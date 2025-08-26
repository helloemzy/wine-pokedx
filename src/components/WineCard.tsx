'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, Grape, Award } from 'lucide-react';

interface Wine {
  id: number;
  name: string;
  year: number;
  region: string;
  producer: string;
  type: string;
  grape: string;
  rating: number;
  tastingNotes: string;
  captured: boolean;
}

interface WineCardProps {
  wine: Wine;
  viewMode: 'grid' | 'list';
}

export default function WineCard({ wine, viewMode }: WineCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all cursor-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-4">
          {/* Pokemon-style circular avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
            {wine.name.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-800 truncate">{wine.name}</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{wine.year}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{wine.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Grape size={14} />
                <span>{wine.grape}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 truncate mb-2">{wine.tastingNotes}</p>
            
            <div className="flex items-center gap-1">
              {renderStars(wine.rating)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">{wine.type}</div>
            {wine.captured && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1">
                Captured
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 hover:shadow-xl transition-all cursor-pointer group"
      whileHover={{ y: -5, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Card Header with Pokemon-style design */}
      <div className="bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 p-4 text-white relative overflow-hidden">
        <div className="absolute top-2 right-2">
          {wine.captured && (
            <motion.div
              className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Award size={14} />
            </motion.div>
          )}
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {wine.name.charAt(0)}
          </div>
          <h3 className="text-lg font-bold truncate">{wine.name}</h3>
          <div className="flex items-center justify-center gap-1 mt-2">
            {renderStars(wine.rating)}
          </div>
        </div>
        
        {/* Pokeball-style decorations */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span className="font-medium">{wine.year}</span>
          </div>
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            {wine.type}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin size={14} className="text-red-500" />
            <span className="font-medium">{wine.region}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Grape size={14} className="text-purple-500" />
            <span className="font-medium">{wine.grape}</span>
          </div>
        </div>
        
        <div className="pt-2">
          <p className="text-sm text-gray-600 leading-relaxed">
            {wine.tastingNotes}
          </p>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center">
            by {wine.producer}
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 via-transparent to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
    </motion.div>
  );
}