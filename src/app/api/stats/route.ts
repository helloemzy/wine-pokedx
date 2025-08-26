import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/stats - Get global and user statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global'; // 'global', 'user', 'leaderboard'
    const session = await getServerSession(authOptions);

    if (type === 'global') {
      // Get global statistics
      const [
        totalSpecies,
        totalWines,
        totalUsers,
        totalTrades,
        rarityDistribution,
        typeDistribution,
        topRegions
      ] = await Promise.all([
        query('SELECT COUNT(*) as count FROM wine_species'),
        query('SELECT COUNT(*) as count FROM wines WHERE is_active = true'),
        query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
        query('SELECT COUNT(*) as count FROM trades WHERE status = \'completed\''),
        
        // Rarity distribution
        query(`
          SELECT 
            ws.base_rarity as rarity,
            COUNT(*) as count,
            ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.is_active = true
          GROUP BY ws.base_rarity
          ORDER BY COUNT(*) DESC
        `),
        
        // Type distribution
        query(`
          SELECT 
            ws.primary_type as type,
            COUNT(*) as count,
            ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.is_active = true
          GROUP BY ws.primary_type
          ORDER BY COUNT(*) DESC
        `),
        
        // Top regions
        query(`
          SELECT 
            ws.region,
            COUNT(*) as count,
            COUNT(DISTINCT ws.id) as species_count
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.is_active = true
          GROUP BY ws.region
          ORDER BY COUNT(*) DESC
          LIMIT 10
        `)
      ]);

      return NextResponse.json({
        global: {
          totalSpecies: parseInt(totalSpecies.rows[0].count),
          totalWines: parseInt(totalWines.rows[0].count),
          totalUsers: parseInt(totalUsers.rows[0].count),
          totalTrades: parseInt(totalTrades.rows[0].count),
        },
        distributions: {
          rarity: rarityDistribution.rows,
          type: typeDistribution.rows,
          regions: topRegions.rows,
        }
      });
    }

    if (type === 'user') {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Get user-specific statistics
      const [
        userWines,
        userSpeciesCount,
        userShinyCount,
        userLegendaryCount,
        userRarityDist,
        userTypeDist,
        userLevelDist,
        recentActivity
      ] = await Promise.all([
        query('SELECT COUNT(*) as count FROM wines WHERE owner_id = $1 AND is_active = true', [session.user.id]),
        
        query(`
          SELECT COUNT(DISTINCT species_id) as count 
          FROM wines 
          WHERE owner_id = $1 AND is_active = true
        `, [session.user.id]),
        
        query('SELECT COUNT(*) as count FROM wines WHERE owner_id = $1 AND is_active = true AND is_shiny = true', [session.user.id]),
        
        query(`
          SELECT COUNT(*) as count 
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.owner_id = $1 AND w.is_active = true AND (ws.is_legendary = true OR ws.is_mythical = true)
        `, [session.user.id]),
        
        // User rarity distribution
        query(`
          SELECT 
            ws.base_rarity as rarity,
            COUNT(*) as count
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.owner_id = $1 AND w.is_active = true
          GROUP BY ws.base_rarity
          ORDER BY COUNT(*) DESC
        `, [session.user.id]),
        
        // User type distribution
        query(`
          SELECT 
            ws.primary_type as type,
            COUNT(*) as count
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.owner_id = $1 AND w.is_active = true
          GROUP BY ws.primary_type
          ORDER BY COUNT(*) DESC
        `, [session.user.id]),
        
        // Level distribution
        query(`
          SELECT 
            CASE 
              WHEN level BETWEEN 1 AND 10 THEN '1-10'
              WHEN level BETWEEN 11 AND 20 THEN '11-20'
              WHEN level BETWEEN 21 AND 30 THEN '21-30'
              WHEN level BETWEEN 31 AND 40 THEN '31-40'
              WHEN level BETWEEN 41 AND 50 THEN '41-50'
              ELSE '50+'
            END as level_range,
            COUNT(*) as count
          FROM wines
          WHERE owner_id = $1 AND is_active = true
          GROUP BY level_range
          ORDER BY MIN(level)
        `, [session.user.id]),
        
        // Recent activity
        query(`
          SELECT 
            w.id,
            COALESCE(w.nickname, ws.name) as name,
            ws.primary_type,
            ws.base_rarity,
            w.level,
            w.is_shiny,
            w.created_at
          FROM wines w
          JOIN wine_species ws ON w.species_id = ws.id
          WHERE w.owner_id = $1 AND w.is_active = true
          ORDER BY w.created_at DESC
          LIMIT 5
        `, [session.user.id])
      ]);

      return NextResponse.json({
        user: {
          totalWines: parseInt(userWines.rows[0].count),
          speciesCollected: parseInt(userSpeciesCount.rows[0].count),
          shinyCount: parseInt(userShinyCount.rows[0].count),
          legendaryCount: parseInt(userLegendaryCount.rows[0].count),
        },
        distributions: {
          rarity: userRarityDist.rows,
          type: userTypeDist.rows,
          levels: userLevelDist.rows,
        },
        recentActivity: recentActivity.rows
      });
    }

    if (type === 'leaderboard') {
      // Get leaderboard data
      const [
        topCollectors,
        topTrainers,
        topTraders,
        shinyHunters
      ] = await Promise.all([
        // Top collectors by unique species
        query(`
          SELECT 
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            u.level as trainer_level,
            COUNT(DISTINCT w.species_id) as species_count,
            COUNT(*) as total_wines
          FROM users u
          JOIN wines w ON u.id = w.owner_id
          WHERE u.is_active = true AND u.is_public = true AND w.is_active = true
          GROUP BY u.id, u.username, u.display_name, u.avatar_url, u.level
          ORDER BY species_count DESC, total_wines DESC
          LIMIT 10
        `),
        
        // Top trainers by level and experience
        query(`
          SELECT 
            id,
            username,
            display_name,
            avatar_url,
            level,
            experience,
            (SELECT COUNT(*) FROM wines WHERE owner_id = users.id AND is_active = true) as wine_count
          FROM users
          WHERE is_active = true AND is_public = true
          ORDER BY level DESC, experience DESC
          LIMIT 10
        `),
        
        // Top traders by completed trades
        query(`
          SELECT 
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            u.level,
            COUNT(*) as trade_count,
            AVG(tr.rating) as avg_rating
          FROM users u
          JOIN trades t ON (u.id = t.initiator_id OR u.id = t.responder_id)
          LEFT JOIN trade_ratings tr ON tr.trade_id = t.id AND tr.rated_user_id = u.id
          WHERE u.is_active = true AND u.is_public = true AND t.status = 'completed'
          GROUP BY u.id, u.username, u.display_name, u.avatar_url, u.level
          HAVING COUNT(*) >= 5
          ORDER BY trade_count DESC, avg_rating DESC NULLS LAST
          LIMIT 10
        `),
        
        // Top shiny hunters
        query(`
          SELECT 
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            u.level,
            COUNT(*) as shiny_count,
            (SELECT COUNT(*) FROM wines WHERE owner_id = u.id AND is_active = true) as total_wines,
            ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM wines WHERE owner_id = u.id AND is_active = true), 0)), 2) as shiny_percentage
          FROM users u
          JOIN wines w ON u.id = w.owner_id
          WHERE u.is_active = true AND u.is_public = true AND w.is_active = true AND w.is_shiny = true
          GROUP BY u.id, u.username, u.display_name, u.avatar_url, u.level
          HAVING COUNT(*) >= 3
          ORDER BY shiny_count DESC, shiny_percentage DESC
          LIMIT 10
        `)
      ]);

      return NextResponse.json({
        leaderboards: {
          collectors: topCollectors.rows,
          trainers: topTrainers.rows,
          traders: topTraders.rows,
          shinyHunters: shinyHunters.rows,
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid stats type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}