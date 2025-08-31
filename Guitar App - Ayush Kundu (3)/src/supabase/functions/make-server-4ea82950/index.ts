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