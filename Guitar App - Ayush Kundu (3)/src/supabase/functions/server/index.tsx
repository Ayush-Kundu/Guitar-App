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
app.use('*', logger(console.log));

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize user_data table on startup
const initializeUserDataTable = async () => {
  try {
    // Check if user_data table exists by attempting to select from it
    const { error } = await supabase
      .from('user_data')
      .select('id')
      .limit(1);
    
    console.log('User data table check completed');
  } catch (error) {
    console.log('User data table initialization check:', error);
  }
};

// Initialize on startup
initializeUserDataTable();

// Health check
app.get('/make-server-4ea82950/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User signup endpoint
app.post('/make-server-4ea82950/signup', async (c) => {
  try {
    const { name, email, password, level, musicPreferences } = await c.req.json();
    
    console.log('Signup request received:', { name, email, level, musicPreferences });
    
    // Validate required fields
    if (!name || !email || !password || !level) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate musicPreferences array has exactly 3 items
    if (!musicPreferences || musicPreferences.length !== 3) {
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
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      
      // Handle the case where user already exists
      if (authError.message.includes('already been registered') || 
          (authError as any).code === 'email_exists') {
        console.log('User already exists, suggesting signin instead');
        return c.json({ 
          error: 'An account with this email already exists. Please sign in instead.',
          code: 'user_exists',
          suggestion: 'signin'
        }, 409);
      }
      
      return c.json({ error: 'Failed to create auth user', details: authError.message }, 400);
    }

    console.log('Auth user created successfully:', authData.user?.id);

    const now = new Date().toISOString();
    const userId = authData.user!.id;
    
    // Step 2: Store profile info in the 'profiles' table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: userId,
          username: name,
          guitar_level: level,
          style_1: musicPreferences[0],
          style_2: musicPreferences[1],
          style_3: musicPreferences[2]
        }
      ]);

    if (profileError) {
      console.error('Profile insert error:', profileError);
      // Don't fail the signup if profile insert fails - we can retry later
      console.log('Continuing with signup despite profile error');
    } else {
      console.log('Profile saved successfully:', profileData);
    }

    // Step 3: Store user data in user_data table (replaces KV store)
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

    const { data: userDataResult, error: userDataError } = await supabase
      .from('user_data')
      .insert([userData])
      .select()
      .single();

    if (userDataError) {
      console.error('User data insert error:', userDataError);
      // Try to create a simple record without full data
      const simpleUserData = {
        user_id: userId,
        name,
        email,
        level,
        created_at: now,
        updated_at: now
      };
      
      const { error: simpleError } = await supabase
        .from('user_data')
        .insert([simpleUserData]);
        
      if (simpleError) {
        console.error('Simple user data insert also failed:', simpleError);
      }
    } else {
      console.log('User data stored successfully:', userDataResult);
    }

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
      authUser: {
        id: authData.user!.id,
        email: authData.user!.email
      },
      profileSaved: !profileError,
      userDataSaved: !userDataError
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup', details: error.message }, 500);
  }
});

// User signin endpoint
app.post('/make-server-4ea82950/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('Signin request received:', { email });
    
    // Create a client with anon key for authentication (fallback to service role if not available)
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      anonKey
    );

    // Sign in with Supabase Auth using anon client
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth signin error:', authError);
      return c.json({ error: 'Invalid credentials', details: authError.message }, 401);
    }

    console.log('Auth signin successful:', authData.user?.id);

    const userId = authData.user!.id;
    
    // Get user data from user_data table (replaces KV store lookup)
    const { data: userData, error: userDataError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userDataError) {
      console.error('User data not found:', userDataError);
      
      // Try to get basic profile data and create minimal user data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile also not found:', profileError);
        
        // Try to create user data from auth user metadata as fallback
        console.log('User data not found in database, creating from auth metadata');
        
        const authUser = authData.user!;
        const now = new Date().toISOString();
        
        const newUserData = {
          id: userId,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email!,
          level: authUser.user_metadata?.level || 'beginner',
          musicPreferences: authUser.user_metadata?.musicPreferences || ['rock', 'pop', 'blues'],
          practiceStreak: 0,
          songsMastered: 0,
          chordsLearned: authUser.user_metadata?.level === 'novice' ? 0 : authUser.user_metadata?.level === 'beginner' ? 3 : 8,
          hoursThisWeek: 0,
          totalPoints: 0,
          weeklyPoints: 0,
          levelProgress: 0,
          joinDate: authUser.created_at || now,
          createdAt: authUser.created_at || now
        };
        
        return c.json({ 
          success: true, 
          user: newUserData,
          accessToken: authData.session?.access_token,
          refreshToken: authData.session?.refresh_token,
          recoveredFromAuth: true
        });
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
        chordsLearned: profileData.guitar_level === 'novice' ? 0 : profileData.guitar_level === 'beginner' ? 3 : 8,
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
      musicPreferences: userData.music_preferences || [userData.style_1, userData.style_2, userData.style_3],
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
    return c.json({ error: 'Internal server error during signin', details: error.message }, 500);
  }
});

// Get user profile endpoint
app.get('/make-server-4ea82950/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }
    
    // Verify user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get user data from user_data table (replaces KV store)
    const { data: userData, error: userDataError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userDataError) {
      console.error('User data fetch error:', userDataError);
      return c.json({ error: 'User not found', details: userDataError.message }, 404);
    }

    // Convert to frontend format
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
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Update user profile endpoint
app.put('/make-server-4ea82950/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const updates = await c.req.json();
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }
    
    // Verify user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
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
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });

    // Update user data in database (replaces KV store)
    const { data: updatedData, error: updateError } = await supabase
      .from('user_data')
      .update(dbUpdates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('User data update error:', updateError);
      return c.json({ error: 'Failed to update user data', details: updateError.message }, 400);
    }

    // Convert back to frontend format
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
    console.error('Update user error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Demo login endpoint
app.post('/make-server-4ea82950/demo', async (c) => {
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
    console.error('Demo login error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Signout endpoint
app.post('/make-server-4ea82950/signout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }
    
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.admin.signOut(accessToken);
    
    if (error) {
      console.error('Signout error:', error);
      return c.json({ error: 'Failed to sign out', details: error.message }, 400);
    }
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error('Signout error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

Deno.serve(app.fetch);