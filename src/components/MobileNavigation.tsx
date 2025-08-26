'use client';

import { motion } from 'framer-motion';
import { 
  Home, 
  Camera, 
  User, 
  Users, 
  Search,
  Compass,
  Trophy,
  Settings,
  Heart,
  Plus,
  Zap
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface NavigationItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  isActive?: boolean;
  isCenterFAB?: boolean;
}

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onScan?: () => void;
  className?: string;
  badges?: Record<string, number>;
}

export default function MobileNavigation({ 
  activeTab, 
  onTabChange, 
  onScan,
  className = '',
  badges = {}
}: MobileNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryTabs: NavigationItem[] = [
    {
      id: 'collection',
      icon: Home,
      label: 'Collection',
      badge: badges.collection,
    },
    {
      id: 'discover',
      icon: Compass,
      label: 'Discover',
      badge: badges.discover,
    },
    {
      id: 'scan',
      icon: Camera,
      label: 'Scan',
      isCenterFAB: true,
    },
    {
      id: 'social',
      icon: Users,
      label: 'Social',
      badge: badges.social,
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      badge: badges.profile,
    },
  ];

  const secondaryActions = [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'achievements', icon: Trophy, label: 'Achievements' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabPress = useCallback((tab: NavigationItem) => {
    if (tab.isCenterFAB) {
      onScan?.();
    } else {
      onTabChange(tab.id);
    }
  }, [onTabChange, onScan]);

  const renderTabButton = (tab: NavigationItem, index: number) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    const isFAB = tab.isCenterFAB;

    return (
      <motion.button
        key={tab.id}
        onClick={() => handleTabPress(tab)}
        className={`
          relative flex flex-col items-center justify-center
          ${isFAB 
            ? 'w-14 h-14 bg-gradient-to-r from-red-500 to-blue-500 rounded-full shadow-lg -mt-6' 
            : 'flex-1 py-2 px-1'
          }
          ${isActive && !isFAB ? 'text-blue-500' : 'text-gray-600'}
          transition-colors duration-200
        `}
        whileTap={{ scale: isFAB ? 0.9 : 0.95 }}
        whileHover={{ scale: isFAB ? 1.05 : 1.02 }}
      >
        {/* Background highlight for active tab */}
        {isActive && !isFAB && (
          <motion.div
            className="absolute inset-0 bg-blue-100 rounded-lg"
            layoutId="activeTab"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Icon */}
        <motion.div
          className={`relative z-10 ${isFAB ? 'text-white' : ''}`}
          animate={{
            scale: isActive && !isFAB ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon size={isFAB ? 24 : 20} />
        </motion.div>

        {/* Label */}
        {!isFAB && (
          <span className={`
            text-xs font-medium mt-1 relative z-10
            ${isActive ? 'text-blue-500' : 'text-gray-600'}
          `}>
            {tab.label}
          </span>
        )}

        {/* Badge */}
        {tab.badge && tab.badge > 0 && (
          <motion.div
            className={`
              absolute -top-1 -right-1 bg-red-500 text-white text-xs 
              rounded-full min-w-[18px] h-[18px] flex items-center justify-center
              ${isFAB ? 'top-1 right-1' : ''}
            `}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            {tab.badge > 99 ? '99+' : tab.badge}
          </motion.div>
        )}

        {/* Pulse effect for FAB */}
        {isFAB && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      {/* Secondary actions panel */}
      {isExpanded && (
        <motion.div
          className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-around">
            {secondaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={() => {
                    onTabChange(action.id);
                    setIsExpanded(false);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                  <span className="text-xs">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main navigation bar */}
      <motion.div 
        className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 pb-safe-bottom"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-around py-2">
          {primaryTabs.map((tab, index) => renderTabButton(tab, index))}
        </div>

        {/* Quick actions toggle */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Plus size={16} className="text-gray-600" />
          </motion.div>
        </motion.button>

        {/* Active indicator line */}
        <motion.div
          className="h-1 bg-blue-500 rounded-full mx-auto mt-1"
          style={{ width: '20%' }}
          animate={{
            x: `${(primaryTabs.findIndex(tab => tab.id === activeTab) - 2) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </motion.div>

      {/* Gesture indicators */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50" />
    </div>
  );
}

// Hook for managing mobile navigation state
export function useMobileNavigation(initialTab = 'collection') {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [badges, setBadges] = useState<Record<string, number>>({});

  const updateBadge = useCallback((tabId: string, count: number) => {
    setBadges(prev => ({
      ...prev,
      [tabId]: count
    }));
  }, []);

  const clearBadge = useCallback((tabId: string) => {
    setBadges(prev => {
      const newBadges = { ...prev };
      delete newBadges[tabId];
      return newBadges;
    });
  }, []);

  return {
    activeTab,
    setActiveTab,
    badges,
    updateBadge,
    clearBadge,
  };
}