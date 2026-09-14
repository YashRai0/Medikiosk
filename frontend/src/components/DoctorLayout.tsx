import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const DoctorLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-navy-900 text-white flex flex-col">
        <div className="p-6">
          <div className="text-teal-400 font-bold text-2xl tracking-tight">MediKiosk</div>
          <div className="text-slate-400 text-sm mt-1">Physician Portal</div>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <Link
            to="/doctor/dashboard"
            className={`block px-4 py-3 rounded-xl transition-colors ${
              location.pathname.includes('/doctor/dashboard')
                ? 'bg-teal-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Dashboard
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="text-sm text-slate-400 hover:text-white">
            ← Back to Kiosk
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">OPD Portal</h2>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
