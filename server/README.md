# Guitar Learning App - Backend API

Complete backend server for the Guitar Learning App with comprehensive functionality for tracking practice sessions, progress, achievements, and more.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
```bash
export PORT=3001  # Default is 3001
```

3. Start the server:
```bash
npm run server
# or
node server/index.js
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - Check server status and available endpoints

### Community Posts
- **POST** `/api/posts` - Create a new community post
- **GET** `/api/posts` - Get all community posts
- **PUT** `/api/posts/:id/like` - Like/unlike a post

### Practice Sessions
- **POST** `/api/sessions` - Create a new practice session
- **GET** `/api/sessions/:userId` - Get user's practice sessions
  - Query params: `startDate`, `endDate`, `activityType`, `limit`
- **GET** `/api/sessions/:userId/stats` - Get session statistics
  - Query params: `period` (week/month/all)

### Progress Tracking

#### Songs
- **POST** `/api/progress/song` - Update song progress
- **GET** `/api/progress/song/:userId` - Get song progress

#### Techniques
- **POST** `/api/progress/technique` - Update technique progress
- **GET** `/api/progress/technique/:userId` - Get technique progress

#### Theory
- **POST** `/api/progress/theory` - Update theory progress
- **GET** `/api/progress/theory/:userId` - Get theory progress

### Activities/Timeline
- **POST** `/api/activities` - Create a new activity
- **GET** `/api/activities/:userId` - Get user's activities
  - Query params: `limit`, `type`

### Achievements
- **POST** `/api/achievements` - Unlock an achievement
- **GET** `/api/achievements/:userId` - Get user's achievements

### Points System
- **POST** `/api/points` - Record points activity
- **GET** `/api/points/:userId` - Get user's points activities
  - Query params: `limit`, `type`

### Competitions
- **POST** `/api/competitions` - Record competition result
- **GET** `/api/leaderboard` - Get leaderboard (placeholder)

### Statistics
- **GET** `/api/stats/:userId` - Get comprehensive user statistics

## 📊 Data Storage

The server uses file-based storage in the following structure:
```
server/
├── data/
│   ├── users/
│   │   └── {userId}/
│   │       ├── sessions.json
│   │       ├── song-progress.json
│   │       ├── technique-progress.json
│   │       ├── theory-progress.json
│   │       ├── activities.json
│   │       ├── achievements.json
│   │       ├── points-activities.json
│   │       └── competitions.json
│   ├── sessions/
│   ├── activities/
│   └── achievements/
└── posts/
```

## 🔧 Request/Response Examples

### Create Practice Session
```bash
POST /api/sessions
Content-Type: application/json

{
  "userId": "user123",
  "activityType": "practice",
  "activityName": "Chord Practice",
  "duration": 30,
  "difficulty": 2,
  "progress": 75,
  "notes": "Focused on G to C transitions"
}
```

### Update Song Progress
```bash
POST /api/progress/song
Content-Type: application/json

{
  "userId": "user123",
  "songId": "wonderwall",
  "songTitle": "Wonderwall",
  "artist": "Oasis",
  "progress": 85,
  "status": "in-progress"
}
```

### Get User Statistics
```bash
GET /api/stats/user123

Response:
{
  "success": true,
  "stats": {
    "totalPoints": 2500,
    "weeklyPoints": 180,
    "totalSessions": 45,
    "weeklySessions": 7,
    "songsMastered": 5,
    "techniquesMastered": 12,
    "theoryCompleted": 8,
    "achievementsUnlocked": 6,
    ...
  }
}
```

## 🎯 Features

### Practice Session Tracking
- Track duration, difficulty, and progress
- Support for different activity types (practice, song, technique, theory, study)
- Session statistics and analytics

### Progress Tracking
- Song progress (0-100%)
- Technique mastery tracking
- Theory lesson completion
- Status tracking (in-progress, mastered, completed)

### Activity Timeline
- Automatic activity creation from sessions
- Support for multiple activity types
- Chronological timeline view

### Points System
- Configurable points for different activities
- Difficulty-based multipliers
- Points history tracking

### Achievements
- Achievement unlocking system
- Category-based organization
- Timestamp tracking

## 🔒 Security Notes

This is a development server. For production:
- Add authentication middleware
- Implement rate limiting
- Use a proper database (PostgreSQL, MongoDB, etc.)
- Add input validation and sanitization
- Implement proper error handling
- Add CORS configuration for specific origins

## 🚧 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Real-time updates via WebSocket
- User authentication and authorization
- File upload support (audio recordings, images)
- Advanced analytics and reporting
- Export functionality (CSV, PDF)
- Backup and restore capabilities

## 📝 License

This backend is part of the Guitar Learning App project.

