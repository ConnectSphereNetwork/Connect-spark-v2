"use client"

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { usePathname } from "next/navigation";
import { useOnlineStatus } from "@/context/OnlineStatusContext";

// import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { deleteJson, getJson, putJson } from "@/lib/api";
import { CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Badge } from "lucide-react";


interface Friend { _id: string; username: string; }
interface FriendRequest { _id: string; sender: { _id: string; username: string; email: string; }; }

export default function FriendsListPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { onlineUsers } = useOnlineStatus();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Refresh all data to show the new friend in the "All Friends" tab
      fetchAll();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

    const handleDecline = async (requestId: string) => {
    try {
      await deleteJson(`/api/friends/requests/${requestId}/decline`);
      // Update UI instantly by removing the request from the list
      setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>

      <Tabs defaultValue="friends" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mx-auto px-3">
          <TabsTrigger value="friends">All Friends</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Pending
            {requests.length > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{requests.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <nav className="space-y-1 p-2">
              {friends.map((friend) => {
                const isOnline = onlineUsers.has(friend._id);
                const isActive = pathname === `/friends/${friend.username}`;
                return (
                  <Link href={`/friends/${friend.username}`} key={friend._id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <div className="relative">
                      <Avatar><AvatarImage src={`https://avatar.vercel.sh/${friend.username}.png`} /><AvatarFallback>{friend.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      {isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                    </div>
                    <p className="font-semibold flex-1 truncate">{friend.username}</p>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-2">
              {requests.length > 0 ? requests.map((request) => (
                <div key={request._id} className="p-2 border rounded-lg bg-background">
                  <p className="font-semibold text-sm">{request.sender.username}</p>
                  <p className="text-xs text-muted-foreground">{request.sender.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="flex-1 h-8" onClick={() => handleAccept(request._id)}>Accept</Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => handleDecline(request._id)}>Decline</Button>
                  </div>
                </div>
              )) : <p className="p-4 text-center text-sm text-muted-foreground">No pending requests.</p>}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}