"use client"

import { useOnlineStatus } from "@/context/OnlineStatusContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ArrowLeft, Video, Phone, Info, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white/95 dark:bg-black/95 backdrop-blur-sm border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex-shrink-0 md:hidden h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
              <AvatarImage 
                src={`https://avatar.vercel.sh/${otherUser?.username}.png`} 
                alt={otherUser?.username || "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
                {otherUserInitial}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white dark:ring-black" />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {otherUser ? otherUser.username : "Loading..."}
            </h1>
            <p className={cn(
              "text-xs truncate",
              isOnline 
                ? 'text-green-600 dark:text-green-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            )}>
              {otherUser ? (isOnline ? 'Active now' : 'Offline') : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <Video className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <Phone className="h-5 w-5" />
        </Button>

        {requestStatus !== 'friends' ? (
          <Button
            size="sm"
            variant={requestStatus === 'sent' ? "secondary" : "default"}
            onClick={onSendFriendRequest}
            disabled={requestStatus !== 'idle' || !otherUser}
            className={cn(
              "rounded-lg text-xs font-medium px-3 py-1.5 h-auto border-0 transition-all duration-200",
              requestStatus === 'sent' 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" 
                : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            )}
          >
            {requestStatus === 'sent' ? 'Requested' : 'Follow'}
          </Button>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
            Following
          </div>
        )}

        {/* More Options */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}