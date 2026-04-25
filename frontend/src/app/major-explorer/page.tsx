'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  Target, 
  Zap, 
  Trophy, 
  BookOpen, 
  Rocket,
  Loader2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Step = 'intro' | 'questions' | 'results' | 'roadmap';

function CareerExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/onboarding';
  
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  
  // Questionnaire State
  const [passions, setPassions] = useState('');
  const [subjects, setSubjects] = useState('');
  const [impact, setDesiredImpact] = useState('');

  // Results State
  const [options, setOptions] = useState<any[]>([]);

  const handlePickCareer = async () => {
    if (!passions || !subjects || !impact) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.assistant.careerPick({
        passions,
        favorite_subjects: subjects,
        desired_impact: impact
      });
      setOptions(res.options);
      setStep('results');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get career recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: any) => {
    toast.success(`Selected ${role.title}! Returning to profile setup...`);
    router.push(`${returnTo}?major=${encodeURIComponent(role.title)}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Navigation / Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-primary text-sm flex items-center gap-1 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        {step !== 'intro' && (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            AI Career Assistant
          </Badge>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-4">
              <Compass className="text-primary w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Find Your <span className="text-gradient">True Path</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                Stop guessing. Our AI Career Matchmaker analyzes your passions, skills, and goals to pick the perfect role for your future.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="btn-primary rounded-full px-10 h-14 text-lg" onClick={() => setStep('questions')}>
                Start AI Discovery <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/squads">
                <Button variant="ghost" size="lg" className="rounded-full px-10 h-14 text-lg">
                  Browse Squads
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Step 2: Questionnaire */}
        {step === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground">The more details you provide, the better the match.</p>
            </div>

            <Card className="glass border-none">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> What are you passionate about?
                  </label>
                  <Textarea 
                    placeholder="e.g. Solving climate change, building beautiful apps, analyzing financial data..." 
                    className="min-h-[100px] bg-muted border-border"
                    value={passions}
                    onChange={(e) => setPassions(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Your favorite subjects or topics?
                  </label>
                  <Input 
                    placeholder="e.g. Physics, Psychology, Graphic Design..." 
                    className="bg-muted border-border h-12"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Target className="w-4 h-4" /> What impact do you want to make?
                  </label>
                  <Textarea 
                    placeholder="e.g. I want to lead a team of developers to create tools for non-profits..." 
                    className="min-h-[100px] bg-muted border-border"
                    value={impact}
                    onChange={(e) => setDesiredImpact(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full btn-primary h-14 text-lg" 
                  onClick={handlePickCareer}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Matching your profile...
                    </>
                  ) : (
                    <>
                      Find My Career <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Top Recommendations</h2>
              <p className="text-muted-foreground">Based on your passions and current skill profile.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {options.map((option, i) => (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass border-none hover:border-primary/30 transition-all cursor-pointer group" onClick={() => handleSelectRole(option)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-bold">{option.title}</h3>
                          </div>
                          <p className="text-muted-foreground">{option.description}</p>
                          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                            <p className="text-sm font-medium text-primary mb-1">Why it fits:</p>
                            <p className="text-sm italic">"{option.why_it_fits}"</p>
                          </div>
                        </div>
                        <div className="md:text-right flex flex-col justify-between items-end gap-4 min-w-[120px]">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Match Score</p>
                            <div className="text-4xl font-bold text-primary">{option.match_score}%</div>
                            <Progress value={option.match_score} className="h-2 w-24 ml-auto" />
                          </div>
                          <Button 
                            variant="outline" 
                            className="group-hover:bg-primary group-hover:text-white transition-colors border-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRole(option);
                            }}
                          >
                            Select this Major <CheckCircle2 className="ml-2 w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={() => setStep('questions')}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Try different interests
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default function CareerExplorerPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading AI Assistant...</p>
        </div>
      }>
        <CareerExplorerContent />
      </Suspense>
    </div>
  );
}
