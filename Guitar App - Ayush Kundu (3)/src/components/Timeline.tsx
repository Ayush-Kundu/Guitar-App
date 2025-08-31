import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Calendar, 
  Clock, 
  Music, 
  CheckCircle2, 
  Award,
  Star,
  PlayCircle,
  BookOpen,
  Target,
  Guitar
} from 'lucide-react';

export function Timeline() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const timelineItems = [
    {
      date: 'Today',
      time: '10:30 AM',
      type: 'practice',
      title: 'Practice Session',
      description: 'Worked on chord transitions for 45 minutes',
      icon: <Music className="w-4 h-4 text-orange-500" />,
      color: 'bg-orange-100'
    },
    {
      date: 'Today',
      time: '9:15 AM',
      type: 'goal',
      title: 'Daily Goal Completed',
      description: 'Practiced 30 minutes - streak maintained!',
      icon: <Target className="w-4 h-4 text-green-500" />,
      color: 'bg-green-100'
    },
    {
      date: 'Yesterday',
      time: '7:45 PM',
      type: 'achievement',
      title: 'Song Mastered',
      description: user.level === 'beginner' ? 'Completed "Twinkle Twinkle"' : 
                   user.level === 'intermediate' ? 'Mastered "Wonderwall"' : 
                   'Perfected "Blackbird"',
      icon: <Award className="w-4 h-4 text-purple-500" />,
      color: 'bg-purple-100'
    },
    {
      date: 'Yesterday',
      time: '2:20 PM',
      type: 'lesson',
      title: 'Theory Lesson',
      description: 'Learned about major scale patterns',
      icon: <BookOpen className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-100'
    },
    {
      date: '2 days ago',
      time: '6:30 PM',
      type: 'milestone',
      title: 'Milestone Reached',
      description: '10-day practice streak achieved!',
      icon: <Star className="w-4 h-4 text-yellow-500" />,
      color: 'bg-yellow-100'
    },
    {
      date: '3 days ago',
      time: '8:15 AM',
      type: 'practice',
      title: 'Morning Practice',
      description: 'Focused on fingerpicking techniques',
      icon: <Music className="w-4 h-4 text-orange-500" />,
      color: 'bg-orange-100'
    },
    {
      date: '4 days ago',
      time: '3:45 PM',
      type: 'lesson',
      title: 'New Chord Learned',
      description: user.level === 'beginner' ? 'Mastered A major chord' : 
                   user.level === 'intermediate' ? 'Added F major to repertoire' : 
                   'Learned complex jazz voicing',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      color: 'bg-green-100'
    },
    {
      date: '1 week ago',
      time: '7:00 PM',
      type: 'performance',
      title: 'First Recording',
      description: 'Recorded practice session for review',
      icon: <PlayCircle className="w-4 h-4 text-indigo-500" />,
      color: 'bg-indigo-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Practice Timeline</h1>
          </div>
          <p className="text-gray-600">Track your guitar learning journey, {user.name}!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Guitar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-xl font-bold">12 sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Time</p>
                  <p className="text-xl font-bold">{user.hoursThisWeek}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-xl font-bold">8 earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timelineItems.map((item, index) => (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {index < timelineItems.length - 1 && (
                    <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{item.date}</p>
                          <p className="text-xs text-gray-400">{item.time}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}