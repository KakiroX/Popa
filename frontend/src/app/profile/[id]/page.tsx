'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, BookOpen, Trophy, Heart, Briefcase, Mail, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Profile } from '@/types';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'olympiad': return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 'volunteer': return <Heart className="w-5 h-5 text-red-400" />;
    case 'project': return <Briefcase className="w-5 h-5 text-blue-400" />;
    default: return <Trophy className="w-5 h-5 text-primary" />;
  }
};

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        let data;
        if (id === 'me') {
          data = await api.profiles.getMe();
          setIsOwnProfile(true);
        } else {
          data = await api.profiles.getById(id);
          // Check if it's the current user's ID
          const me = await api.profiles.getMe().catch(() => null);
          if (me && me.id === id) setIsOwnProfile(true);
        }
        setProfile(data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Profile not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="glass p-8 rounded-3xl relative overflow-hidden border border-border">
          <div className="absolute top-0 right-0 w-full h-32 bg-muted" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start pt-12">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-4xl">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <BookOpen className="w-4 h-4" /> {profile.major} • Year {profile.year_of_study}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" /> {profile.university}
                  </p>
                </div>
                
                {isOwnProfile ? (
                  <Button variant="outline" className="border-border">Edit Profile</Button>
                ) : (
                  <Button className="btn-primary">Invite to Squad</Button>
                )}
              </div>
              
              <p className="text-sm/relaxed max-w-2xl">{profile.bio}</p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.role_tags?.map(role => (
                  <Badge key={role} className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 text-sm">
                    {role}
                  </Badge>
                ))}
                {profile.looking_for_squad && (
                  <Badge variant="outline" className="border-accent text-accent">Looking for Squad</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-muted hover:bg-muted/80">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {!isOwnProfile && (
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border-border bg-muted">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" /> Message
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Achievements Timeline */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-secondary" /> Achievements
            </h2>
            
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card glass shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {getAchievementIcon(achievement.type)}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass border-border">
                      <div className="flex flex-col space-y-1 mb-2">
                        <span className="text-xs text-primary font-bold tracking-wider uppercase">{achievement.date}</span>
                        <h3 className="font-bold text-lg">{achievement.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 glass rounded-2xl border border-border">No achievements added yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
