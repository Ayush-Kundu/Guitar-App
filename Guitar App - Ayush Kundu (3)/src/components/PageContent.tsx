import { Dashboard } from "./Dashboard";
import { 
  Music, 
  Clock, 
  TrendingUp, 
  Users, 
  Volume2, 
  Play, 
  Award,
  Calendar,
  Target,
  BookOpen,
  MessageCircle,
  Share2,
  Settings
} from "lucide-react";

interface PageContentProps {
  activeTab: string;
}

export function PageContent({ activeTab }: PageContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Timeline':
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Practice Timeline</h1>
              </div>
              <div className="space-y-6">
                {/* Timeline items */}
                <div className="relative pl-8 border-l-2 border-orange-200">
                  <div className="absolute -left-2 w-4 h-4 bg-orange-500 rounded-full"></div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="w-4 h-4 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">Practice Session</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Practiced "Wonderwall" for 45 minutes</p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                </div>
                <div className="relative pl-8 border-l-2 border-orange-200">
                  <div className="absolute -left-2 w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Milestone Achieved</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Mastered F major chord - 10 day streak!</p>
                    <span className="text-xs text-gray-400">1 day ago</span>
                  </div>
                </div>
                <div className="relative pl-8 border-l-2 border-orange-200">
                  <div className="absolute -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">New Song Added</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Added "Blackbird" to practice playlist</p>
                    <span className="text-xs text-gray-400">2 days ago</span>
                  </div>
                </div>
                <div className="relative pl-8 border-l-2 border-orange-200">
                  <div className="absolute -left-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Tuning Session</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Used built-in tuner to tune guitar</p>
                    <span className="text-xs text-gray-400">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Progress':
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
              </div>
              <div className="grid gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Skill Development</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Chord Transitions</span>
                        <span className="text-sm text-gray-900">85%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full w-5/6"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Strumming Patterns</span>
                        <span className="text-sm text-gray-900">70%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full w-7/10"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Fingerpicking</span>
                        <span className="text-sm text-gray-900">45%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full w-2/5"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Music Theory</span>
                        <span className="text-sm text-gray-900">60%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full w-3/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Practice Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">12</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-sm text-gray-600">Songs Mastered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">45</div>
                      <div className="text-sm text-gray-600">Total Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">24</div>
                      <div className="text-sm text-gray-600">Chords Learned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Community':
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Guitar Community</h1>
              </div>
              <div className="grid gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Posts</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">JG</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Jake_Guitar</h4>
                        <p className="text-sm text-gray-600 mb-2">Just mastered "Hotel California" solo! 🎸</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <MessageCircle className="w-4 h-4" />
                            12 comments
                          </button>
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">SM</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Sarah_Musician</h4>
                        <p className="text-sm text-gray-600 mb-2">Tips for faster chord transitions? I'm struggling with F to G</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <MessageCircle className="w-4 h-4" />
                            8 comments
                          </button>
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">MR</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Mike_Rocks</h4>
                        <p className="text-sm text-gray-600 mb-2">30-day practice challenge starts tomorrow! Who's in?</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <MessageCircle className="w-4 h-4" />
                            25 comments
                          </button>
                          <button className="flex items-center gap-1 hover:text-orange-600">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Practice Buddies</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">AL</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Alex_Lead</h4>
                        <p className="text-sm text-gray-600">12-day streak • Practicing rock songs</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">EM</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Emma_Music</h4>
                        <p className="text-sm text-gray-600">8-day streak • Learning fingerpicking</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Away</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              </div>
              <div className="grid gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Tuner Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Reference Pitch (A4)</span>
                      <select className="px-3 py-1 border border-orange-200 rounded-lg bg-white">
                        <option>440 Hz</option>
                        <option>442 Hz</option>
                        <option>444 Hz</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tuning Sensitivity</span>
                      <button className="w-12 h-6 bg-orange-500 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Practice Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Daily Practice Reminder</span>
                      <button className="w-12 h-6 bg-orange-500 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Metronome Sound</span>
                      <select className="px-3 py-1 border border-orange-200 rounded-lg bg-white">
                        <option>Classic</option>
                        <option>Modern</option>
                        <option>Wood Block</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Auto-save Practice Sessions</span>
                      <button className="w-12 h-6 bg-orange-500 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-4">App Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Dark Mode</span>
                      <button className="w-12 h-6 bg-gray-300 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Sound Effects</span>
                      <button className="w-12 h-6 bg-orange-500 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return <div className="pb-20">{renderContent()}</div>;
}