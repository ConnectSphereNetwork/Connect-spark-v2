"use client"

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getJson, postJson , putJson } from "@/lib/api";


import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

// Icons
import { MapPin, CalendarDays, MessageSquare, BadgeCheck, Lock, Check } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import EditProfileDialog from "@/app/components/EditProfileDialog";

// --- Type Definitions ---
interface ProfileUser {
  _id: string;
  username: string;
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  friends: string[];
  createdAt: string;
  isVerified: boolean;
  isPrivate?: boolean; 
  privacySettings: {
    showOnlineStatus: boolean;
    profileVisibility: 'public' | 'private';
  };
  socialLinks: {
    linkedin?: string; github?: string; twitter?: string; portfolio?: string;
  };
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

  // --- Data Fetching ---
  useEffect(() => {
    if (username) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getJson<{ data: { user: ProfileUser } }>(`/api/profile/${username}`);
          setProfileUser(res.data.user);
        } catch (err: any) {
          console.error("Failed to fetch profile:", err);
          setError(err.message || "User not found.");
          setProfileUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [username]);
  
  // --- Memoized Friendship Status ---
  const friendshipStatus = useMemo(() => {
    if (!currentUser || !profileUser || isOwnProfile) return "idle";
    if (currentUser.friends.includes(profileUser._id)) return "friends";
    return "idle";
  }, [currentUser, profileUser, isOwnProfile]);

  const handleProfileUpdate = (updatedData: Partial<ProfileUser>) => {
    setProfileUser(currentProfile => currentProfile ? { ...currentProfile, ...updatedData } : null);
    if (isOwnProfile) {
        setCurrentUser(currentAuthUser => currentAuthUser ? { ...currentAuthUser, ...updatedData } : null);
    }
  };
  
  const handleSendMessage = async () => {
    if (!profileUser) return;
    try {
        const res = await getJson<{ data: { chat: { _id: string } } }>(`/api/chats/with/${profileUser._id}`);
        router.push(`/chat/${res.data.chat._id}`);
    } catch (error) { console.error("Could not start chat", error); }
  };
  
  const handleSendFriendRequest = async () => { /* ... same as before ... */ };

  const handleSettingChange = async (settingName: 'showOnlineStatus' | 'profileVisibility', value: any) => {
    try {
      const updatedData = await putJson<{ data: { user: ProfileUser } }>(`/api/profile/me/settings`, { [settingName]: value });
      handleProfileUpdate(updatedData.data.user);
    } catch (error) {
      console.error(`Failed to update ${settingName}:`, error);
    }
  };



  if (error || !profileUser) {
    return (
      <ProtectedRoute>
        <main className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Profile Unavailable</h2>
                <p className="text-muted-foreground">{error || "This user could not be found."}</p>
            </div>
        </main>
      </ProtectedRoute>
    );
  }

  // --- Conditional UI for Private Profiles ---
  if (profileUser.isPrivate) {
    return (
        <ProtectedRoute>
          <div className="flex flex-col h-screen">
            <main className="flex-1 flex items-center justify-center text-center">
                <Card className="p-8 max-w-sm mx-auto">
                    <Avatar className="w-24 h-24 mx-auto border-4 mb-4"><AvatarImage src={`https://avatar.vercel.sh/${profileUser.username}.png`} /><AvatarFallback>{profileUser.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <CardTitle className="flex items-center justify-center gap-2"><Lock className="h-5 w-5"/> This Profile is Private</CardTitle>
                    <CardDescription className="mt-2">You must be friends with {profileUser.username} to see their profile.</CardDescription>
                </Card>
            </main>
          </div>
        </ProtectedRoute>
    );
  }

  const ActionButton = () => {
      if (isOwnProfile) return <EditProfileDialog profile={profileUser} onProfileUpdate={handleProfileUpdate} />;
      if (friendshipStatus === 'friends') return <Button disabled><Check className="mr-2 h-4 w-4" /> Friends</Button>;
   
  };

  const SettingsCard = () => (
    <Card>
      <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="showOnlineStatus" className="flex flex-col space-y-1"><span className="font-medium">Show Online Status</span><span className="font-normal text-xs leading-snug text-muted-foreground">Allow others to see when you're online.</span></Label>
          <Switch id="showOnlineStatus" checked={profileUser.privacySettings?.showOnlineStatus} onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}/>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="profileVisibility" className="flex flex-col space-y-1"><span className="font-medium">Private Account</span><span className="font-normal text-xs leading-snug text-muted-foreground">Only friends can see your profile.</span></Label>
          <Switch id="profileVisibility" checked={profileUser.privacySettings?.profileVisibility === 'private'} onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked ? 'private' : 'public')}/>
        </div>
        <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Account Status</h4>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground flex items-center gap-2">{profileUser.isVerified ? <><BadgeCheck className="h-4 w-4 text-primary"/> Verified Account</> : 'Standard Account'}</p>
                {!profileUser.isVerified && <Button size="sm">Get Verified</Button>}
            </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <Card className="p-4 md:p-6 animate-in fade-in-50 duration-500">
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
              <aside className="md:col-span-1 space-y-6">
                {isOwnProfile && <SettingsCard />}
                {isOwnProfile && <Card>{/* Token Card */}</Card>}
                <Card><CardHeader><CardTitle>Links</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-4">{/* Social Links */}</CardContent></Card>
                <Card><CardHeader><CardTitle>Skills</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{/* Skills */}</CardContent></Card>
              </aside>
              <section className="md:col-span-2"><Card><CardHeader><CardTitle>About</CardTitle></CardHeader><CardContent><p className="text-muted-foreground whitespace-pre-wrap">{profileUser.bio || 'No bio provided.'}</p></CardContent></Card></section>
            </div>

            {/* --- MOBILE LAYOUT --- */}
            <div className="md:hidden mt-6">
                {isOwnProfile && <div className="mb-6"><SettingsCard /></div>}
                <Tabs defaultValue="about" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="links">Links</TabsTrigger>
                    </TabsList>
                    <TabsContent value="about" className="mt-4"><Card><CardContent className="p-4"><p className="text-muted-foreground whitespace-pre-wrap">{profileUser.bio || 'No bio provided.'}</p></CardContent></Card></TabsContent>
                    <TabsContent value="skills" className="mt-4"><Card><CardContent className="p-4 flex flex-wrap gap-2">{/* Skills */}</CardContent></Card></TabsContent>
                    <TabsContent value="links" className="mt-4"><Card><CardContent className="p-4 flex flex-wrap gap-4">{/* Social Links */}</CardContent></Card></TabsContent>
                </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}