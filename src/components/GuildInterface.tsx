'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Shield, 
  Star,
  Calendar,
  Trophy,
  Gift,
  Search,
  Plus,
  Settings,
  LogOut,
  UserPlus,
  MessageSquare,
  Wine,
  Target,
  Award,
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';
import type { Wine } from '@/types/wine';

interface Guild {
  id: string;
  name: string;
  description?: string;
  type: string;
  visibility: string;
  member_count: number;
  max_members: number;
  founded_date: string;
  last_active: string;
  recently_active: boolean;
  user_role?: string;
  competitions_won?: number;
  current_ranking?: number;
}

interface GuildMember {
  user_id: string;
  username: string;
  level: number;
  avatar_url?: string;
  role: string;
  join_date: string;
  contributions: {
    totalExperience: number;
    winesShared: number;
    eventsOrganized: number;
    competitionsWon: number;
  };
  collection_count: number;
  battle_rating: number;
}

interface GuildEvent {
  id: string;
  name: string;
  type: string;
  start_date: string;
  end_date?: string;
  organizer_username: string;
  participant_count: number;
  status: string;
}

interface GuildInterfaceProps {
  userWines: Wine[];
  onGuildJoined?: (guildId: string) => void;
}

type GuildTab = 'discover' | 'my-guilds' | 'create';

export function GuildInterface({ userWines, onGuildJoined }: GuildInterfaceProps) {
  const [activeTab, setActiveTab] = useState<GuildTab>('discover');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuilds, setMyGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [guildDetails, setGuildDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [guildTypeFilter, setGuildTypeFilter] = useState<string>('');
  const [showGuildModal, setShowGuildModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create guild state
  const [createGuildData, setCreateGuildData] = useState({
    name: '',
    description: '',
    type: 'Casual' as string,
    visibility: 'Public' as string,
    maxMembers: 25,
    memberRequirements: {
      minimumLevel: 1,
      minimumCollection: 0,
      applicationRequired: false,
    },
    monthlyDues: 0,
  });

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscoverGuilds();
    } else if (activeTab === 'my-guilds') {
      fetchMyGuilds();
    }
  }, [activeTab, guildTypeFilter]);

  const fetchDiscoverGuilds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'discover',
        guildType: guildTypeFilter,
        limit: '20',
      });

      const response = await fetch(`/api/guilds?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setGuilds(result.data.guilds);
      }
    } catch (error) {
      console.error('Error fetching guilds:', error);
    }
    setLoading(false);
  };

  const fetchMyGuilds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/guilds?type=my-guilds');
      const result = await response.json();
      
      if (result.success) {
        setMyGuilds(result.data.guilds);
      }
    } catch (error) {
      console.error('Error fetching my guilds:', error);
    }
    setLoading(false);
  };

  const searchGuilds = async () => {
    if (!searchQuery.trim()) {
      fetchDiscoverGuilds();
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'search',
        search: searchQuery,
      });

      const response = await fetch(`/api/guilds?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setGuilds(result.data.guilds);
      }
    } catch (error) {
      console.error('Error searching guilds:', error);
    }
    setLoading(false);
  };

  const fetchGuildDetails = async (guildId: string) => {
    try {
      const response = await fetch(`/api/guilds/${guildId}`);
      const result = await response.json();
      
      if (result.success) {
        setGuildDetails(result.data);
      }
    } catch (error) {
      console.error('Error fetching guild details:', error);
    }
  };

  const handleGuildAction = async (guildId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/guilds/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh guild lists
        if (activeTab === 'discover') {
          fetchDiscoverGuilds();
        } else if (activeTab === 'my-guilds') {
          fetchMyGuilds();
        }
        
        // Refresh guild details if modal is open
        if (selectedGuild && selectedGuild.id === guildId) {
          fetchGuildDetails(guildId);
        }

        if (action === 'join' && onGuildJoined) {
          onGuildJoined(guildId);
        }
      } else {
        alert(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error executing guild action:', error);
    }
  };

  const createGuild = async () => {
    try {
      const response = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createGuildData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Reset form
        setCreateGuildData({
          name: '',
          description: '',
          type: 'Casual',
          visibility: 'Public',
          maxMembers: 25,
          memberRequirements: {
            minimumLevel: 1,
            minimumCollection: 0,
            applicationRequired: false,
          },
          monthlyDues: 0,
        });
        
        setShowCreateModal(false);
        setActiveTab('my-guilds');
        
        if (onGuildJoined) {
          onGuildJoined(result.data.guildId);
        }
      } else {
        alert(result.error || 'Failed to create guild');
      }
    } catch (error) {
      console.error('Error creating guild:', error);
    }
  };

  const getGuildTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'Regional': Target,
      'TypeSpecialist': Wine,
      'Competition': Trophy,
      'Education': Award,
      'Trading': TrendingUp,
      'Casual': Users,
      'Professional': Crown,
    };
    return icons[type] || Users;
  };

  const getGuildTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Regional': 'text-green-400 bg-green-400/20',
      'TypeSpecialist': 'text-purple-400 bg-purple-400/20',
      'Competition': 'text-yellow-400 bg-yellow-400/20',
      'Education': 'text-blue-400 bg-blue-400/20',
      'Trading': 'text-orange-400 bg-orange-400/20',
      'Casual': 'text-gray-400 bg-gray-400/20',
      'Professional': 'text-gold-400 bg-gold-400/20',
    };
    return colors[type] || 'text-gray-400 bg-gray-400/20';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Leader': return <Crown className="w-4 h-4 text-gold-400" />;
      case 'Officer': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'Elder': return <Star className="w-4 h-4 text-purple-400" />;
      case 'Member': return <Users className="w-4 h-4 text-green-400" />;
      case 'Recruit': return <Plus className="w-4 h-4 text-gray-400" />;
      default: return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Leader': return 'text-gold-400';
      case 'Officer': return 'text-blue-400';
      case 'Elder': return 'text-purple-400';
      case 'Member': return 'text-green-400';
      case 'Recruit': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          {[
            { id: 'discover', label: 'Discover Guilds', icon: Search },
            { id: 'my-guilds', label: 'My Guilds', icon: Users },
            { id: 'create', label: 'Create Guild', icon: Plus },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GuildTab)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gold-400 text-gold-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Discover Guilds Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search guilds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchGuilds()}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={guildTypeFilter}
                onChange={(e) => setGuildTypeFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              >
                <option value="">All Types</option>
                <option value="Casual">Casual</option>
                <option value="Competition">Competition</option>
                <option value="Education">Education</option>
                <option value="Trading">Trading</option>
                <option value="Regional">Regional</option>
                <option value="TypeSpecialist">Type Specialist</option>
                <option value="Professional">Professional</option>
              </select>
              <button
                onClick={searchGuilds}
                className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Guild List */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
                <p className="mt-4 text-gray-400">Loading guilds...</p>
              </div>
            ) : guilds.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Guilds Found</h3>
                <p className="text-gray-400">Try adjusting your search criteria or create your own guild!</p>
              </div>
            ) : (
              guilds.map((guild) => (
                <GuildCard 
                  key={guild.id} 
                  guild={guild} 
                  onViewDetails={(guild) => {
                    setSelectedGuild(guild);
                    fetchGuildDetails(guild.id);
                    setShowGuildModal(true);
                  }}
                  onJoin={(guild) => handleGuildAction(guild.id, 'join')}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* My Guilds Tab */}
      {activeTab === 'my-guilds' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
              <p className="mt-4 text-gray-400">Loading your guilds...</p>
            </div>
          ) : myGuilds.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Guilds Yet</h3>
              <p className="text-gray-400 mb-6">Join or create a guild to connect with other wine collectors!</p>
              <div className="space-x-4">
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Discover Guilds
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-gold-600 hover:bg-gold-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Create Guild
                </button>
              </div>
            </div>
          ) : (
            myGuilds.map((guild) => (
              <GuildCard 
                key={guild.id} 
                guild={guild} 
                isOwn={true}
                onViewDetails={(guild) => {
                  setSelectedGuild(guild);
                  fetchGuildDetails(guild.id);
                  setShowGuildModal(true);
                }}
                onManage={(guild) => handleGuildAction(guild.id, 'manage')}
                onLeave={(guild) => handleGuildAction(guild.id, 'leave')}
              />
            ))
          )}
        </div>
      )}

      {/* Create Guild Tab */}
      {activeTab === 'create' && (
        <CreateGuildForm 
          guildData={createGuildData}
          setGuildData={setCreateGuildData}
          onCreateGuild={createGuild}
        />
      )}

      {/* Guild Details Modal */}
      <AnimatePresence>
        {showGuildModal && selectedGuild && guildDetails && (
          <GuildDetailsModal
            guild={selectedGuild}
            details={guildDetails}
            onClose={() => {
              setShowGuildModal(false);
              setSelectedGuild(null);
              setGuildDetails(null);
            }}
            onAction={handleGuildAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components would be defined here...
// GuildCard, CreateGuildForm, GuildDetailsModal
// (Implementation continues...)

interface GuildCardProps {
  guild: Guild;
  isOwn?: boolean;
  onViewDetails: (guild: Guild) => void;
  onJoin?: (guild: Guild) => void;
  onManage?: (guild: Guild) => void;
  onLeave?: (guild: Guild) => void;
}

function GuildCard({ guild, isOwn, onViewDetails, onJoin, onManage, onLeave }: GuildCardProps) {
  const TypeIcon = getGuildTypeIcon(guild.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${getGuildTypeColor(guild.type).split(' ')[1]}`}>
            <TypeIcon className={`w-6 h-6 ${getGuildTypeColor(guild.type).split(' ')[0]}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{guild.name}</span>
              {isOwn && guild.user_role && (
                <span className={`text-sm ${getRoleColor(guild.user_role)}`}>
                  ({guild.user_role})
                </span>
              )}
            </h3>
            <p className="text-gray-400">{guild.description || 'No description'}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded-full text-xs ${getGuildTypeColor(guild.type)}`}>
                {guild.type}
              </span>
              <span>{guild.member_count}/{guild.max_members} members</span>
              <span>Founded {new Date(guild.founded_date).toLocaleDateString()}</span>
              {guild.recently_active && (
                <span className="text-green-400">● Active</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(guild)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            View Details
          </button>
          
          {isOwn ? (
            <div className="flex space-x-2">
              {guild.user_role === 'Leader' && (
                <button
                  onClick={() => onManage?.(guild)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage</span>
                </button>
              )}
              <button
                onClick={() => onLeave?.(guild)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onJoin?.(guild)}
              disabled={guild.member_count >= guild.max_members}
              className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join</span>
            </button>
          )}
        </div>
      </div>

      {guild.competitions_won !== undefined && guild.competitions_won > 0 && (
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-yellow-400">
            <Trophy className="w-4 h-4" />
            <span>{guild.competitions_won} competitions won</span>
          </div>
          {guild.current_ranking && (
            <div className="text-gray-400">
              Rank #{guild.current_ranking}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Additional component placeholders
function CreateGuildForm({ guildData, setGuildData, onCreateGuild }: any) {
  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg border border-gray-800 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Guild</h2>
      {/* Form implementation continues... */}
    </div>
  );
}

function GuildDetailsModal({ guild, details, onClose, onAction }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal implementation continues... */}
      </motion.div>
    </motion.div>
  );
}

// Helper functions
function getGuildTypeIcon(type: string) {
  const icons: Record<string, any> = {
    'Regional': Target,
    'TypeSpecialist': Wine,
    'Competition': Trophy,
    'Education': Award,
    'Trading': TrendingUp,
    'Casual': Users,
    'Professional': Crown,
  };
  return icons[type] || Users;
}

function getGuildTypeColor(type: string) {
  const colors: Record<string, string> = {
    'Regional': 'text-green-400 bg-green-400/20',
    'TypeSpecialist': 'text-purple-400 bg-purple-400/20',
    'Competition': 'text-yellow-400 bg-yellow-400/20',
    'Education': 'text-blue-400 bg-blue-400/20',
    'Trading': 'text-orange-400 bg-orange-400/20',
    'Casual': 'text-gray-400 bg-gray-400/20',
    'Professional': 'text-gold-400 bg-gold-400/20',
  };
  return colors[type] || 'text-gray-400 bg-gray-400/20';
}

function getRoleColor(role: string) {
  switch (role) {
    case 'Leader': return 'text-gold-400';
    case 'Officer': return 'text-blue-400';
    case 'Elder': return 'text-purple-400';
    case 'Member': return 'text-green-400';
    case 'Recruit': return 'text-gray-400';
    default: return 'text-gray-400';
  }
}