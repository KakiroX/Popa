'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function UniversityMapPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-primary">University Explorer</h1>
        </div>

        <div className="glass rounded-2xl p-4 border border-primary/20 bg-primary/5 flex flex-col items-center justify-center min-h-[600px]">
          <div className="w-full h-full flex justify-center items-center overflow-hidden rounded-xl">
            <iframe
              src="https://university-map.github.io/#/en/embed"
              width="100%"
              height="600"
              style={{ border: 'none', borderRadius: '8px' }}
              loading="lazy"
              allowFullScreen
              title="University Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
