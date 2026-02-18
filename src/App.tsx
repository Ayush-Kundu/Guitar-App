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
import { AiChat } from "./components/AiChat";
import { FooterNavigation } from "./components/FooterNavigation";
import { Onboarding } from "./components/Onboarding";

function AppContent() {
  const { user, isLoading } = useUser();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  
  // Onboarding state - show for new users (tied to user ID)
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  
  // Check if this specific user has seen onboarding
  React.useEffect(() => {
    if (user) {
      const onboardingKey = `strummy-onboarding-complete-${user.id}`;
      const hasSeenOnboarding = localStorage.getItem(onboardingKey) === "true";
      setShowOnboarding(!hasSeenOnboarding);
    }
  }, [user]);

  // Scroll to top whenever section changes
  const handleSectionChange = React.useCallback((section: string) => {
    setActiveSection(section);
    window.scrollTo(0, 0);
    const root = document.getElementById('root');
    if (root) root.scrollTo(0, 0);
  }, []);
  
  // Handle onboarding completion
  const handleOnboardingComplete = React.useCallback(() => {
    setShowOnboarding(false);
    if (user) {
      const onboardingKey = `strummy-onboarding-complete-${user.id}`;
      localStorage.setItem(onboardingKey, "true");
    }
  }, [user]);

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
      case "aichat":
        return <AiChat />;
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

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {renderActiveSection()}
        <FooterNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        {/* Show onboarding for new users */}
        {showOnboarding && (
          <Onboarding
            onComplete={handleOnboardingComplete}
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