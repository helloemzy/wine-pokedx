import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const memberActionSchema = z.object({
  action: z.enum(['join', 'leave', 'invite', 'kick', 'promote', 'demote', 'transfer-leadership']),
  userId: z.string().optional(),
  newRole: z.enum(['Leader', 'Officer', 'Elder', 'Member', 'Recruit']).optional(),
  message: z.string().max(200).optional(),
});

const updateGuildSchema = z.object({
  description: z.string().max(500).optional(),
  visibility: z.enum(['Public', 'Private', 'InviteOnly']).optional(),
  maxMembers: z.number().min(5).max(100).optional(),
  memberRequirements: z.object({
    minimumLevel: z.number().min(1).max(100).optional(),
    minimumCollection: z.number().min(0).optional(),
    requiredBadges: z.array(z.string()).optional(),
    applicationRequired: z.boolean().optional(),
  }).optional(),
  monthlyDues: z.number().min(0).optional(),
});

// GET /api/guilds/[id] - Get guild details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params.id;

    // Get guild details with member info
    const guildQuery = `
      SELECT 
        g.*,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT ge.id) as active_events,
        COALESCE(SUM(gc.wine_count), 0) as shared_wine_count,
        g.last_active >= NOW() - INTERVAL '7 days' as recently_active,
        gm_user.role as user_role,
        gm_user.join_date as user_join_date,
        gm_user.contributions as user_contributions
      FROM guilds g
      LEFT JOIN guild_members gm ON g.id = gm.guild_id
      LEFT JOIN guild_members gm_user ON g.id = gm_user.guild_id AND gm_user.user_id = $2
      LEFT JOIN guild_events ge ON g.id = ge.guild_id AND ge.end_date >= NOW()
      LEFT JOIN (
        SELECT guild_id, COUNT(*) as wine_count
        FROM guild_shared_cellar_wines gscw
        GROUP BY guild_id
      ) gc ON g.id = gc.guild_id
      WHERE g.id = $1
      GROUP BY g.id, gm_user.role, gm_user.join_date, gm_user.contributions
    `;

    const guildResult = await db.query(guildQuery, [guildId, session.user.id]);

    if (guildResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guild not found' },
        { status: 404 }
      );
    }

    const guild = guildResult.rows[0];

    // Check access permissions
    const isMember = guild.user_role !== null;
    const isPublic = guild.visibility === 'Public';
    
    if (!isMember && !isPublic) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get member list (limited for non-members)
    const memberLimit = isMember ? 100 : 10;
    const membersQuery = `
      SELECT 
        gm.*,
        u.username,
        u.level,
        u.avatar_url,
        u.battle_rating,
        COUNT(w.id) as collection_count,
        gm.join_date,
        gm.contributions
      FROM guild_members gm
      JOIN users u ON gm.user_id = u.id
      LEFT JOIN wines w ON w.owner_id = u.id AND w.captured = true
      WHERE gm.guild_id = $1
      GROUP BY gm.user_id, gm.guild_id, gm.role, gm.join_date, gm.contributions,
               u.username, u.level, u.avatar_url, u.battle_rating
      ORDER BY 
        CASE gm.role 
          WHEN 'Leader' THEN 1
          WHEN 'Officer' THEN 2  
          WHEN 'Elder' THEN 3
          WHEN 'Member' THEN 4
          WHEN 'Recruit' THEN 5
        END,
        gm.join_date
      LIMIT $2
    `;

    const membersResult = await db.query(membersQuery, [guildId, memberLimit]);

    // Get recent events
    const eventsQuery = `
      SELECT 
        ge.*,
        u.username as organizer_username,
        COUNT(gep.user_id) as participant_count
      FROM guild_events ge
      JOIN users u ON ge.organizer = u.id
      LEFT JOIN guild_event_participants gep ON ge.id = gep.event_id
      WHERE ge.guild_id = $1
      GROUP BY ge.id, u.username
      ORDER BY ge.start_date DESC
      LIMIT 5
    `;

    const eventsResult = await db.query(eventsQuery, [guildId]);

    // Get shared cellar info (for members only)
    let sharedCellar = null;
    if (isMember) {
      const cellarQuery = `
        SELECT 
          gsc.*,
          COUNT(gscw.wine_id) as wine_count,
          COALESCE(
            json_agg(
              json_build_object(
                'id', w.id,
                'name', w.name,
                'type', w.wine_type,
                'rarity', w.rarity,
                'level', w.level,
                'contributed_by', u.username,
                'contributed_date', gscw.contributed_date
              ) ORDER BY gscw.contributed_date DESC
            ) FILTER (WHERE w.id IS NOT NULL),
            '[]'
          ) as recent_contributions
        FROM guild_shared_cellars gsc
        LEFT JOIN guild_shared_cellar_wines gscw ON gsc.guild_id = gscw.guild_id
        LEFT JOIN wines w ON gscw.wine_id = w.id
        LEFT JOIN users u ON gscw.contributed_by = u.id
        WHERE gsc.guild_id = $1
        GROUP BY gsc.guild_id, gsc.capacity, gsc.access_permissions, gsc.created_date
      `;

      const cellarResult = await db.query(cellarQuery, [guildId]);
      sharedCellar = cellarResult.rows[0] || null;
    }

    // Get guild achievements and stats
    const statsQuery = `
      SELECT 
        g.competitions_won,
        g.current_ranking,
        COUNT(DISTINCT ge.id) FILTER (WHERE ge.end_date < NOW() AND ge.results IS NOT NULL) as events_completed,
        AVG((gm.contributions->>'totalExperience')::numeric) as avg_member_contribution,
        SUM((gm.contributions->>'winesShared')::numeric) as total_wines_shared,
        SUM((gm.contributions->>'competitionsWon')::numeric) as member_competition_wins
      FROM guilds g
      LEFT JOIN guild_members gm ON g.id = gm.guild_id
      LEFT JOIN guild_events ge ON g.id = ge.guild_id
      WHERE g.id = $1
      GROUP BY g.id, g.competitions_won, g.current_ranking
    `;

    const statsResult = await db.query(statsQuery, [guildId]);

    return NextResponse.json({
      success: true,
      data: {
        guild,
        members: membersResult.rows,
        events: eventsResult.rows,
        sharedCellar,
        stats: statsResult.rows[0],
        userMembership: {
          isMember,
          role: guild.user_role,
          joinDate: guild.user_join_date,
          contributions: guild.user_contributions ? JSON.parse(guild.user_contributions) : null,
        },
      },
    });

  } catch (error) {
    console.error('Guild fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guild' },
      { status: 500 }
    );
  }
}

// PUT /api/guilds/[id] - Update guild settings
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
    const validation = updateGuildSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const guildId = params.id;

    // Check if user has permission to update guild
    const memberCheck = await db.query(
      'SELECT role FROM guild_members WHERE guild_id = $1 AND user_id = $2',
      [guildId, session.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not a member of this guild' },
        { status: 403 }
      );
    }

    const userRole = memberCheck.rows[0].role;
    if (!['Leader', 'Officer'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const updates = validation.data;
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'memberRequirements') {
          updateFields.push(`member_requirements = $${paramIndex}`);
          updateValues.push(JSON.stringify(value));
        } else {
          const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          updateFields.push(`${dbField} = $${paramIndex}`);
          updateValues.push(value);
        }
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    updateFields.push(`last_active = NOW()`);
    updateValues.push(guildId);

    const updateQuery = `
      UPDATE guilds 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(updateQuery, updateValues);

    return NextResponse.json({
      success: true,
      data: { guild: result.rows[0] },
    });

  } catch (error) {
    console.error('Guild update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guild' },
      { status: 500 }
    );
  }
}

// POST /api/guilds/[id] - Guild member actions
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
    const validation = memberActionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid action data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const guildId = params.id;
    const { action, userId, newRole, message } = validation.data;

    // Get guild and user's current membership status
    const guildQuery = `
      SELECT g.*, gm.role as user_role
      FROM guilds g
      LEFT JOIN guild_members gm ON g.id = gm.guild_id AND gm.user_id = $2
      WHERE g.id = $1
    `;

    const guildResult = await db.query(guildQuery, [guildId, session.user.id]);

    if (guildResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guild not found' },
        { status: 404 }
      );
    }

    const guild = guildResult.rows[0];
    const userRole = guild.user_role;

    let actionResult;

    switch (action) {
      case 'join':
        actionResult = await handleJoinGuild(guildId, session.user.id, guild, message);
        break;

      case 'leave':
        actionResult = await handleLeaveGuild(guildId, session.user.id, userRole);
        break;

      case 'invite':
        if (!['Leader', 'Officer'].includes(userRole)) {
          return NextResponse.json(
            { success: false, error: 'Insufficient permissions to invite' },
            { status: 403 }
          );
        }
        actionResult = await handleInviteMember(guildId, userId!, session.user.id, guild, message);
        break;

      case 'kick':
        if (!['Leader', 'Officer'].includes(userRole)) {
          return NextResponse.json(
            { success: false, error: 'Insufficient permissions to kick' },
            { status: 403 }
          );
        }
        actionResult = await handleKickMember(guildId, userId!, session.user.id, userRole);
        break;

      case 'promote':
      case 'demote':
        if (!['Leader', 'Officer'].includes(userRole)) {
          return NextResponse.json(
            { success: false, error: 'Insufficient permissions to change roles' },
            { status: 403 }
          );
        }
        actionResult = await handleRoleChange(guildId, userId!, newRole!, session.user.id, userRole, action);
        break;

      case 'transfer-leadership':
        if (userRole !== 'Leader') {
          return NextResponse.json(
            { success: false, error: 'Only guild leader can transfer leadership' },
            { status: 403 }
          );
        }
        actionResult = await handleTransferLeadership(guildId, userId!, session.user.id);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!actionResult.success) {
      return NextResponse.json(actionResult, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: actionResult.data,
    });

  } catch (error) {
    console.error('Guild action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute guild action' },
      { status: 500 }
    );
  }
}

// DELETE /api/guilds/[id] - Disband guild
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params.id;

    // Check if user is guild leader
    const leaderCheck = await db.query(
      'SELECT role FROM guild_members WHERE guild_id = $1 AND user_id = $2',
      [guildId, session.user.id]
    );

    if (leaderCheck.rows.length === 0 || leaderCheck.rows[0].role !== 'Leader') {
      return NextResponse.json(
        { success: false, error: 'Only guild leader can disband guild' },
        { status: 403 }
      );
    }

    // Disband guild
    await db.query('BEGIN');

    try {
      // Remove all members
      await db.query('DELETE FROM guild_members WHERE guild_id = $1', [guildId]);
      
      // Cancel all active events
      await db.query(`
        UPDATE guild_events 
        SET status = 'Cancelled'
        WHERE guild_id = $1 AND end_date > NOW()
      `, [guildId]);

      // Return shared cellar wines to contributors
      await db.query(`
        UPDATE wines 
        SET status = 'Captured'
        WHERE id IN (
          SELECT wine_id FROM guild_shared_cellar_wines WHERE guild_id = $1
        )
      `, [guildId]);

      // Delete guild data
      await db.query('DELETE FROM guild_shared_cellar_wines WHERE guild_id = $1', [guildId]);
      await db.query('DELETE FROM guild_shared_cellars WHERE guild_id = $1', [guildId]);
      await db.query('DELETE FROM guild_events WHERE guild_id = $1', [guildId]);
      await db.query('DELETE FROM guilds WHERE id = $1', [guildId]);

      await db.query('COMMIT');

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Guild disbanded successfully' },
    });

  } catch (error) {
    console.error('Guild deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disband guild' },
      { status: 500 }
    );
  }
}

// Helper functions for guild actions
async function handleJoinGuild(guildId: string, userId: string, guild: any, message?: string) {
  // Check if guild is full
  const memberCount = await db.query(
    'SELECT COUNT(*) as count FROM guild_members WHERE guild_id = $1',
    [guildId]
  );

  if (parseInt(memberCount.rows[0].count) >= guild.max_members) {
    return { success: false, error: 'Guild is full' };
  }

  // Check if user meets requirements
  const requirements = guild.member_requirements ? JSON.parse(guild.member_requirements) : {};
  
  if (requirements.minimumLevel || requirements.minimumCollection || requirements.requiredBadges) {
    const userQuery = `
      SELECT u.level, COUNT(w.id) as collection_count, 
             COALESCE(array_agg(ub.badge_id) FILTER (WHERE ub.badge_id IS NOT NULL), '{}') as badges
      FROM users u
      LEFT JOIN wines w ON w.owner_id = u.id AND w.captured = true
      LEFT JOIN user_badges ub ON ub.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.level
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    const userData = userResult.rows[0];

    if (requirements.minimumLevel && userData.level < requirements.minimumLevel) {
      return { success: false, error: `Level ${requirements.minimumLevel} required` };
    }

    if (requirements.minimumCollection && userData.collection_count < requirements.minimumCollection) {
      return { success: false, error: `${requirements.minimumCollection} wines required` };
    }

    if (requirements.requiredBadges && requirements.requiredBadges.length > 0) {
      const hasRequired = requirements.requiredBadges.every((badge: string) => 
        userData.badges.includes(badge)
      );
      if (!hasRequired) {
        return { success: false, error: 'Missing required badges' };
      }
    }
  }

  // Handle application-required guilds
  if (requirements.applicationRequired) {
    // Create application instead of direct join
    await db.query(`
      INSERT INTO guild_applications (
        guild_id, user_id, message, application_date, status
      ) VALUES ($1, $2, $3, NOW(), 'Pending')
    `, [guildId, userId, message || 'Application to join']);

    return { 
      success: true, 
      data: { 
        status: 'Application Submitted',
        message: 'Your application has been submitted for review'
      }
    };
  }

  // Direct join
  await db.query(`
    INSERT INTO guild_members (
      guild_id, user_id, role, join_date, contributions
    ) VALUES ($1, $2, 'Recruit', NOW(), $3)
  `, [
    guildId,
    userId,
    JSON.stringify({
      totalExperience: 0,
      winesShared: 0,
      eventsOrganized: 0,
      competitionsWon: 0,
    })
  ]);

  // Update guild activity
  await db.query('UPDATE guilds SET last_active = NOW() WHERE id = $1', [guildId]);

  return { 
    success: true, 
    data: { 
      status: 'Joined',
      role: 'Recruit',
      message: 'Successfully joined guild'
    }
  };
}

async function handleLeaveGuild(guildId: string, userId: string, userRole: string | null) {
  if (!userRole) {
    return { success: false, error: 'Not a member of this guild' };
  }

  if (userRole === 'Leader') {
    // Check if there are other officers to transfer leadership
    const officersQuery = await db.query(
      'SELECT COUNT(*) as count FROM guild_members WHERE guild_id = $1 AND role IN ($2, $3)',
      [guildId, 'Officer', 'Elder']
    );

    if (parseInt(officersQuery.rows[0].count) === 0) {
      return { 
        success: false, 
        error: 'Cannot leave as leader. Transfer leadership first or disband guild.' 
      };
    }

    // Auto-transfer leadership to senior officer
    const newLeaderQuery = await db.query(`
      SELECT user_id FROM guild_members 
      WHERE guild_id = $1 AND role = 'Officer'
      ORDER BY join_date ASC
      LIMIT 1
    `, [guildId]);

    if (newLeaderQuery.rows.length > 0) {
      await db.query(
        'UPDATE guild_members SET role = $1 WHERE guild_id = $2 AND user_id = $3',
        ['Leader', guildId, newLeaderQuery.rows[0].user_id]
      );
    }
  }

  // Remove from guild
  await db.query(
    'DELETE FROM guild_members WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );

  // Return any contributed wines from shared cellar
  await db.query(`
    UPDATE wines 
    SET status = 'Captured'
    WHERE id IN (
      SELECT wine_id FROM guild_shared_cellar_wines 
      WHERE guild_id = $1 AND contributed_by = $2
    )
  `, [guildId, userId]);

  await db.query(
    'DELETE FROM guild_shared_cellar_wines WHERE guild_id = $1 AND contributed_by = $2',
    [guildId, userId]
  );

  return { 
    success: true, 
    data: { 
      status: 'Left',
      message: 'Successfully left guild'
    }
  };
}

async function handleInviteMember(guildId: string, targetUserId: string, inviterUserId: string, guild: any, message?: string) {
  // Check if user exists and is not already a member
  const userCheck = await db.query(`
    SELECT u.username, gm.user_id as is_member
    FROM users u
    LEFT JOIN guild_members gm ON u.id = gm.user_id AND gm.guild_id = $2
    WHERE u.id = $1
  `, [targetUserId, guildId]);

  if (userCheck.rows.length === 0) {
    return { success: false, error: 'User not found' };
  }

  if (userCheck.rows[0].is_member) {
    return { success: false, error: 'User is already a member' };
  }

  // Create invitation
  await db.query(`
    INSERT INTO guild_invitations (
      guild_id, invited_user_id, inviter_id, message, invited_date, status
    ) VALUES ($1, $2, $3, $4, NOW(), 'Pending')
    ON CONFLICT (guild_id, invited_user_id) 
    DO UPDATE SET 
      inviter_id = $3, 
      message = $4, 
      invited_date = NOW(), 
      status = 'Pending'
  `, [guildId, targetUserId, inviterUserId, message || 'Join our guild!']);

  return { 
    success: true, 
    data: { 
      status: 'Invited',
      username: userCheck.rows[0].username,
      message: 'Invitation sent successfully'
    }
  };
}

async function handleKickMember(guildId: string, targetUserId: string, kickerUserId: string, kickerRole: string) {
  // Get target user's role
  const targetCheck = await db.query(
    'SELECT role, join_date FROM guild_members WHERE guild_id = $1 AND user_id = $2',
    [guildId, targetUserId]
  );

  if (targetCheck.rows.length === 0) {
    return { success: false, error: 'User is not a member' };
  }

  const targetRole = targetCheck.rows[0].role;

  // Check permissions (can't kick equal or higher rank)
  const roleHierarchy = { 'Recruit': 1, 'Member': 2, 'Elder': 3, 'Officer': 4, 'Leader': 5 };
  const kickerRank = roleHierarchy[kickerRole as keyof typeof roleHierarchy];
  const targetRank = roleHierarchy[targetRole as keyof typeof roleHierarchy];

  if (targetRank >= kickerRank) {
    return { success: false, error: 'Cannot kick member of equal or higher rank' };
  }

  if (targetRole === 'Leader') {
    return { success: false, error: 'Cannot kick guild leader' };
  }

  // Remove from guild (same as leave)
  return await handleLeaveGuild(guildId, targetUserId, targetRole);
}

async function handleRoleChange(guildId: string, targetUserId: string, newRole: string, changerUserId: string, changerRole: string, action: string) {
  const targetCheck = await db.query(
    'SELECT role FROM guild_members WHERE guild_id = $1 AND user_id = $2',
    [guildId, targetUserId]
  );

  if (targetCheck.rows.length === 0) {
    return { success: false, error: 'User is not a member' };
  }

  const currentRole = targetCheck.rows[0].role;
  const roleHierarchy = { 'Recruit': 1, 'Member': 2, 'Elder': 3, 'Officer': 4, 'Leader': 5 };
  const changerRank = roleHierarchy[changerRole as keyof typeof roleHierarchy];
  const currentRank = roleHierarchy[currentRole as keyof typeof roleHierarchy];
  const newRank = roleHierarchy[newRole as keyof typeof roleHierarchy];

  // Validate role change permissions
  if (currentRank >= changerRank || newRank >= changerRank) {
    return { success: false, error: 'Insufficient permissions for this role change' };
  }

  if (currentRole === 'Leader' || newRole === 'Leader') {
    return { success: false, error: 'Leadership transfers must use transfer-leadership action' };
  }

  await db.query(
    'UPDATE guild_members SET role = $1 WHERE guild_id = $2 AND user_id = $3',
    [newRole, guildId, targetUserId]
  );

  return { 
    success: true, 
    data: { 
      status: action === 'promote' ? 'Promoted' : 'Demoted',
      oldRole: currentRole,
      newRole,
      message: `Successfully ${action}d to ${newRole}`
    }
  };
}

async function handleTransferLeadership(guildId: string, newLeaderId: string, currentLeaderId: string) {
  const newLeaderCheck = await db.query(
    'SELECT role FROM guild_members WHERE guild_id = $1 AND user_id = $2',
    [guildId, newLeaderId]
  );

  if (newLeaderCheck.rows.length === 0) {
    return { success: false, error: 'User is not a member' };
  }

  if (newLeaderCheck.rows[0].role === 'Leader') {
    return { success: false, error: 'User is already the leader' };
  }

  await db.query('BEGIN');

  try {
    // Transfer leadership
    await db.query(
      'UPDATE guild_members SET role = $1 WHERE guild_id = $2 AND user_id = $3',
      ['Officer', guildId, currentLeaderId]
    );

    await db.query(
      'UPDATE guild_members SET role = $1 WHERE guild_id = $2 AND user_id = $3',
      ['Leader', guildId, newLeaderId]
    );

    await db.query('COMMIT');

  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }

  return { 
    success: true, 
    data: { 
      status: 'Leadership Transferred',
      newLeaderId,
      message: 'Leadership has been transferred successfully'
    }
  };
}