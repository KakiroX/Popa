'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Zap, Filter, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Squad } from '@/types';
import { toast } from 'sonner';

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('open');
  const [search, setSearch] = useState('');

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const data = await api.squads.list({ 
        focus_area: filterArea, 
        open_only: filterStatus === 'open' 
      });
      setSquads(data);
    } catch (error) {
      toast.error('Failed to load squads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, [filterArea, filterStatus]);

  const handleSmartMatch = async () => {
    try {
      setIsMatching(true);
      const matches = await api.squads.match();
      if (matches.length > 0) {
        toast.success(`Found ${matches.length} matches!`);
        // In a real app, you might highlight them or show them in a modal
        setSquads(matches.map((m: any) => m.squad));
      } else {
        toast.info('No perfect matches found. Try browsing all squads!');
      }
    } catch (error) {
      toast.error('Smart match failed');
    } finally {
      setIsMatching(false);
    }
  };

  const handleJoin = async (squadId: string) => {
    try {
      // For simplicity, we ask for a role. In a real app, this might be a modal.
      const role = prompt("What role would you like to take? (e.g. Developer, Designer)");
      if (!role) return;
      
      await api.squads.join(squadId, role);
      toast.success('Successfully joined the squad!');
      fetchSquads();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join squad');
    }
  };

  const filteredSquads = squads.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discover Squads</h1>
            <p className="text-muted-foreground">Find the perfect team to collaborate with.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button 
              onClick={handleSmartMatch} 
              disabled={isMatching}
              className="flex-1 md:flex-none btn-primary shadow-sm border border-primary/20"
            >
              {isMatching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} 
              {isMatching ? 'Matching...' : 'Smart Match'}
            </Button>
            <Link href="/squads/create" className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full border-border">Create Squad</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="glass p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center border border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search squads by name..." 
              className="pl-9 bg-muted border-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={filterArea} onValueChange={(val) => setFilterArea(val || 'all')}>
              <SelectTrigger className="w-full md:w-[150px] bg-muted border-none">
                <SelectValue placeholder="Focus Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="FinTech">FinTech</SelectItem>
                <SelectItem value="GreenTech">GreenTech</SelectItem>
                <SelectItem value="EdTech">EdTech</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'open')}>
              <SelectTrigger className="w-full md:w-[150px] bg-muted border-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open Only</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Squad Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredSquads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSquads.map(squad => (
              <Card key={squad.id} className="glass border-border hover:border-primary/50 transition-colors flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
                      {squad.focus_area}
                    </Badge>
                    {squad.is_open ? (
                      <Badge className="bg-accent text-accent-foreground border-none">Open</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted/80">Closed</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{squad.name}</h3>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {squad.max_members} Max Members
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {squad.description}
                  </p>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border gap-2">
                  <Link href={`/squads/${squad.id}`} className="flex-1">
                    <Button variant="ghost" className="w-full bg-muted hover:bg-muted/80">View</Button>
                  </Link>
                  {squad.is_open && (
                    <Button onClick={() => handleJoin(squad.id)} className="flex-1 btn-primary">Join</Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl border border-border">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold">No squads found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new squad!</p>
            <Link href="/squads/create" className="mt-4 inline-block">
              <Button variant="outline">Create a Squad</Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

