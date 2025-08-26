import { NextRequest, NextResponse } from 'next/server';
import { searchWineSpecies, getUserWines, createWine } from '@/lib/api/wines';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/wines - Get wine species or user's wine collection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'ASC';
    const searchTerm = searchParams.get('search') || undefined;
    const types = searchParams.get('types')?.split(',') || undefined;
    const rarities = searchParams.get('rarities')?.split(',') || undefined;
    const regions = searchParams.get('regions')?.split(',') || undefined;
    const isShiny = searchParams.get('isShiny') === 'true' ? true : undefined;
    const isEvolved = searchParams.get('isEvolved') === 'true' ? true : undefined;
    const hasEvolution = searchParams.get('hasEvolution') === 'true' ? true : undefined;
    const minLevel = searchParams.get('minLevel') ? parseInt(searchParams.get('minLevel')!) : undefined;
    const maxLevel = searchParams.get('maxLevel') ? parseInt(searchParams.get('maxLevel')!) : undefined;
    const collection = searchParams.get('collection') === 'true';

    const filters = {
      page,
      limit,
      sortBy,
      sortOrder,
      searchTerm,
      types,
      rarities,
      regions,
      isShiny,
      isEvolved,
      hasEvolution,
      minLevel,
      maxLevel,
    };

    // If collection=true, return user's wine collection
    if (collection) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required for collection access' },
          { status: 401 }
        );
      }

      const result = await getUserWines(session.user.id, filters);
      return NextResponse.json(result);
    }

    // Otherwise return wine species (Pokedex entries)
    const result = await searchWineSpecies(filters);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in GET /api/wines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wines' },
      { status: 500 }
    );
  }
}

// POST /api/wines - Create a new wine (catch/collect a wine)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.speciesId) {
      return NextResponse.json(
        { error: 'speciesId is required' },
        { status: 400 }
      );
    }

    if (!body.nature) {
      return NextResponse.json(
        { error: 'nature is required' },
        { status: 400 }
      );
    }

    const wineData = {
      speciesId: body.speciesId,
      userId: session.user.id,
      nickname: body.nickname,
      level: body.level || 1,
      experience: body.experience || 0,
      nature: body.nature,
      ability: body.ability,
      isShiny: body.isShiny || false,
      metLocation: body.metLocation,
      metDate: body.metDate ? new Date(body.metDate) : new Date(),
      originalTrainer: body.originalTrainer || session.user.id,
      pokeball: body.pokeball || 'pokeball',
      individualValues: body.individualValues,
      effortValues: body.effortValues,
      customAttributes: body.customAttributes,
    };

    const wine = await createWine(wineData);
    
    return NextResponse.json(wine, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/wines:', error);
    return NextResponse.json(
      { error: 'Failed to create wine' },
      { status: 500 }
    );
  }
}