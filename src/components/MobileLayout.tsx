'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Bell, Menu, X } from 'lucide-react';
import MobileNavigation, { useMobileNavigation } from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
  rightActions?: ReactNode;
  bottomNavigation?: boolean;
  className?: string;
}

interface HeaderAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export default function MobileLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  showMenuButton = true,
  showNotifications = true,
  onBack,
  rightActions,
  bottomNavigation = true,
  className = '',
}: MobileLayoutProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { activeTab, setActiveTab, badges } = useMobileNavigation();

  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white ${className}`}>
      {/* Status bar spacer for iOS */}
      <div className="h-safe-top bg-gradient-to-r from-blue-600 to-purple-600" />

      {/* Mobile Header */}
      <motion.header 
        className={`
          sticky top-0 z-40 px-4 py-3 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <motion.button
                onClick={onBack}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
            )}

            {showMenuButton && !showBackButton && (
              <motion.button
                onClick={() => setShowMenu(true)}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Menu size={20} />
              </motion.button>
            )}

            {title && (
              <div className="flex flex-col">
                <h1 className={`text-lg font-bold ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`text-sm ${
                    isScrolled ? 'text-gray-600' : 'text-white/80'
                  }`}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {showNotifications && (
              <motion.button
                className={`relative p-2 rounded-full transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/20'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">3</span>
                </div>
              </motion.button>
            )}

            {rightActions}

            <motion.button
              className={`p-2 rounded-full transition-colors ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical size={20} />
            </motion.button>
          </div>
        </div>

        {/* Progress indicator for scrollable content */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500 rounded-r-full"
          style={{
            width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`
          }}
          initial={{ width: 0 }}
        />
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className={`flex-1 relative ${bottomNavigation ? 'pb-20' : ''}`}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
      >
        {children}
      </motion.main>

      {/* Bottom Navigation */}
      {bottomNavigation && (
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          badges={badges}
        />
      )}

      {/* Side Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Wine Pokédex</h2>
                  <motion.button
                    onClick={() => setShowMenu(false)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">🍷</span>
                  </div>
                  <div>
                    <div className="font-semibold">Wine Master</div>
                    <div className="text-sm opacity-80">Level 12 • 2,450 XP</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {[
                  { label: 'My Collection', icon: '📚', badge: '156' },
                  { label: 'Wish List', icon: '⭐', badge: '23' },
                  { label: 'Tasting Notes', icon: '📝', badge: null },
                  { label: 'Wine Regions', icon: '🗺️', badge: null },
                  { label: 'Learning Hub', icon: '🎓', badge: '3' },
                  { label: 'Competitions', icon: '🏆', badge: null },
                  { label: 'Trade Center', icon: '🔄', badge: '5' },
                  { label: 'Settings', icon: '⚙️', badge: null },
                ].map((item, index) => (
                  <motion.button
                    key={item.label}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1 font-medium text-gray-700">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-center text-sm text-gray-500">
                  Wine Pokédex v2.0.1
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pull-to-refresh indicator */}
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <motion.div
          className="bg-white rounded-full shadow-lg p-3"
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -20 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🔄
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}