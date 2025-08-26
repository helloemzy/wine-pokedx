import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Type definitions for battle moves
interface BattleMove {
  type: string;
  power: number;
  accuracy: number;
  effect: string;
  priority: number;
}

// Type for battle action data
interface BattleActionData {
  action: 'move' | 'ability' | 'item' | 'switch' | 'forfeit';
  wineId: string;
  targetId?: string;
  moveData?: {
    name: string;
    power: number;
    accuracy: number;
    type: string;
  };
  abilityData?: {
    name: string;
    effect: string;
  };
  itemData?: {
    name: string;
    effect: string;
  };
}

// Battle state interface
interface BattleState {
  turn: number;
  currentPlayer: string;
  wines: Record<string, WineBattleStats>;
  field: {
    weather?: string;
    terrain?: string;
  };
  log: BattleLogEntry[];
}

// Wine battle stats
interface WineBattleStats {
  id: string;
  hp: number;
  maxHp: number;
  stats: {
    power: number;
    elegance: number;
    complexity: number;
    longevity: number;
    rarity: number;
    terroir: number;
  };
  statusEffects: string[];
  type: string;
}

// Battle log entry
interface BattleLogEntry {
  timestamp: Date;
  message: string;
  playerId: string;
}

// Battle instance
interface Battle {
  id: string;
  initiator_id: string;
  participant_id: string;
  status: string;
  start_time?: Date;
  end_time?: Date;
}

// Action result
interface ActionResult {
  success: boolean;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  message: string;
  error?: string;
}

// Note: battleActionSchema defined but validation is handled in POST handler

// Note: TYPE_EFFECTIVENESS data moved to database

// Note: BATTLE_MOVES data moved to database

// GET /api/battles/[id] - Get battle details and current state
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;

    // Get battle details with participant info
    const battleQuery = `
      SELECT 
        b.*,
        u1.username as initiator_username,
        u1.level as initiator_level,
        u1.avatar_url as initiator_avatar,
        u2.username as participant_username,
        u2.level as participant_level,
        u2.avatar_url as participant_avatar,
        bs.state_data as current_state,
        bs.updated_at as state_updated_at,
        CASE 
          WHEN b.end_time IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 60
          WHEN b.start_time IS NOT NULL THEN
            EXTRACT(EPOCH FROM (NOW() - b.start_time)) / 60
          ELSE 0
        END as elapsed_minutes
      FROM battles b
      JOIN users u1 ON b.initiator_id = u1.id
      LEFT JOIN users u2 ON b.participant_id = u2.id
      LEFT JOIN battle_states bs ON b.id = bs.battle_id
      WHERE b.id = $1
      ORDER BY bs.updated_at DESC
      LIMIT 1
    `;

    const battleResult = await db.query(battleQuery, [battleId]);

    if (battleResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Battle not found' },
        { status: 404 }
      );
    }

    const battle = battleResult.rows[0];

    // Check if user is participant
    const isParticipant = battle.initiator_id === session.user.id || 
                         battle.participant_id === session.user.id;

    if (!isParticipant && battle.is_private) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get wine details for both teams
    const wineDetailsQuery = `
      SELECT 
        w.*,
        CASE 
          WHEN w.id = ANY($2) THEN 'initiator'
          WHEN w.id = ANY($3) THEN 'participant'
        END as team
      FROM wines w
      WHERE w.id = ANY($2) OR w.id = ANY($3)
      ORDER BY w.level DESC
    `;

    const wineDetails = await db.query(wineDetailsQuery, [
      battleId,
      battle.initiator_wines || [],
      battle.participant_wines || []
    ]);

    // Get available moves for user's wines (if user is participant)
    let availableMoves = {};
    if (isParticipant) {
      const userWines = wineDetails.rows.filter(wine => 
        (battle.initiator_id === session.user.id && wine.team === 'initiator') ||
        (battle.participant_id === session.user.id && wine.team === 'participant')
      );

      availableMoves = generateAvailableMoves(userWines);
    }

    return NextResponse.json({
      success: true,
      data: {
        battle,
        wineDetails: wineDetails.rows,
        currentState: battle.current_state ? JSON.parse(battle.current_state) : null,
        availableMoves,
        isParticipant,
        userTeam: battle.initiator_id === session.user.id ? 'initiator' : 
                  battle.participant_id === session.user.id ? 'participant' : null,
      },
    });

  } catch (error) {
    console.error('Battle fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch battle' },
      { status: 500 }
    );
  }
}

// POST /api/battles/[id] - Execute battle action
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = battleActionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid action data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const battleId = params.id;
    const { action, wineId, targetId, moveData, abilityData } = validation.data;

    // Get current battle state
    const battleQuery = `
      SELECT b.*, bs.state_data 
      FROM battles b
      LEFT JOIN battle_states bs ON b.id = bs.battle_id
      WHERE b.id = $1 AND b.status = 'InProgress'
      ORDER BY bs.updated_at DESC
      LIMIT 1
    `;

    const battleResult = await db.query(battleQuery, [battleId]);

    if (battleResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Battle not found or not in progress' },
        { status: 404 }
      );
    }

    const battle = battleResult.rows[0];
    const currentState = battle.state_data ? JSON.parse(battle.state_data) : null;

    // Verify it's the user's turn
    if (currentState?.currentTurn !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not your turn' },
        { status: 400 }
      );
    }

    // Verify user owns the wine being used
    const userWines = battle.initiator_id === session.user.id ? 
                      battle.initiator_wines : battle.participant_wines;
    
    if (!userWines?.includes(wineId)) {
      return NextResponse.json(
        { success: false, error: 'Wine not in your team' },
        { status: 400 }
      );
    }

    // Execute the action
    const actionResult = await executeBattleAction(
      battle, 
      currentState, 
      session.user.id, 
      { action, wineId, targetId, moveData, abilityData }
    );

    if (!actionResult.success) {
      return NextResponse.json(
        { success: false, error: actionResult.error },
        { status: 400 }
      );
    }

    // Update battle state
    await db.query(
      'UPDATE battle_states SET state_data = $1, updated_at = NOW() WHERE battle_id = $2',
      [JSON.stringify(actionResult.newState), battleId]
    );

    // Check if battle is over
    if (actionResult.battleEnded) {
      await endBattle(battleId, actionResult.winner, actionResult.newState);
    }

    return NextResponse.json({
      success: true,
      data: {
        battleId,
        action,
        result: actionResult.actionResult,
        newState: actionResult.newState,
        battleEnded: actionResult.battleEnded,
        winner: actionResult.winner,
        nextTurn: actionResult.newState.currentTurn,
      },
    });

  } catch (error) {
    console.error('Battle action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute battle action' },
      { status: 500 }
    );
  }
}

// DELETE /api/battles/[id] - Forfeit battle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;

    const battle = await db.query(
      'SELECT * FROM battles WHERE id = $1 AND (initiator_id = $2 OR participant_id = $2) AND status IN ($3, $4)',
      [battleId, session.user.id, 'WaitingForOpponent', 'InProgress']
    );

    if (battle.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Battle not found or cannot forfeit' },
        { status: 404 }
      );
    }

    const battleData = battle.rows[0];
    let winner = null;
    let status = 'Cancelled';

    if (battleData.status === 'InProgress') {
      // Determine winner (opponent wins)
      winner = battleData.initiator_id === session.user.id ? 
               battleData.participant_id : battleData.initiator_id;
      status = 'Completed';

      // Update winner's stats
      if (winner) {
        await db.query(`
          UPDATE users 
          SET battle_wins = battle_wins + 1,
              experience_competition = experience_competition + 75,
              battle_rating = LEAST(battle_rating + 25, 3000)
          WHERE id = $1
        `, [winner]);
      }

      // Update loser's stats (less penalty for forfeit than loss)
      await db.query(`
        UPDATE users 
        SET battle_losses = battle_losses + 1,
            battle_rating = GREATEST(battle_rating - 10, 0)
        WHERE id = $1
      `, [session.user.id]);
    }

    // End battle
    await db.query(`
      UPDATE battles 
      SET status = $1, winner_id = $2, end_time = NOW()
      WHERE id = $3
    `, [status, winner, battleId]);

    // Release wines from battle
    const allWines = [...(battleData.initiator_wines || []), ...(battleData.participant_wines || [])];
    if (allWines.length > 0) {
      await db.query(
        'UPDATE wines SET status = $1 WHERE id = ANY($2)',
        ['Captured', allWines]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        battleId,
        status,
        winner,
        message: status === 'Cancelled' ? 'Battle cancelled' : 'Battle forfeited',
      },
    });

  } catch (error) {
    console.error('Battle forfeit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to forfeit battle' },
      { status: 500 }
    );
  }
}

async function executeBattleAction(battle: Battle, currentState: BattleState, userId: string, actionData: BattleActionData): Promise<{ success: boolean; state?: BattleState; ended?: boolean; winner?: string; error?: string }> {
  const { action, wineId, targetId, moveData } = actionData;

  // Clone current state
  const newState = JSON.parse(JSON.stringify(currentState));
  
  let actionResult: ActionResult = {
    success: false,
    damage: 0,
    effectiveness: 1,
    critical: false,
    message: '',
  };

  let battleEnded = false;
  let winner = null;

  try {
    switch (action) {
      case 'move':
        if (!moveData) {
          return { success: false, error: 'Move data required' };
        }
        actionResult = await executeMove(battle, newState, userId, wineId, targetId, moveData);
        break;

      case 'ability':
        actionResult = await executeAbility(battle, newState, userId, wineId, actionData.abilityData);
        break;

      case 'item':
        actionResult = await executeItem(battle, newState, userId, wineId, actionData.itemData);
        break;

      case 'switch':
        actionResult = await executeSwitch(battle, newState, userId, wineId);
        break;

      case 'forfeit':
        battleEnded = true;
        winner = battle.initiator_id === userId ? battle.participant_id : battle.initiator_id;
        actionResult = { success: true, message: 'Battle forfeited' };
        break;

      default:
        return { success: false, error: 'Invalid action' };
    }

    if (!actionResult.success) {
      return { success: false, error: actionResult.message };
    }

    // Add to battle log
    newState.battleLog.push({
      turn: newState.turnNumber,
      action: action,
      userId,
      wineId,
      targetId,
      result: actionResult,
      timestamp: new Date(),
    });

    // Check for battle end conditions
    if (!battleEnded) {
      const battleCheck = checkBattleEnd(battle, newState);
      battleEnded = battleCheck.ended;
      winner = battleCheck.winner;
    }

    // Switch turns
    if (!battleEnded) {
      newState.currentTurn = battle.initiator_id === userId ? 
                            battle.participant_id : battle.initiator_id;
      newState.turnNumber += 1;
    }

    return {
      success: true,
      newState,
      actionResult,
      battleEnded,
      winner,
    };

  } catch (error) {
    console.error('Action execution error:', error);
    return { success: false, error: 'Failed to execute action' };
  }
}

async function executeMove(battle: Battle, state: BattleState, userId: string, attackerId: string, targetId: string | undefined, moveData: BattleActionData['moveData']): Promise<ActionResult> {
  // Get attacker and target details
  const attackerDetails = await getWineDetails(attackerId);
  const targetDetails = targetId ? await getWineDetails(targetId) : null;

  if (!attackerDetails) {
    return { success: false, message: 'Attacker wine not found' };
  }

  // TODO: Fetch move from database instead of hardcoded data
  const move: BattleMove = {
    type: moveData?.type || 'Terroir',
    power: moveData?.power || 80,
    accuracy: moveData?.accuracy || 100,
    effect: 'Basic attack',
    priority: 0
  };

  // Check accuracy
  const accuracyRoll = Math.random() * 100;
  if (accuracyRoll > move.accuracy) {
    return {
      success: true,
      missed: true,
      message: `${attackerDetails.name} used ${move.name}, but it missed!`,
    };
  }

  const result: ActionResult = {
    success: true,
    move: move.name,
    attacker: attackerDetails.name,
    damage: 0,
    effectiveness: 1,
    critical: false,
  };

  if (move.power > 0 && targetDetails) {
    // Calculate damage
    const damage = calculateDamage(attackerDetails, targetDetails, move);
    result.damage = damage.amount;
    result.effectiveness = damage.effectiveness;
    result.critical = damage.critical;

    // Apply damage to target
    if (!state.wineHP) state.wineHP = {};
    if (!state.wineHP[targetId]) {
      state.wineHP[targetId] = targetDetails.calculated_total || 100;
    }
    
    state.wineHP[targetId] = Math.max(0, state.wineHP[targetId] - damage.amount);

    result.message = `${attackerDetails.name} used ${move.name} on ${targetDetails.name}! `;
    
    if (damage.effectiveness > 1) {
      result.message += "It's super effective! ";
    } else if (damage.effectiveness < 1) {
      result.message += "It's not very effective... ";
    }
    
    if (damage.critical) {
      result.message += "A critical hit! ";
    }
    
    result.message += `Dealt ${damage.amount} damage.`;

    // Check if target fainted
    if (state.wineHP[targetId] <= 0) {
      result.fainted = true;
      result.message += ` ${targetDetails.name} fainted!`;
    }

  } else {
    // Status move or self-targeting move
    result.message = `${attackerDetails.name} used ${move.name}!`;
    
    // Apply move effects
    if (move.effect.includes('Raises')) {
      result.message += ` ${move.effect}!`;
    }
  }

  return result;
}

async function executeAbility(battle: Battle, state: BattleState, userId: string, wineId: string, abilityData: BattleActionData['abilityData']): Promise<ActionResult> {
  const wineDetails = await getWineDetails(wineId);
  
  return {
    success: true,
    message: `${wineDetails?.name} used ability ${abilityData?.name}!`,
  };
}

async function executeItem(battle: Battle, state: BattleState, userId: string, wineId: string, itemData: BattleActionData['itemData']): Promise<ActionResult> {
  return {
    success: true,
    message: `Used item on ${wineId}!`,
  };
}

async function executeSwitch(battle: Battle, state: BattleState, userId: string, wineId: string): Promise<ActionResult> {
  const wineDetails = await getWineDetails(wineId);
  
  return {
    success: true,
    message: `Switched to ${wineDetails?.name}!`,
  };
}

function calculateDamage(attacker: WineBattleStats, target: WineBattleStats, move: BattleMove): number {
  // Base damage calculation
  const attackStat = attacker.stat_power || attacker.calculated_battle_power || 50;
  const defenseStat = target.stat_elegance || 50; // Elegance acts as defense
  const level = attacker.level || 1;

  // Pokemon-style damage formula adapted for wines
  let damage = Math.floor(
    (((2 * level + 10) / 250) * (attackStat / defenseStat) * move.power + 2)
  );

  // Type effectiveness
  const effectiveness = TYPE_EFFECTIVENESS[move.type]?.[target.wine_type] || 1;
  damage = Math.floor(damage * effectiveness);

  // Critical hit check
  const criticalChance = move.effect?.includes('critical') ? 0.25 : 0.0625; // 1/16 base rate
  const critical = Math.random() < criticalChance;
  if (critical) {
    damage = Math.floor(damage * 1.5);
  }

  // Random factor (85-100%)
  const randomFactor = 0.85 + Math.random() * 0.15;
  damage = Math.floor(damage * randomFactor);

  // Minimum damage
  damage = Math.max(damage, 1);

  return {
    amount: damage,
    effectiveness,
    critical,
  };
}

function checkBattleEnd(battle: Battle, state: BattleState): { ended: boolean; winner?: string } {
  // Check if all wines on one side have fainted
  const initiatorWines = battle.initiator_wines || [];
  const participantWines = battle.participant_wines || [];
  
  const initiatorAlive = initiatorWines.some((wineId: string) => 
    !state.wineHP || !state.wineHP[wineId] || state.wineHP[wineId] > 0
  );
  
  const participantAlive = participantWines.some((wineId: string) => 
    !state.wineHP || !state.wineHP[wineId] || state.wineHP[wineId] > 0
  );

  if (!initiatorAlive && !participantAlive) {
    return { ended: true, winner: null }; // Draw
  } else if (!initiatorAlive) {
    return { ended: true, winner: battle.participant_id };
  } else if (!participantAlive) {
    return { ended: true, winner: battle.initiator_id };
  }

  return { ended: false, winner: null };
}

async function getWineDetails(wineId: string) {
  const result = await db.query(`
    SELECT w.*, ws.stat_power, ws.stat_elegance, ws.stat_complexity, 
           ws.stat_longevity, ws.stat_rarity, ws.stat_terroir
    FROM wines w
    LEFT JOIN wine_stats ws ON w.id = ws.wine_id
    WHERE w.id = $1
  `, [wineId]);

  return result.rows[0] || null;
}

function generateAvailableMoves(wines: WineBattleStats[]): string[] {
  const movesByWine: Record<string, any[]> = {};

  wines.forEach(wine => {
    const moves = [];
    
    // Generate moves based on wine type and stats
    const wineType = wine.wine_type;
    const level = wine.level || 1;
    
    // Basic moves available to all wine types
    moves.push('Basic Strike'); // Always available
    
    // Type-specific moves
    if (wineType in BATTLE_MOVES) {
      const typeMoves = Object.keys(BATTLE_MOVES).filter(moveName => 
        BATTLE_MOVES[moveName].type === wineType
      );
      
      // Add moves based on level
      typeMoves.forEach((moveName, index) => {
        if (level >= (index + 1) * 15) { // Learn moves every 15 levels
          moves.push(moveName);
        }
      });
    }
    
    movesByWine[wine.id] = moves.slice(0, 4); // Maximum 4 moves
  });

  return movesByWine;
}

async function endBattle(battleId: string, winnerId: string | null, finalState: BattleState): Promise<void> {
  await db.query(`
    UPDATE battles 
    SET status = 'Completed', winner_id = $1, end_time = NOW()
    WHERE id = $2
  `, [winnerId, battleId]);

  // Update player stats and experience
  const battle = await db.query('SELECT * FROM battles WHERE id = $1', [battleId]);
  const battleData = battle.rows[0];

  if (winnerId) {
    // Winner gets experience and rating boost
    await db.query(`
      UPDATE users 
      SET battle_wins = battle_wins + 1,
          experience_competition = experience_competition + 100,
          battle_rating = LEAST(battle_rating + 50, 3000)
      WHERE id = $1
    `, [winnerId]);

    // Loser gets small experience but rating penalty
    const loserId = battleData.initiator_id === winnerId ? 
                   battleData.participant_id : battleData.initiator_id;
                   
    await db.query(`
      UPDATE users 
      SET battle_losses = battle_losses + 1,
          experience_competition = experience_competition + 25,
          battle_rating = GREATEST(battle_rating - 25, 0)
      WHERE id = $1
    `, [loserId]);
  }

  // Release wines from battle
  const allWines = [...(battleData.initiator_wines || []), ...(battleData.participant_wines || [])];
  if (allWines.length > 0) {
    await db.query(
      'UPDATE wines SET status = $1 WHERE id = $2',
      ['Captured', allWines]
    );
  }
}