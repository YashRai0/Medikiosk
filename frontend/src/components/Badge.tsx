import React from 'react';

interface BadgeProps {
  variant: 'demo' | 'ai' | 'verified' | 'pending' | 'modified';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const variants = {
    demo: 'bg-orange-100 text-orange-800 border-orange-200',
    ai: 'bg-blue-100 text-blue-800 border-blue-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    modified: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};
