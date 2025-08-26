'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, 
  Shield, 
  Zap, 
  Heart,
  Clock,
  Users,
  Trophy,
  AlertTriangle,
  Sparkles,
  Target,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { Wine } from '@/types/wine';

interface Battle {
  id: string;
  type: string;
  status: string;
  initiator_id: string;
  participant_id: string;
  initiator_username: string;
  participant_username: string;
  initiator_level: number;
  participant_level: number;
  winner_id?: string;
  current_turn?: string;
  turn_number?: number;
  elapsed_minutes?: number;
  duration_minutes?: number;
}

interface BattleState {
  currentTurn: string;
  turnNumber: number;
  weather?: string;
  wineHP: Record<string, number>;
  wineStatus: Record<string, string[]>;
  battleLog: BattleLogEntry[];
  field: {
    initiatorSide: { effects: string[]; activeWine?: string };
    participantSide: { effects: string[]; activeWine?: string };
  };
}

interface BattleLogEntry {
  turn: number;
  action: string;
  userId: string;
  wineId: string;
  result: any;
  timestamp: string;
}

interface BattleInterfaceProps {
  battleId: string;
  onBattleEnd?: (winner: string | null) => void;
}

export function BattleInterface({ battleId, onBattleEnd }: BattleInterfaceProps) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [wineDetails, setWineDetails] = useState<Wine[]>([]);
  const [availableMoves, setAvailableMoves] = useState<Record<string, any[]>>({});
  const [userTeam, setUserTeam] = useState<'initiator' | 'participant' | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedWine, setSelectedWine] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showMoveSelection, setShowMoveSelection] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const battleLogRef = useRef<HTMLDivElement>(null);
  const refreshInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchBattleDetails();
    
    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchBattleDetails, 3000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [battleId, autoRefresh]);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleState?.battleLog]);

  const fetchBattleDetails = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}`);
      const result = await response.json();
      
      if (result.success) {
        setBattle(result.data.battle);
        setBattleState(result.data.currentState);
        setWineDetails(result.data.wineDetails);
        setAvailableMoves(result.data.availableMoves);
        setUserTeam(result.data.userTeam);
        
        const myTurn = result.data.currentState?.currentTurn === result.data.battle.initiator_id && result.data.userTeam === 'initiator' ||
                       result.data.currentState?.currentTurn === result.data.battle.participant_id && result.data.userTeam === 'participant';
        setIsMyTurn(myTurn);

        if (result.data.battle.status === 'Completed' && onBattleEnd) {
          onBattleEnd(result.data.battle.winner_id);
        }
      }
    } catch (error) {
      console.error('Error fetching battle details:', error);
    }
    setLoading(false);
  };

  const executeBattleAction = async (action: string, data: any = {}) => {
    setActionLoading(true);
    
    try {
      const response = await fetch(`/api/battles/${battleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          wineId: selectedWine,
          targetId: selectedTarget,
          ...data,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Play sound effect
        if (soundEnabled) {
          playBattleSound(action, result.data.result);
        }

        // Reset selections
        setSelectedWine(null);
        setSelectedMove(null);
        setSelectedTarget(null);
        setShowMoveSelection(false);

        // Refresh battle state
        await fetchBattleDetails();

        if (result.data.battleEnded && onBattleEnd) {
          onBattleEnd(result.data.winner);
        }
      } else {
        alert(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error executing battle action:', error);
    }
    
    setActionLoading(false);
  };

  const handleMoveSelection = (moveName: string) => {
    setSelectedMove(moveName);
    
    // Check if move requires target
    const requiresTarget = moveName !== 'Vineyard Shield' && 
                          moveName !== 'Power Surge' && 
                          moveName !== 'Legendary Aura';
    
    if (requiresTarget) {
      // Show target selection
      setShowMoveSelection(false);
    } else {
      // Execute self-targeting move
      executeBattleAction('move', {
        moveData: {
          name: moveName,
          power: getBattleMoveData(moveName).power,
          accuracy: getBattleMoveData(moveName).accuracy,
          type: getBattleMoveData(moveName).type,
        }
      });
    }
  };

  const handleTargetSelection = (targetId: string) => {
    if (!selectedMove) return;

    setSelectedTarget(targetId);
    
    const moveData = getBattleMoveData(selectedMove);
    executeBattleAction('move', {
      moveData: {
        name: selectedMove,
        power: moveData.power,
        accuracy: moveData.accuracy,
        type: moveData.type,
      }
    });
  };

  const playBattleSound = (action: string, result: any) => {
    // Battle sound effects would be implemented here
    // For now, just log the action
    console.log('Battle sound:', action, result);
  };

  const getBattleMoveData = (moveName: string) => {
    // This would reference the same BATTLE_MOVES from the API
    const moves: Record<string, any> = {
      'Mineral Strike': { type: 'Terroir', power: 80, accuracy: 100 },
      'Alcohol Blast': { type: 'Energy', power: 90, accuracy: 95 },
      'Elegant Dance': { type: 'Flow', power: 60, accuracy: 100 },
      'Mystique Veil': { type: 'Mystical', power: 85, accuracy: 90 },
      // Add more moves as needed
    };
    return moves[moveName] || { type: 'Normal', power: 50, accuracy: 100 };
  };

  const getWinesByTeam = (team: 'initiator' | 'participant') => {
    return wineDetails.filter(wine => wine.team === team);
  };

  const getOpponentTeam = (): 'initiator' | 'participant' => {
    return userTeam === 'initiator' ? 'participant' : 'initiator';
  };

  const getWineHP = (wineId: string, wine: Wine) => {
    const maxHP = wine.calculated_total || 100;
    const currentHP = battleState?.wineHP?.[wineId] ?? maxHP;
    return { current: currentHP, max: maxHP };
  };

  const getHPPercentage = (wineId: string, wine: Wine) => {
    const hp = getWineHP(wineId, wine);
    return (hp.current / hp.max) * 100;
  };

  const getHPColor = (percentage: number) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Terroir': 'from-green-500 to-emerald-600',
      'Energy': 'from-red-500 to-orange-600',
      'Flow': 'from-blue-500 to-cyan-600',
      'Mystical': 'from-purple-500 to-pink-600',
      'Heritage': 'from-amber-600 to-yellow-600',
      'Modern': 'from-gray-500 to-slate-600',
      'Varietal': 'from-indigo-500 to-blue-600',
      'Technique': 'from-teal-500 to-green-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400 mb-4"></div>
          <p className="text-gray-400">Loading battle...</p>
        </div>
      </div>
    );
  }

  if (!battle || !battleState) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Battle Not Found</h3>
        <p className="text-gray-400">The battle could not be loaded.</p>
      </div>
    );
  }

  const myWines = userTeam ? getWinesByTeam(userTeam) : [];
  const opponentWines = userTeam ? getWinesByTeam(getOpponentTeam()) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Battle Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sword className="w-5 h-5 text-gold-400" />
              <h2 className="text-xl font-bold text-white">{battle.type} Battle</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              battle.status === 'InProgress' ? 'text-green-400 bg-green-400/20' :
              battle.status === 'Completed' ? 'text-blue-400 bg-blue-400/20' :
              'text-yellow-400 bg-yellow-400/20'
            }`}>
              {battle.status}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(battle.elapsed_minutes || 0)}m</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {soundEnabled ? 
                <Volume2 className="w-4 h-4 text-gray-400" /> : 
                <VolumeX className="w-4 h-4 text-gray-400" />
              }
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-gold-600 text-white' : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Info */}
        <div className="grid grid-cols-3 gap-6 items-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">{battle.initiator_username}</h3>
            <p className="text-sm text-gray-400">Level {battle.initiator_level}</p>
            {userTeam === 'initiator' && (
              <span className="inline-block mt-1 px-2 py-1 bg-gold-600 text-white text-xs rounded-full">You</span>
            )}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">VS</div>
            <div className="text-sm text-gray-400">Turn {battleState.turnNumber}</div>
            {isMyTurn && battle.status === 'InProgress' && (
              <div className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-full inline-block animate-pulse">
                Your Turn
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">{battle.participant_username}</h3>
            <p className="text-sm text-gray-400">Level {battle.participant_level}</p>
            {userTeam === 'participant' && (
              <span className="inline-block mt-1 px-2 py-1 bg-gold-600 text-white text-xs rounded-full">You</span>
            )}
          </div>
        </div>
      </div>

      {/* Battle Field */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opponent's Team */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-400" />
            Opponent ({opponentWines.length})
          </h3>
          <div className="space-y-3">
            {opponentWines.map((wine) => (
              <WineBattleCard
                key={wine.id}
                wine={wine}
                hp={getWineHP(wine.id, wine)}
                isOpponent={true}
                isTargetable={isMyTurn && selectedMove && getBattleMoveData(selectedMove).power > 0}
                isSelected={selectedTarget === wine.id}
                onSelect={() => selectedMove ? handleTargetSelection(wine.id) : null}
              />
            ))}
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Battle Log</h3>
          <div 
            ref={battleLogRef}
            className="h-96 overflow-y-auto space-y-2 scroll-smooth"
          >
            {battleState.battleLog.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm p-3 bg-gray-800 rounded border-l-4 border-gray-700"
              >
                <div className="text-gray-300">
                  <span className="font-medium text-gold-400">Turn {entry.turn}:</span> {entry.result?.message || entry.action}
                </div>
                {entry.result?.damage > 0 && (
                  <div className="text-red-400 font-medium">
                    -{entry.result.damage} HP
                    {entry.result.critical && <span className="text-yellow-400 ml-2">CRITICAL!</span>}
                  </div>
                )}
                {entry.result?.effectiveness && entry.result.effectiveness !== 1 && (
                  <div className={`font-medium ${
                    entry.result.effectiveness > 1 ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {entry.result.effectiveness > 1 ? 'Super Effective!' : 'Not Very Effective...'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Team */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Sword className="w-5 h-5 mr-2 text-green-400" />
            Your Team ({myWines.length})
          </h3>
          <div className="space-y-3">
            {myWines.map((wine) => (
              <WineBattleCard
                key={wine.id}
                wine={wine}
                hp={getWineHP(wine.id, wine)}
                isOwn={true}
                isSelectable={isMyTurn && !actionLoading}
                isSelected={selectedWine === wine.id}
                onSelect={() => setSelectedWine(wine.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Panel */}
      {isMyTurn && selectedWine && battle.status === 'InProgress' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Action</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowMoveSelection(true)}
              disabled={actionLoading}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Attack</span>
            </button>
            
            <button
              onClick={() => executeBattleAction('ability')}
              disabled={actionLoading}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ability</span>
            </button>
            
            <button
              onClick={() => executeBattleAction('switch')}
              disabled={actionLoading}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Switch</span>
            </button>
            
            <button
              onClick={() => executeBattleAction('forfeit')}
              disabled={actionLoading}
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Forfeit</span>
            </button>
          </div>
        </div>
      )}

      {/* Move Selection Modal */}
      <AnimatePresence>
        {showMoveSelection && selectedWine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowMoveSelection(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Select Move</h3>
              <div className="grid grid-cols-2 gap-3">
                {(availableMoves[selectedWine] || []).map((moveName) => (
                  <button
                    key={moveName}
                    onClick={() => handleMoveSelection(moveName)}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-left transition-colors"
                  >
                    <div className="font-medium text-white">{moveName}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {getBattleMoveData(moveName).type} • Power: {getBattleMoveData(moveName).power}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMoveSelection(false)}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Complete */}
      {battle.status === 'Completed' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 text-center">
          <Trophy className="w-16 h-16 mx-auto text-gold-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Battle Complete!</h3>
          {battle.winner_id ? (
            <p className="text-gray-400">
              Winner: {battle.winner_id === battle.initiator_id ? battle.initiator_username : battle.participant_username}
            </p>
          ) : (
            <p className="text-gray-400">Draw!</p>
          )}
        </div>
      )}
    </div>
  );
}

// Wine Battle Card Component
interface WineBattleCardProps {
  wine: Wine & { team?: string };
  hp: { current: number; max: number };
  isOwn?: boolean;
  isOpponent?: boolean;
  isSelectable?: boolean;
  isTargetable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function WineBattleCard({ 
  wine, 
  hp, 
  isOwn, 
  isOpponent, 
  isSelectable, 
  isTargetable, 
  isSelected, 
  onSelect 
}: WineBattleCardProps) {
  const hpPercentage = (hp.current / hp.max) * 100;
  const isFainted = hp.current <= 0;

  const getHPColor = (percentage: number) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Terroir': 'from-green-500 to-emerald-600',
      'Energy': 'from-red-500 to-orange-600',
      'Flow': 'from-blue-500 to-cyan-600',
      'Mystical': 'from-purple-500 to-pink-600',
      'Heritage': 'from-amber-600 to-yellow-600',
      'Modern': 'from-gray-500 to-slate-600',
      'Varietal': 'from-indigo-500 to-blue-600',
      'Technique': 'from-teal-500 to-green-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div
      onClick={onSelect}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isFainted ? 'opacity-50 grayscale' :
        isSelected ? 'border-gold-400 bg-gold-400/10' :
        isSelectable || isTargetable ? 'border-gray-600 hover:border-gray-500 bg-gray-800' :
        'border-gray-700 bg-gray-800/50'
      }`}
      whileHover={isSelectable || isTargetable ? { scale: 1.02 } : {}}
      whileTap={isSelectable || isTargetable ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getTypeColor(wine.wine_type)} flex items-center justify-center text-white font-bold`}>
          {wine.level}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-white truncate">{wine.name}</h4>
            {wine.is_shiny && <Sparkles className="w-4 h-4 text-yellow-400" />}
          </div>
          <p className="text-sm text-gray-400">{wine.wine_type}</p>
          
          {/* HP Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>HP</span>
              <span>{hp.current}/{hp.max}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getHPColor(hpPercentage)}`}
                style={{ width: `${Math.max(0, hpPercentage)}%` }}
              />
            </div>
          </div>
        </div>
        
        {isTargetable && (
          <Target className="w-5 h-5 text-red-400 animate-pulse" />
        )}
      </div>
      
      {isFainted && (
        <div className="mt-2 text-center text-red-400 font-medium text-sm">
          FAINTED
        </div>
      )}
    </motion.div>
  );
}