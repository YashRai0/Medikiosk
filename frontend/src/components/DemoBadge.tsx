import React, { useContext } from 'react';
import { DemoModeContext } from '../App';

export const DemoBadge: React.FC = () => {
  const { isDemo } = useContext(DemoModeContext);

  if (!isDemo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-50 pointer-events-none flex items-center opacity-90">
      DEMO DATA
    </div>
  );
};
