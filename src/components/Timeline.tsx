import React, { useState, useEffect } from 'react';
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
import { getActivities, getSessionStats, getAchievements } from '../utils/api';

export function Timeline() {
  const { user } = useUser();
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ weeklySessions: 0, totalMinutes: 0, achievements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimeline = async () => {
      if (!user) return;

      try {
        // Load activities from backend
        const activities = await getActivities(user.id, { limit: 50 });
        
        // Transform activities to timeline format
        const items = activities.map(activity => {
          const date = new Date(activity.timestamp);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let dateLabel = 'Today';
          if (diffDays === 1) dateLabel = 'Yesterday';
          else if (diffDays > 1 && diffDays < 7) dateLabel = `${diffDays} days ago`;
          else if (diffDays >= 7) dateLabel = date.toLocaleDateString();

          // Map activity types to icons and colors
          const typeMap: Record<string, { icon: JSX.Element; color: string }> = {
            practice: {
              icon: <Music className="w-4 h-4 text-orange-500" />,
              color: 'bg-orange-100'
            },
            goal: {
              icon: <Target className="w-4 h-4 text-green-500" />,
              color: 'bg-green-100'
            },
            achievement: {
              icon: <Award className="w-4 h-4 text-purple-500" />,
              color: 'bg-purple-100'
            },
            lesson: {
              icon: <BookOpen className="w-4 h-4 text-blue-500" />,
              color: 'bg-blue-100'
            },
            milestone: {
              icon: <Star className="w-4 h-4 text-yellow-500" />,
              color: 'bg-yellow-100'
            },
            performance: {
              icon: <PlayCircle className="w-4 h-4 text-indigo-500" />,
              color: 'bg-indigo-100'
            }
          };

          const typeInfo = typeMap[activity.type] || {
            icon: <Music className="w-4 h-4 text-gray-500" />,
            color: 'bg-gray-100'
          };

          return {
            date: dateLabel,
            time: activity.time || date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: activity.type,
            title: activity.title,
            description: activity.description || '',
            icon: typeInfo.icon,
            color: typeInfo.color
          };
        });

        setTimelineItems(items);

        // Load stats
        const sessionStats = await getSessionStats(user.id, 'week');
        let achievementCount = 0;
        try {
          const achievementData = await getAchievements(user.id);
          achievementCount = Array.isArray(achievementData) ? achievementData.length : 0;
        } catch {
          achievementCount = 0;
        }
        setStats({
          weeklySessions: sessionStats.totalSessions,
          totalMinutes: Math.round(sessionStats.totalMinutes || 0),
          achievements: achievementCount
        });
      } catch (error) {
        console.error('Error loading timeline:', error);
        // Fallback to empty array
        setTimelineItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
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
                  <p className="text-xl font-bold">{stats.weeklySessions} sessions</p>
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
                  <p className="text-xl font-bold">{Math.round(stats.totalMinutes / 60)}h</p>
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
                  <p className="text-xl font-bold">{stats.achievements} earned</p>
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
              {timelineItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No activities yet</p>
                  <p className="text-sm">Start practicing to see your timeline here!</p>
                </div>
              ) : (
                timelineItems.map((item, index) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}