'use client';

import { lazy, Suspense } from 'react';

// Lazy load the heavy trading interface
const TradingInterface = lazy(() => import('@/components/TradingInterface'));

const LoadingTrading = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 className="text-white text-xl font-semibold mb-2">Loading Trading Center</h2>
      <p className="text-white/70">Initializing wine marketplace...</p>
    </div>
  </div>
);

export default function TradingPage() {
  return (
    <Suspense fallback={<LoadingTrading />}>
      <TradingInterface />
    </Suspense>
  );
}