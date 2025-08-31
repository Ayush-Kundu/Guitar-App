import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle2, 
  Star, 
  Timer,
  Volume2,
  RotateCcw,
  Target
} from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: 'practice' | 'study' | 'quiz' | 'metronome' | 'tuner' | 'history';
  activityData?: any;
}

export function ActivityModal({ isOpen, onClose, activityType, activityData }: ActivityModalProps) {
  const { user, updateUser } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setProgress(prev => Math.min(prev + 1, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    if (user) {
      // Update user progress based on activity type
      const updates: any = {};
      
      if (activityType === 'practice') {
        updates.practiceStreak = user.practiceStreak + 1;
        updates.hoursThisWeek = Number(user.hoursThisWeek) + (timeElapsed / 3600);
        
        if (activityData?.type === 'technique') {
          // Could add technique-specific progress here
        } else if (activityData?.type === 'song') {
          // Could update song progress here
        }
      } else if (activityType === 'study') {
        updates.hoursThisWeek = Number(user.hoursThisWeek) + (timeElapsed / 3600);
        // Could add theory progress here
      }
      
      updateUser(updates);
    }
    
    setIsActive(false);
    setTimeElapsed(0);
    setProgress(0);
    onClose();
  };

  const renderContent = () => {
    switch (activityType) {
      case 'practice':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {activityData?.name || 'Practice Session'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activityData?.description || 'Focus on your technique and timing'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm text-gray-600">Session Time</div>
              </div>
              
              <Progress value={progress} className="h-3 mb-4" />
              
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => setIsActive(!isActive)}
                  className="bg-blue-500 hover:bg-blue-600"
                  size="lg"
                >
                  {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
                
                <Button
                  onClick={() => {
                    setIsActive(false);
                    setTimeElapsed(0);
                    setProgress(0);
                  }}
                  variant="outline"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                className="bg-green-500 hover:bg-green-600"
                disabled={timeElapsed < 30}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Session
              </Button>
            </div>
          </div>
        );

      case 'study':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {activityData?.name || 'Study Session'}
              </h3>
              <p className="text-gray-600 mb-4">
                Learn and understand music theory concepts
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm text-gray-600">Study Time</div>
              </div>
              
              <Progress value={progress} className="h-3 mb-4" />
              
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => setIsActive(!isActive)}
                  className="bg-blue-500 hover:bg-blue-600"
                  size="lg"
                >
                  {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Key Concepts</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Scale patterns</li>
                  <li>• Chord progressions</li>
                  <li>• Interval relationships</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Practice Tips</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Start slowly</li>
                  <li>• Use a metronome</li>
                  <li>• Focus on accuracy</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                className="bg-green-500 hover:bg-green-600"
                disabled={timeElapsed < 15}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Study
              </Button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Theory Quiz</h3>
              <p className="text-gray-600 mb-4">Test your knowledge</p>
            </div>

            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <h4 className="font-medium mb-4">Question 1 of 5</h4>
              <p className="mb-4">What are the notes in a C major scale?</p>
              
              <div className="space-y-2">
                {['C-D-E-F-G-A-B', 'C-D-E#-F-G-A-B', 'C-D-E-F#-G-A-B', 'C-D#-E-F-G-A-B'].map((option, i) => (
                  <Button key={i} variant="outline" className="w-full text-left justify-start">
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Next Question
              </Button>
            </div>
          </div>
        );

      case 'metronome':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Metronome</h3>
              <p className="text-gray-600 mb-4">Keep perfect time</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg text-center">
              <div className="text-6xl font-bold text-green-600 mb-4">120</div>
              <div className="text-sm text-gray-600 mb-4">BPM</div>
              
              <div className="flex justify-center gap-3 mb-4">
                <Button size="sm" variant="outline">-10</Button>
                <Button size="sm" variant="outline">-1</Button>
                <Button size="sm" variant="outline">+1</Button>
                <Button size="sm" variant="outline">+10</Button>
              </div>
              
              <Button
                onClick={() => setIsActive(!isActive)}
                className="bg-blue-500 hover:bg-blue-600"
                size="lg"
              >
                {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isActive ? 'Stop' : 'Start'}
              </Button>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        );

      case 'tuner':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Guitar Tuner</h3>
              <p className="text-gray-600 mb-4">Tune your guitar</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">E</div>
                <div className="text-sm text-gray-600">Current String</div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="grid grid-cols-6 gap-2 mb-4">
                {['E', 'A', 'D', 'G', 'B', 'e'].map((string, i) => (
                  <Button key={i} size="sm" variant="outline" className="aspect-square">
                    {string}
                  </Button>
                ))}
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Play a string to tune
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Practice History</h3>
              <p className="text-gray-600 mb-4">Your recent sessions</p>
            </div>

            <div className="space-y-3">
              {[
                { date: 'Today', activity: 'Chord Practice', duration: '25 min', progress: '+5%' },
                { date: 'Yesterday', activity: 'Scale Practice', duration: '30 min', progress: '+8%' },
                { date: '2 days ago', activity: 'Song Practice', duration: '45 min', progress: '+12%' },
              ].map((session, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{session.activity}</div>
                    <div className="text-sm text-gray-600">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{session.duration}</div>
                    <div className="text-sm text-green-600">{session.progress}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activityType === 'practice' && <Play className="w-5 h-5" />}
            {activityType === 'study' && <Clock className="w-5 h-5" />}
            {activityType === 'quiz' && <Target className="w-5 h-5" />}
            {activityType === 'metronome' && <Timer className="w-5 h-5" />}
            {activityType === 'tuner' && <Volume2 className="w-5 h-5" />}
            {activityType === 'history' && <RotateCcw className="w-5 h-5" />}
            {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}