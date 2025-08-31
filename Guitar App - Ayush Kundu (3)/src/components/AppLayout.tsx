import { useState } from "react";
import { PageContent } from "./PageContent";
import { FooterNavigation } from "./FooterNavigation";

export function AppLayout() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContent activeTab={activeTab} />
      <FooterNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}