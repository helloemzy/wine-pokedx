'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  Clock, 
  Shield, 
  TrendingUp, 
  Users, 
  Star,
  Filter,
  Search,
  ChevronDown,
  Gavel,
  ShoppingCart,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { WineTradingCard } from './WineTradingCard';
import type { Wine, Trade } from '@/types/wine';

interface TradingInterfaceProps {
  userWines: Wine[];
  onTradeCreated?: (trade: Trade) => void;
}

type TradeFilter = 'all' | 'direct' | 'market' | 'auction' | 'mystery';
type TradeSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'expiry';

export function TradingInterface({ userWines, onTradeCreated }: TradingInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-trades'>('browse');
  const [availableTrades, setAvailableTrades] = useState<Trade[]>([]);
  const [myTrades, setMyTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TradeFilter>('all');
  const [sort, setSort] = useState<TradeSort>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create trade state
  const [createTradeData, setCreateTradeData] = useState({
    type: 'Direct' as 'Direct' | 'Market' | 'Auction' | 'Mystery',
    offeredWines: [] as string[],
    requestedWines: [] as string[],
    marketPrice: '',
    buyoutPrice: '',
    levelRequirement: '',
    trustRatingRequirement: '',
    regionRestrictions: [] as string[],
    expirationHours: '24',
    insurance: {
      enabled: false,
      coverage: ''
    }
  });

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeDetailsModal, setTradeDetailsModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchAvailableTrades();
    } else if (activeTab === 'my-trades') {
      fetchMyTrades();
    }
  }, [activeTab, filter, sort]);

  const fetchAvailableTrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filter === 'all' ? '' : filter,
        includeOwn: 'false',
        limit: '20',
      });

      const response = await fetch(`/api/trades?${params}`);
      const result = await response.json();
      
      if (result.success) {
        let trades = result.data.trades;
        
        // Apply search filter
        if (searchQuery) {
          trades = trades.filter((trade: Trade) => 
            trade.offered_wine_details?.some((wine: any) => 
              wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              wine.type.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        }
        
        // Apply sorting
        trades = sortTrades(trades, sort);
        
        setAvailableTrades(trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
    setLoading(false);
  };

  const fetchMyTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trades?includeOwn=true');
      const result = await response.json();
      
      if (result.success) {
        setMyTrades(result.data.trades);
      }
    } catch (error) {
      console.error('Error fetching my trades:', error);
    }
    setLoading(false);
  };

  const sortTrades = (trades: Trade[], sortBy: TradeSort) => {
    return [...trades].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        case 'oldest':
          return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
        case 'price_asc':
          return (a.market_price || 0) - (b.market_price || 0);
        case 'price_desc':
          return (b.market_price || 0) - (a.market_price || 0);
        case 'expiry':
          const aExpiry = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
          const bExpiry = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
          return aExpiry - bExpiry;
        default:
          return 0;
      }
    });
  };

  const createTrade = async () => {
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: createTradeData.type,
          offeredWineIds: createTradeData.offeredWines,
          requestedWineIds: createTradeData.requestedWines.length > 0 ? createTradeData.requestedWines : undefined,
          marketPrice: createTradeData.marketPrice ? parseFloat(createTradeData.marketPrice) : undefined,
          buyoutPrice: createTradeData.buyoutPrice ? parseFloat(createTradeData.buyoutPrice) : undefined,
          levelRequirement: createTradeData.levelRequirement ? parseInt(createTradeData.levelRequirement) : undefined,
          trustRatingRequirement: createTradeData.trustRatingRequirement ? parseInt(createTradeData.trustRatingRequirement) : undefined,
          regionRestrictions: createTradeData.regionRestrictions.length > 0 ? createTradeData.regionRestrictions : undefined,
          expirationHours: parseInt(createTradeData.expirationHours),
          insurance: createTradeData.insurance.enabled ? {
            enabled: true,
            coverage: parseFloat(createTradeData.insurance.coverage)
          } : undefined,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Reset form
        setCreateTradeData({
          type: 'Direct',
          offeredWines: [],
          requestedWines: [],
          marketPrice: '',
          buyoutPrice: '',
          levelRequirement: '',
          trustRatingRequirement: '',
          regionRestrictions: [],
          expirationHours: '24',
          insurance: { enabled: false, coverage: '' }
        });
        
        // Switch to my trades tab
        setActiveTab('my-trades');
        
        onTradeCreated?.(result.data);
      }
    } catch (error) {
      console.error('Error creating trade:', error);
    }
  };

  const handleTradeAction = async (tradeId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh trade lists
        if (activeTab === 'browse') {
          fetchAvailableTrades();
        } else if (activeTab === 'my-trades') {
          fetchMyTrades();
        }
        
        setTradeDetailsModal(false);
        setSelectedTrade(null);
      }
    } catch (error) {
      console.error('Error handling trade action:', error);
    }
  };

  const getTradeTypeIcon = (type: string) => {
    switch (type) {
      case 'Direct': return <ArrowLeftRight className="w-4 h-4" />;
      case 'Market': return <ShoppingCart className="w-4 h-4" />;
      case 'Auction': return <Gavel className="w-4 h-4" />;
      case 'Mystery': return <Gift className="w-4 h-4" />;
      default: return <ArrowLeftRight className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'Active': return 'text-green-400 bg-green-400/20';
      case 'Completed': return 'text-blue-400 bg-blue-400/20';
      case 'Cancelled': return 'text-gray-400 bg-gray-400/20';
      case 'Rejected': return 'text-red-400 bg-red-400/20';
      case 'Expired': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTimeRemaining = (expirationDate: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expirationDate).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          {[
            { id: 'browse', label: 'Browse Trades', icon: Search },
            { id: 'create', label: 'Create Trade', icon: ArrowLeftRight },
            { id: 'my-trades', label: 'My Trades', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      {/* Browse Trades Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search wines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as TradeFilter)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              >
                <option value="all">All Types</option>
                <option value="direct">Direct Trade</option>
                <option value="market">Market Sale</option>
                <option value="auction">Auction</option>
                <option value="mystery">Mystery Box</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as TradeSort)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="expiry">Expiring Soon</option>
              </select>
            </div>
          </div>

          {/* Trade List */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
                <p className="mt-4 text-gray-400">Loading trades...</p>
              </div>
            ) : availableTrades.length === 0 ? (
              <div className="text-center py-12">
                <ArrowLeftRight className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Trades Available</h3>
                <p className="text-gray-400">Be the first to create a trade!</p>
              </div>
            ) : (
              availableTrades.map((trade) => (
                <TradeCard 
                  key={trade.id} 
                  trade={trade} 
                  onViewDetails={(trade) => {
                    setSelectedTrade(trade);
                    setTradeDetailsModal(true);
                  }}
                  onQuickAction={handleTradeAction}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Trade Tab */}
      {activeTab === 'create' && (
        <CreateTradeForm 
          tradeData={createTradeData}
          setTradeData={setCreateTradeData}
          userWines={userWines}
          onCreateTrade={createTrade}
        />
      )}

      {/* My Trades Tab */}
      {activeTab === 'my-trades' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
              <p className="mt-4 text-gray-400">Loading your trades...</p>
            </div>
          ) : myTrades.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Trades Yet</h3>
              <p className="text-gray-400">Create your first trade to get started!</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 bg-gold-600 hover:bg-gold-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create Trade
              </button>
            </div>
          ) : (
            myTrades.map((trade) => (
              <TradeCard 
                key={trade.id} 
                trade={trade} 
                isOwner={true}
                onViewDetails={(trade) => {
                  setSelectedTrade(trade);
                  setTradeDetailsModal(true);
                }}
                onQuickAction={handleTradeAction}
              />
            ))
          )}
        </div>
      )}

      {/* Trade Details Modal */}
      <AnimatePresence>
        {tradeDetailsModal && selectedTrade && (
          <TradeDetailsModal
            trade={selectedTrade}
            userWines={userWines}
            onClose={() => {
              setTradeDetailsModal(false);
              setSelectedTrade(null);
            }}
            onAction={handleTradeAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components would be defined here...
// TradeCard, CreateTradeForm, TradeDetailsModal
// (Implementation continues in the next component files for better organization)

interface TradeCardProps {
  trade: Trade;
  isOwner?: boolean;
  onViewDetails: (trade: Trade) => void;
  onQuickAction: (tradeId: string, action: string, data?: any) => void;
}

function TradeCard({ trade, isOwner, onViewDetails, onQuickAction }: TradeCardProps) {
  const getTradeTypeIcon = (type: string) => {
    switch (type) {
      case 'Direct': return <ArrowLeftRight className="w-4 h-4" />;
      case 'Market': return <ShoppingCart className="w-4 h-4" />;
      case 'Auction': return <Gavel className="w-4 h-4" />;
      case 'Mystery': return <Gift className="w-4 h-4" />;
      default: return <ArrowLeftRight className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'Active': return 'text-green-400 bg-green-400/20';
      case 'Completed': return 'text-blue-400 bg-blue-400/20';
      case 'Cancelled': return 'text-gray-400 bg-gray-400/20';
      case 'Rejected': return 'text-red-400 bg-red-400/20';
      case 'Expired': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTimeRemaining = (expirationDate: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expirationDate).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTradeTypeIcon(trade.type)}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {trade.type} Trade
            </h3>
            <p className="text-sm text-gray-400">
              by {isOwner ? 'You' : trade.initiator_username} • 
              Level {trade.initiator_level} • 
              Trust: {trade.initiator_trust_rating}%
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
          {trade.status}
        </div>
      </div>

      {/* Offered Wines Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Offering ({trade.offered_wines?.length || 0}):</p>
        <div className="flex flex-wrap gap-2">
          {trade.offered_wine_details?.slice(0, 3).map((wine: any) => (
            <div key={wine.id} className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                wine.type === 'Terroir' ? 'from-green-500 to-emerald-600' :
                wine.type === 'Energy' ? 'from-red-500 to-orange-600' :
                wine.type === 'Mystical' ? 'from-purple-500 to-pink-600' :
                'from-blue-500 to-indigo-600'
              }`} />
              <span className="text-sm text-white">{wine.name}</span>
              {wine.is_shiny && <Star className="w-3 h-3 text-yellow-400" />}
            </div>
          ))}
          {(trade.offered_wine_details?.length || 0) > 3 && (
            <div className="flex items-center justify-center bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400">
              +{(trade.offered_wine_details?.length || 0) - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Trade Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-400">
          {trade.market_price && (
            <span>Price: ${trade.market_price.toLocaleString()}</span>
          )}
          {trade.expiration_date && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getTimeRemaining(trade.expiration_date)}</span>
            </div>
          )}
          {trade.insurance_enabled && (
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Insured</span>
            </div>
          )}
          {trade.triggers_evolution && (
            <div className="flex items-center space-x-1 text-purple-400">
              <TrendingUp className="w-4 h-4" />
              <span>Evolution</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(trade)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            View Details
          </button>
          {!isOwner && trade.status === 'Pending' && (
            <button
              onClick={() => onQuickAction(trade.id, trade.type === 'Auction' ? 'bid' : 'accept')}
              className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {trade.type === 'Auction' ? 'Bid' : 'Accept'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Additional component placeholders
function CreateTradeForm({ tradeData, setTradeData, userWines, onCreateTrade }: any) {
  return <div>Create Trade Form - Implementation continues...</div>;
}

function TradeDetailsModal({ trade, userWines, onClose, onAction }: any) {
  return <div>Trade Details Modal - Implementation continues...</div>;
}