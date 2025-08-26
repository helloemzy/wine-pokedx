'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EvolutionChainEntry, Wine } from '@/types/wine';

interface EvolutionChainProps {
  evolutionChain: EvolutionChainEntry[];
  currentWineId?: string;
  onWineClick?: (wine: Wine) => void;
  className?: string;
}

export function EvolutionChain({ 
  evolutionChain, 
  currentWineId, 
  onWineClick,
  className 
}: EvolutionChainProps) {
  if (!evolutionChain || evolutionChain.length <= 1) {
    return null;
  }

  const getEvolutionIcon = (requirement?: string) => {
    if (!requirement) return <ArrowRight size={16} />;
    
    if (requirement.includes('age') || requirement.includes('year')) {
      return <Clock size={16} />;
    }
    if (requirement.includes('rating') || requirement.includes('score')) {
      return <Star size={16} />;
    }
    if (requirement.includes('value') || requirement.includes('price')) {
      return <TrendingUp size={16} />;
    }
    return <ArrowRight size={16} />;
  };

  return (
    <div className={cn(
      'evolution-chain bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50',
      'border border-purple-200 rounded-lg p-4',
      className
    )}>
      <h3 className="text-sm font-semibold text-purple-800 mb-3 text-center">
        Evolution Chain
      </h3>
      
      <div className="flex items-center justify-center gap-2 overflow-x-auto">
        {evolutionChain.map((entry, index) => (
          <div key={entry.id} className="flex items-center gap-2">
            {/* Wine Evolution Stage */}
            <motion.div
              className="evolution-wine flex flex-col items-center gap-2 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  'evolution-wine-image relative cursor-pointer',
                  'w-16 h-16 rounded-full border-4 shadow-lg',
                  'bg-gradient-to-br from-purple-100 to-pink-100',
                  'flex items-center justify-center',
                  currentWineId === entry.id
                    ? 'border-purple-500 shadow-purple-500/30'
                    : 'border-white hover:border-purple-300'
                )}
                onClick={() => onWineClick?.(entry)}
              >
                {/* Wine bottle icon */}
                <div className="text-2xl">🍷</div>
                
                {/* Current wine indicator */}
                {currentWineId === entry.id && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Wine name */}
              <div className="text-center">
                <div className="text-xs font-medium text-gray-800 truncate max-w-[80px]">
                  {entry.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  {entry.year}
                </div>
              </div>
              
              {/* Evolution requirements tooltip */}
              {entry.evolutionRequirement && (
                <div className="evolution-requirements absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    {entry.evolutionRequirement}
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Evolution Arrow */}
            {index < evolutionChain.length - 1 && (
              <motion.div
                className="evolution-arrow flex flex-col items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-full text-white shadow-md',
                  'w-8 h-8 bg-purple-500 animate-pulse'
                )}>
                  {getEvolutionIcon(evolutionChain[index + 1].evolutionRequirement)}
                </div>
                
                {/* Requirements text */}
                {evolutionChain[index + 1].evolutionRequirement && (
                  <div className="text-[9px] text-purple-600 text-center max-w-[60px] leading-tight">
                    {evolutionChain[index + 1].evolutionRequirement.split(' ').slice(0, 2).join(' ')}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Evolution chain stats */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-purple-700">
        <div className="flex items-center gap-1">
          <span className="font-medium">Stages:</span>
          <span>{evolutionChain.length}</span>
        </div>
        {currentWineId && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Current:</span>
            <span>
              {evolutionChain.findIndex(entry => entry.id === currentWineId) + 1}/
              {evolutionChain.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}