"use client"

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { getJson, putJson, postJson } from "@/lib/api";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Bell, Mail, UserPlus, Sparkles, MessageCircle, Home, Users, LogOut, Settings } from "lucide-react";
// import { Input } from "./ui/input";

interface Notification {
    _id: string;
    sender: { _id: string; username: string; };
    type: 'FRIEND_REQUEST' | 'NEW_MESSAGE' | 'FRIEND_REQUEST_ACCEPTED' | 'NEW_MATCH';
    isRead: boolean;
    createdAt: string;
}

// --- Helper Component for a single notification item ---
const NotificationItem = ({ notification }: { notification: Notification }) => {
    const getNotificationDetails = () => {
        switch (notification.type) {
            case 'FRIEND_REQUEST':
                return { icon: UserPlus, text: 'sent you a friend request.', color: 'text-blue-500' };
            case 'NEW_MESSAGE':
                return { icon: Mail, text: 'sent you a message.', color: 'text-green-500' };
            case 'FRIEND_REQUEST_ACCEPTED':
                return { icon: UserPlus, text: 'accepted your friend request.', color: 'text-green-500' };
            case 'NEW_MATCH':
                return { icon: Sparkles, text: 'you have a new match!', color: 'text-purple-500' };
            default:
                return { icon: Bell, text: 'has a new notification.', color: 'text-gray-500' };
        }
    };
    const { icon: Icon, text, color } = getNotificationDetails();

    return (
        <div className={cn(
            "p-3 border-b flex items-start gap-3 transition-all duration-200 hover:bg-muted/50 cursor-pointer",
            !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500'
        )}>
            <div className={cn("p-2 rounded-full bg-muted", color)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <span className="font-semibold text-foreground">{notification.sender.username}</span> 
                    <span className="text-muted-foreground"> {text}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

// --- Helper Component for the list of notifications ---
const NotificationList = ({ notifications, onMarkRead }: { notifications: Notification[], onMarkRead: () => void }) => (
    <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center border-b bg-muted/20">
            <h4 className="font-semibold text-lg text-foreground">Notifications</h4>
            {notifications.some(n => !n.isRead) && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={onMarkRead}
                >
                    Mark all read
                </Button>
            )}
        </div>
        <ScrollArea className="flex-1">
            {notifications.length > 0 ? (
                notifications.map(n => <NotificationItem key={n._id} notification={n} />)
            ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">No notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">We'll notify you when something arrives</p>
                </div>
            )}
        </ScrollArea>
    </div>
);

// --- The Main Responsive Notification Panel ---
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
    
    const TriggerButton = (
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Button>
    );

    const PanelContent = <NotificationList notifications={notifications} onMarkRead={handleMarkAllRead} />;

    if (isDesktop) return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
            <PopoverContent className="w-96 p-0 rounded-xl shadow-lg border" align="end">
                {PanelContent}
            </PopoverContent>
        </Popover>
    );
    
    return (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
            <DrawerContent className="max-h-[80vh] rounded-t-2xl">
                {PanelContent}
            </DrawerContent>
        </Drawer>
    );
};

// --- User Menu Component ---
const UserMenu = () => {
    const { user, setUser } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleLogout = async () => {
        try {
            await postJson("/api/auth/logout", {});
            setUser(null);
            router.push("/login");
        } catch (error) { console.error("Failed to logout:", error) }
    };

    const TriggerButton = (
        <Button variant="ghost" className="p-0 h-auto rounded-full">
            <Avatar className="h-8 w-8 border-2 border-transparent hover:border-primary transition-colors">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.username}.png`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        </Button>
    );

    const MenuContent = (
        <div className="p-2">
            <div className="flex items-center gap-3 p-3 border-b mb-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.username}.png`} />
                    <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">View your profile</p>
                </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={`/profile/${user?.username}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
            </Button>
        </div>
    );

    if (isDesktop) return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
            <PopoverContent className="w-64 p-0 rounded-xl" align="end">
                {MenuContent}
            </PopoverContent>
        </Popover>
    );

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
            <DrawerContent className="max-h-[60vh] rounded-t-2xl">
                {MenuContent}
            </DrawerContent>
        </Drawer>
    );
};

// --- Navigation Items ---
const NavItems = () => {
    const { user } = useAuth();
    
    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/friends", icon: Users, label: "Friends" },
        { href: "/chat", icon: MessageCircle, label: "Messages" },
    ];

    return (
        <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Button
                        key={item.href}
                        variant="ghost"
                        className="flex items-center gap-2 rounded-lg px-4 py-2"
                        asChild
                    >
                        <Link href={item.href}>
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );
};

// --- Search Bar Component ---
// const SearchBar = () => {
//     return (
//         <div className="hidden lg:block flex-1 max-w-md mx-8">
//             <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                     placeholder="Search ConnectSpark..."
//                     className="pl-10 bg-muted/50 border-0 focus:bg-background rounded-full"
//                 />
//             </div>
//         </div>
//     );
// };

// --- Mobile Menu ---
// const MobileMenu = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const { user } = useAuth();

//     const mobileNavItems = [
//         { href: "/dashboard", icon: Home, label: "Home" },
//         { href: "/friends", icon: Users, label: "Friends" },
//         { href: "/chat", icon: MessageCircle, label: "Messages" },
//         { href: `/profile/${user?.username}`, icon: Settings, label: "Profile" },
//     ];

//     return (
//         <div className="md:hidden">
//             <Drawer open={isOpen} onOpenChange={setIsOpen}>
//                 <DrawerTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
//                         <Menu className="h-5 w-5" />
//                     </Button>
//                 </DrawerTrigger>
//                 <DrawerContent className="rounded-t-2xl">
//                     <div className="p-4">
//                         <div className="flex items-center gap-3 p-4 border-b mb-4">
//                             <Avatar className="h-12 w-12">
//                                 <AvatarImage src={`https://avatar.vercel.sh/${user?.username}.png`} />
//                                 <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
//                             </Avatar>
//                             <div className="flex-1 min-w-0">
//                                 <p className="font-semibold truncate">{user?.username}</p>
//                                 <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
//                             </div>
//                         </div>
//                         <nav className="space-y-2">
//                             {mobileNavItems.map((item) => {
//                                 const Icon = item.icon;
//                                 return (
//                                     <Button
//                                         key={item.href}
//                                         variant="ghost"
//                                         className="w-full justify-start text-lg py-4"
//                                         asChild
//                                         onClick={() => setIsOpen(false)}
//                                     >
//                                         <Link href={item.href}>
//                                             <Icon className="h-5 w-5 mr-3" />
//                                             {item.label}
//                                         </Link>
//                                     </Button>
//                                 );
//                             })}
//                         </nav>
//                     </div>
//                 </DrawerContent>
//             </Drawer>
//         </div>
//     );
// };

// --- The Main Header Component ---
export default function Header() {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* Left Section - Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* <MobileMenu /> */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden sm:block">ConnectSpark</span>
                    </Link>
                </div>

                {/* Center Section - Navigation & Search */}
                <div className="flex items-center flex-1 justify-center">
                    <NavItems />
                    {/* <SearchBar /> */}
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <NotificationPanel />
                            <UserMenu />
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Log In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}