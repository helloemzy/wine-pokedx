import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateTradeSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel', 'bid', 'buyout']),
  bidAmount: z.number().positive().optional(),
  offeredWineIds: z.array(z.string()).optional(),
});

// GET /api/trades/[id] - Get specific trade details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeId = params.id;

    const query = `
      SELECT 
        t.*,
        u1.username as initiator_username,
        u1.level as initiator_level,
        u1.trust_rating as initiator_trust_rating,
        u1.avatar_url as initiator_avatar,
        u2.username as participant_username,
        u2.level as participant_level,
        u2.trust_rating as participant_trust_rating,
        u2.avatar_url as participant_avatar,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ow.id,
              'name', ow.name,
              'wine_type', ow.wine_type,
              'rarity', ow.rarity,
              'level', ow.level,
              'experience', ow.experience,
              'is_shiny', ow.is_shiny,
              'is_mega', ow.is_mega,
              'base_stats', json_build_object(
                'power', ow.stat_power,
                'elegance', ow.stat_elegance,
                'complexity', ow.stat_complexity,
                'longevity', ow.stat_longevity,
                'rarity', ow.stat_rarity,
                'terroir', ow.stat_terroir
              ),
              'calculated_stats', json_build_object(
                'total', ow.calculated_total,
                'battle_power', ow.calculated_battle_power,
                'collection_value', ow.calculated_collection_value
              ),
              'photo_url', ow.photo_url
            )
          ) FILTER (WHERE ow.id IS NOT NULL),
          '[]'
        ) as offered_wine_details,
        CASE 
          WHEN t.requested_wines IS NOT NULL THEN
            COALESCE(
              json_agg(
                json_build_object(
                  'id', rw.id,
                  'name', rw.name,
                  'wine_type', rw.wine_type,
                  'rarity', rw.rarity,
                  'level', rw.level,
                  'is_shiny', rw.is_shiny,
                  'owner_username', ru.username
                )
              ) FILTER (WHERE rw.id IS NOT NULL),
              '[]'
            )
          ELSE '[]'
        END as requested_wine_details,
        CASE 
          WHEN t.type = 'Auction' AND t.bid_history IS NOT NULL THEN t.bid_history
          ELSE '[]'
        END as bid_history_details
      FROM trades t
      JOIN users u1 ON t.initiator_id = u1.id
      LEFT JOIN users u2 ON t.participant_id = u2.id
      LEFT JOIN wines ow ON ow.id = ANY(t.offered_wines)
      LEFT JOIN wines rw ON rw.id = ANY(t.requested_wines)
      LEFT JOIN users ru ON rw.owner_id = ru.id
      WHERE t.id = $1
      GROUP BY t.id, u1.username, u1.level, u1.trust_rating, u1.avatar_url, 
               u2.username, u2.level, u2.trust_rating, u2.avatar_url
    `;

    const result = await db.query(query, [tradeId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }

    const trade = result.rows[0];

    // Check if user has permission to view this trade
    const isParticipant = trade.initiator_id === session.user.id || 
                         trade.participant_id === session.user.id;
    const isPublicTrade = ['Market', 'Auction', 'Mystery'].includes(trade.type);

    if (!isParticipant && !isPublicTrade) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trade,
    });

  } catch (error) {
    console.error('Trade fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trade' },
      { status: 500 }
    );
  }
}

// PUT /api/trades/[id] - Update trade (accept, reject, bid, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateTradeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const tradeId = params.id;
    const { action, bidAmount, offeredWineIds } = validation.data;

    // Get current trade details
    const tradeQuery = `
      SELECT t.*, u.trust_rating, u.level
      FROM trades t
      JOIN users u ON u.id = $2
      WHERE t.id = $1
    `;
    
    const tradeResult = await db.query(tradeQuery, [tradeId, session.user.id]);
    
    if (tradeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }

    const trade = tradeResult.rows[0];
    const userTrustRating = tradeResult.rows[0].trust_rating;
    const userLevel = tradeResult.rows[0].level;

    // Check trade expiration
    if (trade.expiration_date && new Date(trade.expiration_date) < new Date()) {
      await db.query(
        'UPDATE trades SET status = $1 WHERE id = $2',
        ['Expired', tradeId]
      );
      return NextResponse.json(
        { success: false, error: 'Trade has expired' },
        { status: 400 }
      );
    }

    // Check eligibility requirements
    if (trade.level_requirement && userLevel < trade.level_requirement) {
      return NextResponse.json(
        { success: false, error: `Minimum level ${trade.level_requirement} required` },
        { status: 400 }
      );
    }

    if (trade.trust_rating_requirement && userTrustRating < trade.trust_rating_requirement) {
      return NextResponse.json(
        { success: false, error: `Minimum trust rating ${trade.trust_rating_requirement} required` },
        { status: 400 }
      );
    }

    let updateQuery = '';
    let updateParams: any[] = [];
    let notificationData: any = {};

    switch (action) {
      case 'accept':
        // Handle direct trade acceptance
        if (trade.type !== 'Direct') {
          return NextResponse.json(
            { success: false, error: 'Only direct trades can be accepted directly' },
            { status: 400 }
          );
        }

        if (trade.initiator_id === session.user.id) {
          return NextResponse.json(
            { success: false, error: 'Cannot accept your own trade' },
            { status: 400 }
          );
        }

        if (!offeredWineIds || offeredWineIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Must offer wines to accept trade' },
            { status: 400 }
          );
        }

        // Verify user owns offered wines
        const ownedCheck = await db.query(
          'SELECT COUNT(*) as count FROM wines WHERE id = ANY($1) AND owner_id = $2 AND captured = true',
          [offeredWineIds, session.user.id]
        );

        if (parseInt(ownedCheck.rows[0].count) !== offeredWineIds.length) {
          return NextResponse.json(
            { success: false, error: 'You do not own all offered wines' },
            { status: 400 }
          );
        }

        updateQuery = `
          UPDATE trades 
          SET status = 'Accepted', participant_id = $2, completed_date = NOW(),
              participant_offered_wines = $3
          WHERE id = $1
        `;
        updateParams = [tradeId, session.user.id, offeredWineIds];
        
        // Execute the trade - transfer wines
        await db.query('BEGIN');
        
        try {
          // Transfer initiator's wines to participant
          await db.query(
            'UPDATE wines SET owner_id = $1, status = $2 WHERE id = ANY($3)',
            [session.user.id, 'Captured', trade.offered_wines]
          );
          
          // Transfer participant's wines to initiator  
          await db.query(
            'UPDATE wines SET owner_id = $1, status = $2 WHERE id = ANY($3)',
            [trade.initiator_id, 'Captured', offeredWineIds]
          );

          // Update trade status
          await db.query(updateQuery, updateParams);

          // Handle evolution triggers
          if (trade.triggers_evolution) {
            await db.query(`
              UPDATE wines 
              SET can_evolve = true, evolution_trigger = 'Trade'
              WHERE id = ANY($1) OR id = ANY($2)
            `, [trade.offered_wines, offeredWineIds]);
          }

          // Update user reputation and experience
          await db.query(`
            UPDATE users 
            SET completed_trades = completed_trades + 1,
                successful_trades = successful_trades + 1,
                experience_trading = experience_trading + 50,
                trust_rating = LEAST(trust_rating + 1, 100)
            WHERE id IN ($1, $2)
          `, [trade.initiator_id, session.user.id]);

          await db.query('COMMIT');
          
          notificationData = {
            type: 'TradeCompleted',
            message: 'Trade completed successfully!',
            participantId: session.user.id,
          };
          
        } catch (error) {
          await db.query('ROLLBACK');
          throw error;
        }
        break;

      case 'reject':
        if (trade.initiator_id === session.user.id) {
          return NextResponse.json(
            { success: false, error: 'Use cancel to remove your own trade' },
            { status: 400 }
          );
        }

        updateQuery = 'UPDATE trades SET status = $2 WHERE id = $1';
        updateParams = [tradeId, 'Rejected'];
        
        notificationData = {
          type: 'TradeRejected',
          message: 'Your trade was rejected',
          participantId: session.user.id,
        };
        break;

      case 'cancel':
        if (trade.initiator_id !== session.user.id) {
          return NextResponse.json(
            { success: false, error: 'Only trade initiator can cancel' },
            { status: 403 }
          );
        }

        updateQuery = 'UPDATE trades SET status = $2 WHERE id = $1';
        updateParams = [tradeId, 'Cancelled'];
        
        // Release wines from trade
        await db.query(
          'UPDATE wines SET status = $1 WHERE id = ANY($2)',
          ['Captured', trade.offered_wines]
        );
        break;

      case 'bid':
        if (trade.type !== 'Auction') {
          return NextResponse.json(
            { success: false, error: 'Can only bid on auction trades' },
            { status: 400 }
          );
        }

        if (!bidAmount) {
          return NextResponse.json(
            { success: false, error: 'Bid amount required' },
            { status: 400 }
          );
        }

        // Get current highest bid
        const currentBids = trade.bid_history || [];
        const highestBid = currentBids.length > 0 
          ? Math.max(...currentBids.map((bid: any) => bid.amount)) 
          : trade.market_price || 0;

        if (bidAmount <= highestBid) {
          return NextResponse.json(
            { success: false, error: 'Bid must be higher than current highest bid' },
            { status: 400 }
          );
        }

        const newBid = {
          bidderId: session.user.id,
          amount: bidAmount,
          timestamp: new Date().toISOString(),
        };

        const updatedBidHistory = [...currentBids, newBid];

        updateQuery = `
          UPDATE trades 
          SET bid_history = $2, participant_id = $3
          WHERE id = $1
        `;
        updateParams = [tradeId, JSON.stringify(updatedBidHistory), session.user.id];
        break;

      case 'buyout':
        if (trade.type !== 'Auction' || !trade.buyout_price) {
          return NextResponse.json(
            { success: false, error: 'Trade does not support buyout' },
            { status: 400 }
          );
        }

        // Execute immediate buyout
        updateQuery = `
          UPDATE trades 
          SET status = 'Completed', participant_id = $2, completed_date = NOW(),
              final_price = $3
          WHERE id = $1
        `;
        updateParams = [tradeId, session.user.id, trade.buyout_price];
        
        // Transfer wines and handle payment
        await db.query('BEGIN');
        
        try {
          // Transfer wines to buyer
          await db.query(
            'UPDATE wines SET owner_id = $1, status = $2 WHERE id = ANY($3)',
            [session.user.id, 'Captured', trade.offered_wines]
          );

          // Update user stats
          await db.query(`
            UPDATE users 
            SET completed_trades = completed_trades + 1,
                successful_trades = successful_trades + 1,
                experience_trading = experience_trading + 75
            WHERE id = $1
          `, [session.user.id]);

          await db.query(updateQuery, updateParams);
          await db.query('COMMIT');
          
        } catch (error) {
          await db.query('ROLLBACK');
          throw error;
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Execute the update query if not already executed
    if (action !== 'accept' && action !== 'buyout') {
      await db.query(updateQuery, updateParams);
    }

    // Send notification to trade initiator
    if (notificationData.type) {
      await db.query(`
        INSERT INTO notifications (user_id, type, title, message, data, created_date)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        trade.initiator_id,
        notificationData.type,
        'Trade Update',
        notificationData.message,
        JSON.stringify({ tradeId, action, ...notificationData })
      ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        tradeId,
        action,
        status: action === 'accept' || action === 'buyout' ? 'Completed' : 
                action === 'cancel' ? 'Cancelled' : 
                action === 'reject' ? 'Rejected' : 'Updated',
      },
    });

  } catch (error) {
    console.error('Trade update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trade' },
      { status: 500 }
    );
  }
}

// DELETE /api/trades/[id] - Delete/cancel trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeId = params.id;

    // Check if user owns the trade
    const trade = await db.query(
      'SELECT initiator_id, offered_wines, status FROM trades WHERE id = $1',
      [tradeId]
    );

    if (trade.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' },
        { status: 404 }
      );
    }

    if (trade.rows[0].initiator_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Can only delete your own trades' },
        { status: 403 }
      );
    }

    if (trade.rows[0].status === 'Completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete completed trades' },
        { status: 400 }
      );
    }

    // Release wines and delete trade
    await db.query('BEGIN');
    
    try {
      await db.query(
        'UPDATE wines SET status = $1 WHERE id = ANY($2)',
        ['Captured', trade.rows[0].offered_wines]
      );

      await db.query('DELETE FROM trades WHERE id = $1', [tradeId]);
      
      await db.query('COMMIT');
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Trade deleted successfully' },
    });

  } catch (error) {
    console.error('Trade deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete trade' },
      { status: 500 }
    );
  }
}