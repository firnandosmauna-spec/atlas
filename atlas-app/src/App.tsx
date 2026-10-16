import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useAppConfigStore } from './store/appConfigStore';
import MainLayout from './layouts/MainLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PraPerikatan from './pages/PraPerikatan';
import Engagements from './pages/Engagements';
import RiskAssessment from './pages/RiskAssessment';
import RiskResponse from './pages/RiskResponse';
import Completing from './pages/Completing';
import General from './pages/General';
import Portofolio from './pages/Portofolio';
import WorkspaceBeranda from './pages/workspace/WorkspaceBeranda';
import TrialBalance from './pages/workspace/TrialBalance';
import WorksheetView from './pages/workspace/worksheets/WorksheetView';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import Settings from './pages/Settings';
import FeeCalculator from './pages/FeeCalculator';
import Pmpj from './pages/Pmpj';
import SquareSnake from './components/ui/square-snake';
import SquareSnakeDemo from './components/ui/demo';

function App() {
  const { initialize, isLoading } = useAuthStore();
  const { appName, tagline, fetchFromSupabase } = useAppConfigStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initialize();
    fetchFromSupabase();
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [initialize, fetchFromSupabase]);

  useEffect(() => {
    if (appName) {
      document.title = tagline ? `${appName} - ${tagline}` : appName;
    }
  }, [appName, tagline]);

  if (isLoading || !appReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white select-none dark">
        <SquareSnake />
        <div className="mt-5 text-center space-y-1">
          <p className="text-sm font-semibold tracking-wide text-slate-200">{appName || 'ATLAS'}</p>
          <p className="text-xs text-slate-500 font-medium">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/demo/square-snake" element={<SquareSnakeDemo />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Global Layout (Dashboard, Engagements) */}
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
          
          <Route path="/" element={<MainLayout />}>
            <Route path="engagements" element={<Engagements />} />
            <Route path="portofolio" element={<Portofolio />} />
            <Route path="fee-calculator" element={<FeeCalculator />} />
            <Route path="pmpj" element={<Pmpj />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminDashboard />} />

            {/* Settings Route */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Workspace Layout (Engagement Specific) */}
          <Route path="/workspace/:id" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceBeranda />} />
            <Route path="trial-balance" element={<TrialBalance />} />
            <Route path="pra-perikatan" element={<PraPerikatan />} />
            <Route path="risk-assessment" element={<RiskAssessment />} />
            <Route path="risk-response" element={<RiskResponse />} />
            <Route path="completing" element={<Completing />} />
            <Route path="general" element={<General />} />
            <Route path="worksheet/:worksheetId" element={<WorksheetView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
