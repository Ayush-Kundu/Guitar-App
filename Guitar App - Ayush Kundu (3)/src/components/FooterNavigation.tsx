import { 
  Home, 
  Music, 
  Hand, 
  Brain, 
  BarChart3, 
  Trophy, 
  Users, 
  Settings,
  LucideIcon
} from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-lg transition-all duration-200 relative ${ 
        isActive 
          ? 'text-orange-600 bg-orange-50' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-5 h-5 sm:w-5 sm:h-5 mb-1 transition-transform duration-200 ${ 
        isActive ? 'scale-110' : 'hover:scale-105'
      }`} />
      
      {/* Text hidden on very small screens (xs), shown on sm and up */}
      <span className={`hidden xs:block text-xs font-medium transition-all duration-200 ${ 
        isActive ? 'text-orange-600' : 'text-gray-500'
      }`}>
        {label}
      </span>
      
      {/* Active indicator dot for mobile when text is hidden */}
      {isActive && (
        <div className="xs:hidden absolute -top-1 w-1 h-1 bg-orange-600 rounded-full animate-pulse"></div>
      )}
    </button>
  );
}

interface FooterNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function FooterNavigation({ activeSection, onSectionChange }: FooterNavigationProps) {
  const navItems = [
    { icon: Home, label: 'Dashboard', section: 'dashboard' },
    { icon: Music, label: 'Songs', section: 'songs' },
    { icon: Hand, label: 'Technique', section: 'technique' },
    { icon: Brain, label: 'Theory', section: 'theory' },
    { icon: BarChart3, label: 'Progress', section: 'progress' },
    { icon: Trophy, label: 'Compete', section: 'compete' },
    { icon: Users, label: 'Community', section: 'community' },
    { icon: Settings, label: 'Settings', section: 'settings' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-orange-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <nav className="grid grid-cols-8 gap-1 py-2">
          {navItems.map((item) => (
            <NavItem
              key={item.section}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.section}
              onClick={() => onSectionChange(item.section)}
            />
          ))}
        </nav>
      </div>
    </footer>
  );
}