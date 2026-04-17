'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Zap, Target, FileText, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Challenge } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ChallengeDetailPage() {
  const params = useParams();
  const challengeId = params.id as string;
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [submission, setSubmission] = useState({
    content: '',
    attachments: ''
  });

  useEffect(() => {
    async function fetchChallenge() {
      try {
        setLoading(true);
        const data = await api.challenges.getById(challengeId);
        setChallenge(data);
      } catch (error) {
        toast.error('Failed to load challenge details');
      } finally {
        setLoading(false);
      }
    }
    if (challengeId) fetchChallenge();
  }, [challengeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.challenges.submit(challengeId, {
        content: submission.content,
        attachments: [submission.attachments]
      });
      toast.success('Work submitted successfully!');
      router.push(`/squads/${challenge?.squad_id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Challenge not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link href={`/squads/${challenge.squad_id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Squad
        </Link>

        {/* Challenge Header */}
        <div className="glass p-8 rounded-3xl relative overflow-hidden border border-border">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Target className="w-48 h-48 text-secondary" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-secondary/20 text-secondary border-none">{challenge.category}</Badge>
                <Badge variant="outline" className="border-border">{challenge.difficulty}</Badge>
                {challenge.generated_by_ai && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-none flex items-center gap-1">
                    <Zap className="w-3 h-3" /> AI Generated
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold">{challenge.title}</h1>
              <div className="flex items-center text-accent font-medium mt-2">
                <Clock className="w-4 h-4 mr-2" /> {challenge.deadline_days} Days remaining
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <Badge className={challenge.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-muted'}>
                {challenge.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-5 h-5 text-primary" /> Challenge Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                  {challenge.description}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-xl">Task Breakdown</CardTitle>
                <CardDescription>Role-specific objectives for this challenge.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.tasks.map((task, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted border border-border flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0 pt-1">
                      <Badge variant="outline" className="border-primary/50 text-primary">{task.assigned_role}</Badge>
                    </div>
                    <div>
                      <h4 className="font-bold">{task.task_title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Submission */}
          <div className="space-y-8">
            <Card className="glass border-border border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" /> Submit Work
                </CardTitle>
                <CardDescription>Ready to complete this challenge?</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Message / Summary</Label>
                    <Textarea 
                      placeholder="Briefly describe what your squad accomplished..." 
                      className="bg-muted border-border resize-none h-24"
                      value={submission.content}
                      onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Repository / Figma Link</Label>
                    <Input 
                      placeholder="https://..." 
                      className="bg-muted border-border" 
                      value={submission.attachments}
                      onChange={(e) => setSubmission({ ...submission, attachments: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
