'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Trophy, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LandingPage() {
  const [stats, setStats] = useState([
    { label: 'Total Squads', value: '0', icon: Users },
    { label: 'Students', value: '0', icon: GraduationCap },
    { label: 'Challenges', value: '0', icon: Trophy },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.stats.get();
        setStats([
          { label: 'Total Squads', value: data.total_squads.toString(), icon: Users },
          { label: 'Students', value: data.total_students.toString(), icon: GraduationCap },
          { label: 'Challenges', value: data.total_challenges_completed.toString(), icon: Trophy },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }
    fetchStats();
  }, []);

  const features = [
    {
      title: 'Create Profile',
      description: 'Highlight your skills, major, and achievements to find the perfect squad.',
      step: '01',
    },
    {
      title: 'Join a Squad',
      description: 'Get matched with students from diverse backgrounds (Devs, Designers, Business).',
      step: '02',
    },
    {
      title: 'Conquer Challenges',
      description: 'Complete AI-generated real-world tasks and build your portfolio.',
      step: '03',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full hidden animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full hidden animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center space-y-6 max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            Don't navigate alone. <br />
            <span className="gradient-text">Build your squad.</span>
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto">
            The platform for multidisciplinary student collaboration powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth">
              <Button size="lg" className="btn-primary text-lg px-8 py-6 rounded-full">
                Get Started
              </Button>
            </Link>
            <Link href="/squads">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-border hover:bg-muted">
                Find My Squad
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center p-6 glass rounded-2xl">
              <stat.icon className="w-8 h-8 text-primary mb-4" />
              <span className="text-4xl font-bold">{stat.value}+</span>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground">Three steps to professional collaboration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ translateY: -4 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-none h-full relative">
                <CardContent className="p-8 space-y-4">
                  <div className="text-5xl font-bold opacity-10 absolute right-8 top-8">{feature.step}</div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto glass p-12 rounded-3xl space-y-8">
          <h2 className="text-4xl font-bold">Ready to find your team?</h2>
          <p className="text-muted-foreground text-xl">
            Join hundreds of students already building amazing things together.
          </p>
          <Link href="/auth">
            <Button size="lg" className="btn-primary text-lg px-8 py-6 rounded-full">
              Join Squad Navigator
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

