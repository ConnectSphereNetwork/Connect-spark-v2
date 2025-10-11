"use client"

import { useOnlineStatus } from "@/context/OnlineStatusContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Check, UserPlus } from "lucide-react";

interface Participant {
  _id: string;
  username: string;
}

interface ChatHeaderProps {
  otherUser: Participant | null;
  requestStatus: "idle" | "sent" | "friends";
  onSendFriendRequest: () => void;
}

export default function ChatHeader({ otherUser, requestStatus, onSendFriendRequest }: ChatHeaderProps) {
  const { onlineUsers } = useOnlineStatus();
  const isOnline = otherUser ? onlineUsers.has(otherUser._id) : false;
  const otherUserInitial = otherUser?.username?.[0]?.toUpperCase() ?? "U";

  return (
    <CardHeader className="border-b">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://avatar.vercel.sh/${otherUser?.username}.png`} alt="Avatar" />
              <AvatarFallback>{otherUserInitial}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
            )}
          </div>
          <div>
            <CardTitle className="text-pretty text-lg">
              {otherUser ? otherUser.username : "Loading Chat..."}
            </CardTitle>
            <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
              {otherUser ? (isOnline ? 'Online' : 'Offline') : ''}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={onSendFriendRequest} disabled={requestStatus !== 'idle' || !otherUser}>
          {requestStatus === 'friends' ? (
            <><Check className="h-4 w-4 mr-2" /> Friends</>
          ) : requestStatus === 'sent' ? (
            'Request Sent'
          ) : (
            <><UserPlus className="h-4 w-4 mr-2" /> Add Friend</>
          )}
        </Button>
      </div>
    </CardHeader>
  );
}