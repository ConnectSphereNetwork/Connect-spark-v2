"use client"

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Input } from "@/app/components/ui/input";
import { Search, MessageCircle, Users, Clock, CheckCheck, Badge } from "lucide-react";
import { getJson } from "@/lib/api";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Participant {
  _id: string;
  username: string;
}

interface Chat {
  _id: string;
  participants: Participant[];
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export default function ChatListPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;
    return chats.filter(chat => {
      const otherUser = chat.participants.find(p => p._id !== user?._id);
      return otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [chats, searchTerm, user]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="space-y-4 p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Messages</CardTitle>
            {totalUnread > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                {totalUnread} unread
              </Badge>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Stats */}
        {!loading && chats.length > 0 && (
          <div className="px-4 py-3 border-b bg-muted/20">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{chats.length} conversations</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>
                  {new Set(chats.flatMap(chat => chat.participants.map(p => p._id))).size} people
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const otherUser = chat.participants.find(p => p._id !== user?._id);
                if (!otherUser) return null;

                const isActive = pathname === `/chat/${chat._id}`;
                const hasUnread = chat.unreadCount && chat.unreadCount > 0;

                return (
                  <Link 
                    href={`/chat/${chat._id}`} 
                    key={chat._id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted/80 hover:shadow-sm border border-transparent hover:border-border"
                    )}
                  >
                    {/* Avatar with Online Status */}
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background group-hover:scale-105 transition-transform">
                        <AvatarImage 
                          src={`https://avatar.vercel.sh/${otherUser.username}.png`} 
                          alt={otherUser.username}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                          {otherUser.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {chat.isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                      )}
                    </div>
                    
                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate text-sm">
                          {otherUser.username}
                        </p>
                        {hasUnread && (
                          <Badge variant="destructive" className="h-4 px-1 text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate flex items-center gap-1",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                        hasUnread && !isActive && "text-foreground font-medium"
                      )}>
                        {chat.lastMessage ? (
                          <>
                            {chat.lastMessage}
                            {!hasUnread && <CheckCheck className="h-3 w-3 ml-1" />}
                          </>
                        ) : (
                          "Start a conversation..."
                        )}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className={cn(
                        "text-xs whitespace-nowrap",
                        isActive ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}>
                        {formatTime(chat.updatedAt)}
                      </p>
                      {hasUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              // Empty State
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No conversations found" : "No conversations yet"}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                  {searchTerm 
                    ? "Try adjusting your search or browse all conversations"
                    : "Start connecting with people to begin conversations"
                  }
                </p>
                {!searchTerm && (
                  <Link 
                    href="/discover" 
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Discover People
                  </Link>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Recent Activity Footer */}
        {!loading && chats.length > 0 && (
          <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated just now</span>
              </div>
              <span>{filteredChats.length} of {chats.length}</span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}