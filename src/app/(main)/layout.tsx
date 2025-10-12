"use client"

import { usePathname } from 'next/navigation';
import BottomNavBar from "../components/BottomNavBar";
import Sidebar from "../components/Sidebar";
import { cn } from '@/lib/utils';

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.includes('/chat/');
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden sm:block fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <main className={cn(
        "flex-1 w-full transition-all duration-200",
        "sm:pl-16", // Account for sidebar on desktop
        isChatPage ? "pb-0" : "pb-16 sm:pb-0" // Hide bottom nav on chat pages
      )}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation - Hidden on chat pages */}
      {!isChatPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
          <BottomNavBar />
        </div>
      )}
    </div>
  );
}