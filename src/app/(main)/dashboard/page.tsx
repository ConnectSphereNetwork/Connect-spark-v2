"use client"

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Sparkles, Users, Coins, ArrowRight, Plus, Check } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Spinner } from "@/app/components/ui/spinner";
// import { getJson, postJson } from "@/utils/api";

import { formatDistanceToNow } from 'date-fns';
import { getJson, postJson } from "@/lib/api";

// --- Animation Variants ---
const container = (stagger = 0.06) => ({ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { staggerChildren: stagger, when: "beforeChildren" } } });
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } } };
const hoverCard = { rest: { y: 0 }, hover: { y: -4, transition: { type: "spring", stiffness: 220, damping: 18 } } };

// --- Type Definitions ---
interface OnlineFriend { _id: string; username: string; }
interface Activity { _id: string; type: 'NEW_FRIEND' | 'NEW_MATCH'; subject: { _id: string; username: string; }; createdAt: string; }
interface TrendData { day: string; tokens: number; }

export default function AnimatedDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  
  const [isMatching, setIsMatching] = useState(false);
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [tokenTrend, setTokenTrend] = useState<TrendData[]>([]);
  const [copied, setCopied] = useState(false);

  const motionContainer = useMemo(() => (reduceMotion ? undefined : container()), [reduceMotion]);

  // --- Data Fetching ---
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [friendsRes, activityRes, trendRes] = await Promise.all([
            getJson<{ data: { onlineFriends: OnlineFriend[] } }>('/api/users/online-friends'),
            getJson<{ data: Activity[] }>('/api/activity/me'),
            getJson<{ data: { trend: TrendData[] } }>('/api/users/me/token-trend')
          ]);
          setOnlineFriends(friendsRes.data.onlineFriends);
          setRecentActivity(activityRes.data);
          setTokenTrend(trendRes.data.trend);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  // --- Event Handlers ---
  const handleFindMatch = async () => {
    setIsMatching(true);
    try {
      const response = await postJson("/api/match/find", {});
      router.push(`/chat/${response.data.chat._id}`);
    } catch (error: any) { alert(error.message); } 
    finally { setIsMatching(false); }
  };

  const handleInvite = () => {
    if (!user) return;
    const inviteUrl = `${window.location.origin}/register?ref=${user.username}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <motion.header initial="hidden" animate="show" variants={motionContainer} className="mb-6">
          <motion.h1 variants={item} className="text-balance text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{user?.username || "Explorer"}</span>
          </motion.h1>
          <motion.p variants={item} className="mt-1 text-muted-foreground">
            Connect smarter, grow faster — here’s what’s happening in your Sphere.
          </motion.p>
        </motion.header>

        <motion.section initial="hidden" animate="show" variants={motionContainer} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          <motion.div variants={item} initial="rest" whileHover="hover" animate="rest" className="lg:col-span-2">
            <motion.div variants={hoverCard}>
              <Card className="relative overflow-hidden"><div className="absolute inset-x-0 top-0 h-1 bg-primary/30" />
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Global Connect</CardTitle><CardDescription>Discover new people and expand your network.</CardDescription></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">Use your tokens to get instantly matched for a one-on-one private chat.</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" className="group" onClick={handleFindMatch} disabled={isMatching}>
                      {isMatching ? <><Spinner className="mr-2 h-4 w-4" /> Searching...</> : <>Find a New Match<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
                    </Button>
                    <Button variant="secondary" onClick={handleInvite}>
                      {copied ? <><Check className="mr-2 h-4 w-4" /> Copied!</> : <><Plus className="mr-2 h-4 w-4" /> Invite a Friend</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={item} initial="rest" whileHover="hover" animate="rest">
            <motion.div variants={hoverCard}>
              <Card>
                <CardHeader className="pb-3"><CardTitle>Your Stats</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Coins className="h-5 w-5 text-muted-foreground" /> <span className="font-medium">Available Tokens</span></div><span className="text-lg font-bold">{user?.tokens ?? 0}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-muted-foreground" /> <span className="font-medium">Connections</span></div><span className="text-lg font-bold">{user?.friends?.length ?? 0}</span></div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2"><CardTitle>Weekly Spending</CardTitle><CardDescription>Your token spending over the last 7 days.</CardDescription></CardHeader>
              <CardContent className="h-48 -ml-4">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={tokenTrend}><defs><linearGradient id="fillTokens" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} /></linearGradient></defs><XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: "12px" }} /><Area type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" fill="url(#fillTokens)" strokeWidth={2} activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          
          {onlineFriends.length > 0 && 
            <motion.div variants={item} className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3"><CardTitle>Online Friends</CardTitle><CardDescription>See who’s available to chat right now.</CardDescription></CardHeader>
                <CardContent>
                  <div className="flex gap-5 overflow-x-auto py-1 -mx-6 px-6"><div className="flex gap-5">{onlineFriends.map((friend) => ( <Link key={friend._id} href={`/friends/${friend.username}`}><motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 140, damping: 16 }} className="flex flex-col items-center gap-2"><div className="relative"><Avatar className="h-12 w-12 border"><AvatarImage src={`https://avatar.vercel.sh/${friend.username}.png`} alt={`${friend.username} avatar`} /><AvatarFallback>{friend.username.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-card bg-green-500"/></div><span className="text-xs font-medium">{friend.username}</span></motion.div></Link>))}</div></div>
                </CardContent>
              </Card>
            </motion.div>
          }

          {recentActivity.length > 0 &&
            <motion.div variants={item} className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3"><CardTitle>Recent Activity</CardTitle><CardDescription>Your latest matches and connections</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((a) => {
                    const label = a.type === 'NEW_MATCH' ? `You matched with @${a.subject.username}` : `You are now friends with @${a.subject.username}`;
                    const iconType = a.type === 'NEW_MATCH' ? 'match' : 'friend';
                    return (
                      <motion.div key={a._id} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ type: "spring", stiffness: 150, damping: 16 }} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div aria-hidden="true" className={cn("flex h-8 w-8 items-center justify-center rounded-md", iconType === "match" && "bg-primary/10 text-primary", iconType === "friend" && "bg-secondary text-foreground")}>
                            {iconType === "match" ? <Sparkles className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          }
        </motion.section>
      </main>
    </ProtectedRoute>
  )
}