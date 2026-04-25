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
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Step = 'intro' | 'questions' | 'results' | 'roadmap';

export default function CareerExplorerPage() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  
  // Questionnaire State
  const [passions, setPassions] = useState('');
  const [subjects, setSubjects] = useState('');
  const [impact, setDesiredImpact] = useState('');

  // Results State
  const [options, setOptions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Roadmap State
  const [roadmap, setRoadmap] = useState<any>(null);

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

  const handleSelectRole = async (role: any) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      const res = await api.assistant.generateRoadmap({
        target_role: role.title,
        timeframe_months: 6,
        learning_hours_per_week: 10
      });
      setRoadmap(res);
      setStep('roadmap');
      toast.success('Your personalized roadmap is ready!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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
                            <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors border-primary/20">
                              Generate Roadmap <ArrowRight className="ml-2 w-4 h-4" />
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

          {/* Step 4: Roadmap */}
          {step === 'roadmap' && roadmap && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-20"
            >
              <header className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <Badge className="bg-primary/10 text-primary border-none mb-2">Personalized Roadmap</Badge>
                    <h1 className="text-4xl font-bold">{roadmap.title}</h1>
                    <p className="text-muted-foreground text-lg">{roadmap.target_role} • {roadmap.timeframe_months} Months</p>
                  </div>
                  <Link href={`/squads?focus_area=${selectedRole?.title}`}>
                    <Button className="btn-primary rounded-full px-6">Find {selectedRole?.title} Squads</Button>
                  </Link>
                </div>
                <Card className="glass border-none bg-primary/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Zap className="text-primary w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{roadmap.roadmap_data.description}</p>
                  </CardContent>
                </Card>
              </header>

              <div className="space-y-12 relative">
                {/* Connection Line */}
                <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-border z-0" />
                
                {roadmap.roadmap_data.phases.map((phase: any, i: number) => (
                  <motion.div 
                    key={i} 
                    className="relative z-10 pl-16 space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary shadow-lg">
                      {i + 1}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{phase.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{phase.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phase.resources.map((res: any, j: number) => (
                        <a key={j} href={res.url} target="_blank" rel="noopener noreferrer">
                          <Card className="glass border-none hover:bg-muted/50 transition-colors h-full">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Search className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium text-sm line-clamp-1">{res.title}</span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <motion.div 
                  className="relative z-10 pl-16 pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="absolute left-0 top-8 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="glass border border-primary/20 rounded-2xl p-8 space-y-4">
                    <h3 className="text-2xl font-bold">Goal Achieved!</h3>
                    <p className="text-muted-foreground">After completing these 6 phases, you will be ready to take on professional {selectedRole?.title} challenges.</p>
                    <div className="flex gap-4 pt-2">
                      <Link href="/dashboard" className="flex-1">
                        <Button variant="secondary" className="w-full bg-muted hover:bg-muted/80">Go to Dashboard</Button>
                      </Link>
                      <Button className="flex-1 btn-primary" onClick={() => setStep('results')}>Explore Other Roles</Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
