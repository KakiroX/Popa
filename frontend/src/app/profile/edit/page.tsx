'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronLeft, Loader2, Save, X, Plus, Trophy, Heart, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Profile, Achievement } from '@/types';

const ROLES = ['Developer', 'Designer', 'Marketer', 'Business Analyst', 'Finance', 'Legal', 'Content Creator', 'Data Scientist'];
const ACHIEVEMENT_TYPES = [
  { value: 'olympiad', label: 'Olympiad/Competition', icon: Trophy },
  { value: 'volunteer', label: 'Volunteer', icon: Heart },
  { value: 'project', label: 'Project', icon: Briefcase },
];

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    university: '',
    major: '',
    year_of_study: 9,
    bio: '',
    role_tags: [],
    skills: [],
    achievements: [],
    looking_for_squad: true
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [newAchievement, setNewAchievement] = useState<Achievement>({
    title: '',
    description: '',
    date: '',
    type: 'project'
  });
  const [showAchForm, setShowAchForm] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await api.profiles.getMe();
        setProfile(data);
        setSkillsInput(data.skills?.join(', ') || '');
      } catch (error) {
        toast.error('Failed to load profile');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedData = {
        ...profile,
        skills: skillsInput.split(',').map(s => s.trim()).filter(s => s),
      };
      await api.profiles.updateMe(updatedData);
      toast.success('Profile updated successfully!');
      router.push('/profile/me');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    const currentRoles = profile.role_tags || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    setProfile({ ...profile, role_tags: newRoles });
  };

  const addAchievement = () => {
    if (!newAchievement.title || !newAchievement.date) {
      toast.error('Title and date are required');
      return;
    }
    const currentAchs = profile.achievements || [];
    setProfile({ ...profile, achievements: [...currentAchs, newAchievement] });
    setNewAchievement({ title: '', description: '', date: '', type: 'project' });
    setShowAchForm(false);
  };

  const removeAchievement = (index: number) => {
    const currentAchs = profile.achievements || [];
    setProfile({ ...profile, achievements: currentAchs.filter((_, i) => i !== index) });
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
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-muted">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <Button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Basic Info */}
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your school and academic details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Current School</Label>
                <Input 
                  value={profile.university}
                  onChange={(e) => setProfile({...profile, university: e.target.value})}
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intended Major</Label>
                  <Input 
                    value={profile.major}
                    onChange={(e) => setProfile({...profile, major: e.target.value})}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade Level</Label>
                  <Select 
                    value={profile.year_of_study?.toString()}
                    onValueChange={(val) => setProfile({...profile, year_of_study: parseInt(val)})}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[9, 10, 11, 12].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}th Grade</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea 
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="bg-muted border-border resize-none h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles & Skills */}
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle>Roles & Skills</CardTitle>
              <CardDescription>Update what you bring to a squad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(role => (
                    <Badge 
                      key={role} 
                      variant={(profile.role_tags || []).includes(role) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 transition-all ${(profile.role_tags || []).includes(role) ? 'bg-primary text-primary-foreground' : 'hover:border-primary border-border'}`}
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input 
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="bg-muted border-border"
                  placeholder="React, Python, Public Speaking"
                />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Highlight your wins.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowAchForm(true)} className="border-border">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAchForm && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={newAchievement.title}
                        onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                        placeholder="Hackathon Winner"
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        value={newAchievement.date}
                        onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                        placeholder="June 2025"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={newAchievement.type}
                      onValueChange={(val: any) => setNewAchievement({...newAchievement, type: val})}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACHIEVEMENT_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                      placeholder="Briefly describe what you did..."
                      className="bg-background border-border resize-none h-20"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowAchForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={addAchievement}>Add Achievement</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(profile.achievements || []).map((ach, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {ACHIEVEMENT_TYPES.find(t => t.value === ach.type)?.icon({ className: "w-4 h-4" } as any)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{ach.title}</p>
                        <p className="text-xs text-muted-foreground">{ach.date}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeAchievement(i)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
