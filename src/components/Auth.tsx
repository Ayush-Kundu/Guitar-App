import React, { useState, useEffect } from 'react';
import { useUser, MUSIC_THEMES } from '../contexts/UserContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Guitar, Music, CheckCircle2 } from 'lucide-react';
import { isNative } from '../utils/capacitor';
import { isNativeGoogleConfigured, nativeGoogleSignIn } from '../utils/nativeGoogleAuth';
import { nativeAppleSignIn } from '../utils/nativeAppleAuth';

const HAS_VISITED_KEY = 'strummy-has-visited';

export function Auth() {
  const { signUp, signIn, signInWithGoogle, signInWithApple, signUpWithSocial } = useUser();

  // First-time users see sign-up; returning users see sign-in.
  const [isSignUp, setIsSignUp] = useState(() => {
    try {
      return !localStorage.getItem(HAS_VISITED_KEY);
    } catch {
      return false;
    }
  });

  // Mark as visited on mount so next open defaults to sign-in.
  useEffect(() => {
    try {
      localStorage.setItem(HAS_VISITED_KEY, '1');
    } catch {}
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignInOption, setShowSignInOption] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic info, 2: Music preferences

  // Social sign-up: holds the provider token so we can create the profile on final submit.
  const [socialAuth, setSocialAuth] = useState<{
    provider: 'google' | 'apple';
    idToken: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level: 'novice' as const,
    musicPreferences: [] as string[]
  });

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('strummy-oauth-error');
      if (msg) {
        sessionStorage.removeItem('strummy-oauth-error');
        setError(msg);
      }
    } catch (_) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSignUp && step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        if (socialAuth) {
          // Social sign-up: create auth via idToken + profile with user-entered details.
          await signUpWithSocial(socialAuth.provider, socialAuth.idToken, {
            name: formData.name,
            email: formData.email,
            level: formData.level,
            musicPreferences: formData.musicPreferences,
          });
        } else {
          await signUp(formData);
        }
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);

      let errorMessage = error.message || 'An error occurred during authentication';
      let showSignInButton = false;

      if (error.message && (
          error.message.includes('already been registered') ||
          error.message.includes('Failed to create auth user') ||
          error.message.includes('account with this email already exists')
        )) {
        errorMessage = 'This email is already registered. You can sign in with your existing account or try using a different email address to create a new account.';
        showSignInButton = true;
      } else if (error.message && (
          error.message.includes('Incorrect email or password') ||
          error.message.includes('Invalid credentials') ||
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_credentials')
        )) {
        errorMessage = 'Incorrect email or password.';
      } else if (error.message && error.message.includes('Network error')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      }

      setError(errorMessage);
      setShowSignInOption(showSignInButton);
    } finally {
      setIsLoading(false);
    }
  };

  /** Get email/name from Google or Apple, pre-fill the sign-up form. */
  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError(null);
    try {
      let idToken: string;
      let email: string | undefined;
      let name: string | undefined;

      if (provider === 'google') {
        if (!isNative() || !isNativeGoogleConfigured()) {
          throw new Error('Google sign-up is only available on the iOS app.');
        }
        const result = await nativeGoogleSignIn();
        idToken = result.idToken;
        email = result.email;
        name = result.name;
      } else {
        if (!isNative()) {
          throw new Error('Apple sign-up is only available on the iOS app.');
        }
        const result = await nativeAppleSignIn();
        idToken = result.idToken;
        email = result.email;
        name = result.name;
      }

      if (!email) {
        throw new Error(`Could not get email from ${provider === 'google' ? 'Google' : 'Apple'}. Please sign up with email and password instead.`);
      }

      // Store the token for later, pre-fill form fields.
      setSocialAuth({ provider, idToken });
      setFormData(prev => ({
        ...prev,
        email,
        name: name || prev.name,
      }));
      setStep(1);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('1001') || msg.includes('popup_closed')) {
        return;
      }
      setError(error.message || `${provider} sign-up failed`);
    }
  };

  const handleThemeToggle = (themeId: string) => {
    const currentPreferences = formData.musicPreferences;

    if (currentPreferences.includes(themeId)) {
      setFormData({
        ...formData,
        musicPreferences: currentPreferences.filter(id => id !== themeId)
      });
    } else if (currentPreferences.length < 3) {
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
    setSocialAuth(null);
    setStep(1);
    setError(null);
    setShowSignInOption(false);
    setFormData(prev => ({
      ...prev,
      password: '',
      musicPreferences: []
    }));
  };

  const handleSwitchToSignUp = () => {
    setIsSignUp(true);
    setSocialAuth(null);
    setStep(1);
    setError(null);
    setShowSignInOption(false);
  };

  // For social sign-up, password isn't needed.
  const canProceedToStep2 = socialAuth
    ? formData.name && formData.email && formData.level
    : formData.name && formData.email && formData.password && formData.level;
  const canCompleteSignup = formData.musicPreferences.length === 3;

  // Google/Apple button SVGs
  const googleIcon = (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  const appleIcon = (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );

  return (
    <div className="page-content min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Guitar className="w-10 h-10 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Strummy</h1>
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
            {socialAuth && isSignUp && step === 1 && (
              <p className="text-xs text-center text-green-600 mt-2">
                {socialAuth.provider === 'google' ? 'Google' : 'Apple'} account linked — fill in the details below to finish signing up.
              </p>
            )}
          </CardHeader>

          <CardContent>
            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-950 dark:text-amber-100">
                <p className="font-semibold m-0 mb-1">Supabase is not connected</p>
                <p className="m-0 text-xs leading-relaxed opacity-95">
                  Add <code className="px-1 rounded bg-white/70 dark:bg-black/30">VITE_SUPABASE_URL</code> and{' '}
                  <code className="px-1 rounded bg-white/70 dark:bg-black/30">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                  <code className="px-1 rounded bg-white/70 dark:bg-black/30">.env</code> file (see{' '}
                  <code className="px-1 rounded bg-white/70 dark:bg-black/30">.env.example</code>), then stop and restart{' '}
                  <code className="px-1 rounded bg-white/70 dark:bg-black/30">npm run dev</code>.
                </p>
              </div>
            )}

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

            {/* ── Sign-up: Google / Apple buttons (before the form, step 1 only, if no social token yet) ── */}
            {isSignUp && step === 1 && !socialAuth && (
              <>
                <div className="space-y-2 mb-4">
                  <Button
                    onClick={() => handleSocialSignUp('google')}
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    {googleIcon}
                    {isLoading ? 'Connecting...' : 'Sign up with Google'}
                  </Button>
                  <Button
                    onClick={() => handleSocialSignUp('apple')}
                    className="w-full bg-black hover:bg-gray-900 text-white"
                    disabled={isLoading}
                  >
                    {appleIcon}
                    {isLoading ? 'Connecting...' : 'Sign up with Apple'}
                  </Button>
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">or sign up with email</span>
                  </div>
                </div>
              </>
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
                      <SelectTrigger id="level">
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
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      readOnly={!!socialAuth}
                      className={socialAuth ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>

                  {/* Hide password field when signing up via Google/Apple */}
                  {!(isSignUp && socialAuth) && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  )}

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

            {/* ── Sign-in: Google / Apple buttons ── */}
            {!isSignUp && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      try {
                        await signInWithGoogle();
                      } catch (error: any) {
                        console.error('Google sign-in error:', error);
                        setError(error.message || 'Google sign-in failed');
                        setIsLoading(false);
                      }
                    }}
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    {googleIcon}
                    {isLoading ? 'Signing In...' : 'Sign in with Google'}
                  </Button>

                  <Button
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      try {
                        await signInWithApple();
                      } catch (error: any) {
                        console.error('Apple sign-in error:', error);
                        setError(error.message || 'Apple sign-in failed');
                        setIsLoading(false);
                      }
                    }}
                    className="w-full bg-black hover:bg-gray-900 text-white"
                    disabled={isLoading}
                  >
                    {appleIcon}
                    {isLoading ? 'Signing In...' : 'Sign in with Apple'}
                  </Button>
                </div>
              </>
            )}

            {/* Terms & Privacy */}
            {((!isSignUp) || (isSignUp && step === 1)) && (
              <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                By {isSignUp ? 'signing up' : 'signing in'}, you agree to our{' '}
                <a href="https://strummy.studio/terms" target="_blank" rel="noopener noreferrer" className="underline text-orange-500">Terms of Service</a>
                {' '}and{' '}
                <a href="https://strummy.studio/privacy" target="_blank" rel="noopener noreferrer" className="underline text-orange-500">Privacy Policy</a>.
              </p>
            )}

            {/* Toggle sign-in / sign-up */}
            {!isSignUp && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={handleSwitchToSignUp}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {isSignUp && step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={handleSwitchToSignIn}
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
