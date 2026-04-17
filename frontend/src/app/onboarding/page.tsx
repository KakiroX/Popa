'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ROLES = ['Developer', 'Designer', 'Marketer', 'Business Analyst', 'Finance', 'Legal', 'Content Creator', 'Data Scientist'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    major: '',
    year_of_study: '1',
    bio: '',
    skills: '',
    looking_for_squad: true,
    focus_interest: 'Any'
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const handleNext = () => setStep(Math.min(step + 1, 4));
  const handleBack = () => setStep(Math.max(step - 1, 1));

  const handleFinish = async () => {
    try {
      setLoading(true);
      await api.profiles.updateMe({
        full_name: formData.full_name,
        university: formData.university,
        major: formData.major,
        year_of_study: parseInt(formData.year_of_study),
        bio: formData.bio,
        role_tags: selectedRoles,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        achievements: achievements,
        looking_for_squad: formData.looking_for_squad
      });
      toast.success('Profile completed!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`h-1 w-16 sm:w-32 mx-2 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-2xl glass border-none overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <div className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Basic Info</CardTitle>
                  <CardDescription>Tell us a bit about yourself.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="Jane Doe" 
                      className="bg-muted border-border" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Input 
                      placeholder="State University" 
                      className="bg-muted border-border" 
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Major</Label>
                      <Input 
                        placeholder="Computer Science" 
                        className="bg-muted border-border" 
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Study</Label>
                      <Select 
                        value={formData.year_of_study}
                        onValueChange={(val) => setFormData({...formData, year_of_study: val || '1'})}
                      >
                        <SelectTrigger className="bg-muted border-border">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(y => <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 2 && (
              <div className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Roles & Skills</CardTitle>
                  <CardDescription>What do you bring to a squad?</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  <div className="space-y-4">
                    <Label>Select your primary roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map(role => (
                        <Badge 
                          key={role} 
                          variant={selectedRoles.includes(role) ? "default" : "outline"}
                          className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-all ${selectedRoles.includes(role) ? 'bg-primary text-primary-foreground' : 'hover:border-primary border-border'}`}
                          onClick={() => toggleRole(role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Specific Skills (comma separated)</Label>
                    <Input 
                      placeholder="React, Python, Financial Modeling, Figma" 
                      className="bg-muted border-border" 
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>
                </CardContent>
              </div>
            )}

            {step === 3 && (
              <div className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Achievements</CardTitle>
                  <CardDescription>Highlight your past wins and projects.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="space-y-2">
                    <Label>Bio / About Me</Label>
                    <Textarea 
                      placeholder="Tell us about your background and interests..." 
                      className="bg-muted border-border resize-none h-24" 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">You can add more detailed achievements in your profile later.</p>
                </CardContent>
              </div>
            )}

            {step === 4 && (
              <div className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Squad Preferences</CardTitle>
                  <CardDescription>What kind of team are you looking for?</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  <div className="space-y-2">
                    <Label>Focus Area Interest</Label>
                    <Select 
                      value={formData.focus_interest}
                      onValueChange={(val) => setFormData({...formData, focus_interest: val || 'Any'})}
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue placeholder="Select interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="EdTech">EdTech</SelectItem>
                        <SelectItem value="GreenTech">GreenTech</SelectItem>
                        <SelectItem value="Any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div 
                    onClick={() => setFormData({...formData, looking_for_squad: true})}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${formData.looking_for_squad ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted'}`}
                  >
                    <h4 className="font-bold mb-1">Looking to join a squad</h4>
                    <p className="text-sm text-muted-foreground">Match me with existing teams that need my skills.</p>
                  </div>

                  <div 
                    onClick={() => setFormData({...formData, looking_for_squad: false})}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${!formData.looking_for_squad ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted'}`}
                  >
                    <h4 className="font-bold mb-1">I want to create a new squad</h4>
                    <p className="text-sm text-muted-foreground">I have an idea and want to recruit members.</p>
                  </div>
                </CardContent>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <CardFooter className="flex justify-between border-t border-border p-6">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading} className="hover:bg-muted">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} className="btn-primary">
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 ml-2" />}
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

