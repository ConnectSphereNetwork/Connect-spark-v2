"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CardHeader, CardTitle } from "@/app/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";


import { getJson } from "@/lib/api";

import { ScrollArea } from "@/app/components/ui/scroll-area";
import { usePathname } from "next/navigation";

interface Participant {
  _id: string;
  username: string;
}

interface Chat {
  _id: string;
  participants: Participant[];
  updatedAt: string;
}

export default function ChatListPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchChats = async () => {
        setLoading(true);
        try {
          const res = await getJson<{ data: { chats: Chat[] } }>('/api/chats');
          setChats(res.data.chats);
        } catch (error) {
          console.error("Failed to fetch chats:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchChats();
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {loading ? (
            <p className="p-2 text-sm text-muted-foreground">Loading...</p>
          ) : chats.length > 0 ? (
            chats.map((chat) => {
              const otherUser = chat.participants.find(p => p._id !== user?._id);
              if (!otherUser) return null;

              const isActive = pathname === `/chat/${chat._id}`;

              return (
                <Link href={`/chat/${chat._id}`} key={chat._id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${otherUser.username}.png`} />
                    <AvatarFallback>{otherUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold flex-1 truncate">{otherUser.username}</p>
                </Link>
              );
            })
          ) : (
            <p className="p-2 text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}