"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { getJson } from "@/lib/api";




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
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchChats = async () => {
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
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading chats...</p>
            ) : chats.length > 0 ? (
              <div className="space-y-2">
                {chats.map((chat) => {
                  const otherUser = chat.participants.find(p => p._id !== user?._id);
                  if (!otherUser) return null;

                  return (
                    <Link href={`/chat/${chat._id}`} key={chat._id}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${otherUser.username}.png`} />
                          <AvatarFallback>{otherUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{otherUser.username}</p>
                          <p className="text-sm text-muted-foreground">Click to view chat</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p>You have no active conversations. Find a match to start chatting!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}