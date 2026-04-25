'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy, ChevronRight, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Profile, Squad } from '@/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedSquads, setRecommendedSquads] = useState<any[]>([]);

  // AI Career Advisor State
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [careerAdvice, setCareerAdvice] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const myProfile = await api.profiles.getMe().catch(() => null);
        if (!myProfile) {
          // Send to onboarding if profile doesn't exist
          window.location.href = '/onboarding';
          return;
        }
        setProfile(myProfile);
        
        const matches = await api.squads.match();
        setRecommendedSquads(matches);
      } catch (error) {
        console.error(error);
        // toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleGetCareerAdvice = async () => {
    try {
      setAdviceLoading(true);
      const res = await api.profiles.getCareerAdvice();
      setCareerAdvice(res.advice);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get career advice');
    } finally {
      setAdviceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Avatar className="h-10 w-10 border border-primary">
            <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </header>

        {profile && !profile.looking_for_squad ? (
          <div className="w-full glass rounded-2xl p-8 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full hidden pointer-events-none" />
            <div className="space-y-2 z-10 text-center md:text-left">
              <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Trophy className="text-primary w-6 h-6" /> You're in a squad!
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Check your squad page for active challenges and team updates.
              </p>
            </div>
            <div className="flex gap-4 z-10 w-full md:w-auto">
              <Link href="/squads" className="flex-1 md:flex-none">
                <Button className="w-full btn-primary">My Squad</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full glass rounded-2xl p-8 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full hidden pointer-events-none" />
            <div className="space-y-2 z-10 text-center md:text-left">
              <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Zap className="text-primary w-6 h-6" /> You're currently squadless
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Don't navigate alone. Find a squad that needs your skills or create a new one to start conquering challenges.
              </p>
            </div>
            <div className="flex gap-4 z-10 w-full md:w-auto">
              <Link href="/squads" className="flex-1 md:flex-none">
                <Button className="w-full btn-primary">Find a Squad</Button>
              </Link>
              <Link href="/squads/create" className="flex-1 md:flex-none">
                <Button variant="outline" className="w-full border-border">Create Squad</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="space-y-8">
            <Card className="glass border-none">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{profile?.full_name}</h2>
                  <p className="text-muted-foreground text-sm">{profile?.major} • {profile?.university}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {profile?.role_tags?.map(tag => (
                    <Badge key={tag} className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link href={`/profile/${profile?.id}`} className="w-full mt-4">
                  <Button variant="secondary" className="w-full bg-muted hover:bg-muted/80">View Profile</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-secondary" /> My Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Challenges Completed</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Squads Joined</span>
                  <span className="font-bold">{profile?.looking_for_squad ? 0 : 1}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Activity & Updates
            </h3>
            
            <div className="space-y-4">
              <Card className="glass border-none border-dashed border-border bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold">No recent activity</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                      Join a squad to see active challenges, upcoming deadlines, and team updates here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recommended for you</h3>
              <Link href="/squads">
                <Button variant="link" className="text-primary pr-0">View all <ChevronRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedSquads.map((match, i) => (
                <Link href={`/squads/${match.squad.id}`} key={i}>
                  <Card className="glass border-none hover:bg-muted transition-colors cursor-pointer h-full">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold">{match.squad.name}</h4>
                        <Badge variant="outline" className="bg-muted text-xs">{match.squad.focus_area}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{match.match_reason || match.squad.description}</p>
                      <div className="flex items-center text-[10px] text-primary">
                        <Zap className="w-3 h-3 mr-1" /> Match Score: {match.score}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {recommendedSquads.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2 text-center py-4 glass rounded-xl">No specific recommendations yet. Browse all squads!</p>
              )}
            </div>

            {/* AI College Advisor Section */}
            <div className="pt-8">
              <Card className="glass border border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" /> AI College Prep Advisor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations for summer programs, competitions, or open-source projects based on your intended major, skills, and school achievements.
                  </p>
                  
                  {!careerAdvice && !adviceLoading && (
                    <Button onClick={handleGetCareerAdvice} className="btn-primary" disabled={adviceLoading}>
                      Ask for College Prep Advice
                    </Button>
                  )}
                  
                  {adviceLoading && (
                    <div className="flex items-center text-primary text-sm gap-2 mt-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Fetching real-world opportunities...
                    </div>
                  )}
                  
                  {careerAdvice && (
                    <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border prose prose-invert text-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: careerAdvice.replace(/\n/g, '<br/>') }} />
                      <Button onClick={handleGetCareerAdvice} variant="outline" size="sm" className="mt-4 border-border">
                        Refresh Advice
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

