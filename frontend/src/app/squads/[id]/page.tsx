'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Users, Zap, Calendar, ArrowLeft, Trophy, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Squad, Challenge, Message, Profile } from '@/types';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

export default function SquadDetailPage() {
  const params = useParams();
  const squadId = params.id as string;
  
  const [squad, setSquad] = useState<Squad | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [category, setCategory] = useState('Hackathon');

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const squadData = await api.squads.getById(squadId);
      setSquad(squadData);
      
      const challengesData = await apiFetch(`/api/squads/${squadId}/challenges`).catch(() => []);
      setChallenges(challengesData);

      const msgs = await api.squads.getMessages(squadId).catch(() => []);
      setMessages(msgs);
    } catch (error) {
      toast.error('Failed to load squad details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (squadId) fetchData();
  }, [squadId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsChatLoading(true);
      const tempMsg = newMessage;
      setNewMessage(''); // clear input early for UX
      
      const newMsgs = await api.squads.sendMessage(squadId, tempMsg);
      // Backend returns a list of [user_message] or [user_message, ai_message]
      // We prepend them because flex-col-reverse shows newest at bottom
      setMessages((prev) => [...newMsgs.reverse(), ...prev]); 
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const newChallenge = await api.challenges.generate({
        squad_id: squadId,
        difficulty,
        category
      });
      toast.success('AI Challenge generated successfully!');
      setChallenges([newChallenge, ...challenges]);
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate challenge');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoin = async () => {
    try {
      const role = prompt("What role would you like to take? (e.g. Developer, Designer)");
      if (!role) return;
      
      await api.squads.join(squadId, role);
      toast.success('Successfully joined the squad!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join squad');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold">Squad not found</h1>
        <Link href="/squads">
          <Button>Back to Squads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link href="/squads" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Squads
          </Link>
          
          <div className="glass p-8 rounded-2xl relative overflow-hidden border-border">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full hidden pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{squad.focus_area}</Badge>
                  {squad.is_open && <Badge className="bg-accent text-accent-foreground border-none">Accepting Members</Badge>}
                </div>
                <h1 className="text-4xl font-bold">{squad.name}</h1>
                <p className="text-muted-foreground max-w-2xl text-lg">{squad.description}</p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {squad.is_open && (
                  <Button onClick={handleJoin} className="btn-primary w-full md:w-auto px-8" size="lg">Join Squad</Button>
                )}
                <Button variant="outline" className="border-border w-full md:w-auto" onClick={() => setShowModal(true)}>
                  <Zap className="w-4 h-4 mr-2 text-secondary" /> Generate Challenge
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Overview / Chat */}
        <div className="mt-8">
          <div className="flex border-b border-border mb-6">
            <button 
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${!showChat ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setShowChat(false)}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${showChat ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setShowChat(true)}
            >
              Squad Chat
            </button>
          </div>

          {!showChat ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Members Column */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" /> Members ({squad.members?.length || 0})
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {squad.members?.map(member => (
                    <Card key={member.id} className="glass border-border">
                      <CardContent className="p-5 flex items-start gap-4">
                        <Avatar className="h-12 w-12 border border-primary/50">
                          <AvatarFallback>{member.profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div>
                            <h3 className="font-bold">{member.profile?.full_name || 'Unknown User'}</h3>
                            <p className="text-xs text-muted-foreground">{member.profile?.major} • <span className="text-primary">{member.role_in_squad}</span></p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.profile?.skills?.slice(0, 3).map(skill => (
                              <Badge key={skill} variant="secondary" className="bg-muted text-[10px] py-0">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Challenges */}
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-secondary" /> Active Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {challenges.length > 0 ? challenges.map(challenge => (
                      <Link href={`/challenges/${challenge.id}`} key={challenge.id}>
                        <div className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors border border-border cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-none">{challenge.status}</Badge>
                          </div>
                          <h4 className="font-bold text-sm mb-2">{challenge.title}</h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" /> {challenge.deadline_days} days
                          </div>
                        </div>
                      </Link>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No challenges yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="glass border-border rounded-xl overflow-hidden flex flex-col h-[600px] relative">
              <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center z-10">
                <div className="font-bold flex items-center gap-2">
                  <Users className="w-4 h-4" /> Squad Chat
                </div>
                <div className="text-xs text-muted-foreground flex gap-3">
                  <span className="font-medium text-primary">/ai [ask anything]</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                {isChatLoading && <div className="text-center text-xs text-muted-foreground pb-4">AI is typing...</div>}
                
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.is_ai ? '' : 'flex-row-reverse'}`}>
                    <Avatar className={`w-8 h-8 shrink-0 ${msg.is_ai ? 'bg-primary border-primary' : 'border-border'}`}>
                      {msg.is_ai ? (
                        <Zap className="w-4 h-4 text-white m-auto mt-2" />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {msg.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.is_ai ? 'bg-muted border border-border' : 'bg-primary text-primary-foreground'}`}>
                      {!msg.is_ai && <div className="text-[10px] opacity-70 mb-1 text-right">{msg.profiles?.full_name || 'Me'}</div>}
                      {msg.is_ai && <div className="text-[10px] text-muted-foreground mb-1">Gemini Scout</div>}
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-20 flex-1 flex flex-col justify-end">
                    <p>No messages yet. Say hello or trigger the AI!</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-border bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Type a message or use /ai..." 
                    className="flex-1 bg-muted border-border"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isChatLoading}
                  />
                  <Button type="submit" className="btn-primary shrink-0 px-3" disabled={isChatLoading || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md glass border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Generate AI Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-16 h-16 animate-spin text-primary" />
                  <p className="text-primary font-medium animate-pulse">Gemini is crafting your challenge...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Select difficulty and category for your next squad challenge.</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                          <Button 
                            key={d}
                            variant={difficulty === d ? 'default' : 'outline'} 
                            className={difficulty === d ? 'bg-primary/20 text-primary border-primary' : 'bg-muted'}
                            onClick={() => setDifficulty(d)}
                          >
                            {d}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select 
                        className="w-full bg-muted border border-border rounded-md p-2"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option>Hackathon</option>
                        <option>Business Case</option>
                        <option>Product Sprint</option>
                        <option>Pitch</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} className="btn-primary">Generate</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper for inline fetch since we need it for challenges
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = await (async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  })();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
}
