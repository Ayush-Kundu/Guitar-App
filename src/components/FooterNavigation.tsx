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
import { playTap } from '../utils/soundEffects';

interface NavItemProps {
  icon: LucideIcon;
  icon2?: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, icon2: Icon2, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={() => { playTap(); onClick(); }}
      className={`flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-lg transition-all duration-200 relative ${ 
        isActive 
          ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/20 dark:text-orange-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
      }`}
    >
      {Icon2 ? (
        <div className={`flex items-center gap-0.5 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
          <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
          <Icon2 className="w-4 h-4 sm:w-4 sm:h-4" />
        </div>
      ) : (
      <Icon className={`w-5 h-5 sm:w-5 sm:h-5 mb-1 transition-transform duration-200 ${ 
        isActive ? 'scale-110' : 'hover:scale-105'
      }`} />
      )}
      
      {/* Text hidden on very small screens (xs), shown on sm and up */}
      <span className={`hidden xs:block text-xs font-medium transition-all duration-200 ${ 
        isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
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
  const navItems: { icon: LucideIcon; icon2?: LucideIcon; label: string; section: string }[] = [
    { icon: Home, label: 'Dashboard', section: 'dashboard' },
    { icon: Music, label: 'Songs', section: 'songs' },
    { icon: Hand, icon2: Brain, label: 'Learn', section: 'technique' },
    { icon: BarChart3, label: 'Progress', section: 'progress' },
    { icon: Trophy, label: 'Compete', section: 'compete' },
    { icon: Users, label: 'Community', section: 'community' },
    { icon: Settings, label: 'Settings', section: 'settings' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <nav className="grid grid-cols-7 gap-1 py-1.5">
          {navItems.map((item) => (
            <NavItem
              key={item.section}
              icon={item.icon}
              icon2={item.icon2}
              label={item.label}
              isActive={activeSection === item.section || (item.section === 'technique' && activeSection === 'theory')}
              onClick={() => onSectionChange(item.section)}
            />
          ))}
        </nav>
      </div>
    </footer>
  );
}
