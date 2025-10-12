"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { getJson } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/app/components/ui/input";
import { Search, MessageCircle, Users, Plus, Calendar, Filter, Badge } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

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

  const formatDate = (dateString: string) => {
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

  const filteredChats = chats.filter(chat => {
    const otherUser = chat.participants.find(p => p._id !== user?._id);
    const matchesSearch = otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || (chat.unreadCount && chat.unreadCount > 0);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = chats.filter(chat => chat.unreadCount && chat.unreadCount > 0).length;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const hoverVariants = {
    rest: { 
      scale: 1, 
      y: 0,
      backgroundColor: "rgba(0,0,0,0)"
    },
    hover: { 
      scale: 1.01, 
      y: -1,
      backgroundColor: "rgba(0,0,0,0.02)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col gap-8">
              {/* Header Skeleton */}
              <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              
              {/* Search and Filter Skeleton */}
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-32" />
              </div>
              
              {/* Chat List Skeletons */}
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-2 mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Messages
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay connected with your conversations
            </p>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
       
            
            <div className="flex gap-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="h-12 px-4 rounded-xl gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                All Chats
              </Button>
              
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                className="h-12 px-4 rounded-xl gap-2 relative"
              >
                <Filter className="h-4 w-4" />
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-3 mb-8 overflow-x-auto pb-2"
          >
            <Button asChild className="rounded-xl gap-3 h-14 px-6 flex-1 sm:flex-initial bg-primary hover:bg-primary/90">
              <Link href="/">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Discover People</span>
              </Link>
            </Button>
           
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-2 border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {filteredChats.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-border"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredChats.map((chat) => {
                        const otherUser = chat.participants.find(p => p._id !== user?._id);
                        if (!otherUser) return null;

                        return (
                          <motion.div
                            key={chat._id}
                            variants={itemVariants}
                            layout
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            whileHover="hover"
                            className="group"
                          >
                            <Link 
                              href={`/chat/${chat._id}`}
                              className="block"
                            >
                              <motion.div
                                variants={hoverVariants}
                                className="flex items-center gap-4 p-6 transition-all duration-300 cursor-pointer border-l-4 border-l-transparent group-hover:border-l-primary"
                              >
                                {/* Avatar Section */}
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-16 w-16 border-3 border-background shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <AvatarImage 
                                      src={`https://avatar.vercel.sh/${otherUser.username}.png`} 
                                      alt={otherUser.username}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                                      {otherUser.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  {/* Online Status */}
                                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-3 border-background shadow-sm" />
                                  
                                  {/* Unread Badge */}
                                  {chat.unreadCount && chat.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Chat Info */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-foreground text-lg truncate">
                                      {otherUser.username}
                                    </h3>
                                    {chat.unreadCount && chat.unreadCount > 0 && (
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                        New messages
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className={cn(
                                    "text-muted-foreground truncate text-sm leading-relaxed",
                                    chat.unreadCount && chat.unreadCount > 0 && "font-medium text-foreground"
                                  )}>
                                    {chat.lastMessage || "No messages yet. Start the conversation!"}
                                  </p>
                                </div>
                                
                                {/* Timestamp */}
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(chat.updatedAt)}</span>
                                  </div>
                                  {chat.unreadCount && chat.unreadCount > 0 && (
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  )}
                                </div>
                              </motion.div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-16 px-8"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center"
                    >
                      <MessageCircle className="h-12 w-12 text-blue-500" />
                    </motion.div>
                    
                 
                    
               

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button asChild size="lg" className="rounded-xl px-8 h-12 text-base font-semibold">
                        <Link href="/">
                          <Users className="h-5 w-5 mr-2" />
                          Discover People
                        </Link>
                      </Button>
                      
                      {(searchQuery || filter === "unread") && (
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="rounded-xl px-8 h-12 text-base font-semibold"
                          onClick={() => {
                            setSearchQuery("");
                            setFilter("all");
                          }}
                        >
                          View All Chats
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Footer */}
          {!loading && filteredChats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-6 justify-center"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active conversations</p>
                  <p className="text-lg font-bold text-blue-700">{filteredChats.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-200">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Connected people</p>
                  <p className="text-lg font-bold text-green-700">
                    {new Set(filteredChats.flatMap(chat => chat.participants.map(p => p._id))).size}
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Unread messages</p>
                    <p className="text-lg font-bold text-orange-700">{unreadCount}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}