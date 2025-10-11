"use client"

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
// import { getJson, putJson, postJson } from "@/utils/api"; // FIX: Corrected API import path

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Bell, Mail, UserPlus, LogOut } from "lucide-react";
import { getJson, postJson, putJson } from "@/lib/api";

interface Notification {
    _id: string;
    sender: { _id: string; username: string; };
    type: 'FRIEND_REQUEST' | 'NEW_MESSAGE';
    isRead: boolean;
    createdAt: string;
}

const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div className={cn("p-4 border-b flex items-start gap-3 last:border-b-0", !notification.isRead && 'bg-primary/5')}>
        <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={`https://avatar.vercel.sh/${notification.sender.username}.png`} />
            <AvatarFallback>{notification.sender.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-sm flex-1">
            <p><span className="font-semibold">{notification.sender.username}</span>{notification.type === 'FRIEND_REQUEST' ? ' sent you a friend request.' : ' sent you a message.'}</p>
            <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
        {notification.type === 'FRIEND_REQUEST' && <UserPlus className="h-4 w-4 text-muted-foreground ml-auto" />}
        {notification.type === 'NEW_MESSAGE' && <Mail className="h-4 w-4 text-muted-foreground ml-auto" />}
    </div>
);

const NotificationList = ({ notifications, onMarkRead }: { notifications: Notification[], onMarkRead: () => void }) => (
    <div className="flex flex-col">
        <div className="p-3 flex justify-between items-center border-b">
            <h4 className="font-semibold text-lg">Notifications</h4>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={onMarkRead}>Mark all as read</Button>
        </div>
        <ScrollArea className="h-full max-h-[60vh] md:max-h-[400px]">
            {notifications.length > 0 ? (
                notifications.map(n => <NotificationItem key={n._id} notification={n} />)
            ) : (<p className="p-8 text-center text-sm text-muted-foreground">You have no notifications.</p>)}
        </ScrollArea>
    </div>
);

const NotificationPanel = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getJson<{ data: Notification[] }>('/api/notifications');
            setNotifications(res.data);
        } catch (error) { console.error("Failed to fetch notifications:", error); }
    }, [user]);
    
    useEffect(() => { fetchNotifications() }, [fetchNotifications]);

    useEffect(() => {
        if (!socket) return;
        const handleNewNotification = (newNotification: Notification) => {
            new Audio('/notification.mp3').play().catch(() => {});
            setNotifications(prev => [newNotification, ...prev]);
        };
        socket.on('newNotification', handleNewNotification);
        return () => { socket.off('newNotification', handleNewNotification) };
    }, [socket, fetchNotifications]);

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await putJson('/api/notifications/read');
            setNotifications(current => current.map(n => ({ ...n, isRead: true })));
        } catch (error) { console.error("Failed to mark read:", error); }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) setTimeout(handleMarkAllRead, 1500);
    };
    
    const TriggerButton = (<Button variant="ghost" size="icon" className="relative"><Bell className="h-5 w-5" />{unreadCount > 0 && (<span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{unreadCount}</span>)}</Button>);
    const PanelContent = <NotificationList notifications={notifications} onMarkRead={handleMarkAllRead} />;

    if (isDesktop) return (<Popover open={isOpen} onOpenChange={handleOpenChange}><PopoverTrigger asChild>{TriggerButton}</PopoverTrigger><PopoverContent className="w-96 p-0" align="end">{PanelContent}</PopoverContent></Popover>);
    return (<Drawer open={isOpen} onOpenChange={handleOpenChange}><DrawerTrigger asChild>{TriggerButton}</DrawerTrigger><DrawerContent><div className="mx-auto w-full max-w-sm">{PanelContent}</div></DrawerContent></Drawer>);
};

export default function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await postJson("/api/auth/logout", {});
      setUser(null);
      router.push("/login");
    } catch (error) { console.error("Failed to logout:", error) }
  };

  return (
    <header className="bg-background/80 backdrop-blur border-b z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/dashboard" className="text-lg font-semibold">ConnectSphere</Link>
        <nav className="flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              <Link href="/friends"><Button variant="ghost" size="sm">Friends</Button></Link>
              <Link href="/friends/requests"><Button variant="ghost" size="sm">Requests</Button></Link>
              <NotificationPanel />
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>

              {/* --- NEW: Instagram-style Profile Icon Link --- */}
              <Link href={`/profile/${user.username}`} aria-label="My Profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png`} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : ( <p className="text-sm text-muted-foreground">Loading...</p> )}
        </nav>
      </div>
    </header>
  );
}