interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  gradient?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  borderBottom?: string;
  titleGradient?: string;
}

export function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  className = "", 
  gradient = "from-orange-400 to-red-500",
  icon,
  style,
  borderBottom,
  titleGradient
}: DashboardCardProps) {
  const cardStyle: React.CSSProperties = {
    ...style,
    ...(borderBottom && { borderBottom }),
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${gradient === "none" ? "bg-white" : `bg-gradient-to-br ${gradient}`} p-6 shadow-lg transition-transform hover:scale-105 ${className}`}
      style={cardStyle}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className={`w-8 h-8 ${gradient === "none" ? "bg-gray-100" : "bg-white/20"} rounded-full flex items-center justify-center`}>
              {icon}
            </div>
          )}
          <h3 
            className={`font-medium ${titleGradient ? "" : gradient === "none" ? "text-gray-900" : "text-white"}`}
            style={titleGradient ? {
              background: titleGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : undefined}
          >
            {title}
          </h3>
        </div>
        {subtitle && (
          <p 
            className={`text-sm mb-4 ${titleGradient ? "" : gradient === "none" ? "text-gray-600" : "text-white/80"}`}
            style={titleGradient ? {
              background: titleGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.8,
            } : undefined}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
      
      {/* Musical note decorations - only show on gradient backgrounds */}
      {gradient !== "none" && (
        <>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/3 -right-4 w-8 h-8 bg-white/5 rounded-full"></div>
          
          {/* Musical staff lines */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5"></div>
          <div className="absolute bottom-2 left-0 right-0 h-px bg-white/10"></div>
          <div className="absolute bottom-4 left-0 right-0 h-px bg-white/10"></div>
        </>
      )}
    </div>
  );
}