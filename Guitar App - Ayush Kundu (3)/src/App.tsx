import React from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";
import { Songs } from "./components/Songs";
import { Technique } from "./components/Technique";
import { Theory } from "./components/Theory";
import { Timeline } from "./components/Timeline";
import { Progress } from "./components/Progress";
import { Compete } from "./components/Compete";
import { Community } from "./components/Community";
import { Settings } from "./components/Settings";
import { FooterNavigation } from "./components/FooterNavigation";

function AppContent() {
  const { user, isLoading } = useUser();
  const [activeSection, setActiveSection] = React.useState("dashboard");
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
        return <Dashboard onSectionChange={setActiveSection} />;
      case "songs":
        return <Songs />;
      case "technique":
        return <Technique />;
      case "theory":
        return <Theory />;
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
        return <Dashboard onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {renderActiveSection()}
        <FooterNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
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