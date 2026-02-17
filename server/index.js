const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage directories
const dataDir = path.join(__dirname, 'data');
const postsDir = path.join(__dirname, 'posts');
const sessionsDir = path.join(dataDir, 'sessions');
const progressDir = path.join(dataDir, 'progress');
const activitiesDir = path.join(dataDir, 'activities');
const achievementsDir = path.join(dataDir, 'achievements');
const competitionsDir = path.join(dataDir, 'competitions');
const usersDir = path.join(dataDir, 'users');
const friendsDir = path.join(dataDir, 'friends');
const chatsDir = path.join(dataDir, 'chats');
const leaguesDir = path.join(dataDir, 'leagues');
const challengesDir = path.join(dataDir, 'challenges');

// Ensure all directories exist
[dataDir, postsDir, sessionsDir, progressDir, activitiesDir, achievementsDir, competitionsDir, usersDir, friendsDir, chatsDir, leaguesDir, challengesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// In-memory cache for online users
let onlineUsers = new Map(); // Map<userId, { lastSeen, socketId }>

// Generate unique ID
const generateId = (prefix = '') => `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Helper function to get user data directory
const getUserDataDir = (userId) => {
  const userDir = path.join(dataDir, 'users', userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

// ========== COMMUNITY POSTS API ==========
let posts = [];

// Load existing posts from files
const loadPosts = () => {
  try {
    const files = fs.readdirSync(postsDir);
    posts = files
      .filter(file => file.endsWith('.json'))
      .map(file => readJsonFile(path.join(postsDir, file)))
      .filter(post => post !== null);
  } catch (error) {
    console.error('Error loading posts:', error);
    posts = [];
  }
};

loadPosts();

// POST endpoint to create a new post
app.post('/api/posts', (req, res) => {
  try {
    const { userId, userName, username, userLevel, userAvatar, content, timestamp, likes, comments, shares, hasLiked, type } = req.body;
    
    if (!userId || !userName || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, userName, and content are required' 
      });
    }

    const newPost = {
      id: Date.now().toString(),
      userId,
      userName,
      username: username || userName.toLowerCase().replace(/\s+/g, '_'),
      userLevel: userLevel || 'beginner',
      avatar: userAvatar || '🎸',
      content,
      timestamp: timestamp || new Date().toISOString(),
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      hasLiked: hasLiked || false,
      type: type || 'post',
      likedBy: []
    };

    posts.push(newPost);
    const postFile = path.join(postsDir, `post_${newPost.id}.json`);
    writeJsonFile(postFile, newPost);

    console.log('New post created:', {
      id: newPost.id,
      user: userName,
      content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to retrieve all posts
app.get('/api/posts', (req, res) => {
  try {
    loadPosts(); // Reload to get latest
    res.json({
      success: true,
      posts: posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      count: posts.length
    });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PUT endpoint to like/unlike a post
app.put('/api/posts/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likedBy = post.likedBy || [];
    const hasLiked = likedBy.includes(userId);
    
    if (hasLiked) {
      post.likedBy = likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
      post.hasLiked = false;
    } else {
      post.likedBy = [...likedBy, userId];
      post.likes = (post.likes || 0) + 1;
      post.hasLiked = true;
    }

    const postFile = path.join(postsDir, `post_${post.id}.json`);
    writeJsonFile(postFile, post);

    res.json({
      success: true,
      post: post
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== PRACTICE SESSIONS API ==========

// POST endpoint to create a practice session
app.post('/api/sessions', (req, res) => {
  try {
    const { userId, activityType, activityName, duration, difficulty, progress, notes } = req.body;
    
    if (!userId || !activityType || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, activityType, and duration are required' 
      });
    }

    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      activityType, // 'practice', 'song', 'technique', 'theory', 'study'
      activityName: activityName || 'Practice Session',
      duration: parseFloat(duration), // in minutes
      difficulty: difficulty || 1,
      progress: progress || 0, // 0-100
      notes: notes || '',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    const userDir = getUserDataDir(userId);
    const sessionsFile = path.join(userDir, 'sessions.json');
    const sessions = readJsonFile(sessionsFile) || [];
    sessions.push(session);
    writeJsonFile(sessionsFile, sessions);

    // Also save individual session file
    const sessionFile = path.join(sessionsDir, `${session.id}.json`);
    writeJsonFile(sessionFile, session);

    console.log('Practice session created:', {
      id: session.id,
      userId,
      activityType,
      duration: session.duration
    });

    res.status(201).json({
      success: true,
      session: session
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to retrieve user's practice sessions
app.get('/api/sessions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, activityType, limit } = req.query;
    
    const userDir = getUserDataDir(userId);
    const sessionsFile = path.join(userDir, 'sessions.json');
    let sessions = readJsonFile(sessionsFile) || [];

    // Filter by date range
    if (startDate) {
      sessions = sessions.filter(s => s.date >= startDate);
    }
    if (endDate) {
      sessions = sessions.filter(s => s.date <= endDate);
    }

    // Filter by activity type
    if (activityType) {
      sessions = sessions.filter(s => s.activityType === activityType);
    }

    // Sort by timestamp (newest first)
    sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply limit
    if (limit) {
      sessions = sessions.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      sessions: sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('Error retrieving sessions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to get session statistics
app.get('/api/sessions/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query; // 'week', 'month', 'all'
    
    const userDir = getUserDataDir(userId);
    const sessionsFile = path.join(userDir, 'sessions.json');
    let sessions = readJsonFile(sessionsFile) || [];

    const now = new Date();
    let cutoffDate;

    if (period === 'week') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      cutoffDate = new Date(0); // All time
    }

    sessions = sessions.filter(s => new Date(s.timestamp) >= cutoffDate);

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      totalHours: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
      averageDuration: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
        : 0,
      byActivityType: {},
      byDay: {}
    };

    sessions.forEach(session => {
      // Count by activity type
      stats.byActivityType[session.activityType] = 
        (stats.byActivityType[session.activityType] || 0) + 1;

      // Count by day
      const day = session.date;
      stats.byDay[day] = (stats.byDay[day] || 0) + (session.duration || 0);
    });

    res.json({
      success: true,
      stats: stats,
      period: period
    });

  } catch (error) {
    console.error('Error retrieving session stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== PROGRESS TRACKING API ==========

// POST endpoint to update song progress
app.post('/api/progress/song', (req, res) => {
  try {
    const { userId, songId, songTitle, artist, progress, status, lastPracticed } = req.body;
    
    if (!userId || !songId || progress === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, songId, and progress are required' 
      });
    }

    const userDir = getUserDataDir(userId);
    const progressFile = path.join(userDir, 'song-progress.json');
    let songProgress = readJsonFile(progressFile) || {};

    songProgress[songId] = {
      songId,
      songTitle: songTitle || songId,
      artist: artist || '',
      progress: Math.min(100, Math.max(0, parseFloat(progress))),
      status: status || (progress >= 100 ? 'mastered' : 'in-progress'),
      lastPracticed: lastPracticed || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    writeJsonFile(progressFile, songProgress);

    res.json({
      success: true,
      progress: songProgress[songId]
    });

  } catch (error) {
    console.error('Error updating song progress:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to get song progress
app.get('/api/progress/song/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userDir = getUserDataDir(userId);
    const progressFile = path.join(userDir, 'song-progress.json');
    const songProgress = readJsonFile(progressFile) || {};

    res.json({
      success: true,
      progress: songProgress
    });

  } catch (error) {
    console.error('Error retrieving song progress:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST endpoint to update technique progress
app.post('/api/progress/technique', (req, res) => {
  try {
    const { userId, techniqueId, techniqueName, category, progress, status, lastPracticed } = req.body;
    
    if (!userId || !techniqueId || progress === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, techniqueId, and progress are required' 
      });
    }

    const userDir = getUserDataDir(userId);
    const progressFile = path.join(userDir, 'technique-progress.json');
    let techniqueProgress = readJsonFile(progressFile) || {};

    techniqueProgress[techniqueId] = {
      techniqueId,
      techniqueName: techniqueName || techniqueId,
      category: category || '',
      progress: Math.min(100, Math.max(0, parseFloat(progress))),
      status: status || (progress >= 100 ? 'mastered' : 'in-progress'),
      lastPracticed: lastPracticed || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    writeJsonFile(progressFile, techniqueProgress);

    res.json({
      success: true,
      progress: techniqueProgress[techniqueId]
    });

  } catch (error) {
    console.error('Error updating technique progress:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to get technique progress
app.get('/api/progress/technique/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userDir = getUserDataDir(userId);
    const progressFile = path.join(userDir, 'technique-progress.json');
    const techniqueProgress = readJsonFile(progressFile) || {};

    res.json({
      success: true,
      progress: techniqueProgress
    });

  } catch (error) {
    console.error('Error retrieving technique progress:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST endpoint to update theory progress
app.post('/api/progress/theory', (req, res) => {
  try {
    const { userId, theoryId, theoryName, category, progress, status, lastStudied } = req.body;
    
    if (!userId || !theoryId || progress === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, theoryId, and progress are required' 
      });
    }

    const userDir = getUserDataDir(userId);
    const progressFile = path.join(userDir, 'theory-progress.json');
    let theoryProgress = readJsonFile(progressFile) || {};

    theoryProgress[theoryId] = {
      theoryId,
      theoryName: theoryName || theoryId,
      category: category || '',
      progress: Math.min(100, Math.max(0, parseFloat(progress))),
      status: status || (progress >= 100 ? 'completed' : 'in-progress'),
      lastStudied: lastStudied || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    writeJsonFile(progressFile, theoryProgress);

    res.json({
      success: true,
      progress: theoryProgress[theoryId]
    });

  } catch (error) {
    console.error('Error updating theory progress:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to get theory progress
app.get('/api/progress/theory/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userDir = getUserDataDir(userId);
    const progressFile = path.join(userDir, 'theory-progress.json');
    const theoryProgress = readJsonFile(progressFile) || {};

    res.json({
      success: true,
      progress: theoryProgress
    });

  } catch (error) {
    console.error('Error retrieving theory progress:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== ACTIVITIES/TIMELINE API ==========

// POST endpoint to create an activity
app.post('/api/activities', (req, res) => {
  try {
    const { userId, type, title, description, icon, color, metadata } = req.body;
    
    if (!userId || !type || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, type, and title are required' 
      });
    }

    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type, // 'practice', 'goal', 'achievement', 'lesson', 'milestone', 'performance'
      title,
      description: description || '',
      icon: icon || '🎸',
      color: color || 'bg-orange-100',
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    const userDir = getUserDataDir(userId);
    const activitiesFile = path.join(userDir, 'activities.json');
    const activities = readJsonFile(activitiesFile) || [];
    activities.push(activity);
    writeJsonFile(activitiesFile, activities);

    // Also save individual activity file
    const activityFile = path.join(activitiesDir, `${activity.id}.json`);
    writeJsonFile(activityFile, activity);

    res.status(201).json({
      success: true,
      activity: activity
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to retrieve user's activities
app.get('/api/activities/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, type } = req.query;
    
    const userDir = getUserDataDir(userId);
    const activitiesFile = path.join(userDir, 'activities.json');
    let activities = readJsonFile(activitiesFile) || [];

    // Filter by type if provided
    if (type) {
      activities = activities.filter(a => a.type === type);
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply limit
    activities = activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      activities: activities,
      count: activities.length
    });

  } catch (error) {
    console.error('Error retrieving activities:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== ACHIEVEMENTS API ==========

// POST endpoint to unlock an achievement
app.post('/api/achievements', (req, res) => {
  try {
    const { userId, achievementId, title, description, icon, category } = req.body;
    
    if (!userId || !achievementId || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, achievementId, and title are required' 
      });
    }

    const userDir = getUserDataDir(userId);
    const achievementsFile = path.join(userDir, 'achievements.json');
    const achievements = readJsonFile(achievementsFile) || [];

    // Check if achievement already exists
    const existing = achievements.find(a => a.achievementId === achievementId);
    if (existing) {
      return res.json({
        success: true,
        achievement: existing,
        message: 'Achievement already unlocked'
      });
    }

    const achievement = {
      achievementId,
      title,
      description: description || '',
      icon: icon || '⭐',
      category: category || 'general',
      unlockedAt: new Date().toISOString()
    };

    achievements.push(achievement);
    writeJsonFile(achievementsFile, achievements);

    res.status(201).json({
      success: true,
      achievement: achievement
    });

  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to get user's achievements
app.get('/api/achievements/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userDir = getUserDataDir(userId);
    const achievementsFile = path.join(userDir, 'achievements.json');
    const achievements = readJsonFile(achievementsFile) || [];

    res.json({
      success: true,
      achievements: achievements
    });

  } catch (error) {
    console.error('Error retrieving achievements:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== POINTS ACTIVITIES API ==========

// POST endpoint to record points activity
app.post('/api/points', (req, res) => {
  try {
    const { userId, type, points, description, difficulty, timestamp } = req.body;
    
    if (!userId || !type || points === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, type, and points are required' 
      });
    }

    const pointsActivity = {
      id: `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type, // 'practice', 'song_completed', 'chord_learned', etc.
      points: parseFloat(points),
      description: description || '',
      difficulty: difficulty || 1,
      timestamp: timestamp || new Date().toISOString()
    };

    const userDir = getUserDataDir(userId);
    const pointsFile = path.join(userDir, 'points-activities.json');
    const pointsActivities = readJsonFile(pointsFile) || [];
    pointsActivities.push(pointsActivity);
    writeJsonFile(pointsFile, pointsActivities);

    res.status(201).json({
      success: true,
      pointsActivity: pointsActivity
    });

  } catch (error) {
    console.error('Error recording points:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint to get user's points activities
app.get('/api/points/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, type } = req.query;
    
    const userDir = getUserDataDir(userId);
    const pointsFile = path.join(userDir, 'points-activities.json');
    let pointsActivities = readJsonFile(pointsFile) || [];

    // Filter by type if provided
    if (type) {
      pointsActivities = pointsActivities.filter(p => p.type === type);
    }

    // Sort by timestamp (newest first)
    pointsActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply limit
    pointsActivities = pointsActivities.slice(0, parseInt(limit));

    const totalPoints = pointsActivities.reduce((sum, p) => sum + p.points, 0);

    res.json({
      success: true,
      pointsActivities: pointsActivities,
      totalPoints: totalPoints,
      count: pointsActivities.length
    });

  } catch (error) {
    console.error('Error retrieving points:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== COMPETITION/LEADERBOARD API ==========

// POST endpoint to record competition result
app.post('/api/competitions', (req, res) => {
  try {
    const { userId, competitionId, competitionName, score, rank, pointsEarned, timestamp } = req.body;
    
    if (!userId || !competitionId || score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, competitionId, and score are required' 
      });
    }

    const result = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      competitionId,
      competitionName: competitionName || 'Competition',
      score: parseFloat(score),
      rank: rank || null,
      pointsEarned: pointsEarned || 0,
      timestamp: timestamp || new Date().toISOString()
    };

    const userDir = getUserDataDir(userId);
    const competitionsFile = path.join(userDir, 'competitions.json');
    const competitions = readJsonFile(competitionsFile) || [];
    competitions.push(result);
    writeJsonFile(competitionsFile, competitions);

    res.status(201).json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Error recording competition:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== USER STATISTICS API ==========

// GET endpoint to get comprehensive user statistics
app.get('/api/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userDir = getUserDataDir(userId);

    // Load all user data
    const sessions = readJsonFile(path.join(userDir, 'sessions.json')) || [];
    const songProgress = readJsonFile(path.join(userDir, 'song-progress.json')) || {};
    const techniqueProgress = readJsonFile(path.join(userDir, 'technique-progress.json')) || {};
    const theoryProgress = readJsonFile(path.join(userDir, 'theory-progress.json')) || {};
    const pointsActivities = readJsonFile(path.join(userDir, 'points-activities.json')) || [];
    const achievements = readJsonFile(path.join(userDir, 'achievements.json')) || [];

    // Calculate statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklySessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const monthlySessions = sessions.filter(s => new Date(s.timestamp) >= monthAgo);

    const stats = {
      totalPoints: pointsActivities.reduce((sum, p) => sum + p.points, 0),
      weeklyPoints: pointsActivities
        .filter(p => new Date(p.timestamp) >= weekAgo)
        .reduce((sum, p) => sum + p.points, 0),
      totalSessions: sessions.length,
      weeklySessions: weeklySessions.length,
      monthlySessions: monthlySessions.length,
      totalPracticeMinutes: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      weeklyPracticeMinutes: weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      songsMastered: Object.values(songProgress).filter(p => p.status === 'mastered').length,
      songsInProgress: Object.values(songProgress).filter(p => p.status === 'in-progress').length,
      techniquesMastered: Object.values(techniqueProgress).filter(p => p.status === 'mastered').length,
      techniquesInProgress: Object.values(techniqueProgress).filter(p => p.status === 'in-progress').length,
      theoryCompleted: Object.values(theoryProgress).filter(p => p.status === 'completed').length,
      theoryInProgress: Object.values(theoryProgress).filter(p => p.status === 'in-progress').length,
      achievementsUnlocked: achievements.length,
      currentStreak: 0, // Would need to calculate from sessions
      longestStreak: 0 // Would need to calculate from sessions
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ========== USERS API ==========

// Initialize default users database
const usersDbFile = path.join(dataDir, 'users-db.json');
const initUsersDb = () => {
  if (!fs.existsSync(usersDbFile)) {
    const defaultUsers = [
      { id: 'user_1', name: 'Strummy2024', username: 'strummy2024', email: 'strummy@example.com', level: 'expert', totalPoints: 18450, weeklyPoints: 850, streak: 45, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_2', name: 'StrumQueen', username: 'strumqueen', email: 'queen@example.com', level: 'advanced', totalPoints: 14200, weeklyPoints: 720, streak: 38, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_3', name: 'ChordWizard', username: 'chordwizard', email: 'wizard@example.com', level: 'proficient', totalPoints: 11800, weeklyPoints: 590, streak: 32, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_4', name: 'PickMaster', username: 'pickmaster', email: 'pick@example.com', level: 'intermediate', totalPoints: 3100, weeklyPoints: 180, streak: 18, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_5', name: 'SixStringHero', username: 'sixstringhero', email: 'hero@example.com', level: 'elementary', totalPoints: 2850, weeklyPoints: 165, streak: 22, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_6', name: 'GuitarNinja', username: 'guitarninja', email: 'ninja@example.com', level: 'advanced', totalPoints: 9500, weeklyPoints: 420, streak: 28, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_7', name: 'MelodyMaker', username: 'melodymaker', email: 'melody@example.com', level: 'proficient', totalPoints: 7200, weeklyPoints: 350, streak: 15, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
      { id: 'user_8', name: 'RiffRider', username: 'riffrider', email: 'riff@example.com', level: 'intermediate', totalPoints: 4800, weeklyPoints: 280, streak: 12, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&auto=format', createdAt: new Date().toISOString() },
    ];
    writeJsonFile(usersDbFile, defaultUsers);
    return defaultUsers;
  }
  return readJsonFile(usersDbFile) || [];
};

let usersDb = initUsersDb();

// POST - Register/create user
app.post('/api/users', (req, res) => {
  try {
    const { name, username, email, avatar, level } = req.body;
    
    if (!name || !username) {
      return res.status(400).json({ error: 'name and username are required' });
    }

    // Check if username exists
    if (usersDb.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
      id: generateId('user_'),
      name,
      username: username.toLowerCase(),
      email: email || '',
      avatar: avatar || '',
      level: level || 'beginner',
      totalPoints: 0,
      weeklyPoints: 0,
      streak: 0,
      createdAt: new Date().toISOString()
    };

    usersDb.push(newUser);
    writeJsonFile(usersDbFile, usersDb);

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get all users
app.get('/api/users', (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    let users = [...usersDb];

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.username.toLowerCase().includes(searchLower)
      );
    }

    // Add online status
    users = users.map(u => ({
      ...u,
      isOnline: onlineUsers.has(u.id)
    }));

    users = users.slice(0, parseInt(limit));

    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get user by ID
app.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = usersDb.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: { ...user, isOnline: onlineUsers.has(userId) }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT - Update user profile
app.put('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const userIndex = usersDb.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    usersDb[userIndex] = { ...usersDb[userIndex], ...updates, updatedAt: new Date().toISOString() };
    writeJsonFile(usersDbFile, usersDb);

    res.json({ success: true, user: usersDb[userIndex] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Update online status (heartbeat)
app.post('/api/users/:userId/online', (req, res) => {
  try {
    const { userId } = req.params;
    onlineUsers.set(userId, { lastSeen: new Date().toISOString() });
    
    res.json({ success: true, isOnline: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Go offline
app.delete('/api/users/:userId/online', (req, res) => {
  try {
    const { userId } = req.params;
    onlineUsers.delete(userId);
    
    res.json({ success: true, isOnline: false });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get online users
app.get('/api/online-users', (req, res) => {
  try {
    const onlineUserIds = Array.from(onlineUsers.keys());
    const users = usersDb.filter(u => onlineUserIds.includes(u.id));
    
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== FRIENDS API ==========

const friendsDbFile = path.join(dataDir, 'friends-db.json');
const initFriendsDb = () => {
  if (!fs.existsSync(friendsDbFile)) {
    writeJsonFile(friendsDbFile, { friendships: [], requests: [], blocks: [] });
  }
  return readJsonFile(friendsDbFile) || { friendships: [], requests: [], blocks: [] };
};

let friendsDb = initFriendsDb();

// POST - Send friend request
app.post('/api/friends/request', (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    const existingFriendship = friendsDb.friendships.find(f => 
      (f.user1Id === fromUserId && f.user2Id === toUserId) ||
      (f.user1Id === toUserId && f.user2Id === fromUserId)
    );
    if (existingFriendship) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check for existing pending request
    const existingRequest = friendsDb.requests.find(r =>
      r.status === 'pending' &&
      ((r.fromUserId === fromUserId && r.toUserId === toUserId) ||
       (r.fromUserId === toUserId && r.toUserId === fromUserId))
    );
    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already pending' });
    }

    // Check if blocked
    const isBlocked = friendsDb.blocks.find(b =>
      (b.blockerId === toUserId && b.blockedId === fromUserId)
    );
    if (isBlocked) {
      return res.status(400).json({ error: 'Cannot send request to this user' });
    }

    const request = {
      id: generateId('req_'),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    friendsDb.requests.push(request);
    writeJsonFile(friendsDbFile, friendsDb);

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT - Accept/decline friend request
app.put('/api/friends/request/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const requestIndex = friendsDb.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = friendsDb.requests[requestIndex];
    
    if (action === 'accept') {
      request.status = 'accepted';
      
      // Create friendship
      const friendship = {
        id: generateId('friend_'),
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
        createdAt: new Date().toISOString()
      };
      friendsDb.friendships.push(friendship);
    } else if (action === 'decline') {
      request.status = 'declined';
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "accept" or "decline"' });
    }

    request.updatedAt = new Date().toISOString();
    friendsDb.requests[requestIndex] = request;
    writeJsonFile(friendsDbFile, friendsDb);

    res.json({ success: true, request });
  } catch (error) {
    console.error('Error processing friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get friend requests for user
app.get('/api/friends/requests/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'all' } = req.query; // 'received', 'sent', 'all'

    let requests = friendsDb.requests.filter(r => r.status === 'pending');

    if (type === 'received') {
      requests = requests.filter(r => r.toUserId === userId);
    } else if (type === 'sent') {
      requests = requests.filter(r => r.fromUserId === userId);
    } else {
      requests = requests.filter(r => r.fromUserId === userId || r.toUserId === userId);
    }

    // Enrich with user data
    requests = requests.map(r => ({
      ...r,
      fromUser: usersDb.find(u => u.id === r.fromUserId),
      toUser: usersDb.find(u => u.id === r.toUserId)
    }));

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get user's friends
app.get('/api/friends/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const friendships = friendsDb.friendships.filter(f =>
      f.user1Id === userId || f.user2Id === userId
    );

    const friendIds = friendships.map(f => 
      f.user1Id === userId ? f.user2Id : f.user1Id
    );

    const friends = usersDb.filter(u => friendIds.includes(u.id)).map(f => ({
      ...f,
      isOnline: onlineUsers.has(f.id)
    }));

    res.json({ success: true, friends, count: friends.length });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Remove friend
app.delete('/api/friends/:userId/:friendId', (req, res) => {
  try {
    const { userId, friendId } = req.params;

    friendsDb.friendships = friendsDb.friendships.filter(f =>
      !((f.user1Id === userId && f.user2Id === friendId) ||
        (f.user1Id === friendId && f.user2Id === userId))
    );

    writeJsonFile(friendsDbFile, friendsDb);
    res.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Block user
app.post('/api/friends/block', (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;

    if (!blockerId || !blockedId) {
      return res.status(400).json({ error: 'blockerId and blockedId are required' });
    }

    // Remove any existing friendship
    friendsDb.friendships = friendsDb.friendships.filter(f =>
      !((f.user1Id === blockerId && f.user2Id === blockedId) ||
        (f.user1Id === blockedId && f.user2Id === blockerId))
    );

    // Remove any pending requests
    friendsDb.requests = friendsDb.requests.filter(r =>
      !((r.fromUserId === blockerId && r.toUserId === blockedId) ||
        (r.fromUserId === blockedId && r.toUserId === blockerId))
    );

    // Add block
    const block = {
      id: generateId('block_'),
      blockerId,
      blockedId,
      createdAt: new Date().toISOString()
    };
    friendsDb.blocks.push(block);

    writeJsonFile(friendsDbFile, friendsDb);
    res.json({ success: true, block });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Unblock user
app.delete('/api/friends/block/:blockerId/:blockedId', (req, res) => {
  try {
    const { blockerId, blockedId } = req.params;

    friendsDb.blocks = friendsDb.blocks.filter(b =>
      !(b.blockerId === blockerId && b.blockedId === blockedId)
    );

    writeJsonFile(friendsDbFile, friendsDb);
    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get blocked users
app.get('/api/friends/blocked/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const blocks = friendsDb.blocks.filter(b => b.blockerId === userId);
    const blockedIds = blocks.map(b => b.blockedId);
    const blockedUsers = usersDb.filter(u => blockedIds.includes(u.id));

    res.json({ success: true, blockedUsers });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== CHATS/MESSAGES API ==========

const chatsDbFile = path.join(dataDir, 'chats-db.json');
const initChatsDb = () => {
  if (!fs.existsSync(chatsDbFile)) {
    writeJsonFile(chatsDbFile, { chats: [], messages: [] });
  }
  return readJsonFile(chatsDbFile) || { chats: [], messages: [] };
};

let chatsDb = initChatsDb();

// POST - Create chat
app.post('/api/chats', (req, res) => {
  try {
    const { creatorId, participants, isGroup, groupName } = req.body;

    if (!creatorId || !participants || participants.length === 0) {
      return res.status(400).json({ error: 'creatorId and participants are required' });
    }

    // For private chats, check if one already exists
    if (!isGroup && participants.length === 1) {
      const existingChat = chatsDb.chats.find(c =>
        c.type === 'private' &&
        c.participants.includes(creatorId) &&
        c.participants.includes(participants[0])
      );
      if (existingChat) {
        return res.json({ success: true, chat: existingChat, existing: true });
      }
    }

    const chat = {
      id: generateId('chat_'),
      type: isGroup ? 'group' : 'private',
      name: isGroup ? groupName : null,
      participants: [creatorId, ...participants],
      creatorId,
      createdAt: new Date().toISOString(),
      lastMessageAt: null
    };

    chatsDb.chats.push(chat);
    writeJsonFile(chatsDbFile, chatsDb);

    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get user's chats
app.get('/api/chats/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    let userChats = chatsDb.chats.filter(c => c.participants.includes(userId));

    // Enrich with last message and participant info
    userChats = userChats.map(chat => {
      const chatMessages = chatsDb.messages.filter(m => m.chatId === chat.id);
      const lastMessage = chatMessages[chatMessages.length - 1];
      const unreadCount = chatMessages.filter(m => 
        m.senderId !== userId && !m.readBy?.includes(userId)
      ).length;

      const participantUsers = usersDb.filter(u => chat.participants.includes(u.id));

      return {
        ...chat,
        lastMessage,
        unreadCount,
        participantUsers
      };
    });

    // Sort by last message time
    userChats.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.json({ success: true, chats: userChats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Send message
app.post('/api/chats/:chatId/messages', (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content, type = 'text' } = req.body;

    if (!senderId || !content) {
      return res.status(400).json({ error: 'senderId and content are required' });
    }

    const chat = chatsDb.chats.find(c => c.id === chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ error: 'Not a participant of this chat' });
    }

    const message = {
      id: generateId('msg_'),
      chatId,
      senderId,
      content,
      type, // 'text', 'image', 'audio', 'achievement'
      timestamp: new Date().toISOString(),
      readBy: [senderId]
    };

    chatsDb.messages.push(message);
    
    // Update chat's last message time
    const chatIndex = chatsDb.chats.findIndex(c => c.id === chatId);
    chatsDb.chats[chatIndex].lastMessageAt = message.timestamp;

    writeJsonFile(chatsDbFile, chatsDb);

    // Include sender info
    message.sender = usersDb.find(u => u.id === senderId);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get chat messages
app.get('/api/chats/:chatId/messages', (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 100, before } = req.query;

    let messages = chatsDb.messages.filter(m => m.chatId === chatId);

    if (before) {
      messages = messages.filter(m => new Date(m.timestamp) < new Date(before));
    }

    // Sort by timestamp (oldest first for chat display)
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Apply limit (get last N messages)
    messages = messages.slice(-parseInt(limit));

    // Enrich with sender info
    messages = messages.map(m => ({
      ...m,
      sender: usersDb.find(u => u.id === m.senderId)
    }));

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT - Mark messages as read
app.put('/api/chats/:chatId/read', (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    chatsDb.messages = chatsDb.messages.map(m => {
      if (m.chatId === chatId && !m.readBy?.includes(userId)) {
        return { ...m, readBy: [...(m.readBy || []), userId] };
      }
      return m;
    });

    writeJsonFile(chatsDbFile, chatsDb);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== LEAGUES API ==========

const leaguesDbFile = path.join(dataDir, 'leagues-db.json');
const initLeaguesDb = () => {
  if (!fs.existsSync(leaguesDbFile)) {
    const defaultLeagues = [
      { id: 'league_1', name: 'Acoustic Legends', description: 'For acoustic guitar enthusiasts', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format', members: ['user_1', 'user_3'], maxMembers: 10, creatorId: 'user_1', createdAt: new Date().toISOString() },
      { id: 'league_2', name: 'Rock Warriors', description: 'Electric guitar and rock music focus', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&auto=format', members: ['user_2', 'user_4', 'user_6'], maxMembers: 15, creatorId: 'user_2', createdAt: new Date().toISOString() },
      { id: 'league_3', name: 'Classical Masters', description: 'Classical guitar techniques and repertoire', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop&auto=format', members: ['user_5', 'user_7'], maxMembers: 8, creatorId: 'user_5', createdAt: new Date().toISOString() },
    ];
    writeJsonFile(leaguesDbFile, defaultLeagues);
    return defaultLeagues;
  }
  return readJsonFile(leaguesDbFile) || [];
};

let leaguesDb = initLeaguesDb();

// GET - Get all leagues
app.get('/api/leagues', (req, res) => {
  try {
    const { userId } = req.query;

    const leagues = leaguesDb.map(league => {
      const memberUsers = usersDb.filter(u => league.members.includes(u.id));
      const totalPoints = memberUsers.reduce((sum, u) => sum + (u.totalPoints || 0), 0);
      const averagePoints = memberUsers.length > 0 ? Math.round(totalPoints / memberUsers.length) : 0;

      return {
        ...league,
        memberCount: league.members.length,
        totalPoints,
        averagePoints,
        isJoined: userId ? league.members.includes(userId) : false,
        memberUsers: memberUsers.slice(0, 5) // Preview of members
      };
    });

    res.json({ success: true, leagues });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Create league
app.post('/api/leagues', (req, res) => {
  try {
    const { name, description, image, maxMembers, creatorId } = req.body;

    if (!name || !creatorId) {
      return res.status(400).json({ error: 'name and creatorId are required' });
    }

    const league = {
      id: generateId('league_'),
      name,
      description: description || '',
      image: image || '',
      members: [creatorId],
      maxMembers: maxMembers || 10,
      creatorId,
      createdAt: new Date().toISOString()
    };

    leaguesDb.push(league);
    writeJsonFile(leaguesDbFile, leaguesDb);

    res.status(201).json({ success: true, league });
  } catch (error) {
    console.error('Error creating league:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Join league
app.post('/api/leagues/:leagueId/join', (req, res) => {
  try {
    const { leagueId } = req.params;
    const { userId } = req.body;

    const leagueIndex = leaguesDb.findIndex(l => l.id === leagueId);
    if (leagueIndex === -1) {
      return res.status(404).json({ error: 'League not found' });
    }

    const league = leaguesDb[leagueIndex];

    if (league.members.includes(userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    if (league.members.length >= league.maxMembers) {
      return res.status(400).json({ error: 'League is full' });
    }

    league.members.push(userId);
    leaguesDb[leagueIndex] = league;
    writeJsonFile(leaguesDbFile, leaguesDb);

    res.json({ success: true, league });
  } catch (error) {
    console.error('Error joining league:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Leave league
app.delete('/api/leagues/:leagueId/leave', (req, res) => {
  try {
    const { leagueId } = req.params;
    const { userId } = req.body;

    const leagueIndex = leaguesDb.findIndex(l => l.id === leagueId);
    if (leagueIndex === -1) {
      return res.status(404).json({ error: 'League not found' });
    }

    const league = leaguesDb[leagueIndex];
    league.members = league.members.filter(m => m !== userId);
    leaguesDb[leagueIndex] = league;
    writeJsonFile(leaguesDbFile, leaguesDb);

    res.json({ success: true, message: 'Left league' });
  } catch (error) {
    console.error('Error leaving league:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get league leaderboard
app.get('/api/leagues/:leagueId/leaderboard', (req, res) => {
  try {
    const { leagueId } = req.params;

    const league = leaguesDb.find(l => l.id === leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const members = usersDb
      .filter(u => league.members.includes(u.id))
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .map((m, index) => ({ ...m, rank: index + 1 }));

    res.json({ success: true, leaderboard: members });
  } catch (error) {
    console.error('Error fetching league leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== CHALLENGES API ==========

const challengesDbFile = path.join(dataDir, 'challenges-db.json');
const initChallengesDb = () => {
  if (!fs.existsSync(challengesDbFile)) {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + (7 - now.getDay()));
    
    const defaultChallenges = [
      { 
        id: 'challenge_1', 
        name: 'Chord Master Challenge', 
        description: 'Play 100 different chord progressions this week',
        type: 'weekly',
        target: 100,
        metric: 'chord_progressions',
        pointReward: 500,
        bonusReward: 'Gold Badge',
        startDate: now.toISOString(),
        endDate: weekEnd.toISOString(),
        participants: {},
        isActive: true
      },
      { 
        id: 'challenge_2', 
        name: 'Practice Streak', 
        description: 'Practice for 7 days in a row',
        type: 'weekly',
        target: 7,
        metric: 'streak_days',
        pointReward: 300,
        bonusReward: 'Streak Badge',
        startDate: now.toISOString(),
        endDate: weekEnd.toISOString(),
        participants: {},
        isActive: true
      },
      { 
        id: 'challenge_3', 
        name: 'Song Learner', 
        description: 'Learn 3 new songs this week',
        type: 'weekly',
        target: 3,
        metric: 'songs_learned',
        pointReward: 400,
        bonusReward: 'Song Master Badge',
        startDate: now.toISOString(),
        endDate: weekEnd.toISOString(),
        participants: {},
        isActive: true
      }
    ];
    writeJsonFile(challengesDbFile, defaultChallenges);
    return defaultChallenges;
  }
  return readJsonFile(challengesDbFile) || [];
};

let challengesDb = initChallengesDb();

// GET - Get active challenges
app.get('/api/challenges', (req, res) => {
  try {
    const { userId, type = 'weekly' } = req.query;
    const now = new Date();

    let challenges = challengesDb.filter(c => 
      c.isActive && 
      c.type === type &&
      new Date(c.endDate) > now
    );

    // Add user progress if userId provided
    if (userId) {
      challenges = challenges.map(c => ({
        ...c,
        userProgress: c.participants[userId] || 0,
        progressPercent: c.participants[userId] ? Math.min(100, (c.participants[userId] / c.target) * 100) : 0,
        isCompleted: c.participants[userId] >= c.target,
        participantCount: Object.keys(c.participants).length
      }));
    }

    // Calculate time remaining
    challenges = challenges.map(c => {
      const endDate = new Date(c.endDate);
      const diffMs = endDate - now;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return {
        ...c,
        timeLeft: diffDays > 0 ? `${diffDays} days` : `${diffHours} hours`
      };
    });

    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Update challenge progress
app.post('/api/challenges/:challengeId/progress', (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId, progress } = req.body;

    const challengeIndex = challengesDb.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = challengesDb[challengeIndex];
    const previousProgress = challenge.participants[userId] || 0;
    challenge.participants[userId] = Math.max(previousProgress, progress);
    
    // Check if newly completed
    const wasCompleted = previousProgress >= challenge.target;
    const isNowCompleted = challenge.participants[userId] >= challenge.target;
    const justCompleted = !wasCompleted && isNowCompleted;

    challengesDb[challengeIndex] = challenge;
    writeJsonFile(challengesDbFile, challengesDb);

    res.json({ 
      success: true, 
      progress: challenge.participants[userId],
      justCompleted,
      pointsEarned: justCompleted ? challenge.pointReward : 0
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Get challenge leaderboard
app.get('/api/challenges/:challengeId/leaderboard', (req, res) => {
  try {
    const { challengeId } = req.params;
    const { limit = 50 } = req.query;

    const challenge = challengesDb.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const leaderboard = Object.entries(challenge.participants)
      .map(([participantId, progress]) => {
        const user = usersDb.find(u => u.id === String(participantId));
        return {
          userId: String(participantId),
          progress,
          progressPercent: Math.min(100, (progress / challenge.target) * 100),
          isCompleted: progress >= challenge.target,
          user
        };
      })
      .filter(e => e.user)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, parseInt(limit))
      .map((e, index) => ({ ...e, rank: index + 1 }));

    res.json({ success: true, leaderboard, challenge });
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== ENHANCED LEADERBOARD API ==========

// GET - Enhanced global leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const { type = 'total', limit = 100, userId } = req.query;

    let users = [...usersDb];

    // Sort based on type
    if (type === 'weekly') {
      users.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
    } else if (type === 'streak') {
      users.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    } else {
      users.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    }

    // Add rank and check if friends
    let friendIds = [];
    if (userId) {
      const friendships = friendsDb.friendships.filter(f =>
        f.user1Id === userId || f.user2Id === userId
      );
      friendIds = friendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    }

    users = users.slice(0, parseInt(limit)).map((user, index) => ({
      ...user,
      rank: index + 1,
      isFriend: friendIds.includes(user.id),
      isCurrentUser: user.id === userId,
      isOnline: onlineUsers.has(user.id)
    }));

    // Find current user's rank if not in top
    let currentUserRank = null;
    if (userId) {
      const fullIndex = usersDb.findIndex(u => u.id === userId);
      if (fullIndex >= 0) {
        currentUserRank = fullIndex + 1;
      }
    }

    res.json({ 
      success: true, 
      leaderboard: users,
      type,
      currentUserRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Friends leaderboard
app.get('/api/leaderboard/friends/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'total' } = req.query;

    // Get friend IDs
    const friendships = friendsDb.friendships.filter(f =>
      f.user1Id === userId || f.user2Id === userId
    );
    const friendIds = friendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    
    // Include current user
    friendIds.push(userId);

    let friends = usersDb.filter(u => friendIds.includes(u.id));

    // Sort based on type
    if (type === 'weekly') {
      friends.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
    } else if (type === 'streak') {
      friends.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    } else {
      friends.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    }

    friends = friends.map((user, index) => ({
      ...user,
      rank: index + 1,
      isCurrentUser: user.id === userId,
      isOnline: onlineUsers.has(user.id)
    }));

    res.json({ success: true, leaderboard: friends, type });
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== HEALTH CHECK ==========

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    endpoints: {
      posts: '/api/posts',
      sessions: '/api/sessions/:userId',
      progress: '/api/progress/:type/:userId',
      activities: '/api/activities/:userId',
      achievements: '/api/achievements/:userId',
      points: '/api/points/:userId',
      stats: '/api/stats/:userId',
      users: '/api/users',
      friends: '/api/friends/:userId',
      friendRequests: '/api/friends/requests/:userId',
      chats: '/api/chats/:userId',
      messages: '/api/chats/:chatId/messages',
      leagues: '/api/leagues',
      challenges: '/api/challenges',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Serve static frontend files from build directory
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  console.log('📦 Serving frontend from /build');
} else {
  console.log('⚠️  No build directory found. Run "npm run build" to create frontend build.');
}

// Start server
app.listen(PORT, () => {
  console.log(`🎸 Strummy Backend Server running on port ${PORT}`);
  console.log('');
  console.log('=== COMMUNITY APIs ===');
  console.log(`📝 Posts: POST/GET /api/posts`);
  console.log(`👥 Users: GET/POST/PUT /api/users`);
  console.log(`🤝 Friends: /api/friends/:userId`);
  console.log(`📨 Friend Requests: /api/friends/request`);
  console.log(`💬 Chats: /api/chats/:userId`);
  console.log(`✉️  Messages: /api/chats/:chatId/messages`);
  console.log(`🟢 Online Status: /api/users/:userId/online`);
  console.log('');
  console.log('=== COMPETE APIs ===');
  console.log(`🏆 Leaderboard: GET /api/leaderboard`);
  console.log(`👫 Friends Leaderboard: GET /api/leaderboard/friends/:userId`);
  console.log(`🏟️  Leagues: GET/POST /api/leagues`);
  console.log(`🎯 Challenges: GET /api/challenges`);
  console.log(`📊 Challenge Progress: POST /api/challenges/:id/progress`);
  console.log('');
  console.log('=== PROGRESS APIs ===');
  console.log(`🎯 Practice Sessions: POST/GET /api/sessions/:userId`);
  console.log(`📊 Progress Tracking: POST/GET /api/progress/:type/:userId`);
  console.log(`📅 Activities: POST/GET /api/activities/:userId`);
  console.log(`🏆 Achievements: POST/GET /api/achievements/:userId`);
  console.log(`⭐ Points: POST/GET /api/points/:userId`);
  console.log(`📈 Statistics: GET /api/stats/:userId`);
  console.log('');
  console.log(`❤️  Health check: GET /api/health`);
});

module.exports = app;
