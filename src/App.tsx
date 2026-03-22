import React from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";
import { Songs } from "./components/Songs";
import { TechniqueTheory } from "./components/TechniqueTheory";
import { Timeline } from "./components/Timeline";
import { Progress } from "./components/Progress";
import { Compete } from "./components/Compete";
import { Community } from "./components/Community";
import { Settings } from "./components/Settings";
import { FooterNavigation } from "./components/FooterNavigation";
import { NoviceIntro, shouldShowIntro, markIntroDone } from "./components/NoviceIntro";
import { BeatsPopup } from "./components/BeatsPopup";

function AppContent() {
  const { user, isLoading } = useUser();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [showIntro, setShowIntro] = React.useState(false);
  const [beatsPopupDismissed, setBeatsPopupDismissed] = React.useState(false);

  // Intro (guitar intro + coach's board) only first time
  React.useEffect(() => {
    if (user) setShowIntro(shouldShowIntro(user.id));
  }, [user]);

  // Beats popup: clear "came from Beats" on load *before* paint so user can't click arrow before we clear (avoids popup showing in wrong spots on fresh load)
  React.useLayoutEffect(() => {
    try {
      if (typeof window !== 'undefined') sessionStorage.removeItem('strummy-beats-directed');
    } catch (_) {}
  }, []);

  // Scroll to top whenever section changes. Clear "came from Beats" only when navigating to a section that didn't match (i.e. user used footer/other nav, not Beats CTA).
  const handleSectionChange = React.useCallback((section: string) => {
    try {
      const fromBeats = typeof window !== 'undefined' && sessionStorage.getItem('strummy-beats-directed') === section;
      if (typeof window !== 'undefined' && !fromBeats) {
        sessionStorage.removeItem('strummy-beats-directed');
      }
    } catch (_) {}
    setActiveSection(section);
    setBeatsPopupDismissed(false);
    window.scrollTo(0, 0);
    const root = document.getElementById('root');
    if (root) root.scrollTo(0, 0);
  }, []);
  
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("guitarapp-dark-mode") === "true";
    }
    return false;
  });

  // Apply dark mode class to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("guitarapp-dark-mode", isDarkMode.toString());
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center safe-area-top">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading your guitar journey...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <Auth />
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard onSectionChange={handleSectionChange} />;
      case "songs":
        return <Songs />;
      case "technique":
        return <TechniqueTheory initialTab="technique" />;
      case "theory":
        return <TechniqueTheory initialTab="theory" />;
      case "timeline":
        return <Timeline />;
      case "progress":
        return <Progress />;
      case "compete":
        return <Compete />;
      case "community":
        return <Community />;
      case "settings":
        return (
          <Settings
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        );
      default:
        return <Dashboard onSectionChange={handleSectionChange} />;
    }
  };

  const beatsSections = ['songs', 'technique', 'theory', 'progress', 'community', 'compete'];
  const showBeatsPopup =
    !beatsPopupDismissed &&
    beatsSections.includes(activeSection) &&
    typeof window !== 'undefined' &&
    sessionStorage.getItem('strummy-beats-directed') === activeSection;

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className={`min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${showBeatsPopup ? 'pb-28' : ''}`}>
        {renderActiveSection()}
        {showBeatsPopup && (
          <BeatsPopup
            section={activeSection as 'songs' | 'technique' | 'theory' | 'progress' | 'community' | 'compete'}
            onDismiss={() => setBeatsPopupDismissed(true)}
            onNavigate={handleSectionChange}
          />
        )}
        <FooterNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        {/* Intro: guitar basics + coach's board (only first time) */}
        {showIntro && user && (
          <NoviceIntro
            isOpen={true}
            userId={user.id}
            userLevel={user.level}
            onComplete={() => {
              markIntroDone(user.id);
              setShowIntro(false);
            }}
            onGoToBasics={() => handleSectionChange('songs')}
            onGoToSongs={() => handleSectionChange('songs')}
            onNavigate={handleSectionChange}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}