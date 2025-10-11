"use client"

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { cn } from "@/lib/utils";



// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";



// Icons
import { Linkedin, Github, Twitter, Globe, MapPin, CalendarDays, MessageSquare, UserPlus, Check, Coins, BadgeCheck, Lock } from "lucide-react";
import EditProfileDialog from "@/app/components/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { getJson, postJson, putJson } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
// import { Tooltip } from "";


interface ProfileUser {
  _id: string; username: string; fullName: string; headline: string; bio: string;
  location: string; skills: string[]; friends: string[]; createdAt: string;
  isVerified: boolean; isPrivate?: boolean;
  privacySettings: { showOnlineStatus: boolean; profileVisibility: 'public' | 'private'; };
  socialLinks: { linkedin?: string; github?: string; twitter?: string; portfolio?: string; };
}

// --- Helper Components ---
const SocialLink = ({ href, icon: Icon, label }: { href?: string; icon: React.ElementType; label: string }) => {
  if (!href) return null;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Icon className="w-5 h-5" />
          </a>
        </TooltipTrigger>
        <TooltipContent><p>{label}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// --- Main Page Component ---
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = params.username as string;
  const isOwnProfile = currentUser?.username.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    if (username) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getJson<{ data: { user: ProfileUser } }>(`/api/profile/${username}`);
          setProfileUser(res.data.user);
        } catch (err: any) {
          setError(err.message || "User not found.");
          setProfileUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [username]);
  
  const friendshipStatus = useMemo(() => { /* ... same as before ... */ }, [currentUser, profileUser, isOwnProfile]);
  const handleProfileUpdate = (updatedData: Partial<ProfileUser>) => { /* ... same as before ... */ };
  const handleSendMessage = async () => { /* ... same as before ... */ };
  const handleSendFriendRequest = async () => { /* ... same as before ... */ };
  const handleSettingChange = async (settingName: string, value: any) => { /* ... same as before ... */ };

  if (loading) {
    return <main className="container mx-auto p-6 text-center">Loading profile...</main>;
  }

  if (error || !profileUser) {
    return (
        <main className="flex-1 flex items-center justify-center text-center p-4">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Profile Unavailable</h2>
                <p className="text-muted-foreground">{error || "This user could not be found."}</p>
            </div>
        </main>
    );
  }

  if (profileUser.isPrivate && !isOwnProfile && friendshipStatus !== 'friends') {
    return (
        <main className="flex-1 flex items-center justify-center text-center p-4">
            <Card className="p-8 max-w-sm mx-auto">
                <Avatar className="w-24 h-24 mx-auto border-4 mb-4"><AvatarImage src={`https://avatar.vercel.sh/${profileUser.username}.png`} /><AvatarFallback>{profileUser.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <CardTitle className="flex items-center justify-center gap-2"><Lock className="h-5 w-5"/> This Profile is Private</CardTitle>
                <CardDescription className="mt-2">You must be friends with {profileUser.username} to see their profile.</CardDescription>
            </Card>
        </main>
    );
  }

  const ActionButton = () => { /* ... same as before ... */ };
  const SettingsCard = () => { /* ... same as before ... */ };

  return (
    <main className="overflow-y-auto bg-muted/40 p-4 md:p-6">
      <div className="container mx-auto">
        <Card className="p-4 sm:p-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 shrink-0"><AvatarImage src={`https://avatar.vercel.sh/${profileUser.username}.png`} /><AvatarFallback>{profileUser.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                       <h1 className="text-2xl sm:text-3xl font-bold">{profileUser.fullName || profileUser.username}</h1>
                       {profileUser.isVerified && <TooltipProvider><Tooltip><TooltipTrigger><BadgeCheck className="h-6 w-6 text-primary shrink-0" /></TooltipTrigger><TooltipContent><p>Verified by ConnectSphere</p></TooltipContent></Tooltip></TooltipProvider>}
                    </div>
                    <p className="text-primary text-md">{profileUser.headline}</p>
                    <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
                        {profileUser.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profileUser.location}</span>}
                        <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 mt-4 sm:mt-0">
                    {!isOwnProfile && <Button onClick={handleSendMessage}><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>}
                    <ActionButton />
                </div>
            </div>
        </Card>

        {/* --- DESKTOP LAYOUT --- */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <aside className="md:col-span-1 space-y-6">{/* All sidebar cards (Settings, Tokens, Links, Skills) go here */}</aside>
          <section className="md:col-span-2"><Card><CardHeader><CardTitle>About</CardTitle></CardHeader><CardContent><p className="text-muted-foreground whitespace-pre-wrap">{profileUser.bio || 'No bio provided.'}</p></CardContent></Card></section>
        </div>

        {/* --- MOBILE LAYOUT --- */}
        <div className="md:hidden mt-6">{/* All mobile tab content (Settings, Tokens, etc.) goes here */}</div>
      </div>
    </main>
  );
}