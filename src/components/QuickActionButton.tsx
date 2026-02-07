import { LucideIcon } from "lucide-react";
import React from "react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  color?: string;
  style?: React.CSSProperties;
}

export function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "bg-purple-500",
  style
}: QuickActionButtonProps) {
  // Map background colors to darker border colors for 3D effect
  const getBorderColor = (bgColor: string) => {
    const colorMap: { [key: string]: { border: string; borderBottom: string } } = {
      // Lighter colors - map to slightly darker shades for 3D effect
      'rgb(255, 207, 147)': { border: 'rgb(255, 187, 97)', borderBottom: 'rgb(245, 158, 11)' },   // Orange
      'rgb(141, 223, 255)': { border: 'rgb(96, 165, 250)', borderBottom: 'rgb(59, 130, 246)' },   // Blue
      'rgb(139, 233, 153)': { border: 'rgb(74, 222, 128)', borderBottom: 'rgb(34, 197, 94)' },    // Green
      'rgb(224, 190, 255)': { border: 'rgb(192, 132, 252)', borderBottom: 'rgb(168, 85, 247)' },  // Purple
      'rgb(246, 142, 193)': { border: 'rgb(244, 114, 182)', borderBottom: 'rgb(236, 72, 153)' },  // Pink
      'rgb(167, 174, 188)': { border: 'rgb(156, 163, 175)', borderBottom: 'rgb(107, 114, 128)' }, // Gray
    };
    return colorMap[bgColor] || { border: 'rgb(192, 132, 252)', borderBottom: 'rgb(168, 85, 247)' };
  };

  // Get text color based on background
  const getTextColor = (bgColor: string) => {
    const textColorMap: { [key: string]: string } = {
      'rgb(255, 207, 147)': 'rgb(180, 83, 9)',    // Orange - dark amber text
      'rgb(141, 223, 255)': 'rgb(30, 64, 175)',   // Blue - dark blue text
      'rgb(139, 233, 153)': 'rgb(21, 128, 61)',   // Green - dark green text
      'rgb(224, 190, 255)': 'rgb(107, 33, 168)',  // Purple - dark purple text
      'rgb(246, 142, 193)': 'rgb(157, 23, 77)',   // Pink - dark pink text
      'rgb(167, 174, 188)': 'rgb(55, 65, 81)',    // Gray - dark gray text
    };
    return textColorMap[bgColor] || 'rgb(107, 33, 168)';
  };

  const iconBgColor = style?.backgroundColor as string || color;
  const borderColors = getBorderColor(iconBgColor);
  const textColor = getTextColor(iconBgColor);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:scale-105 transition-all duration-200 backdrop-blur-sm"
      style={{ 
        border: '2px solid rgb(237, 237, 237)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
        style={{
          backgroundColor: iconBgColor,
          border: `2px solid ${borderColors.border}`,
          borderBottom: `4px solid ${borderColors.borderBottom}`,
        }}
      >
        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
      </div>
      <span 
        className="text-xs font-semibold"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </button>
  );
}
