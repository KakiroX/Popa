'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Compass, Lightbulb, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const MAJORS = [
  { name: 'Computer Science', category: 'STEM', description: 'Study of computation, automation, and information.', skills: ['Logic', 'Math', 'Problem Solving'] },
  { name: 'Business Administration', category: 'Business', description: 'Management of business operations and decision making.', skills: ['Leadership', 'Strategy', 'Finance'] },
  { name: 'Marketing', category: 'Business', description: 'Promoting and selling products or services.', skills: ['Creativity', 'Psychology', 'Communication'] },
  { name: 'Digital Arts', category: 'Creative', description: 'Creating art using digital technology.', skills: ['Design', 'Software', 'Aesthetics'] },
  { name: 'BioTech', category: 'STEM', description: 'Using biology to develop technologies and products.', skills: ['Science', 'Research', 'Lab Work'] },
  { name: 'Finance', category: 'Business', description: 'Management of money and investments.', skills: ['Analytics', 'Math', 'Economics'] },
  { name: 'Data Science', category: 'STEM', description: 'Extracting insights from data using statistics and algorithms.', skills: ['Coding', 'Stats', 'Visualization'] },
  { name: 'Environmental Science', category: 'STEM', description: 'Study of the environment and solutions to environmental problems.', skills: ['Ecology', 'Ethics', 'Sustainability'] },
];

export default function MajorExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMajors = MAJORS.filter(major => 
    major.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    major.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/onboarding" className="text-primary text-sm flex items-center gap-1 mb-2 hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back to Setup
            </Link>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Compass className="text-primary w-10 h-10" /> Major Explorer
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Discover which path fits your passions and skills.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search majors or categories..."
              className="pl-10 bg-muted border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMajors.map((major, i) => (
            <motion.div
              key={major.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass border-none h-full flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                      {major.category}
                    </Badge>
                  </div>
                  <CardTitle>{major.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{major.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {major.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 border-white/10">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button variant="ghost" className="w-full justify-between group hover:text-primary p-0 h-auto" onClick={() => {
                    // Logic to set major could go here if we passed state
                    alert(`Great choice! Type "${major.name}" in your profile.`);
                  }}>
                    Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMajors.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl border border-dashed border-border">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold">No majors found</h3>
            <p className="text-muted-foreground">Try searching for something else like "STEM" or "Business".</p>
          </div>
        )}

        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">Still undecided?</h3>
            <p className="text-muted-foreground">Try joining a squad in a field you're curious about. Hands-on experience is the best teacher.</p>
          </div>
          <Link href="/squads">
            <Button className="btn-primary rounded-full px-8">Browse Squads</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
