import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/search - Global search across wines, species, users, etc.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'all', 'wines', 'species', 'users', 'regions'
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const searchTerm = `%${q}%`;
    const results: Record<string, unknown[]> = {};

    // Search wine species
    if (type === 'all' || type === 'species') {
      const speciesResult = await query(`
        SELECT 
          'species' as type,
          id,
          name,
          region,
          grape_variety as grape,
          producer,
          primary_type,
          secondary_type,
          base_rarity as rarity,
          is_legendary,
          is_mythical
        FROM wine_species 
        WHERE 
          name ILIKE $1 OR 
          region ILIKE $1 OR 
          grape_variety ILIKE $1 OR 
          producer ILIKE $1
        ORDER BY 
          CASE 
            WHEN name ILIKE $2 THEN 1
            WHEN region ILIKE $2 THEN 2
            WHEN producer ILIKE $2 THEN 3
            ELSE 4
          END,
          name ASC
        LIMIT $3
      `, [searchTerm, `${q}%`, limit]);

      results.species = speciesResult.rows;
    }

    // Search individual wines (public data only)
    if (type === 'all' || type === 'wines') {
      const winesResult = await query(`
        SELECT DISTINCT
          'wine' as type,
          w.id,
          COALESCE(w.nickname, ws.name) as name,
          ws.region,
          ws.grape_variety as grape,
          ws.producer,
          ws.primary_type,
          ws.secondary_type,
          ws.base_rarity as rarity,
          w.level,
          w.is_shiny,
          u.username as owner_username
        FROM wines w
        JOIN wine_species ws ON w.species_id = ws.id
        JOIN users u ON w.owner_id = u.id
        WHERE w.is_active = true AND (
          w.nickname ILIKE $1 OR
          ws.name ILIKE $1 OR
          ws.region ILIKE $1 OR
          ws.grape_variety ILIKE $1
        )
        ORDER BY 
          CASE 
            WHEN w.nickname ILIKE $2 THEN 1
            WHEN ws.name ILIKE $2 THEN 2
            ELSE 3
          END,
          w.level DESC,
          w.created_at DESC
        LIMIT $3
      `, [searchTerm, `${q}%`, limit]);

      results.wines = winesResult.rows;
    }

    // Search users (public profiles only)
    if (type === 'all' || type === 'users') {
      const usersResult = await query(`
        SELECT 
          'user' as type,
          id,
          username,
          display_name,
          level,
          experience,
          avatar_url,
          created_at as joined_date
        FROM users 
        WHERE 
          is_active = true AND 
          is_public = true AND (
            username ILIKE $1 OR 
            display_name ILIKE $1
          )
        ORDER BY 
          CASE 
            WHEN username ILIKE $2 THEN 1
            WHEN display_name ILIKE $2 THEN 2
            ELSE 3
          END,
          level DESC,
          created_at DESC
        LIMIT $3
      `, [searchTerm, `${q}%`, limit]);

      results.users = usersResult.rows;
    }

    // Search regions
    if (type === 'all' || type === 'regions') {
      const regionsResult = await query(`
        SELECT DISTINCT
          'region' as type,
          region as name,
          COUNT(*) as wine_count
        FROM wine_species
        WHERE region ILIKE $1
        GROUP BY region
        ORDER BY 
          CASE WHEN region ILIKE $2 THEN 1 ELSE 2 END,
          COUNT(*) DESC,
          region ASC
        LIMIT $3
      `, [searchTerm, `${q}%`, limit]);

      results.regions = regionsResult.rows;
    }

    // Search grape varieties
    if (type === 'all' || type === 'grapes') {
      const grapesResult = await query(`
        SELECT DISTINCT
          'grape' as type,
          grape_variety as name,
          COUNT(*) as wine_count
        FROM wine_species
        WHERE grape_variety ILIKE $1
        GROUP BY grape_variety
        ORDER BY 
          CASE WHEN grape_variety ILIKE $2 THEN 1 ELSE 2 END,
          COUNT(*) DESC,
          grape_variety ASC
        LIMIT $3
      `, [searchTerm, `${q}%`, limit]);

      results.grapes = grapesResult.rows;
    }

    // Calculate total results for pagination info
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return NextResponse.json({
      query: q,
      type,
      totalResults,
      results,
    });

  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}