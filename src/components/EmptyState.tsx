import React from 'react';
import { Button } from './ui/button';
import { Music } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto">
          <Music className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <h3>{title}</h3>
      <p>{description}</p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="action-button-pop"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}