import React, { useState } from 'react';
import { useUser, MUSIC_THEMES } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Guitar, Music, Star, CheckCircle2 } from 'lucide-react';

export function Auth() {
  const { signUp, signIn } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignInOption, setShowSignInOption] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic info, 2: Music preferences
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level: 'novice' as const,
    musicPreferences: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isSignUp && step === 1) {
      // Move to music preferences step
      setStep(2);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(formData);
        // No need to set success message - user will be redirected to dashboard
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific error cases with better UX
      let errorMessage = error.message || 'An error occurred during authentication';
      let showSignInButton = false;
      
      if (error.message && (
          error.message.includes('already been registered') || 
          error.message.includes('Failed to create auth user') ||
          error.message.includes('account with this email already exists')
        )) {
        errorMessage = 'This email is already registered. You can sign in with your existing account or try using a different email address to create a new account.';
        showSignInButton = true;
      } else if (error.message && error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message && error.message.includes('Network error')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      setShowSignInOption(showSignInButton);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('demo@example.com', 'demo');
    } catch (error: any) {
      console.error('Demo login error:', error);
      setError(error.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeToggle = (themeId: string) => {
    const currentPreferences = formData.musicPreferences;
    
    if (currentPreferences.includes(themeId)) {
      // Remove theme
      setFormData({
        ...formData,
        musicPreferences: currentPreferences.filter(id => id !== themeId)
      });
    } else if (currentPreferences.length < 3) {
      // Add theme (max 3)
      setFormData({
        ...formData,
        musicPreferences: [...currentPreferences, themeId]
      });
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError(null);
    setShowSignInOption(false);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
    setStep(1);
    setError(null);
    setShowSignInOption(false);
    // Keep the email but clear other fields for sign-in
    setFormData(prev => ({
      ...prev,
      password: '',
      musicPreferences: []
    }));
  };

  const canProceedToStep2 = formData.name && formData.email && formData.password && formData.level;
  const canCompleteSignup = formData.musicPreferences.length === 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Guitar className="w-10 h-10 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">GuitarMaster</h1>
          </div>
          <p className="text-gray-600">Your personalized guitar learning journey</p>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-orange-200">
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? (
                step === 1 ? 'Create Your Account' : 'Choose Your Music Style'
              ) : 'Welcome Back'}
            </CardTitle>
            {isSignUp && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              </div>
            )}
          </CardHeader>
          
          <CardContent>

            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 mb-3">{error}</p>
                {showSignInOption && (
                  <Button
                    onClick={handleSwitchToSignIn}
                    variant="outline"
                    size="sm"
                    className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    Sign In with This Email Instead
                  </Button>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Current Guitar Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => setFormData({ ...formData, level: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novice">Novice - Never played before</SelectItem>
                        <SelectItem value="beginner">Beginner - Know a few chords</SelectItem>
                        <SelectItem value="elementary">Elementary - Can play simple songs</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Comfortable with basics</SelectItem>
                        <SelectItem value="proficient">Proficient - Advanced techniques</SelectItem>
                        <SelectItem value="advanced">Advanced - Complex pieces</SelectItem>
                        <SelectItem value="expert">Expert - Master level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {isSignUp && step === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <Music className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pick Your Favorite Music Styles</h3>
                    <p className="text-sm text-gray-600">
                      Choose exactly 3 genres to personalize your learning experience
                    </p>
                    <div className="mt-2 text-sm text-orange-600 font-medium">
                      {formData.musicPreferences.length}/3 selected
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {MUSIC_THEMES.map((theme) => {
                      const isSelected = formData.musicPreferences.includes(theme.id);
                      const isDisabled = !isSelected && formData.musicPreferences.length >= 3;
                      
                      return (
                        <div 
                          key={theme.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50' 
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 bg-white hover:border-orange-300'
                          }`}
                          onClick={() => !isDisabled && handleThemeToggle(theme.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{theme.name}</h4>
                              <p className="text-xs text-gray-600">{theme.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBackToStep1}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!canCompleteSignup || isLoading}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      {isLoading ? 'Creating Account...' : 'Complete Signup'}
                    </Button>
                  </div>
                  
                  {formData.musicPreferences.length < 3 && (
                    <p className="text-sm text-center text-gray-500">
                      Please select {3 - formData.musicPreferences.length} more style{3 - formData.musicPreferences.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {(!isSignUp || step === 1) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  {!isSignUp && (
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  )}

                  {isSignUp && step === 1 && (
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600" 
                      disabled={!canProceedToStep2 || isLoading}
                    >
                      Next: Choose Music Styles
                    </Button>
                  )}
                </>
              )}
            </form>

            {!isSignUp && (
              <>
                <div className="mt-4">
                  <Button 
                    onClick={handleDemoLogin}
                    variant="outline" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError(null);
                        setShowSignInOption(false);
                      }}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </>
            )}

            {isSignUp && step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                      setShowSignInOption(false);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        {!isSignUp && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">What you'll get:</p>
            <div className="flex justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Personalized Lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Progress Tracking</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Interactive Tools</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}