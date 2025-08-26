import { query, transaction, PaginationParams, PaginatedResult } from '@/lib/db';
import type { 
  Wine, 
  WineSpecies, 
  WineType, 
  WineRarity,
  BaseStats,
  IndividualValues,
  EffortValues
} from '@/types/wine';

export interface WineSearchFilters {
  types?: WineType[];
  rarities?: WineRarity[];
  regions?: string[];
  minLevel?: number;
  maxLevel?: number;
  minRating?: number;
  maxRating?: number;
  isShiny?: boolean;
  isEvolved?: boolean;
  hasEvolution?: boolean;
  searchTerm?: string;
  userId?: string;
  speciesId?: string;
}

export interface CreateWineData {
  speciesId: string;
  userId: string;
  nickname?: string;
  level?: number;
  experience?: number;
  nature: string;
  ability?: string;
  isShiny?: boolean;
  metLocation?: string;
  metDate?: Date;
  originalTrainer?: string;
  pokeball?: string;
  individualValues?: IndividualValues;
  effortValues?: EffortValues;
  customAttributes?: Record<string, unknown>;
}

export interface UpdateWineData {
  nickname?: string;
  level?: number;
  experience?: number;
  effortValues?: EffortValues;
  customAttributes?: Record<string, unknown>;
}

// Wine Species operations
export async function getWineSpecies(id: string): Promise<WineSpecies | null> {
  const result = await query(`
    SELECT 
      ws.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ec.evolution_to_species_id,
            'name', ews.name,
            'level_requirement', ec.level_requirement,
            'item_requirement', ec.item_requirement,
            'condition_requirement', ec.condition_requirement,
            'time_of_day', ec.time_of_day
          )
        ) FILTER (WHERE ec.id IS NOT NULL), 
        '[]'::json
      ) as evolution_chain
    FROM wine_species ws
    LEFT JOIN evolution_chains ec ON ws.id = ec.species_id
    LEFT JOIN wine_species ews ON ec.evolution_to_species_id = ews.id
    WHERE ws.id = $1
    GROUP BY ws.id
  `, [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    region: row.region,
    grape: row.grape_variety,
    producer: row.producer,
    description: row.description,
    rarity: row.base_rarity,
    baseStats: {
      complexity: row.base_complexity,
      balance: row.base_balance,
      intensity: row.base_intensity,
      finesse: row.base_finesse,
      power: row.base_power,
      elegance: row.base_elegance,
    },
    captureRate: row.capture_rate,
    baseExperience: row.base_experience,
    evolutionChain: row.evolution_chain || [],
    isLegendary: row.is_legendary,
    isMythical: row.is_mythical,
    generation: row.generation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function searchWineSpecies(
  filters: Omit<WineSearchFilters, 'userId'> & PaginationParams = {}
): Promise<PaginatedResult<WineSpecies>> {
  const whereConditions: string[] = [];
  const queryParams: unknown[] = [];
  let paramCount = 0;

  // Build WHERE conditions
  if (filters.types?.length) {
    whereConditions.push(`(ws.primary_type = ANY($${++paramCount}) OR ws.secondary_type = ANY($${paramCount}))`);
    queryParams.push(filters.types);
  }

  if (filters.rarities?.length) {
    whereConditions.push(`ws.base_rarity = ANY($${++paramCount})`);
    queryParams.push(filters.rarities);
  }

  if (filters.regions?.length) {
    whereConditions.push(`ws.region = ANY($${++paramCount})`);
    queryParams.push(filters.regions);
  }

  if (filters.searchTerm) {
    whereConditions.push(`(
      ws.name ILIKE $${++paramCount} OR 
      ws.region ILIKE $${paramCount} OR 
      ws.grape_variety ILIKE $${paramCount} OR 
      ws.producer ILIKE $${paramCount}
    )`);
    queryParams.push(`%${filters.searchTerm}%`);
  }

  if (filters.isEvolved !== undefined) {
    if (filters.isEvolved) {
      whereConditions.push(`EXISTS(SELECT 1 FROM evolution_chains WHERE evolution_to_species_id = ws.id)`);
    } else {
      whereConditions.push(`NOT EXISTS(SELECT 1 FROM evolution_chains WHERE evolution_to_species_id = ws.id)`);
    }
  }

  if (filters.hasEvolution !== undefined) {
    if (filters.hasEvolution) {
      whereConditions.push(`EXISTS(SELECT 1 FROM evolution_chains WHERE species_id = ws.id)`);
    } else {
      whereConditions.push(`NOT EXISTS(SELECT 1 FROM evolution_chains WHERE species_id = ws.id)`);
    }
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  const baseQuery = `
    SELECT ws.*, COUNT(*) OVER() as total_count
    FROM wine_species ws
    ${whereClause}
  `;

  const page = filters.page || 1;
  const limit = Math.min(50, filters.limit || 20);
  const offset = (page - 1) * limit;
  const sortBy = filters.sortBy || 'name';
  const sortOrder = filters.sortOrder || 'ASC';

  const fullQuery = `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

  const result = await query(fullQuery, queryParams);
  
  const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
  const totalPages = Math.ceil(totalCount / limit);

  const species = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    region: row.region,
    grape: row.grape_variety,
    producer: row.producer,
    description: row.description,
    rarity: row.base_rarity,
    baseStats: {
      complexity: row.base_complexity,
      balance: row.base_balance,
      intensity: row.base_intensity,
      finesse: row.base_finesse,
      power: row.base_power,
      elegance: row.base_elegance,
    },
    captureRate: row.capture_rate,
    baseExperience: row.base_experience,
    isLegendary: row.is_legendary,
    isMythical: row.is_mythical,
    generation: row.generation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return {
    data: species,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Individual Wine operations
export async function createWine(data: CreateWineData): Promise<Wine> {
  return transaction(async (client) => {
    // Generate IVs if not provided
    const ivs = data.individualValues || {
      complexity: Math.floor(Math.random() * 32),
      balance: Math.floor(Math.random() * 32),
      intensity: Math.floor(Math.random() * 32),
      finesse: Math.floor(Math.random() * 32),
      power: Math.floor(Math.random() * 32),
      elegance: Math.floor(Math.random() * 32),
    };

    // Generate EVs if not provided (start at 0)
    const evs = data.effortValues || {
      complexity: 0,
      balance: 0,
      intensity: 0,
      finesse: 0,
      power: 0,
      elegance: 0,
    };

    // Insert the wine
    const result = await client.query(`
      INSERT INTO wines (
        species_id, owner_id, nickname, level, experience, nature, ability,
        is_shiny, met_location, met_date, original_trainer, pokeball,
        iv_complexity, iv_balance, iv_intensity, iv_finesse, iv_power, iv_elegance,
        ev_complexity, ev_balance, ev_intensity, ev_finesse, ev_power, ev_elegance,
        custom_attributes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *
    `, [
      data.speciesId,
      data.userId,
      data.nickname,
      data.level || 1,
      data.experience || 0,
      data.nature,
      data.ability,
      data.isShiny || false,
      data.metLocation,
      data.metDate || new Date(),
      data.originalTrainer || data.userId,
      data.pokeball || 'pokeball',
      ivs.complexity, ivs.balance, ivs.intensity, ivs.finesse, ivs.power, ivs.elegance,
      evs.complexity, evs.balance, evs.intensity, evs.finesse, evs.power, evs.elegance,
      JSON.stringify(data.customAttributes || {}),
    ]);

    const wine = result.rows[0];

    // Get the complete wine with species data
    return getWine(wine.id);
  });
}

export async function getWine(id: string): Promise<Wine | null> {
  const result = await query(`
    SELECT 
      w.*,
      ws.name as species_name,
      ws.primary_type,
      ws.secondary_type,
      ws.region,
      ws.grape_variety,
      ws.producer,
      ws.base_rarity,
      ws.base_complexity,
      ws.base_balance,
      ws.base_intensity,
      ws.base_finesse,
      ws.base_power,
      ws.base_elegance,
      ws.is_legendary,
      ws.is_mythical,
      u.username as owner_username
    FROM wines w
    JOIN wine_species ws ON w.species_id = ws.id
    JOIN users u ON w.owner_id = u.id
    WHERE w.id = $1 AND w.is_active = true
  `, [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  // Calculate actual stats based on level, IVs, EVs, and nature
  const baseStats = {
    complexity: row.base_complexity,
    balance: row.base_balance,
    intensity: row.base_intensity,
    finesse: row.base_finesse,
    power: row.base_power,
    elegance: row.base_elegance,
  };

  const individualValues = {
    complexity: row.iv_complexity,
    balance: row.iv_balance,
    intensity: row.iv_intensity,
    finesse: row.iv_finesse,
    power: row.iv_power,
    elegance: row.iv_elegance,
  };

  const effortValues = {
    complexity: row.ev_complexity,
    balance: row.ev_balance,
    intensity: row.ev_intensity,
    finesse: row.ev_finesse,
    power: row.ev_power,
    elegance: row.ev_elegance,
  };

  // Calculate actual stats (Pokemon formula)
  const actualStats = {} as BaseStats;
  for (const [stat, baseStat] of Object.entries(baseStats)) {
    const iv = individualValues[stat as keyof IndividualValues] || 0;
    const ev = effortValues[stat as keyof EffortValues] || 0;
    const level = row.level;
    
    // Pokemon stat calculation formula
    actualStats[stat as keyof BaseStats] = Math.floor(
      ((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + 5
    );
  }

  return {
    id: row.id,
    speciesId: row.species_id,
    name: row.species_name,
    nickname: row.nickname || row.species_name,
    type: row.primary_type,
    secondaryType: row.secondary_type,
    region: row.region,
    grape: row.grape_variety,
    producer: row.producer,
    rarity: row.base_rarity,
    level: row.level,
    experience: row.experience,
    experiencePoints: row.experience,
    nature: row.nature,
    ability: row.ability,
    baseStats,
    actualStats,
    individualValues,
    effortValues,
    isShiny: row.is_shiny,
    isLegendary: row.is_legendary,
    isMythical: row.is_mythical,
    metLocation: row.met_location,
    metDate: row.met_date,
    originalTrainer: row.original_trainer,
    pokeball: row.pokeball,
    owner: {
      id: row.owner_id,
      username: row.owner_username,
    },
    customAttributes: row.custom_attributes ? JSON.parse(row.custom_attributes) : {},
    captured: true,
    rating: 5, // Default rating - could be calculated based on stats
    year: new Date().getFullYear(), // Could be derived from met_date
    tastingNotes: '', // Would come from separate tasting notes
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserWines(
  userId: string,
  filters: WineSearchFilters & PaginationParams = {}
): Promise<PaginatedResult<Wine>> {
  const whereConditions: string[] = ['w.owner_id = $1 AND w.is_active = true'];
  const queryParams: unknown[] = [userId];
  let paramCount = 1;

  // Build additional WHERE conditions
  if (filters.types?.length) {
    whereConditions.push(`(ws.primary_type = ANY($${++paramCount}) OR ws.secondary_type = ANY($${paramCount}))`);
    queryParams.push(filters.types);
  }

  if (filters.rarities?.length) {
    whereConditions.push(`ws.base_rarity = ANY($${++paramCount})`);
    queryParams.push(filters.rarities);
  }

  if (filters.minLevel !== undefined) {
    whereConditions.push(`w.level >= $${++paramCount}`);
    queryParams.push(filters.minLevel);
  }

  if (filters.maxLevel !== undefined) {
    whereConditions.push(`w.level <= $${++paramCount}`);
    queryParams.push(filters.maxLevel);
  }

  if (filters.isShiny !== undefined) {
    whereConditions.push(`w.is_shiny = $${++paramCount}`);
    queryParams.push(filters.isShiny);
  }

  if (filters.searchTerm) {
    whereConditions.push(`(
      ws.name ILIKE $${++paramCount} OR 
      w.nickname ILIKE $${paramCount} OR 
      ws.region ILIKE $${paramCount} OR 
      ws.grape_variety ILIKE $${paramCount}
    )`);
    queryParams.push(`%${filters.searchTerm}%`);
  }

  const whereClause = whereConditions.join(' AND ');
  
  const baseQuery = `
    SELECT 
      w.*,
      ws.name as species_name,
      ws.primary_type,
      ws.secondary_type,
      ws.region,
      ws.grape_variety,
      ws.producer,
      ws.base_rarity,
      ws.base_complexity,
      ws.base_balance,
      ws.base_intensity,
      ws.base_finesse,
      ws.base_power,
      ws.base_elegance,
      ws.is_legendary,
      ws.is_mythical,
      COUNT(*) OVER() as total_count
    FROM wines w
    JOIN wine_species ws ON w.species_id = ws.id
    WHERE ${whereClause}
  `;

  const page = filters.page || 1;
  const limit = Math.min(50, filters.limit || 20);
  const offset = (page - 1) * limit;
  const sortBy = filters.sortBy || 'w.created_at';
  const sortOrder = filters.sortOrder || 'DESC';

  const fullQuery = `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

  const result = await query(fullQuery, queryParams);
  
  const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
  const totalPages = Math.ceil(totalCount / limit);

  const wines = result.rows.map(row => ({
    id: row.id,
    speciesId: row.species_id,
    name: row.species_name,
    nickname: row.nickname || row.species_name,
    type: row.primary_type,
    secondaryType: row.secondary_type,
    region: row.region,
    grape: row.grape_variety,
    producer: row.producer,
    rarity: row.base_rarity,
    level: row.level,
    experience: row.experience,
    experiencePoints: row.experience,
    nature: row.nature,
    ability: row.ability,
    baseStats: {
      complexity: row.base_complexity,
      balance: row.base_balance,
      intensity: row.base_intensity,
      finesse: row.base_finesse,
      power: row.base_power,
      elegance: row.base_elegance,
    },
    individualValues: {
      complexity: row.iv_complexity,
      balance: row.iv_balance,
      intensity: row.iv_intensity,
      finesse: row.iv_finesse,
      power: row.iv_power,
      elegance: row.iv_elegance,
    },
    effortValues: {
      complexity: row.ev_complexity,
      balance: row.ev_balance,
      intensity: row.ev_intensity,
      finesse: row.ev_finesse,
      power: row.ev_power,
      elegance: row.ev_elegance,
    },
    isShiny: row.is_shiny,
    isLegendary: row.is_legendary,
    isMythical: row.is_mythical,
    metLocation: row.met_location,
    metDate: row.met_date,
    originalTrainer: row.original_trainer,
    pokeball: row.pokeball,
    customAttributes: row.custom_attributes ? JSON.parse(row.custom_attributes) : {},
    captured: true,
    rating: 5,
    year: new Date().getFullYear(),
    tastingNotes: '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return {
    data: wines,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function updateWine(id: string, userId: string, data: UpdateWineData): Promise<Wine | null> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramCount = 0;

  if (data.nickname !== undefined) {
    updates.push(`nickname = $${++paramCount}`);
    params.push(data.nickname);
  }

  if (data.level !== undefined) {
    updates.push(`level = $${++paramCount}`);
    params.push(data.level);
  }

  if (data.experience !== undefined) {
    updates.push(`experience = $${++paramCount}`);
    params.push(data.experience);
  }

  if (data.effortValues) {
    updates.push(`ev_complexity = $${++paramCount}`);
    params.push(data.effortValues.complexity);
    updates.push(`ev_balance = $${++paramCount}`);
    params.push(data.effortValues.balance);
    updates.push(`ev_intensity = $${++paramCount}`);
    params.push(data.effortValues.intensity);
    updates.push(`ev_finesse = $${++paramCount}`);
    params.push(data.effortValues.finesse);
    updates.push(`ev_power = $${++paramCount}`);
    params.push(data.effortValues.power);
    updates.push(`ev_elegance = $${++paramCount}`);
    params.push(data.effortValues.elegance);
  }

  if (data.customAttributes !== undefined) {
    updates.push(`custom_attributes = $${++paramCount}`);
    params.push(JSON.stringify(data.customAttributes));
  }

  if (updates.length === 0) {
    return getWine(id);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id, userId);

  const result = await query(`
    UPDATE wines 
    SET ${updates.join(', ')}
    WHERE id = $${++paramCount} AND owner_id = $${++paramCount} AND is_active = true
    RETURNING id
  `, params);

  if (result.rows.length === 0) return null;
  
  return getWine(id);
}

export async function deleteWine(id: string, userId: string): Promise<boolean> {
  const result = await query(`
    UPDATE wines 
    SET is_active = false, updated_at = NOW()
    WHERE id = $1 AND owner_id = $2 AND is_active = true
    RETURNING id
  `, [id, userId]);

  return result.rows.length > 0;
}