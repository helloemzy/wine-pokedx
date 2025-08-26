'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Zap, Shield, Sword, Target, Flame, Droplets } from 'lucide-react';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  type?: 'complexity' | 'balance' | 'intensity' | 'finesse' | 'power' | 'elegance';
  animated?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statConfig = {
  complexity: { 
    gradient: 'bg-gradient-to-r from-purple-400 to-purple-600', 
    icon: Zap,
    color: 'text-purple-500',
    name: 'Complexity'
  },
  balance: { 
    gradient: 'bg-gradient-to-r from-blue-400 to-blue-600', 
    icon: Shield,
    color: 'text-blue-500',
    name: 'Balance'
  },
  intensity: { 
    gradient: 'bg-gradient-to-r from-red-400 to-red-600', 
    icon: Sword,
    color: 'text-red-500',
    name: 'Intensity'
  },
  finesse: { 
    gradient: 'bg-gradient-to-r from-purple-400 to-purple-600', 
    icon: Target,
    color: 'text-purple-500',
    name: 'Finesse'
  },
  power: { 
    gradient: 'bg-gradient-to-r from-orange-400 to-orange-600', 
    icon: Flame,
    color: 'text-orange-500',
    name: 'Power'
  },
  elegance: { 
    gradient: 'bg-gradient-to-r from-cyan-400 to-cyan-600', 
    icon: Droplets,
    color: 'text-cyan-500',
    name: 'Elegance'
  },
};

export function StatBar({ 
  label, 
  value, 
  maxValue = 100, 
  type = 'power',
  animated = true,
  showIcon = true,
  size = 'md'
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const config = statConfig[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: { container: 'h-2', text: 'text-xs', spacing: 'py-1' },
    md: { container: 'h-3', text: 'text-sm', spacing: 'py-2' },
    lg: { container: 'h-4', text: 'text-base', spacing: 'py-3' },
  };
  
  return (
    <div className={cn('stat-bar', sizeClasses[size].spacing)}>
      <div className={cn(
        'stat-label flex items-center gap-2 min-w-[100px] uppercase tracking-wide font-medium',
        sizeClasses[size].text,
        config.color
      )}>
        {showIcon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
        {label || config.name}
      </div>
      
      <div className={cn(
        'stat-bar-container flex-1 bg-gray-200 rounded-full overflow-hidden relative',
        sizeClasses[size].container
      )}>
        <motion.div
          className={cn('stat-bar-fill h-full relative overflow-hidden', config.gradient)}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        </motion.div>
        
        {/* Value indicator line for high values */}
        {value >= 80 && (
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-white/60"
            style={{ left: `${percentage}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          />
        )}
      </div>
      
      <div className={cn(
        'stat-value font-bold min-w-[40px] text-right',
        sizeClasses[size].text,
        value >= 90 ? 'text-green-600' :
        value >= 70 ? 'text-yellow-600' :
        value >= 50 ? 'text-orange-600' : 'text-gray-600'
      )}>
        {value}
      </div>
    </div>
  );
}