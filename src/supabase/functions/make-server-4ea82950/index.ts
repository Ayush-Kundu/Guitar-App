import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add logging
app.use('*', logger());

// Create Supabase client with enhanced error handling
const createSupabaseClient = () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables');
      return null;
    }
    
    return createClient(supabaseUrl, supabaseServiceRoleKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

const supabase = createSupabaseClient();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    supabaseAvailable: Boolean(supabase)
  });
});

// Enhanced error handler
const handleError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  return {
    error: `Internal server error during ${operation}`,
    details: error.message || 'Unknown error',
    timestamp: new Date().toISOString()
  };
};

// User signup endpoint
app.post('/signup', async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const { name, email, password, level, musicPreferences } = await c.req.json();
    
    console.log('Signup request received:', { name, email, level, musicPreferences: musicPreferences?.length });
    
    // Validate input
    if (!name || !email || !password || !level || !musicPreferences) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    if (!Array.isArray(musicPreferences) || musicPreferences.length !== 3) {
      return c.json({ error: 'Must select exactly 3 music preferences' }, 400);
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        level,
        musicPreferences 
      },
      email_confirm: true
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      
      if (authError.message?.includes('already registered')) {
        return c.json({ error: 'User already exists', code: 'user_exists' }, 409);
      }
      
      return c.json({ 
        error: 'Failed to create account', 
        details: authError.message 
      }, 400);
    }

    const now = new Date().toISOString();
    const userId = authData.user!.id;
    
    // Store profile info in the 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        user_id: userId,
        username: name,
        guitar_level: level,
        style_1: musicPreferences[0],
        style_2: musicPreferences[1],
        style_3: musicPreferences[2]
      }]);

    // Store user data in user_data table
    const userData = {
      user_id: userId,
      name,
      email,
      level,
      music_preferences: musicPreferences,
      practice_streak: 0,
      songs_mastered: 0,
      chords_learned: level === 'novice' ? 0 : level === 'beginner' ? 3 : 8,
      hours_this_week: 0,
      total_points: 0,
      weekly_points: 0,
      level_progress: 0,
      join_date: now,
      created_at: now,
      updated_at: now
    };

    const { error: userDataError } = await supabase
      .from('user_data')
      .insert([userData]);

    // Return user data in the format expected by frontend
    const responseUserData = {
      id: userId,
      name,
      email,
      level,
      musicPreferences,
      practiceStreak: 0,
      songsMastered: 0,
      chordsLearned: level === 'novice' ? 0 : level === 'beginner' ? 3 : 8,
      hoursThisWeek: 0,
      totalPoints: 0,
      weeklyPoints: 0,
      levelProgress: 0,
      joinDate: now,
      createdAt: now
    };

    return c.json({ 
      success: true, 
      user: responseUserData,
      authUser: { id: userId, email },
      profileSaved: !profileError,
      userDataSaved: !userDataError
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return c.json(handleError(error, 'signup'), 500);
  }
});

// User signin endpoint
app.post('/signin', async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    console.log('Signin request received for:', email);
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth signin error:', authError);
      return c.json({ 
        error: 'Invalid credentials', 
        details: authError.message 
      }, 401);
    }

    const userId = authData.user!.id;
    
    // Get user data from user_data table
    const { data: userData, error: userDataError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userDataError) {
      console.error('User data not found, trying profile recovery');
      
      // Try to get basic profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        return c.json({ 
          error: 'User data not found. Please contact support.' 
        }, 404);
      }

      // Create basic user data from profile
      const basicUserData = {
        id: userId,
        name: profileData.username,
        email: authData.user!.email,
        level: profileData.guitar_level,
        musicPreferences: [profileData.style_1, profileData.style_2, profileData.style_3],
        practiceStreak: 0,
        songsMastered: 0,
        chordsLearned: profileData.guitar_level === 'novice' ? 0 : 3,
        hoursThisWeek: 0,
        totalPoints: 0,
        weeklyPoints: 0,
        levelProgress: 0,
        joinDate: profileData.created_at || new Date().toISOString(),
        createdAt: profileData.created_at || new Date().toISOString()
      };

      return c.json({ 
        success: true, 
        user: basicUserData,
        accessToken: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
        recoveredFromProfile: true
      });
    }

    // Convert database format to frontend format
    const frontendUserData = {
      id: userData.user_id,
      name: userData.name,
      email: userData.email,
      level: userData.level,
      musicPreferences: userData.music_preferences || [],
      practiceStreak: userData.practice_streak || 0,
      songsMastered: userData.songs_mastered || 0,
      chordsLearned: userData.chords_learned || 0,
      hoursThisWeek: userData.hours_this_week || 0,
      totalPoints: userData.total_points || 0,
      weeklyPoints: userData.weekly_points || 0,
      levelProgress: userData.level_progress || 0,
      joinDate: userData.join_date || userData.created_at,
      createdAt: userData.created_at
    };

    return c.json({ 
      success: true, 
      user: frontendUserData,
      accessToken: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token
    });
    
  } catch (error) {
    console.error('Signin error:', error);
    return c.json(handleError(error, 'signin'), 500);
  }
});

// Demo login endpoint
app.post('/demo', async (c) => {
  try {
    const now = new Date().toISOString();
    const demoUser = {
      id: 'demo_' + Math.random().toString(36).substr(2, 9),
      name: 'Demo User',
      email: 'demo@example.com',
      level: 'beginner',
      musicPreferences: ['rock', 'pop', 'blues'],
      practiceStreak: 5,
      songsMastered: 3,
      chordsLearned: 8,
      hoursThisWeek: 2.5,
      totalPoints: 1250,
      weeklyPoints: 320,
      levelProgress: 65,
      joinDate: now,
      createdAt: now
    };
    
    return c.json({ 
      success: true, 
      user: demoUser,
      isDemo: true
    });
    
  } catch (error) {
    return c.json(handleError(error, 'demo login'), 500);
  }
});

function getClientIp(c: any): string {
  const xf = c.req.header('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 128);
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    'unknown'
  ).slice(0, 128);
}

/** Service-role purge of one Strummy user id (profiles, social, progress). */
async function purgeAllUserDataForId(admin: any, userId: string) {
  const uid = userId;
  const run = async (label: string, fn: () => Promise<any>) => {
    try {
      await fn();
    } catch (e) {
      console.warn(`[moderation] skip ${label}:`, e);
    }
  };
  await run('likes', () => admin.from('likes').delete().eq('user_id', uid));
  await run('posts', () => admin.from('posts').delete().eq('user_id', uid));
  await run('friend_messages', () =>
    admin.from('friend_messages').delete().or(`send_user.eq.${uid},receive_user.eq.${uid}`),
  );
  await run('messages', () =>
    admin.from('messages').delete().or(`sender_id.eq.${uid},receive_id.eq.${uid}`),
  );
  await run('friend_requests', () =>
    admin.from('friend_requests').delete().or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`),
  );
  await run('friendships', () =>
    admin.from('friendships').delete().or(`user_id_1.eq.${uid},user_id_2.eq.${uid}`),
  );
  await run('chats', () =>
    admin.from('chats').delete().or(`participant_1.eq.${uid},participant_2.eq.${uid}`),
  );
  await run('blocked_users', () =>
    admin.from('blocked_users').delete().or(`blocker_id.eq.${uid},blocked_id.eq.${uid}`),
  );
  await run('user_progress', () => admin.from('user_progress').delete().eq('user_id', uid));
  await run('user_data', () => admin.from('user_data').delete().eq('user_id', uid));
  await run('profiles', () => admin.from('profiles').delete().eq('user_id', uid));
}

// Protected route helper
const requireAuth = async (c: any, next: any) => {
  if (!supabase) {
    return c.json({ error: 'Service unavailable' }, 503);
  }

  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No access token provided' }, 401);
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  
  c.set('user', user);
  c.set('accessToken', accessToken);
  await next();
};

// Get user profile endpoint
app.get('/user/:userId', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = c.get('user');
    
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access' }, 403);
    }
    
    const { data: userData, error: userDataError } = await supabase!
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userDataError) {
      return c.json({ 
        error: 'User not found', 
        details: userDataError.message 
      }, 404);
    }

    const frontendUserData = {
      id: userData.user_id,
      name: userData.name,
      email: userData.email,
      level: userData.level,
      musicPreferences: userData.music_preferences || [],
      practiceStreak: userData.practice_streak || 0,
      songsMastered: userData.songs_mastered || 0,
      chordsLearned: userData.chords_learned || 0,
      hoursThisWeek: userData.hours_this_week || 0,
      totalPoints: userData.total_points || 0,
      weeklyPoints: userData.weekly_points || 0,
      levelProgress: userData.level_progress || 0,
      joinDate: userData.join_date || userData.created_at,
      createdAt: userData.created_at
    };
    
    return c.json({ user: frontendUserData });
    
  } catch (error) {
    return c.json(handleError(error, 'get user'), 500);
  }
});

// Update user profile endpoint
app.put('/user/:userId', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = c.get('user');
    const updates = await c.req.json();
    
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access' }, 403);
    }
    
    // Convert frontend format to database format
    const dbUpdates = {
      name: updates.name,
      email: updates.email,
      level: updates.level,
      music_preferences: updates.musicPreferences,
      practice_streak: updates.practiceStreak,
      songs_mastered: updates.songsMastered,
      chords_learned: updates.chordsLearned,
      hours_this_week: updates.hoursThisWeek,
      total_points: updates.totalPoints,
      weekly_points: updates.weeklyPoints,
      level_progress: updates.levelProgress,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
        delete dbUpdates[key as keyof typeof dbUpdates];
      }
    });

    const { data: updatedData, error: updateError } = await supabase!
      .from('user_data')
      .update(dbUpdates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError) {
      return c.json({ 
        error: 'Failed to update user data', 
        details: updateError.message 
      }, 400);
    }

    const frontendUserData = {
      id: updatedData.user_id,
      name: updatedData.name,
      email: updatedData.email,
      level: updatedData.level,
      musicPreferences: updatedData.music_preferences || [],
      practiceStreak: updatedData.practice_streak || 0,
      songsMastered: updatedData.songs_mastered || 0,
      chordsLearned: updatedData.chords_learned || 0,
      hoursThisWeek: updatedData.hours_this_week || 0,
      totalPoints: updatedData.total_points || 0,
      weeklyPoints: updatedData.weekly_points || 0,
      levelProgress: updatedData.level_progress || 0,
      joinDate: updatedData.join_date || updatedData.created_at,
      createdAt: updatedData.created_at
    };
    
    return c.json({ success: true, user: frontendUserData });
    
  } catch (error) {
    return c.json(handleError(error, 'update user'), 500);
  }
});

// Signout endpoint
app.post('/signout', requireAuth, async (c) => {
  try {
    const accessToken = c.get('accessToken');
    
    const { error } = await supabase!.auth.admin.signOut(accessToken);
    
    if (error) {
      console.error('Signout error:', error);
      return c.json({ 
        error: 'Failed to sign out', 
        details: error.message 
      }, 400);
    }
    
    return c.json({ success: true });
    
  } catch (error) {
    return c.json(handleError(error, 'signout'), 500);
  }
});

// ========== FRIENDS API ENDPOINTS ==========

// Send friend request
app.post('/friends/request', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const { toUserId } = await c.req.json();
    
    if (!toUserId) {
      return c.json({ error: 'toUserId is required' }, 400);
    }
    
    if (toUserId === user.id) {
      return c.json({ error: 'Cannot send friend request to yourself' }, 400);
    }

    // Check if users are already friends
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${toUserId}),and(user_id_1.eq.${toUserId},user_id_2.eq.${user.id})`)
      .maybeSingle();

    if (existingFriendship) {
      return c.json({ error: 'Already friends with this user' }, 400);
    }

    // Check if there's a pending request
    const { data: pendingRequest } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('from_user_id', user.id)
      .eq('to_user_id', toUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (pendingRequest) {
      return c.json({ error: 'Friend request already sent' }, 400);
    }

    // Check if user is blocked
    const { data: blocked } = await supabase
      .from('blocked_users')
      .select('*')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${toUserId}),and(blocker_id.eq.${toUserId},blocked_id.eq.${user.id})`)
      .maybeSingle();

    if (blocked) {
      return c.json({ error: 'Cannot send request to blocked user' }, 403);
    }

    // Create friend request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating friend request:', requestError);
      return c.json({ error: 'Failed to send friend request', details: requestError.message }, 500);
    }

    return c.json({ success: true, request }, 201);
  } catch (error) {
    return c.json(handleError(error, 'send friend request'), 500);
  }
});

// Accept friend request
app.post('/friends/accept/:requestId', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const requestId = c.req.param('requestId');
    
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('to_user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (requestError || !request) {
      return c.json({ error: 'Friend request not found' }, 404);
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      return c.json({ error: 'Failed to accept request', details: updateError.message }, 500);
    }

    // Create friendship (ensure user_id_1 < user_id_2 for consistency)
    const userId1 = user.id < request.from_user_id ? user.id : request.from_user_id;
    const userId2 = user.id < request.from_user_id ? request.from_user_id : user.id;

    const { data: friendship, error: friendshipError } = await supabase
      .from('friendships')
      .insert({
        user_id_1: userId1,
        user_id_2: userId2,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (friendshipError) {
      console.error('Error creating friendship:', friendshipError);
      // Try to rollback request status
      await supabase
        .from('friend_requests')
        .update({ status: 'pending' })
        .eq('id', requestId);
      return c.json({ error: 'Failed to create friendship', details: friendshipError.message }, 500);
    }

    return c.json({ success: true, friendship }, 200);
  } catch (error) {
    return c.json(handleError(error, 'accept friend request'), 500);
  }
});

// Decline friend request
app.post('/friends/decline/:requestId', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const requestId = c.req.param('requestId');
    
    const { error } = await supabase
      .from('friend_requests')
      .update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('to_user_id', user.id);

    if (error) {
      return c.json({ error: 'Failed to decline request', details: error.message }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json(handleError(error, 'decline friend request'), 500);
  }
});

// Cancel sent friend request
app.post('/friends/cancel/:requestId', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const requestId = c.req.param('requestId');
    
    const { error } = await supabase
      .from('friend_requests')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('from_user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      return c.json({ error: 'Failed to cancel request', details: error.message }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json(handleError(error, 'cancel friend request'), 500);
  }
});

// Get user's friends
app.get('/friends', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

    if (error) {
      return c.json({ error: 'Failed to fetch friends', details: error.message }, 500);
    }

    // Extract friend IDs
    const friendIds = (friendships || []).map(f => 
      f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
    );

    // Get friend profiles
    if (friendIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, guitar_level')
        .in('user_id', friendIds);

      if (profileError) {
        return c.json({ error: 'Failed to fetch friend profiles', details: profileError.message }, 500);
      }

      return c.json({ friends: friendIds, profiles: profiles || [] }, 200);
    }

    return c.json({ friends: [], profiles: [] }, 200);
  } catch (error) {
    return c.json(handleError(error, 'get friends'), 500);
  }
});

// Get friend requests (sent and received)
app.get('/friends/requests', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: 'Failed to fetch requests', details: error.message }, 500);
    }

    const received = (requests || []).filter(r => r.to_user_id === user.id);
    const sent = (requests || []).filter(r => r.from_user_id === user.id);

    return c.json({ received, sent }, 200);
  } catch (error) {
    return c.json(handleError(error, 'get friend requests'), 500);
  }
});

// Remove friend
app.delete('/friends/:friendId', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const friendId = c.req.param('friendId');
    
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${friendId}),and(user_id_1.eq.${friendId},user_id_2.eq.${user.id})`);

    if (error) {
      return c.json({ error: 'Failed to remove friend', details: error.message }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json(handleError(error, 'remove friend'), 500);
  }
});

// Block user
app.post('/friends/block/:userId', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const userIdToBlock = c.req.param('userId');
    
    if (userIdToBlock === user.id) {
      return c.json({ error: 'Cannot block yourself' }, 400);
    }

    // Remove friendship if exists
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${userIdToBlock}),and(user_id_1.eq.${userIdToBlock},user_id_2.eq.${user.id})`);

    // Cancel any pending requests
    await supabase
      .from('friend_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${userIdToBlock}),and(from_user_id.eq.${userIdToBlock},to_user_id.eq.${user.id})`)
      .eq('status', 'pending');

    // Create block
    const { data: block, error: blockError } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: user.id,
        blocked_id: userIdToBlock,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (blockError) {
      // Check if already blocked
      if (blockError.code === '23505') { // Unique violation
        return c.json({ error: 'User already blocked' }, 400);
      }
      return c.json({ error: 'Failed to block user', details: blockError.message }, 500);
    }

    return c.json({ success: true, block }, 200);
  } catch (error) {
    return c.json(handleError(error, 'block user'), 500);
  }
});

// Unblock user
app.post('/friends/unblock/:userId', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    const userIdToUnblock = c.req.param('userId');
    
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userIdToUnblock);

    if (error) {
      return c.json({ error: 'Failed to unblock user', details: error.message }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json(handleError(error, 'unblock user'), 500);
  }
});

// Get blocked users
app.get('/friends/blocked', requireAuth, async (c) => {
  if (!supabase) {
    return c.json({ error: 'Service temporarily unavailable' }, 503);
  }

  try {
    const user = c.get('user');
    
    const { data: blocked, error } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', user.id);

    if (error) {
      return c.json({ error: 'Failed to fetch blocked users', details: error.message }, 500);
    }

    const blockedIds = (blocked || []).map(b => b.blocked_id);

    // Get profiles of blocked users
    if (blockedIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, guitar_level')
        .in('user_id', blockedIds);

      return c.json({ blocked: blockedIds, profiles: profiles || [] }, 200);
    }

    return c.json({ blocked: [], profiles: [] }, 200);
  } catch (error) {
    return c.json(handleError(error, 'get blocked users'), 500);
  }
});

// --- Content moderation: IP / device bans + full purge (requires SQL in supabase_moderation_setup.sql) ---

app.get('/moderation/ip-ban-status', async (c) => {
  if (!supabase) return c.json({ banned: false }, 200);
  try {
    const ip = getClientIp(c);
    const deviceId = (c.req.query('deviceId') || '').toString().slice(0, 128);
    if (deviceId) {
      const { data: dev } = await supabase
        .from('banned_devices')
        .select('id')
        .eq('device_id', deviceId)
        .maybeSingle();
      if (dev) return c.json({ banned: true, reason: 'device' }, 200);
    }
    if (ip && ip !== 'unknown') {
      const { data: row } = await supabase
        .from('banned_ips')
        .select('id')
        .eq('ip_raw', ip)
        .maybeSingle();
      if (row) return c.json({ banned: true, reason: 'ip' }, 200);
    }
    return c.json({ banned: false }, 200);
  } catch (e) {
    console.warn('[moderation] ip-ban-status:', e);
    return c.json({ banned: false }, 200);
  }
});

app.post('/moderation/enforce-violation', requireAuth, async (c) => {
  if (!supabase) return c.json({ error: 'Service unavailable' }, 503);
  try {
    const authUser = c.get('user');
    const ip = getClientIp(c);
    let deviceId = '';
    try {
      const body = await c.req.json();
      if (body && typeof body.deviceId === 'string') deviceId = body.deviceId.slice(0, 128);
    } catch {
      /* no body */
    }

    const ids = new Set<string>();
    ids.add(authUser.id);
    if (authUser.email) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', String(authUser.email).toLowerCase());
      for (const p of profs || []) {
        if (p?.user_id) ids.add(p.user_id);
      }
    }

    for (const id of ids) {
      await purgeAllUserDataForId(supabase, id);
    }

    try {
      await supabase.from('banned_ips').insert({
        ip_raw: ip,
        reason: 'content_moderation',
      });
    } catch {
      /* duplicate IP etc. */
    }
    if (deviceId) {
      try {
        await supabase.from('banned_devices').insert({
          device_id: deviceId,
          reason: 'content_moderation',
        });
      } catch {
        /* duplicate */
      }
    }

    try {
      await supabase.auth.admin.deleteUser(authUser.id);
    } catch (e) {
      console.warn('[moderation] admin.deleteUser:', e);
    }

    return c.json({ ok: true }, 200);
  } catch (error) {
    return c.json(handleError(error, 'moderation enforce'), 500);
  }
});

// Catch-all for unmatched routes
app.all('*', (c) => {
  return c.json({ 
    error: 'Route not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// Error handling middleware
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

export default {
  fetch: app.fetch
};