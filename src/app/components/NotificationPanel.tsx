"use client"

import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
// import { useMediaQuery } from "@/hooks/use-media-query";

import { Button } from "./ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

// A placeholder for the content for now.
const NotificationContent = () => (
    <div className="p-4">
        <h4 className="font-medium leading-none">Notifications</h4>
        <p className="text-sm text-muted-foreground">You have no new notifications.</p>
    </div>
);


export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Placeholder for notification data
  const unreadCount = 0; // We will replace this with real data

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <NotificationContent />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <NotificationContent />
      </DrawerContent>
    </Drawer>
  );
}