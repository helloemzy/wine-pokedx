import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/market - Get market data and wine pricing
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wineId = searchParams.get('wineId');
    const type = searchParams.get('type'); // 'pricing' | 'trending' | 'recommendations'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (wineId) {
      // Get specific wine market data
      return await getWineMarketData(wineId);
    }

    switch (type) {
      case 'trending':
        return await getTrendingWines(limit);
      case 'recommendations':
        return await getMarketRecommendations(session.user.id, limit);
      case 'pricing':
      default:
        return await getMarketOverview(limit);
    }

  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

async function getWineMarketData(wineId: string) {
  // Get wine details and recent trade history
  const wineQuery = `
    SELECT 
      w.id, w.name, w.wine_type, w.rarity, w.level, w.is_shiny,
      w.calculated_collection_value as base_value,
      COUNT(t.id) as active_trades,
      AVG(t.market_price) FILTER (WHERE t.market_price IS NOT NULL) as avg_market_price,
      MIN(t.market_price) FILTER (WHERE t.market_price IS NOT NULL) as min_price,
      MAX(t.market_price) FILTER (WHERE t.market_price IS NOT NULL) as max_price
    FROM wines w
    LEFT JOIN trades t ON w.id = ANY(t.offered_wines) 
      AND t.status IN ('Pending', 'Active') 
      AND t.type IN ('Market', 'Auction')
    WHERE w.id = $1
    GROUP BY w.id, w.name, w.wine_type, w.rarity, w.level, w.is_shiny, w.calculated_collection_value
  `;

  const wineResult = await db.query(wineQuery, [wineId]);
  
  if (wineResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Wine not found' },
      { status: 404 }
    );
  }

  const wine = wineResult.rows[0];

  // Get recent price history from completed trades
  const historyQuery = `
    SELECT 
      COALESCE(t.final_price, t.market_price) as price,
      t.completed_date as date,
      1 as volume
    FROM trades t
    WHERE $1 = ANY(t.offered_wines)
      AND t.status = 'Completed'
      AND (t.final_price IS NOT NULL OR t.market_price IS NOT NULL)
      AND t.completed_date >= NOW() - INTERVAL '30 days'
    ORDER BY t.completed_date DESC
    LIMIT 20
  `;

  const historyResult = await db.query(historyQuery, [wineId]);

  // Calculate supply and demand metrics
  const supplyDemandQuery = `
    SELECT 
      COUNT(*) FILTER (WHERE t.type IN ('Market', 'Auction')) as supply,
      COUNT(*) FILTER (WHERE tr.wine_id IS NOT NULL) as demand,
      AVG(COALESCE(t.final_price, t.market_price)) as recent_avg_price
    FROM trades t
    LEFT JOIN trade_requests tr ON tr.wine_id = $1 AND tr.created_date >= NOW() - INTERVAL '7 days'
    WHERE $1 = ANY(t.offered_wines) 
      AND t.created_date >= NOW() - INTERVAL '7 days'
  `;

  const supplyDemandResult = await db.query(supplyDemandQuery, [wineId]);
  const supplyDemand = supplyDemandResult.rows[0];

  // Determine trend
  const prices = historyResult.rows.map(row => row.price);
  let trend = 'Stable';
  if (prices.length >= 3) {
    const recent = prices.slice(0, Math.ceil(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(prices.length / 2);
    const older = prices.slice(Math.ceil(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(prices.length / 2);
    if (recent > older * 1.1) trend = 'Rising';
    else if (recent < older * 0.9) trend = 'Falling';
  }

  // Calculate seasonal multiplier based on wine type and current month
  const currentMonth = new Date().getMonth() + 1;
  const seasonalMultiplier = calculateSeasonalMultiplier(wine.wine_type, currentMonth);

  // Calculate rarity premium
  const rarityPremium = calculateRarityPremium(wine.rarity, wine.is_shiny);

  // Calculate investment rating
  const investmentRating = calculateInvestmentRating(wine, supplyDemand, trend);

  return NextResponse.json({
    success: true,
    data: {
      wineId,
      currentPrice: wine.avg_market_price || wine.base_value,
      priceRange: {
        min: wine.min_price || wine.base_value * 0.8,
        max: wine.max_price || wine.base_value * 1.5,
        avg: wine.avg_market_price || wine.base_value,
      },
      priceHistory: historyResult.rows,
      supplyDemand: {
        supply: parseInt(supplyDemand.supply) || 0,
        demand: parseInt(supplyDemand.demand) || 0,
        trend,
      },
      seasonalMultiplier,
      rarityPremium,
      investmentRating,
      activeTrades: parseInt(wine.active_trades) || 0,
      lastUpdated: new Date(),
    },
  });
}

async function getTrendingWines(limit: number) {
  const query = `
    WITH wine_activity AS (
      SELECT 
        w.id, w.name, w.wine_type, w.rarity, w.level, w.is_shiny,
        w.calculated_collection_value,
        COUNT(t.id) as trade_count,
        AVG(COALESCE(t.final_price, t.market_price)) as avg_price,
        COUNT(DISTINCT t.initiator_id) as unique_traders,
        MAX(t.created_date) as last_trade_date
      FROM wines w
      JOIN trades t ON w.id = ANY(t.offered_wines)
      WHERE t.created_date >= NOW() - INTERVAL '7 days'
        AND t.type IN ('Market', 'Auction')
      GROUP BY w.id, w.name, w.wine_type, w.rarity, w.level, w.is_shiny, w.calculated_collection_value
      HAVING COUNT(t.id) >= 2
    )
    SELECT 
      *,
      (trade_count * 0.4 + unique_traders * 0.6) as activity_score
    FROM wine_activity
    ORDER BY activity_score DESC, last_trade_date DESC
    LIMIT $1
  `;

  const result = await db.query(query, [limit]);

  return NextResponse.json({
    success: true,
    data: {
      trending: result.rows,
      updated: new Date(),
    },
  });
}

async function getMarketRecommendations(userId: string, limit: number) {
  // Get user's collection preferences and trading history
  const userQuery = `
    SELECT 
      u.level, u.experience_trading,
      array_agg(DISTINCT w.wine_type) as preferred_types,
      array_agg(DISTINCT w.rarity) as owned_rarities,
      AVG(w.calculated_collection_value) as avg_collection_value
    FROM users u
    LEFT JOIN wines w ON w.owner_id = u.id AND w.captured = true
    WHERE u.id = $1
    GROUP BY u.id, u.level, u.experience_trading
  `;

  const userResult = await db.query(userQuery, [userId]);
  const user = userResult.rows[0];

  // Find wines that match user preferences and are available for trading
  const recommendationsQuery = `
    WITH available_wines AS (
      SELECT DISTINCT w.*, t.market_price, t.type as trade_type
      FROM wines w
      JOIN trades t ON w.id = ANY(t.offered_wines)
      WHERE t.status IN ('Pending', 'Active')
        AND t.type IN ('Market', 'Auction', 'Mystery')
        AND t.initiator_id != $1
        AND (t.level_requirement IS NULL OR t.level_requirement <= $2)
        AND NOT EXISTS (
          SELECT 1 FROM wines uw 
          WHERE uw.owner_id = $1 AND uw.name = w.name AND uw.captured = true
        )
    ),
    scored_recommendations AS (
      SELECT 
        *,
        CASE 
          WHEN wine_type = ANY($3) THEN 30 ELSE 0 
        END +
        CASE 
          WHEN rarity = ANY($4) THEN 20 ELSE 0
        END +
        CASE 
          WHEN calculated_collection_value BETWEEN $5 * 0.5 AND $5 * 2 THEN 25 ELSE 0
        END +
        CASE 
          WHEN is_shiny THEN 15 ELSE 0
        END +
        CASE 
          WHEN trade_type = 'Mystery' THEN 10 ELSE 0
        END as recommendation_score
      FROM available_wines
    )
    SELECT * FROM scored_recommendations
    WHERE recommendation_score > 20
    ORDER BY recommendation_score DESC, calculated_collection_value ASC
    LIMIT $6
  `;

  const result = await db.query(recommendationsQuery, [
    userId,
    user.level,
    user.preferred_types || [],
    user.owned_rarities || [],
    user.avg_collection_value || 100,
    limit,
  ]);

  return NextResponse.json({
    success: true,
    data: {
      recommendations: result.rows,
      criteria: {
        userLevel: user.level,
        preferredTypes: user.preferred_types,
        avgCollectionValue: user.avg_collection_value,
      },
      updated: new Date(),
    },
  });
}

async function getMarketOverview(limit: number) {
  const query = `
    SELECT 
      wine_type,
      rarity,
      COUNT(*) as available_count,
      AVG(COALESCE(final_price, market_price)) as avg_price,
      MIN(COALESCE(final_price, market_price)) as min_price,
      MAX(COALESCE(final_price, market_price)) as max_price,
      COUNT(*) FILTER (WHERE status = 'Completed' AND completed_date >= NOW() - INTERVAL '7 days') as recent_sales
    FROM trades t
    JOIN wines w ON w.id = ANY(t.offered_wines)
    WHERE t.type IN ('Market', 'Auction')
      AND (t.market_price IS NOT NULL OR t.final_price IS NOT NULL)
      AND t.created_date >= NOW() - INTERVAL '30 days'
    GROUP BY wine_type, rarity
    HAVING COUNT(*) > 0
    ORDER BY recent_sales DESC, avg_price DESC
    LIMIT $1
  `;

  const result = await db.query(query, [limit]);

  return NextResponse.json({
    success: true,
    data: {
      overview: result.rows,
      updated: new Date(),
    },
  });
}

function calculateSeasonalMultiplier(wineType: string, month: number): number {
  const seasonalBoosts = {
    'Terroir': { 3: 1.15, 4: 1.20, 5: 1.15, 9: 1.10, 10: 1.25, 11: 1.10 }, // Spring/Fall
    'Energy': { 12: 1.20, 1: 1.15, 2: 1.10, 6: 1.10, 7: 1.15, 8: 1.10 }, // Winter/Summer
    'Flow': { 3: 1.10, 4: 1.15, 5: 1.20, 6: 1.25, 7: 1.20, 8: 1.15 }, // Spring/Summer
    'Heritage': { 9: 1.15, 10: 1.20, 11: 1.25, 12: 1.20 }, // Fall/Winter
  };

  const typeBoosts = seasonalBoosts[wineType as keyof typeof seasonalBoosts];
  return typeBoosts?.[month as keyof typeof typeBoosts] || 1.0;
}

function calculateRarityPremium(rarity: string, isShiny: boolean): number {
  const rarityMultipliers = {
    'Everyday': 1.0, 'Regional': 1.1, 'Quality': 1.2,
    'Estate': 1.4, 'Vintage': 1.6, 'Reserve': 1.8,
    'SingleVineyard': 2.2, 'GrandCru': 2.8, 'MasterSelection': 3.5,
    'CultClassic': 4.5, 'AllocationOnly': 6.0, 'CriticsChoice': 7.5,
    'MuseumPiece': 10.0, 'InvestmentGrade': 15.0, 'Unicorn': 25.0,
    'GhostVintage': 40.0, 'LostLabel': 60.0, 'FoundersReserve': 80.0,
    'OnceInLifetime': 120.0, 'PerfectStorm': 200.0, 'TimeCapsule': 500.0,
  };

  let premium = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1.0;
  if (isShiny) premium *= 2.5;
  
  return premium;
}

function calculateInvestmentRating(wine: any, supplyDemand: any, trend: string): string {
  let score = 0;

  // Rarity score
  if (wine.rarity.includes('Grade') || wine.rarity.includes('Time')) score += 40;
  else if (wine.rarity.includes('Museum') || wine.rarity.includes('Unicorn')) score += 30;
  else if (wine.rarity.includes('Cult') || wine.rarity.includes('Critics')) score += 20;
  else if (wine.rarity.includes('Grand') || wine.rarity.includes('Master')) score += 15;
  
  // Shiny bonus
  if (wine.is_shiny) score += 20;
  
  // Supply/demand balance
  const supply = parseInt(supplyDemand.supply) || 1;
  const demand = parseInt(supplyDemand.demand) || 0;
  if (demand > supply * 2) score += 15;
  else if (demand > supply) score += 10;
  else if (supply > demand * 2) score -= 10;
  
  // Trend bonus
  if (trend === 'Rising') score += 10;
  else if (trend === 'Falling') score -= 5;
  
  // Level bonus for high-level wines
  if (wine.level >= 90) score += 10;
  else if (wine.level >= 70) score += 5;

  if (score >= 80) return 'Outstanding';
  if (score >= 60) return 'Excellent';
  if (score >= 40) return 'Good';
  if (score >= 20) return 'Fair';
  return 'Poor';
}