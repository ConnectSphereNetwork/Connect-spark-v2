"use client"

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";


import { CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Input } from "@/app/components/ui/input";
import { Search } from "lucide-react";
import { getJson } from "@/lib/api";
import ProtectedRoute from "@/app/components/ProtectedRoute";

// --- Type Definitions ---
interface Participant {
  _id: string;
  username: string;
}

interface Chat {
  _id: string;
  participants: Participant[];
  updatedAt: string;
  lastMessage?: string; // Added lastMessage for previews
}

// --- Main Page Component ---
export default function ChatListPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Data Fetching ---
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

  // --- Search Logic ---
  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;
    return chats.filter(chat => {
      const otherUser = chat.participants.find(p => p._id !== user?._id);
      return otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [chats, searchTerm, user]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          {/* --- NEW UI: Search Bar --- */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-2">
            {loading ? (
              <p className="p-2 text-sm text-muted-foreground">Loading...</p>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const otherUser = chat.participants.find(p => p._id !== user?._id);
                if (!otherUser) return null;

                const isActive = pathname === `/chat/${chat._id}`;

                return (
                  <Link href={`/chat/${chat._id}`} key={chat._id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${otherUser.username}.png`} />
                      <AvatarFallback>{otherUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">{otherUser.username}</p>
                      {/* --- NEW UI: Last Message Preview --- */}
                      <p className={`text-xs truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="p-2 text-sm text-muted-foreground text-center">No conversations found.</p>
            )}
          </nav>
        </ScrollArea>
      </div>
    </ProtectedRoute>
  );
}