import { MessageSquare } from "lucide-react";

export default function ChatPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-muted/40">
      <MessageSquare className="w-16 h-16 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-semibold">Select a Chat</h2>
      <p className="mt-2 text-muted-foreground">
        Choose from an existing conversation to start messaging.
      </p>
    </div>
  );
}