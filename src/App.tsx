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
import { BeatsGuidedStrip } from "./components/BeatsGuidedStrip";
import { CelebrationOverlay, type CelebrationPayload } from "./components/CelebrationOverlay";
import {
  getGuidedBeatsMessage,
  getGuidedBeatsStep,
  guidedStepMatchesSection,
  isGuidedBeatsFlowActive,
} from "./utils/beatsGuidedFlow";
import { checkForOtaUpdate } from "./utils/otaUpdate";

function AppContent() {
  const { user, isLoading } = useUser();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [showIntro, setShowIntro] = React.useState(false);
  const [beatsPopupDismissed, setBeatsPopupDismissed] = React.useState(false);
  const [celebration, setCelebration] = React.useState<CelebrationPayload | null>(null);
  const clearCelebration = React.useCallback(() => setCelebration(null), []);

  // Check for OTA updates on launch (native only, no-op on web).
  React.useEffect(() => {
    checkForOtaUpdate();
  }, []);

  // Intro (first time)
  React.useEffect(() => {
    if (user) setShowIntro(shouldShowIntro(user.id));
  }, [user]);

  React.useEffect(() => {
    const onCelebration = (e: Event) => {
      const d = (e as CustomEvent<CelebrationPayload>).detail;
      if (d && typeof d === 'object' && 'kind' in d) setCelebration(d as CelebrationPayload);
    };
    window.addEventListener('strummy-celebration', onCelebration);
    return () => window.removeEventListener('strummy-celebration', onCelebration);
  }, []);

  React.useEffect(() => {
    const nav = (e: Event) => {
      const ce = e as CustomEvent<{ section: string }>;
      setBeatsPopupDismissed(false);
      if (ce.detail?.section) setActiveSection(ce.detail.section);
    };
    window.addEventListener('strummy-guided-beats-navigate', nav as EventListener);
    return () => window.removeEventListener('strummy-guided-beats-navigate', nav as EventListener);
  }, []);

  // Scroll to top whenever section changes. Clear "came from Beats" only when navigating to a section that didn't match (i.e. user used footer/other nav, not Beats CTA).
  const handleSectionChange = React.useCallback((section: string) => {
    try {
      if (typeof window !== 'undefined') {
        const guided = sessionStorage.getItem('strummy-beats-guided-active') === '1';
        const fromBeats = sessionStorage.getItem('strummy-beats-directed') === section;
        if (!guided && !fromBeats) {
          sessionStorage.removeItem('strummy-beats-directed');
        }
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
  const guidedStep =
    user && typeof window !== 'undefined' && isGuidedBeatsFlowActive() ? getGuidedBeatsStep() : null;
  const guidedMessage =
    guidedStep && guidedStepMatchesSection(guidedStep, activeSection)
      ? getGuidedBeatsMessage(guidedStep)
      : null;
  const showGuidedStrip =
    !beatsPopupDismissed &&
    Boolean(guidedMessage) &&
    beatsSections.includes(activeSection);
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${
          showGuidedStrip ? 'pb-28' : ''
        }`}
      >
        {renderActiveSection()}
        {showGuidedStrip && guidedMessage ? (
          <BeatsGuidedStrip
            message={guidedMessage}
            onDismiss={() => setBeatsPopupDismissed(true)}
          />
        ) : null}
        {celebration ? (
          <CelebrationOverlay payload={celebration} onDone={clearCelebration} />
        ) : null}
        <FooterNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        {/* Intro: Beats says, guitar basics, optional Learn Guitar Basics (first time) */}
        {showIntro && user && (
          <NoviceIntro
            isOpen={true}
            userId={user.id}
            onComplete={() => {
              markIntroDone(user.id);
              setShowIntro(false);
              handleSectionChange('dashboard');
            }}
            onStartLearnGuitarBasics={() => {
              markIntroDone(user.id);
              setShowIntro(false);
              handleSectionChange('songs');
              queueMicrotask(() => {
                try {
                  window.dispatchEvent(new CustomEvent('strummy-request-open-guitar-basics'));
                } catch (_) {}
              });
            }}
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