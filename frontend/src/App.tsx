import React, { createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DoctorLayout } from './components/DoctorLayout';
import { DemoBadge } from './components/DemoBadge';
import KioskHome from './pages/KioskHome';
import ConsentPage from './pages/ConsentPage';
import LanguagePage from './pages/LanguagePage';
import PatientStartPage from './pages/PatientStartPage';
import HistoryPage from './pages/HistoryPage';
import DocumentsPage from './pages/DocumentsPage';
import PatientReviewPage from './pages/PatientReviewPage';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorReviewPage from './pages/DoctorReviewPage';
import InteroperabilityPage from './pages/InteroperabilityPage';
import AyushPage from './pages/AyushPage';

const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
export const DemoModeContext = createContext({ isDemo: isDemoMode });

function App() {
  return (
    <DemoModeContext.Provider value={{ isDemo: isDemoMode }}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<KioskHome />} />
            <Route path="/patient/consent" element={<ConsentPage />} />
            <Route path="/patient/language" element={<LanguagePage />} />
            <Route path="/patient/start" element={<PatientStartPage />} />
            <Route path="/patient/history" element={<HistoryPage />} />
            <Route path="/patient/documents" element={<DocumentsPage />} />
            <Route path="/patient/review" element={<PatientReviewPage />} />
            <Route path="/ayush" element={<AyushPage />} />
          </Route>
          <Route element={<DoctorLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/review/:sessionId" element={<DoctorReviewPage />} />
            <Route path="/interoperability/:sessionId" element={<InteroperabilityPage />} />
          </Route>
        </Routes>
        <DemoBadge />
      </BrowserRouter>
    </DemoModeContext.Provider>
  );
}

export default App;
