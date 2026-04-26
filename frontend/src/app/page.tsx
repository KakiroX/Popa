'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Users, GraduationCap, Trophy, Zap, Sparkles, Target, Brain,
  Rocket, ArrowRight, ChevronDown, Star, Globe, Shield, Code,
  Palette, TrendingUp, MessageSquare, Award, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

/* ─── Animated counter ─── */
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ─── Floating particles canvas (white/grey) ─── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}

/* ─── Typewriter effect ─── */
function Typewriter({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, 45);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-white/40">|</span>}
    </span>
  );
}

/* ─── Soft glow orb (grey/white only) ─── */
function GlowOrb({ size, top, left, delay = 0, opacity = 0.06 }: { size: number; top: string; left: string; delay?: number; opacity?: number }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ width: size, height: size, top, left, background: `rgba(255,255,255,${opacity})` }}
      animate={{ scale: [1, 1.2, 1], opacity: [opacity, opacity * 1.8, opacity] }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function LandingPage() {
  const [stats, setStats] = useState({ total_squads: 0, total_students: 0, total_challenges_completed: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.stats.get().then(setStats).catch(() => {});
  }, []);

  // Apply dark theme class to body so footer and body match
  useEffect(() => {
    document.body.classList.add('landing-active');
    return () => { document.body.classList.remove('landing-active'); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  const features = [
    { icon: Sparkles, title: 'Build Your Profile', desc: 'Highlight your skills, school, and academic interests to find the perfect team.' },
    { icon: Users, title: 'Join a Squad', desc: 'Get matched with other ambitious students to solve real problems together.' },
    { icon: Trophy, title: 'College Portfolio', desc: 'Complete AI-generated real-world tasks that make your university application stand out.' },
  ];

  const capabilities = [
    { icon: Brain, title: 'AI-Powered Challenges', desc: 'Google Gemini generates unique, industry-relevant challenges tailored to your squad\'s composition.' },
    { icon: Target, title: 'Smart Matching', desc: 'Our algorithm finds the perfect squad for you based on your skills, major, and interests.' },
    { icon: Globe, title: 'Cross-Discipline Teams', desc: 'Work with developers, designers, marketers, and business minds — just like the real world.' },
    { icon: Rocket, title: 'Portfolio Builder', desc: 'Every completed challenge becomes a portfolio piece for your college application.' },
    { icon: Shield, title: 'Mentored Growth', desc: 'AI coaching guides you through each challenge with role-specific task breakdowns.' },
    { icon: Award, title: 'Track Achievements', desc: 'Log olympiads, volunteer work, and projects in a beautiful achievement timeline.' },
  ];

  const roles = [
    { icon: Code, label: 'Developer' },
    { icon: Palette, label: 'Designer' },
    { icon: TrendingUp, label: 'Business' },
    { icon: MessageSquare, label: 'Marketing' },
    { icon: BookOpen, label: 'Finance' },
    { icon: Star, label: 'Data Science' },
  ];

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/60 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center group-hover:bg-white/90 transition-colors">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Squad Navigator</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
            <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How It Works</a>
            <a href="#roles" className="hover:text-white transition-colors duration-300">Roles</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/[0.06] rounded-full px-5 transition-all duration-300">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium shadow-lg shadow-white/10 border-0 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20"
      >
        <ParticleField />
        <GlowOrb size={600} top="5%" left="5%" opacity={0.03} />
        <GlowOrb size={500} top="50%" left="65%" delay={3} opacity={0.04} />
        <GlowOrb size={350} top="25%" left="75%" delay={5} opacity={0.025} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 text-center space-y-8 max-w-5xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-white/50 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-white/60" />
            Powered by Google Gemini AI
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95]">
            <span className="text-white">Build your future.</span>
            <br />
            <span className="text-white/30">
              <Typewriter text="Before university." />
            </span>
          </h1>

          <p className="text-white/35 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The platform for ambitious high school students to collaborate on real-world projects, tackle AI-generated challenges, and build a stand-out portfolio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-10 py-7 rounded-full shadow-2xl shadow-white/10 border-0 font-semibold group transition-all duration-300">
                Start My Portfolio
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/squads">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-full border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/20 bg-white/[0.02] backdrop-blur-md transition-all duration-300">
                Find My Squad
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="z-10 grid grid-cols-3 gap-6 md:gap-16 mt-20 md:mt-28 w-full max-w-3xl"
        >
          {[
            { label: 'Squads Formed', value: stats.total_squads, icon: Users },
            { label: 'High Schoolers', value: stats.total_students, icon: GraduationCap },
            { label: 'Projects Built', value: stats.total_challenges_completed, icon: Trophy },
          ].map((s, i) => (
            <div key={i} className="text-center space-y-2">
              <s.icon className="w-5 h-5 mx-auto text-white/25 mb-1" />
              <div className="text-3xl md:text-4xl font-bold text-white">
                <AnimatedCounter target={s.value} />+
              </div>
              <div className="text-white/30 text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-white/15" />
        </motion.div>
      </motion.section>

      {/* ── Divider line ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} className="text-white/40 font-semibold mb-3 tracking-widest uppercase text-xs">How It Works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              Three steps to a{' '}
              <span className="text-white/40">professional portfolio</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/25 text-lg max-w-xl mx-auto">Before you even graduate high school.</motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="group relative h-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 overflow-hidden backdrop-blur-sm">
                  {/* subtle top glow on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/[0.04] to-transparent" />
                  <div className="relative z-10">
                    <div className="text-7xl font-black text-white/[0.03] absolute -top-3 -right-1 select-none">0{i + 1}</div>
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:bg-white/[0.08] transition-colors duration-300">
                      <f.icon className="w-7 h-7 text-white/50 group-hover:text-white/70 transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white/90">{f.title}</h3>
                    <p className="text-white/35 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* ── Capabilities ── */}
      <section id="features" className="relative py-32 px-4">
        <GlowOrb size={700} top="15%" left="-15%" delay={2} opacity={0.025} />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} className="text-white/40 font-semibold mb-3 tracking-widest uppercase text-xs">Platform Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="text-white/40">stand out</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/25 text-lg max-w-xl mx-auto">
              AI coaching, smart matching, and real-world challenges — all in one platform.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {capabilities.map((c, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="group p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.035] hover:border-white/[0.1] transition-all duration-400 h-full backdrop-blur-sm">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] group-hover:scale-105 transition-all duration-300">
                    <c.icon className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white/85">{c.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* ── Roles showcase ── */}
      <section id="roles" className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.p variants={fadeUp} className="text-white/40 font-semibold mb-3 tracking-widest uppercase text-xs">Squad Roles</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              Find your{' '}
              <span className="text-white/40">role</span>{' '}
              in the squad
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/25 text-lg max-w-xl mx-auto mb-16">
              Every great team needs diverse skills. Which one are you?
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {roles.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.06, y: -3 }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 cursor-default backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <r.icon className="w-5 h-5 text-white/45" />
                </div>
                <span className="font-medium text-white/65">{r.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* ── Final CTA ── */}
      <section className="relative py-32 px-4">
        <div className="max-w-3xl mx-auto relative">
          <GlowOrb size={500} top="-30%" left="15%" delay={0} opacity={0.03} />
          <GlowOrb size={400} top="40%" left="60%" delay={4} opacity={0.025} />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center p-12 md:p-16 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-white/40 mb-6">
              <Rocket className="w-4 h-4" /> Ready to launch?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to{' '}
              <span className="text-white/40">stand out</span>?
            </h2>
            <p className="text-white/30 text-lg mb-10 max-w-lg mx-auto">
              Join other students building amazing things for their college applications. Your squad is waiting.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-12 py-7 rounded-full shadow-2xl shadow-white/10 border-0 font-semibold group transition-all duration-300">
                Join Squad Navigator
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
