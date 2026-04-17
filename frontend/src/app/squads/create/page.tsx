'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ROLES = ['Developer', 'Designer', 'Marketer', 'Business Analyst', 'Finance', 'Legal', 'Content Creator', 'Data Scientist'];

export default function CreateSquadPage() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    focus_area: 'Any',
    max_members: '5'
  });

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const newSquad = await api.squads.create({
        ...formData,
        max_members: parseInt(formData.max_members),
        needed_roles: selectedRoles
      });
      toast.success('Squad created successfully!');
      router.push(`/squads/${newSquad.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create squad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <Link href="/squads" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Squads
        </Link>

        <Card className="glass border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Users className="w-32 h-32 text-primary" />
          </div>
          
          <CardHeader>
            <CardTitle className="text-3xl">Create a New Squad</CardTitle>
            <CardDescription>Assemble your multidisciplinary dream team.</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="name">Squad Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., FinTech Innovators" 
                  className="bg-muted border-border" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mission / Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="What are you building? What's your goal?" 
                  className="bg-muted border-border resize-none h-24" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Focus Area</Label>
                  <Select 
                    value={formData.focus_area}
                    onValueChange={(val) => setFormData({ ...formData, focus_area: val || 'Any' })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FinTech">FinTech</SelectItem>
                      <SelectItem value="EdTech">EdTech</SelectItem>
                      <SelectItem value="GreenTech">GreenTech</SelectItem>
                      <SelectItem value="HealthTech">HealthTech</SelectItem>
                      <SelectItem value="Any">Any / General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Members</Label>
                  <Select 
                    value={formData.max_members}
                    onValueChange={(val) => setFormData({ ...formData, max_members: val || '5' })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Members</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <Label className="text-base">Roles Needed</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select the skills you need to complete your squad.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(role => (
                    <Badge 
                      key={role} 
                      variant={selectedRoles.includes(role) ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-all ${selectedRoles.includes(role) ? 'bg-primary text-primary-foreground' : 'hover:border-primary border-border bg-transparent'}`}
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full btn-primary" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Creating...' : 'Launch Squad'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

