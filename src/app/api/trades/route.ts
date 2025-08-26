import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTradeSchema = z.object({
  type: z.enum(['Direct', 'Market', 'Auction', 'Mystery']),
  offeredWineIds: z.array(z.string()).min(1),
  requestedWineIds: z.array(z.string()).optional(),
  marketPrice: z.number().positive().optional(),
  buyoutPrice: z.number().positive().optional(),
  levelRequirement: z.number().min(1).max(100).optional(),
  trustRatingRequirement: z.number().min(0).max(100).optional(),
  regionRestrictions: z.array(z.string()).optional(),
  expirationHours: z.number().min(1).max(168).default(24), // 1 week max
  insurance: z.object({
    enabled: z.boolean(),
    coverage: z.number().positive(),
  }).optional(),
});

const updateTradeSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'Cancelled']),
  counterOffer: z.object({
    offeredWineIds: z.array(z.string()),
    requestedWineIds: z.array(z.string()),
  }).optional(),
});

// GET /api/trades - List all trades with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeOwn = searchParams.get('includeOwn') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      conditions.push(`t.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (status) {
      conditions.push(`t.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (!includeOwn) {
      conditions.push(`t.initiator_id != $${paramIndex}`);
      params.push(session.user.id);
      paramIndex++;
    }

    // Only show active trades if no specific status requested
    if (!status) {
      conditions.push(`t.status IN ('Pending', 'Active')`);
    }

    // Filter out expired trades
    conditions.push(`(t.expiration_date IS NULL OR t.expiration_date > NOW())`);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        t.id,
        t.type,
        t.status,
        t.initiator_id,
        t.participant_id,
        t.offered_wines,
        t.requested_wines,
        t.market_price,
        t.buyout_price,
        t.level_requirement,
        t.trust_rating_requirement,
        t.region_restrictions,
        t.trading_fees,
        t.insurance_enabled,
        t.insurance_cost,
        t.insurance_coverage,
        t.created_date,
        t.expiration_date,
        t.triggers_evolution,
        u1.username as initiator_username,
        u1.level as initiator_level,
        u1.trust_rating as initiator_trust_rating,
        u2.username as participant_username,
        COALESCE(
          json_agg(
            json_build_object(
              'id', w.id,
              'name', w.name,
              'type', w.wine_type,
              'rarity', w.rarity,
              'level', w.level,
              'is_shiny', w.is_shiny
            )
          ) FILTER (WHERE w.id IS NOT NULL), 
          '[]'
        ) as offered_wine_details
      FROM trades t
      JOIN users u1 ON t.initiator_id = u1.id
      LEFT JOIN users u2 ON t.participant_id = u2.id
      LEFT JOIN wines w ON w.id = ANY(t.offered_wines)
      ${whereClause}
      GROUP BY t.id, u1.username, u1.level, u1.trust_rating, u2.username
      ORDER BY t.created_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM trades t
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: {
        trades: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Trade listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

// POST /api/trades - Create a new trade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createTradeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid trade data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      type,
      offeredWineIds,
      requestedWineIds,
      marketPrice,
      buyoutPrice,
      levelRequirement,
      trustRatingRequirement,
      regionRestrictions,
      expirationHours,
      insurance,
    } = validation.data;

    // Verify user owns the offered wines
    const ownedWinesQuery = `
      SELECT id, name, level, evolution_level, can_evolve
      FROM wines 
      WHERE id = ANY($1) AND owner_id = $2 AND captured = true
    `;
    
    const ownedWines = await db.query(ownedWinesQuery, [offeredWineIds, session.user.id]);
    
    if (ownedWines.rows.length !== offeredWineIds.length) {
      return NextResponse.json(
        { error: 'You do not own all the wines you are trying to trade' },
        { status: 400 }
      );
    }

    // Check if any wines would trigger evolution through trading
    const triggersEvolution = ownedWines.rows.some(wine => 
      wine.can_evolve && wine.evolution_level && wine.evolution_level <= wine.level
    );

    // Calculate trading fees (base 2% + insurance cost)
    const baseValue = marketPrice || (ownedWines.rows.length * 100); // Default value calculation
    const tradingFees = Math.floor(baseValue * 0.02);
    const insuranceCost = insurance?.enabled ? Math.floor(insurance.coverage * 0.05) : 0;

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expirationHours);

    // Insert new trade
    const insertQuery = `
      INSERT INTO trades (
        type, status, initiator_id, offered_wines, requested_wines,
        market_price, buyout_price, level_requirement, trust_rating_requirement,
        region_restrictions, trading_fees, insurance_enabled, insurance_cost,
        insurance_coverage, created_date, expiration_date, triggers_evolution
      ) VALUES (
        $1, 'Pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING id, created_date
    `;

    const insertParams = [
      type,
      session.user.id,
      offeredWineIds,
      requestedWineIds || null,
      marketPrice || null,
      buyoutPrice || null,
      levelRequirement || null,
      trustRatingRequirement || null,
      regionRestrictions || null,
      tradingFees,
      insurance?.enabled || false,
      insuranceCost,
      insurance?.coverage || null,
      expirationDate,
      triggersEvolution,
    ];

    const newTrade = await db.query(insertQuery, insertParams);

    // Update wine status to "In Trade"
    await db.query(
      'UPDATE wines SET status = $1 WHERE id = ANY($2)',
      ['InTrade', offeredWineIds]
    );

    // Create trade notification for market trades
    if (type === 'Market' || type === 'Auction') {
      await db.query(`
        INSERT INTO notifications (user_id, type, title, message, data, created_date)
        VALUES ($1, 'TradeCreated', 'Trade Listed', $2, $3, NOW())
      `, [
        session.user.id,
        `Your ${type.toLowerCase()} trade has been listed successfully`,
        JSON.stringify({ tradeId: newTrade.rows[0].id, type, wineCount: offeredWineIds.length })
      ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        tradeId: newTrade.rows[0].id,
        createdDate: newTrade.rows[0].created_date,
        expirationDate,
        tradingFees,
        insuranceCost,
        triggersEvolution,
      },
    });

  } catch (error) {
    console.error('Trade creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}