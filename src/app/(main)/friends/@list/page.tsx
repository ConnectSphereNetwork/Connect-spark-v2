"use client"

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/context/OnlineStatusContext";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { deleteJson, getJson, putJson } from "@/lib/api";
import { CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { UserPlus, UserCheck, Clock, Search, MessageCircle, MoreHorizontal, Check, X, Badge } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// import { Badge } from "@/app/components/ui/badge";

interface Friend { _id: string; username: string; }
interface FriendRequest { _id: string; sender: { _id: string; username: string; email: string; }; }

export default function FriendsListPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { onlineUsers } = useOnlineStatus();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        getJson<{ data: Friend[] }>('/api/friends'),
        getJson<{ data: FriendRequest[] }>('/api/friends/requests')
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
    } catch (error) { 
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  const handleAccept = async (requestId: string) => {
    try {
      await putJson(`/api/friends/requests/${requestId}/accept`, {});
      fetchAll();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await deleteJson(`/api/friends/requests/${requestId}/decline`);
      setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const res = await getJson<{ data: { chat: { _id: string } } }>(`/api/chats/with/${friendId}`);
      router.push(`/chat/${res.data.chat._id}`);
    } catch (error) {
      console.error("Could not start chat", error);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(request =>
    request.sender.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.sender.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const hoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2 }
  };

  const tapVariants = {
    rest: { scale: 1 },
    tap: { scale: 0.98 }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b"
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">
            Connections
          </CardTitle>
        </CardHeader>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-4 border-b"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors duration-200"
          />
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="px-4 pt-4"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="friends" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <UserCheck className="h-4 w-4" />
              Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 justify-center p-0 text-xs font-medium">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm relative transition-all duration-200"
            >
              <Clock className="h-4 w-4" />
              Pending
              {requests.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0 bg-red-500 text-white font-medium">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Friends Tab */}
        <TabsContent value="friends" className="flex-1 flex flex-col min-h-0 mt-4">
          <ScrollArea className="flex-1">
            <motion.div 
              className="space-y-2 p-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key="friends-content"
            >
              {loading ? (
                // Loading skeletons
                Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="flex items-center gap-3 p-3"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </motion.div>
                ))
              ) : filteredFriends.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredFriends.map((friend) => {
                    const isOnline = onlineUsers.has(friend._id);
                    const isActive = pathname === `/friends/${friend.username}`;
                    
                    return (
                      <motion.div
                        key={friend._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        layout
                        whileHover="hover"
                        whileTap="tap"
                        variants={{
                          ...itemVariants,
                          ...hoverVariants,
                          ...tapVariants
                        }}
                      >
                        <Link 
                          href={`/friends/${friend.username}`} 
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : "bg-card hover:shadow-md border border-transparent hover:border-border"
                          )}
                        >
                          {/* Background gradient on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="relative z-10 flex items-center gap-3 w-full">
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-background group-hover:scale-105 transition-transform duration-200 shadow-sm">
                                <AvatarImage 
                                  src={`https://avatar.vercel.sh/${friend.username}.png`} 
                                  alt={friend.username}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                                  {friend.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {isOnline && (
                                <motion.span 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate text-sm md:text-base">{friend.username}</p>
                              <p className={cn(
                                "text-xs truncate transition-colors duration-200",
                                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {isOnline ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Online now
                                  </span>
                                ) : "Offline"}
                              </p>
                            </div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleStartChat(friend._id);
                                }}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-60" />
                  </motion.div>
                  <p className="text-muted-foreground font-medium text-lg mb-2">No connections found</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {searchQuery ? "Try adjusting your search terms" : "Start building your network by connecting with others"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </ScrollArea>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="flex-1 flex flex-col min-h-0 mt-4">
          <ScrollArea className="flex-1">
            <motion.div 
              className="space-y-3 p-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key="requests-content"
            >
              {loading ? (
                // Loading skeletons for requests
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="p-4 border rounded-xl space-y-3"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </div>
                  </motion.div>
                ))
              ) : filteredRequests.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage 
                            src={`https://avatar.vercel.sh/${request.sender.username}.png`} 
                            alt={request.sender.username}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-medium">
                            {request.sender.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{request.sender.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{request.sender.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            size="sm" 
                            className="flex-1 h-10 rounded-lg bg-green-600 hover:bg-green-700 transition-colors duration-200"
                            onClick={() => handleAccept(request._id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 h-10 rounded-lg border-border hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                            onClick={() => handleDecline(request._id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-60" />
                  </motion.div>
                  <p className="text-muted-foreground font-medium text-lg mb-2">No pending requests</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {searchQuery ? "No requests match your search" : "When someone sends you a request, it will appear here"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}