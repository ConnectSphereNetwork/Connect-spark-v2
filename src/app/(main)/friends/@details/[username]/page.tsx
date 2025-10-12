"use client"

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// Icons
import { Linkedin, Github, Twitter, Globe, MapPin, CalendarDays, MessageCircle, UserPlus, Check, MoreHorizontal, Settings, Lock, Mail } from "lucide-react";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import EditProfileDialog from "@/app/components/EditProfileDialog";
import { getJson, postJson } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// --- Type Definitions ---
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
          <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">{label}</span>
          </a>
        </TooltipTrigger>
        <TooltipContent><p>{label}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// --- Main Page Component ---
export default function ProfileDetailsPage() {
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
  
  const handleSendFriendRequest = async () => {
    if (!profileUser) return;
    try {
        await postJson("/api/friends/request", { recipientId: profileUser._id });
        // You might want to update the requestStatus state here
    } catch (error: any) { alert(error.message); }
  };
  
  const handleSettingChange = async (settingName: string, value: any) => { /* ... settings logic ... */ };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <Card className="p-8 max-w-sm mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg mb-2">Profile Not Found</CardTitle>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (profileUser.isPrivate && !isOwnProfile && friendshipStatus !== 'friends') {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <Card className="p-8 max-w-sm mx-auto border-0 shadow-lg">
          <Avatar className="w-24 h-24 mx-auto border-4 mb-4">
            <AvatarImage src={`https://avatar.vercel.sh/${profileUser.username}.png`} />
            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-700 text-white">
              {profileUser.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="flex items-center justify-center gap-2 text-lg mb-2">
            <Lock className="h-5 w-5"/> Private Account
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Follow this account to see their photos and videos.
          </p>
        </Card>
      </div>
    );
  }

  const ActionButton = () => {
    if (isOwnProfile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditProfileDialog profile={profileUser} onProfileUpdate={handleProfileUpdate} />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    if (friendshipStatus === 'friends') {
      return (
        <Button variant="outline" className="rounded-full" disabled>
          <Check className="mr-2 h-4 w-4" /> Following
        </Button>
      );
    }
    return (
      <Button onClick={handleSendFriendRequest} className="rounded-full bg-blue-600 hover:bg-blue-700">
        <UserPlus className="mr-2 h-4 w-4" /> Follow
      </Button>
    );
  };

  const SettingsCard = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="showOnlineStatus" className="text-sm font-medium">Show Online Status</Label>
            <p className="text-xs text-muted-foreground">Allow others to see when you're online</p>
          </div>
          <Switch 
            id="showOnlineStatus" 
            checked={profileUser.privacySettings?.showOnlineStatus} 
            onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="profileVisibility" className="text-sm font-medium">Private Account</Label>
            <p className="text-xs text-muted-foreground">Only followers can see your content</p>
          </div>
          <Switch 
            id="profileVisibility" 
            checked={profileUser.privacySettings?.profileVisibility === 'private'} 
            onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked ? 'private' : 'public')}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-y-auto">
        {/* Header Section */}
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-background shadow-lg">
                  <AvatarImage 
                    src={`https://avatar.vercel.sh/${profileUser.username}.png`} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                    {profileUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold">{profileUser.username}</h1>
                    {profileUser.isVerified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified Account</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {profileUser.fullName && (
                    <p className="text-lg text-muted-foreground font-medium">
                      {profileUser.fullName}
                    </p>
                  )}
                  
                  {profileUser.headline && (
                    <p className="text-sm text-muted-foreground">
                      {profileUser.headline}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold">{profileUser.friends?.length || 0}</div>
                    <div className="text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{profileUser.friends?.length || 0}</div>
                    <div className="text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">0</div>
                    <div className="text-muted-foreground">Posts</div>
                  </div>
                </div>

                {/* Bio */}
                {profileUser.bio && (
                  <p className="text-sm leading-relaxed max-w-2xl">
                    {profileUser.bio}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {profileUser.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {profileUser.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isOwnProfile && (
                  <Button 
                    onClick={handleSendMessage} 
                    variant="outline" 
                    size="sm"
                    className="rounded-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                <ActionButton />
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-t">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-14">
                <TabsTrigger 
                  value="posts" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent h-14 px-6"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent h-14 px-6"
                >
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="skills" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent h-14 px-6"
                >
                  Skills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    When {isOwnProfile ? 'you' : 'they'} share posts, they'll appear here.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="about" className="p-6">
                <div className="grid gap-6">
                  {isOwnProfile && <SettingsCard />}
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {profileUser.bio || 'No bio provided.'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <SocialLink href={profileUser.socialLinks?.linkedin} icon={Linkedin} label="LinkedIn" />
                      <SocialLink href={profileUser.socialLinks?.github} icon={Github} label="GitHub" />
                      <SocialLink href={profileUser.socialLinks?.twitter} icon={Twitter} label="Twitter" />
                      <SocialLink href={profileUser.socialLinks?.portfolio} icon={Globe} label="Portfolio" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="p-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills?.length > 0 ? (
                        profileUser.skills.map((skill, i) => (
                          <div 
                            key={i} 
                            className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No skills listed.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}