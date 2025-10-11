"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users, Compass, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/chat", icon: MessageSquare, label: "Chats" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/dashboard", icon: Compass, label: "Discover" },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    // This entire component is hidden on screens sm and larger
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur-sm sm:hidden">
      <div className="container mx-auto grid h-16 grid-cols-4 items-center gap-4 px-4 text-xs">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname.startsWith(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
        {user && (
           <Link
            href={`/profile/${user.username}`}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname.startsWith('/profile')
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        )}
      </div>
    </nav>
  );
}