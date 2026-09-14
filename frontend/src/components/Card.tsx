import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};
