'use client';

import { lazy, Suspense } from 'react';

// Lazy load the heavy guild interface
const GuildInterface = lazy(() => import('@/components/GuildInterface'));

const LoadingGuilds = () => (
  <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 className="text-white text-xl font-semibold mb-2">Loading Guild Hall</h2>
      <p className="text-white/70">Connecting to wine communities...</p>
    </div>
  </div>
);

export default function GuildsPage() {
  return (
    <Suspense fallback={<LoadingGuilds />}>
      <GuildInterface />
    </Suspense>
  );
}