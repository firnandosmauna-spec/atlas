import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
import { Building2 } from 'lucide-react';

function App() {
  const { initialize, isLoading } = useAuthStore();
  const { appName, tagline } = useAppConfigStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (appName) {
      document.title = tagline ? `${appName} - ${tagline}` : appName;
    }
  }, [appName, tagline]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building2 className="text-gray-950" size={24} />
          </div>
          <p className="text-white font-medium animate-pulse">Mengautentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
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
