import { NextRequest, NextResponse } from 'next/server';
import { getWine, getWineSpecies, updateWine, deleteWine } from '@/lib/api/wines';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/wines/[id] - Get a specific wine or wine species
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'species' or 'wine' (default)
    const session = await getServerSession(authOptions);
    
    if (type === 'species') {
      // Get wine species data (Pokedex entry)
      const species = await getWineSpecies(params.id);
      
      if (!species) {
        return NextResponse.json(
          { error: 'Wine species not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(species);
    }

    // Get individual wine data
    const wine = await getWine(params.id);
    
    if (!wine) {
      return NextResponse.json(
        { error: 'Wine not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this wine
    // (For now, all wines are viewable, but owner gets more details)
    const isOwner = session?.user?.id === wine.owner?.id;
    
    if (!isOwner) {
      // Return limited public data for non-owners
      const publicWine = {
        id: wine.id,
        name: wine.name,
        nickname: wine.nickname,
        type: wine.type,
        secondaryType: wine.secondaryType,
        region: wine.region,
        grape: wine.grape,
        producer: wine.producer,
        rarity: wine.rarity,
        level: wine.level,
        nature: wine.nature,
        isShiny: wine.isShiny,
        isLegendary: wine.isLegendary,
        isMythical: wine.isMythical,
        owner: wine.owner,
        metLocation: wine.metLocation,
        metDate: wine.metDate,
      };
      return NextResponse.json(publicWine);
    }

    return NextResponse.json(wine);

  } catch (error) {
    console.error(`Error in GET /api/wines/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch wine' },
      { status: 500 }
    );
  }
}

// PUT /api/wines/[id] - Update a wine (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const updateData = {
      nickname: body.nickname,
      level: body.level,
      experience: body.experience,
      effortValues: body.effortValues,
      customAttributes: body.customAttributes,
    };

    const updatedWine = await updateWine(params.id, session.user.id, updateData);
    
    if (!updatedWine) {
      return NextResponse.json(
        { error: 'Wine not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedWine);

  } catch (error) {
    console.error(`Error in PUT /api/wines/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update wine' },
      { status: 500 }
    );
  }
}

// DELETE /api/wines/[id] - Delete a wine (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const success = await deleteWine(params.id, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Wine not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`Error in DELETE /api/wines/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete wine' },
      { status: 500 }
    );
  }
}