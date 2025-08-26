'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, Grape, Award, Sparkles, Eye, Mic, Heart, Share, Zap, Shield, Sword, Target, Flame, Droplets } from 'lucide-react';
import { getRarityColor, getWineTypeColor } from '@/lib/utils';
import { useGestures } from '@/hooks/useGestures';
import { useState, useCallback } from 'react';
import type { Wine } from '@/types/wine';

interface WineTradingCardProps {
  wine: Wine;
  isFlipped?: boolean;
  onFlip?: () => void;
  onClick?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onRate?: (rating: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  size?: 'small' | 'medium' | 'large';
  isFavorite?: boolean;
  isInteractive?: boolean;
}

export default function WineTradingCard({ 
  wine, 
  isFlipped = false, 
  onFlip, 
  onClick,
  onFavorite,
  onShare,
  onRate,
  onNext,
  onPrevious,
  size = 'medium',
  isFavorite = false,
  isInteractive = true
}: WineTradingCardProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Quick rating state for swipe-to-rate
  const [quickRating, setQuickRating] = useState<number | null>(null);

  // Gesture callbacks
  const handleTap = useCallback(() => {
    if (isInteractive) {
      onClick?.();
    }
  }, [onClick, isInteractive]);

  const handleDoubleTap = useCallback(() => {
    if (isInteractive) {
      onFlip?.();
    }
  }, [onFlip, isInteractive]);

  const handleLongPress = useCallback(() => {
    if (isInteractive) {
      setShowActionMenu(true);
    }
  }, [isInteractive]);

  const handleSwipeLeft = useCallback(() => {
    if (isInteractive) {
      onNext?.();
    }
  }, [onNext, isInteractive]);

  const handleSwipeRight = useCallback(() => {
    if (isInteractive) {
      onPrevious?.();
    }
  }, [onPrevious, isInteractive]);

  const handleSwipeUp = useCallback(() => {
    if (isInteractive) {
      onFavorite?.();
      // Show temporary favorite indicator
      setTimeout(() => setQuickRating(null), 1500);
    }
  }, [onFavorite, isInteractive]);

  const handleSwipeDown = useCallback(() => {
    if (isInteractive && onRate) {
      // Show quick rating interface
      setQuickRating(wine.rating || 0);
      setTimeout(() => setQuickRating(null), 3000);
    }
  }, [onRate, wine.rating, isInteractive]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((gesture: { deltaX: number; deltaY: number }) => {
    if (isInteractive) {
      setDragOffset({ x: gesture.deltaX, y: gesture.deltaY });
    }
  }, [isInteractive]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Setup gestures
  const gestureHandlers = useGestures({
    onTap: handleTap,
    onDoubleTap: handleDoubleTap,
    onLongPress: handleLongPress,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
  }, {
    enableHapticFeedback: true,
    swipeThreshold: 30,
    longPressDelay: 600,
  });

  const cardSizes = {
    small: 'w-48 h-72',
    medium: 'w-64 h-96',
    large: 'w-80 h-[480px]'
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size === 'small' ? 12 : 16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  const CardFront = () => (
    <div className="absolute inset-0 backface-hidden">
      {/* Holographic effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 shimmer"></div>
      
      {/* Card border with rarity color */}
      <div className={`absolute inset-0 rounded-2xl border-4 ${getRarityColor(wine.rarity).replace('text-', 'border-').replace('bg-', 'border-')}`}></div>
      
      {/* Header with wine type and rarity */}
      <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-3 rounded-t-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(wine.rarity)}`}>
            {wine.rarity}
          </span>
          <div className="flex items-center gap-1">
            <Award size={14} />
            <span className="text-xs">#{wine.id}</span>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-bold truncate">{wine.name}</h3>
          <p className="text-sm opacity-80">{wine.year}</p>
        </div>
        
        {/* Enhanced wine type indicator with Pokemon-style badge */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`w-10 h-10 rounded-full ${getWineTypeColor(wine.type)} opacity-90 flex items-center justify-center border-2 border-white shadow-lg`}>
            <span className="text-white text-xs font-bold">{wine.type.slice(0, 2).toUpperCase()}</span>
          </div>
          {wine.secondaryType && (
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full ${getWineTypeColor(wine.secondaryType)} opacity-80 flex items-center justify-center border border-white`}>
              <span className="text-white text-[10px] font-bold">{wine.secondaryType.slice(0, 1)}</span>
            </div>
          )}
        </div>
        
        {/* Pokemon-style nature indicator */}
        {wine.nature && (
          <div className="absolute top-12 right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">
            {wine.nature}
          </div>
        )}
        
        {/* Shiny/Special indicator */}
        {wine.isShiny && (
          <div className="absolute top-2 left-2 animate-sparkle">
            <Sparkles size={16} className="text-yellow-400 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Main wine bottle visualization */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white p-6 flex-1">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Wine bottle silhouette */}
          <div className="relative mb-4">
            <div className={`w-16 h-32 ${getWineTypeColor(wine.type)} rounded-b-lg opacity-80 relative`}>
              {/* Bottle neck */}
              <div className="w-4 h-8 bg-gray-600 mx-auto -mb-8 relative z-10"></div>
              {/* Cork */}
              <div className="w-6 h-3 bg-amber-200 mx-auto -mb-3 relative z-20 rounded-t"></div>
              {/* Label */}
              <div className="absolute inset-x-2 top-8 bottom-8 bg-white/80 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800 writing-vertical-rl transform rotate-180">
                  {wine.producer}
                </span>
              </div>
            </div>
          </div>
          
          {/* Wine details */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <MapPin size={12} />
              <span className="truncate">{wine.region}</span>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Grape size={12} />
              <span className="truncate">{wine.grape}</span>
            </div>
            
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(wine.rating)}
            </div>
            
            {/* Evolution chain indicator */}
            {wine.evolutionChain && wine.evolutionChain.length > 1 && (
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-bold">
                  {wine.evolutionChain.findIndex(evo => evo.id === wine.id) + 1}/{wine.evolutionChain.length}
                </span>
              </div>
            )}
            
            {/* Breeding/Collection info */}
            {wine.captured && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded-full font-bold">
                  CAPTURED
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Pokemon-style stats display */}
        <div className="absolute top-2 right-2 space-y-1">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {wine.experiencePoints} XP
          </div>
          {wine.level && (
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              Lv.{wine.level}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Pokemon-style base stats */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-3 rounded-b-2xl">
        {wine.baseStats && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Zap size={10} className="text-yellow-500" />
                <span className="text-xs font-bold">{wine.baseStats.complexity}</span>
              </div>
              <div className="text-[10px] text-gray-500">COM</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Shield size={10} className="text-blue-500" />
                <span className="text-xs font-bold">{wine.baseStats.balance}</span>
              </div>
              <div className="text-[10px] text-gray-500">BAL</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Sword size={10} className="text-red-500" />
                <span className="text-xs font-bold">{wine.baseStats.intensity}</span>
              </div>
              <div className="text-[10px] text-gray-500">INT</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Target size={10} className="text-purple-500" />
                <span className="text-xs font-bold">{wine.baseStats.finesse}</span>
              </div>
              <div className="text-[10px] text-gray-500">FIN</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame size={10} className="text-orange-500" />
                <span className="text-xs font-bold">{wine.baseStats.power}</span>
              </div>
              <div className="text-[10px] text-gray-500">PWR</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Droplets size={10} className="text-cyan-500" />
                <span className="text-xs font-bold">{wine.baseStats.elegance}</span>
              </div>
              <div className="text-[10px] text-gray-500">ELE</div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Vintage {wine.year}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {wine.voiceNoteUrl && <Mic size={12} className="text-blue-500" />}
            {wine.photoUrl && <Eye size={12} className="text-green-500" />}
            <Sparkles size={12} className="text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const CardBack = () => (
    <div className="absolute inset-0 backface-hidden transform rotate-y-180">
      {/* Card border */}
      <div className="absolute inset-0 rounded-2xl border-4 border-gray-300"></div>
      
      {/* Background pattern */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-4 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h4 className="font-bold text-gray-800">{wine.name}</h4>
          <p className="text-sm text-gray-600">{wine.producer}</p>
        </div>

        {/* Tasting notes */}
        <div className="flex-1 overflow-hidden">
          <div className="bg-white/80 rounded-lg p-3 mb-3">
            <h5 className="font-semibold text-sm mb-2 text-gray-800">Tasting Notes</h5>
            <p className="text-xs text-gray-700 leading-relaxed">
              {wine.tastingNotes}
            </p>
          </div>

          {/* WSET Details if available */}
          {wine.appearance && (
            <div className="bg-white/80 rounded-lg p-3 mb-3">
              <h5 className="font-semibold text-sm mb-2 text-gray-800">WSET Analysis</h5>
              <div className="space-y-1 text-xs text-gray-700">
                <div><strong>Appearance:</strong> {wine.appearance.intensity} {wine.appearance.color}</div>
                {wine.nose && <div><strong>Nose:</strong> {wine.nose.intensity} intensity</div>}
                {wine.palate && (
                  <div><strong>Palate:</strong> {wine.palate.body} body, {wine.palate.finish} finish</div>
                )}
              </div>
            </div>
          )}

          {/* Personal notes if available */}
          {wine.personalNotes && (
            <div className="bg-white/80 rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-2 text-gray-800">Personal Notes</h5>
              <p className="text-xs text-gray-700 leading-relaxed">
                {wine.personalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Pokemon-style stats footer */}
        <div className="space-y-3">
          {wine.baseStats && (
            <div className="bg-white/80 rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-2 text-gray-800">Base Stats</h5>
              <div className="space-y-2">
                {Object.entries(wine.baseStats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-gray-600">{stat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            value >= 80 ? 'bg-green-500' :
                            value >= 60 ? 'bg-yellow-500' :
                            value >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(value, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800 min-w-[2rem] text-right">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {wine.individualValues && (
            <div className="bg-white/80 rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-2 text-gray-800">Individual Values (IVs)</h5>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                {Object.entries(wine.individualValues).map(([stat, value]) => (
                  <div key={stat} className="bg-white/60 rounded p-1">
                    <div className={`font-bold ${
                      value >= 28 ? 'text-gold-500' :
                      value >= 20 ? 'text-green-500' :
                      value >= 15 ? 'text-blue-500' : 'text-gray-500'
                    }`}>{value}</div>
                    <div className="text-gray-600 capitalize">{stat.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-white/60 rounded p-2">
              <div className="font-bold text-blue-600">{wine.experiencePoints}</div>
              <div className="text-gray-600">Experience</div>
            </div>
            <div className="bg-white/60 rounded p-2">
              <div className="font-bold text-green-600">{wine.rating}/5</div>
              <div className="text-gray-600">Rating</div>
            </div>
            {wine.level && (
              <div className="bg-white/60 rounded p-2">
                <div className="font-bold text-purple-600">{wine.level}</div>
                <div className="text-gray-600">Level</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className={`${cardSizes[size]} relative cursor-pointer perspective-1000 select-none`}
      {...gestureHandlers}
      style={{
        transform: isDragging ? `translate(${dragOffset.x * 0.1}px, ${dragOffset.y * 0.1}px)` : undefined
      }}
      animate={{
        scale: isDragging ? 0.95 : 1,
        rotateX: isDragging ? dragOffset.y * 0.05 : 0,
        rotateY: isDragging ? dragOffset.x * 0.05 : 0,
      }}
      whileHover={isInteractive ? { 
        scale: 1.05,
        rotateX: 2,
        rotateY: 2,
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="absolute inset-0 rounded-2xl shadow-2xl bg-white">
          <CardFront />
          <CardBack />
        </div>
        
        {/* Captured indicator */}
        {wine.captured && (
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Award size={16} className="text-white" />
          </motion.div>
        )}

        {/* Enhanced rarity glow effects for all tiers */}
        {wine.rarity === 'Divine' && (
          <div className="absolute -inset-2 bg-gradient-to-r from-white via-gold-300 to-white rounded-2xl opacity-40 animate-pulse -z-10 shadow-2xl shadow-gold-500/50"></div>
        )}
        {wine.rarity === 'Celestial' && (
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 rounded-2xl opacity-35 animate-pulse -z-10 shadow-xl shadow-cyan-500/30"></div>
        )}
        {wine.rarity === 'Mythical' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-300 to-pink-400 rounded-2xl opacity-35 animate-pulse -z-10 shadow-xl shadow-pink-500/30"></div>
        )}
        {wine.rarity === 'Legendary' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-2xl opacity-30 animate-pulse -z-10 shadow-lg shadow-yellow-500/20"></div>
        )}
        {wine.rarity === 'Epic' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 rounded-2xl opacity-25 animate-pulse -z-10 shadow-lg shadow-purple-500/20"></div>
        )}
        {wine.rarity === 'Rare' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 rounded-2xl opacity-20 animate-pulse -z-10"></div>
        )}
        {wine.rarity === 'Uncommon' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-green-300 to-green-400 rounded-2xl opacity-15 animate-pulse -z-10"></div>
        )}
        {wine.rarity === 'Superior' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-400 rounded-2xl opacity-18 animate-pulse -z-10"></div>
        )}
        {wine.rarity === 'Exceptional' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 rounded-2xl opacity-20 animate-pulse -z-10"></div>
        )}
        {wine.rarity === 'Outstanding' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 rounded-2xl opacity-22 animate-pulse -z-10"></div>
        )}
        {wine.rarity === 'Magnificent' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-red-300 to-red-400 rounded-2xl opacity-24 animate-pulse -z-10"></div>
        )}
        {wine.rarity === 'Transcendent' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 rounded-2xl opacity-26 animate-pulse -z-10 shadow-md shadow-emerald-500/15"></div>
        )}
        {wine.rarity === 'Phenomenal' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-violet-300 to-violet-400 rounded-2xl opacity-28 animate-pulse -z-10 shadow-md shadow-violet-500/15"></div>
        )}
        {wine.rarity === 'Sublime' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 rounded-2xl opacity-30 animate-pulse -z-10 shadow-lg shadow-rose-500/18"></div>
        )}
        {wine.rarity === 'Eternal' && (
          <div className="absolute -inset-2 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-2xl opacity-32 animate-pulse -z-10 shadow-lg shadow-slate-500/20"></div>
        )}
        {wine.rarity === 'Cosmic' && (
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 rounded-2xl opacity-38 animate-pulse -z-10 shadow-xl shadow-purple-500/25"></div>
        )}
        {wine.rarity === 'Primordial' && (
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 rounded-2xl opacity-42 animate-pulse -z-10 shadow-2xl shadow-amber-500/30"></div>
        )}

        {/* Favorite indicator */}
        {isFavorite && (
          <motion.div
            className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <Heart size={16} className="text-white fill-current" />
          </motion.div>
        )}

        {/* Quick action overlays */}
        {quickRating !== null && (
          <motion.div
            className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center text-white">
              <div className="text-lg font-bold mb-2">Quick Rating</div>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onRate?.(index + 1);
                      setQuickRating(null);
                    }}
                    className="p-1"
                  >
                    <Star
                      size={20}
                      className={index < quickRating ? "text-yellow-400 fill-current" : "text-gray-400"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action menu */}
        {showActionMenu && (
          <motion.div
            className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center z-30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="grid grid-cols-2 gap-4 text-white">
              <button
                onClick={() => {
                  onFavorite?.();
                  setShowActionMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Heart size={20} className={isFavorite ? "fill-current text-red-400" : ""} />
                <span className="text-xs">{isFavorite ? 'Unfavorite' : 'Favorite'}</span>
              </button>
              
              <button
                onClick={() => {
                  onShare?.();
                  setShowActionMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Share size={20} />
                <span className="text-xs">Share</span>
              </button>
              
              <button
                onClick={() => {
                  setQuickRating(wine.rating || 0);
                  setShowActionMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Star size={20} />
                <span className="text-xs">Rate</span>
              </button>
              
              <button
                onClick={() => setShowActionMenu(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <span className="text-lg">×</span>
                <span className="text-xs">Close</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Swipe hints */}
        {isInteractive && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Left/Right navigation hints */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-30 transition-opacity">
              <div className="text-white bg-black/50 rounded-full p-1">
                <span className="text-xs">←</span>
              </div>
            </div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-30 transition-opacity">
              <div className="text-white bg-black/50 rounded-full p-1">
                <span className="text-xs">→</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}