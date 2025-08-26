'use client';

import { lazy, Suspense } from 'react';

// Lazy load the heavy battle interface
const BattleInterface = lazy(() => import('@/components/BattleInterface'));

const LoadingBattles = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 className="text-white text-xl font-semibold mb-2">Loading Battle Arena</h2>
      <p className="text-white/70">Preparing wine battles...</p>
    </div>
  </div>
);

export default function BattlesPage() {
  return (
    <Suspense fallback={<LoadingBattles />}>
      <BattleInterface />
    </Suspense>
  );
}