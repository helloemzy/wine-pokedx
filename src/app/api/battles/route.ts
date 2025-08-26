import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createBattleSchema = z.object({
  type: z.enum(['BlindTasting', 'PerfectPairing', 'TerroirChallenge', 'VintageQuiz', 'SpeedTasting', 'TeamBattle']),
  challengerId: z.string().optional(),
  wineIds: z.array(z.string()).min(1).max(6),
  battleData: z.object({
    typeEffectiveness: z.boolean().default(true),
    weatherEffects: z.string().optional(),
    criticalHits: z.boolean().default(true),
    abilities: z.boolean().default(true),
  }).optional(),
  isPrivate: z.boolean().default(false),
  entryFee: z.number().min(0).optional(),
});

// Note: Battle constants moved to database for dynamic configuration

// GET /api/battles - List battles and matchmaking
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'waiting';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        b.*,
        u1.username as initiator_username,
        u1.level as initiator_level,
        u2.username as participant_username,
        u2.level as participant_level,
        CASE WHEN b.participant_id IS NULL THEN true ELSE false END as is_open
      FROM battles b
      JOIN users u1 ON b.initiator_id = u1.id
      LEFT JOIN users u2 ON b.participant_id = u2.id
      WHERE b.status = $1
    `;
    
    const params = [status];
    let paramIndex = 2;

    if (type) {
      query += ` AND b.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit.toString(), offset.toString());

    const result = await db.query(query, params);
    
    return NextResponse.json({ 
      success: true, 
      battles: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get battles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch battles' },
      { status: 500 }
    );
  }
}

// POST /api/battles - Create new battle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBattleSchema.parse(body);

    // Validate wine ownership
    const wineCheck = await db.query(
      'SELECT id FROM wines WHERE id = ANY($1) AND owner_id = $2',
      [validatedData.wineIds, session.user.id]
    );

    if (wineCheck.rows.length !== validatedData.wineIds.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid wine selection' },
        { status: 400 }
      );
    }

    // Create battle
    const battleResult = await db.query(`
      INSERT INTO battles (
        initiator_id, type, wine_ids, battle_data, 
        is_private, entry_fee, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'waiting', NOW())
      RETURNING *
    `, [
      session.user.id,
      validatedData.type,
      validatedData.wineIds,
      validatedData.battleData ? JSON.stringify(validatedData.battleData) : null,
      validatedData.isPrivate,
      validatedData.entryFee || 0
    ]);

    const battle = battleResult.rows[0];

    // If challenger specified, send invitation
    if (validatedData.challengerId) {
      // TODO: Implement battle invitation system
    }

    return NextResponse.json({
      success: true,
      battle: {
        ...battle,
        wine_ids: battle.wine_ids // Ensure proper serialization
      }
    });

  } catch (error) {
    console.error('Create battle error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid battle data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create battle' },
      { status: 500 }
    );
  }
}