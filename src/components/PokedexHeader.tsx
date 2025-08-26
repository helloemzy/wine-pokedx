'use client';

import { motion } from 'framer-motion';
import { Grape, Award, Map, Calendar } from 'lucide-react';

export default function PokedexHeader() {
  return (
    <motion.div 
      className="text-center mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Title */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 inline-block">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Grape className="text-white" size={28} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Wine Pokedex
            </h1>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Award className="text-white" size={28} />
            </div>
          </div>
          
          <motion.p 
            className="text-xl text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Gotta Taste Them All! 🍷
          </motion.p>
        </div>
      </motion.div>

      {/* Pokedex-style navigation buttons */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar size={18} />
          By Year
        </motion.button>
        
        <motion.button
          className="flex items-center gap-2 bg-blue-500/90 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Map size={18} />
          By Region
        </motion.button>
        
        <motion.button
          className="flex items-center gap-2 bg-green-500/90 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Grape size={18} />
          By Grape
        </motion.button>
        
        <motion.button
          className="flex items-center gap-2 bg-yellow-500/90 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm border border-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Award size={18} />
          By Rating
        </motion.button>
      </motion.div>
    </motion.div>
  );
}