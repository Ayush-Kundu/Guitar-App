import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  LogOut,
  Save,
  Edit3,
  Mail,
  Star,
  Calendar,
  Moon,
  Sun,
  CheckCircle2,
  UserCircle,
  Clock,
  Trophy,
  Music,
  Flame,
  Lightbulb,
  Users,
  BellRing,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useUser } from '../contexts/UserContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useNotifications, NotificationCategory } from '../utils/notifications';

// Import all avatar options
import avatar1 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (1).png";
import avatar2 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (2).png";
import avatar3 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (3).png";
import avatar4 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (4).png";
import avatar5 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (5).png";
import avatar6 from "../assets/avatar-enhanced.png";

// Avatar options array
const avatarOptions = [
  { id: 1, src: avatar1, name: "Blue Guitar" },
  { id: 2, src: avatar2, name: "Dark Pick" },
  { id: 3, src: avatar3, name: "Cream Fork" },
  { id: 4, src: avatar4, name: "Purple Note" },
  { id: 5, src: avatar5, name: "Orange Circle" },
  { id: 6, src: avatar6, name: "Guitar Character" },
];

// Export avatar options for use in other components
export { avatarOptions };

// Export function to get preferred genres
export function getPreferredGenres(): string[] {
  if (typeof window === 'undefined') return ['rock', 'pop', 'folk'];
  const saved = localStorage.getItem('guitarApp_preferredGenres');
  return saved ? JSON.parse(saved) : ['rock', 'pop', 'folk'];
}

interface SettingsProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

// Available song genres
const songGenres = [
  { id: 'rock', label: 'Rock', emoji: '🎸', color: 'rgb(239, 68, 68)' },
  { id: 'pop', label: 'Pop', emoji: '🎵', color: 'rgb(236, 72, 153)' },
  { id: 'classical', label: 'Classical', emoji: '🎼', color: 'rgb(168, 85, 247)' },
  { id: 'folk', label: 'Folk', emoji: '🪕', color: 'rgb(34, 197, 94)' },
  { id: 'blues', label: 'Blues', emoji: '🎺', color: 'rgb(59, 130, 246)' },
  { id: 'country', label: 'Country', emoji: '🤠', color: 'rgb(234, 179, 8)' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷', color: 'rgb(99, 102, 241)' },
  { id: 'metal', label: 'Metal', emoji: '⚡', color: 'rgb(75, 85, 99)' },
];

export function Settings({ isDarkMode, setIsDarkMode }: SettingsProps) {
  const { user, signOut, updateProfile, deleteAccount } = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    level: user?.level || '',
    email: user?.email || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Get selected avatar from localStorage (per-user key so each profile has its own avatar)
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(6);
  useEffect(() => {
    if (user?.id) {
      const key = `guitarApp_selectedAvatar_${user.id}`;
      const saved = localStorage.getItem(key) || localStorage.getItem('guitarApp_selectedAvatar');
      setSelectedAvatarId(saved ? parseInt(saved, 10) : 6);
    }
  }, [user?.id]);

  // Song genre preferences
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    const saved = localStorage.getItem('guitarApp_preferredGenres');
    return saved ? JSON.parse(saved) : ['rock', 'pop', 'folk']; // Default genres
  });

  // Toggle genre selection
  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      const newGenres = prev.includes(genreId)
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId];
      localStorage.setItem('guitarApp_preferredGenres', JSON.stringify(newGenres));
      return newGenres;
    });
  };

  // Get the current avatar image
  const currentAvatar = avatarOptions.find(a => a.id === selectedAvatarId)?.src || avatar6;

  // Handle avatar selection (store per user so each profile has its own avatar)
  const handleSelectAvatar = async (avatarId: number) => {
    setSelectedAvatarId(avatarId);
    if (user?.id) localStorage.setItem(`guitarApp_selectedAvatar_${user.id}`, avatarId.toString());
    else localStorage.setItem('guitarApp_selectedAvatar', avatarId.toString());
    setShowAvatarPicker(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    // Sync avatar selection to Supabase profile
    if (user) {
      try {
        await updateProfile({ avatar: avatarId.toString() });
      } catch (error) {
        console.error('Error syncing avatar to Supabase:', error);
      }
    }
  };
  
  // Notification settings from hook
  const {
    settings: notificationSettings,
    updateSettings: updateNotificationSettings,
    permissionGranted,
    requestPermission,
    sendTestNotification,
    isNative
  } = useNotifications();

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        name: editData.name,
        level: editData.level as 'novice' | 'beginner' | 'elementary' | 'intermediate' | 'proficient' | 'advanced' | 'expert'
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
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-3 pt-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 transition-all duration-500" style={{ border: '2px solid rgb(240, 240, 240)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-medium">Settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6 rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden" style={{ border: '2px solid rgb(240, 240, 240)', borderBottom: '4px solid rgb(240, 240, 240)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              <CardHeader style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <CardTitle className="dark:text-white text-gray-800 font-semibold">Profile Information</CardTitle>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="dark:border-gray-600 dark:text-gray-300 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                {/* Profile Picture - Avatar Image */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
                      <img 
                        src={currentAvatar} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover scale-110"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-orange-500 hover:bg-orange-600 transition-all duration-300"
                      onClick={() => setShowAvatarPicker(true)}
                    >
                      <UserCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Avatar Picker Dialog - 3x2 Grid */}
                <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
                  <DialogContent style={{ width: '340px', maxWidth: '90vw' }}>
                    <DialogHeader>
                      <DialogTitle className="text-center text-lg font-semibold">Choose Your Avatar</DialogTitle>
                    </DialogHeader>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gridTemplateRows: 'repeat(2, 1fr)',
                      gap: '16px',
                      padding: '16px'
                    }}>
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => handleSelectAvatar(avatar.id)}
                          className={`relative rounded-full overflow-hidden transition-all duration-300 ${
                            selectedAvatarId === avatar.id 
                              ? 'ring-2 ring-gray-400' 
                              : 'hover:scale-105'
                          }`}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            margin: '0 auto',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' 
                          }}
                        >
                          <img 
                            src={avatar.src} 
                            alt={avatar.name} 
                            className={`w-full h-full object-cover scale-110 transition-all duration-300 ${
                              selectedAvatarId === avatar.id ? 'brightness-50' : ''
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 pb-2">
                      Click on an avatar to select it
                    </p>
                  </DialogContent>
                </Dialog>
                <div className="text-center mb-6">
                  <h3 className="font-semibold dark:text-white text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user.level} guitarist</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-200 text-gray-700 text-sm font-medium">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="bg-white/60 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 dark:text-white rounded-lg"
                      />
                    ) : (
                      <div
                        id="name"
                        className="flex items-center gap-2 p-3 bg-white/40 dark:bg-gray-700/30 rounded-lg"
                        style={{ border: '1px solid rgba(240, 240, 240, 0.8)', borderBottom: '3px solid rgb(240, 240, 240)' }}
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="dark:text-white text-gray-700">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="dark:text-gray-200 text-gray-700 text-sm font-medium">Guitar Level</Label>
                    {isEditing ? (
                      <Select value={editData.level} onValueChange={(value) => setEditData(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger
                          id="level"
                          className="bg-white/60 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 dark:text-white rounded-lg"
                        >
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
                      <div
                        id="level"
                        className="flex items-center gap-2 p-3 bg-white/40 dark:bg-gray-700/30 rounded-lg"
                        style={{ border: '1px solid rgba(240, 240, 240, 0.8)', borderBottom: '3px solid rgb(240, 240, 240)' }}
                      >
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="capitalize dark:text-white text-gray-700">{user.level}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="dark:text-gray-200 text-gray-700 text-sm font-medium">Email Address</p>
                  <div className="flex items-center gap-2 p-3 bg-white/40 dark:bg-gray-700/30 rounded-lg" style={{ border: '1px solid rgba(240, 240, 240, 0.8)', borderBottom: '3px solid rgb(240, 240, 240)' }}>
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="dark:text-white text-gray-700 flex-1">{user.email}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Cannot be changed</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200 text-gray-700 text-sm font-medium">Member Since</Label>
                  <div className="flex items-center gap-2 p-3 bg-white/40 dark:bg-gray-700/30 rounded-lg" style={{ border: '1px solid rgba(240, 240, 240, 0.8)', borderBottom: '3px solid rgb(240, 240, 240)' }}>
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="dark:text-white text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600"
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
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden" style={{ border: '2px solid rgb(240, 240, 240)', borderBottom: '4px solid rgb(240, 240, 240)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              <CardHeader style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" style={{ color: 'rgb(255, 140, 0)' }} />
                    <CardTitle className="text-lg dark:text-white font-semibold" style={{ color: 'rgb(255, 140, 0)' }}>Notifications</CardTitle>
                  </div>
                  <Switch
                    checked={notificationSettings.enabled}
                    onCheckedChange={(checked) => updateNotificationSettings({ enabled: checked })}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                {!permissionGranted && isNative && (
                  <Button
                    size="sm"
                    onClick={requestPermission}
                    className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                  >
                    <BellRing className="w-3 h-3 mr-1" />
                    Enable Notifications
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                {/* Practice Reminders */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Practice reminders</span>
                    </div>
                    <Switch
                      checked={notificationSettings.practiceReminders}
                      onCheckedChange={(checked) => updateNotificationSettings({ practiceReminders: checked })}
                      className="data-[state=checked]:bg-orange-500"
                      disabled={!notificationSettings.enabled}
                    />
                  </div>
                  {notificationSettings.practiceReminders && notificationSettings.enabled && (
                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Daily at</span>
                      <Input
                        type="time"
                        value={notificationSettings.practiceReminderTime}
                        onChange={(e) => updateNotificationSettings({ practiceReminderTime: e.target.value })}
                        className="w-24 h-7 text-xs bg-white/60 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Streak Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Streak reminders</span>
                  </div>
                  <Switch
                    checked={notificationSettings.streakReminders}
                    onCheckedChange={(checked) => updateNotificationSettings({ streakReminders: checked })}
                    className="data-[state=checked]:bg-orange-500"
                    disabled={!notificationSettings.enabled}
                  />
                </div>

                {/* Weekly Challenges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Weekly challenges</span>
                  </div>
                  <Switch
                    checked={notificationSettings.challengeNotifications}
                    onCheckedChange={(checked) => updateNotificationSettings({ challengeNotifications: checked })}
                    className="data-[state=checked]:bg-orange-500"
                    disabled={!notificationSettings.enabled}
                  />
                </div>

                {/* Song Suggestions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Song suggestions</span>
                  </div>
                  <Switch
                    checked={notificationSettings.songSuggestions}
                    onCheckedChange={(checked) => updateNotificationSettings({ songSuggestions: checked })}
                    className="data-[state=checked]:bg-orange-500"
                    disabled={!notificationSettings.enabled}
                  />
                </div>

                {/* Achievements */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Achievement alerts</span>
                  </div>
                  <Switch
                    checked={notificationSettings.achievementNotifications}
                    onCheckedChange={(checked) => updateNotificationSettings({ achievementNotifications: checked })}
                    className="data-[state=checked]:bg-orange-500"
                    disabled={!notificationSettings.enabled}
                  />
                </div>

                {/* Social */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Social updates</span>
                  </div>
                  <Switch
                    checked={notificationSettings.socialNotifications}
                    onCheckedChange={(checked) => updateNotificationSettings({ socialNotifications: checked })}
                    className="data-[state=checked]:bg-orange-500"
                    disabled={!notificationSettings.enabled}
                  />
                </div>

                {/* Tips */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Guitar tips</span>
                  </div>
                  <Switch
                    checked={notificationSettings.tipNotifications}
                    onCheckedChange={(checked) => updateNotificationSettings({ tipNotifications: checked })}
                    className="data-[state=checked]:bg-orange-500"
                    disabled={!notificationSettings.enabled}
                  />
                </div>

                {/* Test Notification Button (only on native) */}
                {isNative && permissionGranted && notificationSettings.enabled && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendTestNotification('practice_reminder')}
                      className="w-full text-xs dark:border-gray-600 dark:text-gray-300"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Send Test Notification
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden" style={{ border: '2px solid rgb(240, 240, 240)', borderBottom: '4px solid rgb(240, 240, 240)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              <CardHeader style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" style={{ color: 'rgb(255, 140, 0)' }} />
                  <CardTitle className="text-lg dark:text-white font-semibold" style={{ color: 'rgb(255, 140, 0)' }}>Appearance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className="w-5 h-5" style={{ color: 'rgb(255, 140, 0)' }} /> : <Sun className="w-5 h-5" style={{ color: 'rgb(255, 140, 0)' }} />}
                    <div>
                      <Label htmlFor="settings-dark-mode" className="text-gray-600 dark:text-white">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Toggle dark theme</p>
                    </div>
                  </div>
                  <Switch
                    id="settings-dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Song Style Preferences */}
            <Card className="rounded-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden" style={{ border: '2px solid rgb(240, 240, 240)', borderBottom: '4px solid rgb(240, 240, 240)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              <CardHeader style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5" style={{ color: 'rgb(255, 140, 0)' }} />
                  <CardTitle className="text-lg dark:text-white font-semibold" style={{ color: 'rgb(255, 140, 0)' }}>Song Styles</CardTitle>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select your preferred genres</p>
              </CardHeader>
              <CardContent style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <div className="grid grid-cols-2 gap-2">
                  {songGenres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id);
                    const orangeColor = 'rgb(249, 115, 22)';
                    return (
                      <button
                        key={genre.id}
                        onClick={() => toggleGenre(genre.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                          isSelected ? 'scale-[1.02]' : 'opacity-60 hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'rgb(243, 244, 246)',
                          border: isSelected ? `2px solid ${orangeColor}` : '2px solid rgb(229, 231, 235)',
                          borderBottom: isSelected ? `3px solid ${orangeColor}` : '3px solid rgb(209, 213, 219)'
                        }}
                      >
                        <span 
                          className="text-sm font-medium"
                          style={{ color: isSelected ? orangeColor : 'rgb(107, 114, 128)' }}
                        >
                          {genre.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: orangeColor }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Account Actions — side by side */}
            <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-2 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl"
                  onClick={async () => {
                    try { await signOut(); } catch (e) { console.error(e); }
                  }}
                  style={{ borderBottom: '3px solid rgb(255, 123, 106)' }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-700 border-2 border-red-400 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30 rounded-xl"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  style={{ borderBottom: '3px solid rgb(239, 68, 68)' }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
            </div>

            {/* Legal — below account actions */}
            <div className="flex justify-center gap-4 mt-4 pb-4">
              <a href="/terms.html" className="text-xs text-gray-400 hover:text-orange-500 underline">Terms of Service</a>
              <a href="/privacy.html" className="text-xs text-gray-400 hover:text-orange-500 underline">Privacy Policy</a>
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data including your profile, posts, messages, friends, and practice progress. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await deleteAccount();
                      } catch (err) {
                        console.error('Delete account failed:', err);
                        setIsDeleting(false);
                        setShowDeleteConfirm(false);
                      }
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
        </div>
        </div>
        </div>
  );
}