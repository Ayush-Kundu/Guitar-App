import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Volume2,
  LogOut,
  Save,
  Edit3,
  Mail,
  Star,
  Calendar,
  Moon,
  Sun,
  CheckCircle2,
  Camera
} from "lucide-react";
import { useUser } from '../contexts/UserContext';

interface SettingsProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export function Settings({ isDarkMode, setIsDarkMode }: SettingsProps) {
  const { user, signOut, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    level: user?.level || '',
    email: user?.email || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    practiceReminders: true,
    achievementAlerts: true,
    weeklyProgress: false,
    shareProgress: false,
    allowFriends: true,
    metronomeVolume: [70],
    backingTrackVolume: [60]
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        name: editData.name,
        level: editData.level as any
      });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      name: user?.name || '',
      level: user?.level || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and app preferences</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">Settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-orange-600" />
                    <CardTitle className="dark:text-white">Profile Information</CardTitle>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                <CardDescription className="dark:text-gray-400">
                  Manage your personal information and guitar level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture - Simple Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-orange-500 hover:bg-orange-600"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{user.level} guitarist</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-200">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="dark:text-white">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="dark:text-gray-200">Guitar Level</Label>
                    {isEditing ? (
                      <Select value={editData.level} onValueChange={(value) => setEditData(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select your guitar level" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="novice">Novice - Just picked up guitar</SelectItem>
                          <SelectItem value="beginner">Beginner - Know a few chords</SelectItem>
                          <SelectItem value="elementary">Elementary - Basic songs</SelectItem>
                          <SelectItem value="intermediate">Intermediate - Confident player</SelectItem>
                          <SelectItem value="proficient">Proficient - Advanced techniques</SelectItem>
                          <SelectItem value="advanced">Advanced - Very skilled</SelectItem>
                          <SelectItem value="expert">Expert - Master level</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="capitalize dark:text-white">{user.level}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-gray-200">Email Address</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="dark:text-white">{user.email}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Cannot be changed</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">Member Since</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Practice Statistics */}
            <Card className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Practice Statistics</CardTitle>
                <CardDescription className="dark:text-gray-400">Your guitar learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{user.practiceStreak}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user.songsMastered}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Songs Mastered</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{user.hoursThisWeek}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Hours This Week</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.chordsLearned}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Chords Learned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-lg dark:text-white">Appearance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-600" />}
                    <div>
                      <Label className="dark:text-white">Dark Mode</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Toggle dark theme</p>
                    </div>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-lg dark:text-white">Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-300">Practice reminders</span>
                  <Switch
                    checked={settings.practiceReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, practiceReminders: checked }))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-300">Achievement alerts</span>
                  <Switch
                    checked={settings.achievementAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, achievementAlerts: checked }))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-300">Weekly progress</span>
                  <Switch
                    checked={settings.weeklyProgress}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyProgress: checked }))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings - Orange themed sliders */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-lg dark:text-white">Audio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="dark:text-white">Metronome Volume</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{settings.metronomeVolume[0]}%</span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={settings.metronomeVolume}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, metronomeVolume: value }))}
                      max={100}
                      step={1}
                      className="w-full [&_.slider-track]:bg-gray-300 [&_.slider-track]:dark:bg-gray-600 [&_.slider-range]:bg-orange-500 [&_.slider-thumb]:border-orange-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="dark:text-white">Backing Track Volume</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{settings.backingTrackVolume[0]}%</span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={settings.backingTrackVolume}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, backingTrackVolume: value }))}
                      max={100}
                      step={1}
                      className="w-full [&_.slider-track]:bg-gray-300 [&_.slider-track]:dark:bg-gray-600 [&_.slider-range]:bg-orange-500 [&_.slider-thumb]:border-orange-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-lg dark:text-white">Privacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-300">Share progress publicly</span>
                  <Switch
                    checked={settings.shareProgress}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shareProgress: checked }))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-gray-300">Allow friend requests</span>
                  <Switch
                    checked={settings.allowFriends}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowFriends: checked }))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom spacing for footer */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}