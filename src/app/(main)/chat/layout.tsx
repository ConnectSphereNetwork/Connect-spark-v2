"use client"
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ChatLayout({ 
  list, 
  details 
}: { 
  list: React.ReactNode; 
  details: React.ReactNode; 
}) {
  const pathname = usePathname();
  const isChatDetailPage = pathname.includes('/chat/') && pathname.split('/').length > 2;

  return (
    <div className="flex h-full bg-background">
      {/* Chat List Sidebar */}
      <div 
        className={cn(
          "flex flex-col w-full md:w-80 lg:w-96 border-r bg-card transition-all duration-200 ease-in-out",
          isChatDetailPage ? "hidden md:flex" : "flex"
        )}
      >
        {list}
      </div>

      {/* Chat Detail View */}
      <div 
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-200 ease-in-out",
          isChatDetailPage ? "flex" : "hidden md:flex"
        )}
      >
        {isChatDetailPage ? (
          details
        ) : (
          // Empty state when no chat is selected on desktop
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <svg 
                className="w-10 h-10 text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Select a Conversation
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Choose a conversation from the sidebar to start messaging or view your chat history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}