"use client"

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ChatHeader from "@/app/components/ChatHeader";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJson, postJson } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

interface Message {
  sender: { _id: string; username: string; };
  text: string;
  createdAt: string;
}

interface Participant {
  _id: string;
  username: string;
}

export default function ChatRoomPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const params = useParams();
  const chatId = params.chatId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<Participant | null>(null);
  const [requestStatus, setRequestStatus] = useState<"idle" | "sent" | "friends">("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && otherUser && user.friends.includes(otherUser._id)) {
      setRequestStatus("friends");
    }
  }, [user, otherUser]);

  useEffect(() => {
    if (chatId && user) {
      const fetchHistory = async () => {
        try {
          const res = await getJson<{ data: { messages: Message[] } }>(`/api/chats/${chatId}/messages`);
          setMessages(res.data.messages);
        } catch (error) { console.error("Failed to fetch chat history:", error) }
      };
      const fetchChatDetails = async () => {
        try {
          const res = await getJson<{ data: { chat: { participants: Participant[] } } }>(`/api/chats/${chatId}`);
          const partner = res.data.chat.participants.find((p) => p._id !== user._id) || null;
          setOtherUser(partner);
        } catch (error) { console.error("Failed to fetch chat details:", error) }
      };
      fetchHistory();
      fetchChatDetails();
    }
  }, [chatId, user]);

  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit("joinRoom", chatId);
    const handleReceiveMessage = (message: { sender: string; text: string; }) => {
        const formattedMessage: Message = {
            sender: { _id: '', username: message.sender },
            text: message.text,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, formattedMessage]);
    };
    socket.on("receiveMessage", handleReceiveMessage);
    return () => { socket.off("receiveMessage", handleReceiveMessage) };
  }, [socket, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (trimmed === "" || !socket || !user) return;
    
    const optimisticMessage: Message = {
        sender: { _id: user._id, username: user.username },
        text: trimmed,
        createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    socket.emit("sendMessage", { chatId, messageData: { sender: user.username, text: trimmed } });
  };
  
  const handleSendFriendRequest = async () => {
    if (!otherUser) return;
    try {
      await postJson("/api/friends/request", { recipientId: otherUser._id });
      setRequestStatus("sent");
    } catch (error: any) { alert(error.message) }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <ChatHeader 
          otherUser={otherUser} 
          requestStatus={requestStatus} 
          onSendFriendRequest={handleSendFriendRequest} 
        />
      </div>
      
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[url('/chat-bg-patternn.png')] bg-repeat">
        <div className="p-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => {
              const isSelf = msg.sender.username === user?.username;
              return (
                <div key={index} className={cn("flex items-end gap-2", isSelf ? "justify-end" : "justify-start")}>
                  {!isSelf && <Avatar className="h-6 w-6"><AvatarFallback>{msg.sender.username[0]}</AvatarFallback></Avatar>}
                  <div className={cn("max-w-[70%] rounded-lg px-3 py-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300", isSelf ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                    {!isSelf && <p className="text-xs font-bold text-primary mb-1">{msg.sender.username}</p>}
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className="text-xs opacity-60 text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Fixed Input Area */}
      <div className="flex-shrink-0 p-2 md:p-4 border-t bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Textarea placeholder="Type a message..." value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            className="flex-1 resize-none max-h-24" />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}