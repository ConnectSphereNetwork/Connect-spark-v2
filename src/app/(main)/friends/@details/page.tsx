import { Users } from "lucide-react";

export default function FriendsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-muted/40">
      <Users className="w-16 h-16 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-semibold">Select a Friend</h2>
      <p className="mt-2 text-muted-foreground">
        Choose a friend from the list to view their profile.
      </p>
    </div>
  );
}