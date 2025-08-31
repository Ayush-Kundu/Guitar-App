import { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  color?: string;
}

export function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "bg-purple-500" 
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:scale-105 transition-all duration-200"
    >
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}