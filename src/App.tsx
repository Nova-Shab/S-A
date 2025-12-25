import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuditProvider, useAudit } from "./context/AuditContext";
import { SystemsProvider } from "./context/SystemsContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { RiskAssessmentPage } from "./pages/RiskAssessmentPage";
import { AuditPage } from "./pages/AuditPage";
import { ActionPlanPage } from "./pages/ActionPlanPage";
import { ScannerPage } from "./pages/ScannerPage";
import { DemoAccessPage } from "./pages/DemoAccessPage";
import { AuditToolsPage } from "./pages/AuditToolsPage";
import { SystemsListPage } from "./pages/SystemsListPage";
import { SystemDetailPage } from "./pages/SystemDetailPage";
import authService from "./services/authService";
import demoService, { DemoLead } from "./services/demoService";

const AppContent: React.FC = () => {
  const { state, setCurrentStep, resetAudit } = useAudit();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDemoAccess, setHasDemoAccess] = useState(false);
  const [demoLead, setDemoLead] = useState<DemoLead | null>(null);
  const [demoEnabled, setDemoEnabled] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      await checkDemoStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const checkDemoStatus = async () => {
    try {
      const status = await demoService.getStatus();
      setDemoEnabled(status.enabled);

      if (demoService.hasDemoAccess()) {
        const verification = await demoService.verifyAccess();
        if (verification.valid && verification.lead) {
          setHasDemoAccess(true);
          setDemoLead(verification.lead);
        } else {
          setHasDemoAccess(false);
          setDemoLead(null);
        }
      }
    } catch (error) {
      console.error("Error checking demo status:", error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    resetAudit();
    navigate('/login', { replace: true });
  };

  const handleDemoGranted = async (token: string) => {
    demoService.setDemoToken(token);
    const verification = await demoService.verifyAccess();
    if (verification.valid && verification.lead) {
      setHasDemoAccess(true);
      setDemoLead(verification.lead);
      navigate('/audit-tools', { replace: true });
    }
  };

  const handleCreateNewAudit = () => {
    resetAudit();
    setCurrentStep(0);
    navigate('/audit/new');
  };

  const handleOpenExistingAudit = (auditId: number) => {
    setCurrentStep(2);
    navigate(`/audit/${auditId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              onNavigateToRegister={() => navigate('/register')}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage
              onRegister={handleRegister}
              onNavigateToLogin={() => navigate('/login')}
            />
          )
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute requireAuth hasDemoAccess={hasDemoAccess}>
            <Layout
              hasDemoAccess={hasDemoAccess}
              demoEnabled={demoEnabled}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <DashboardPage
              onCreateAudit={handleCreateNewAudit}
              onOpenAudit={handleOpenExistingAudit}
              onLogout={() => {}}
            />
          </div>
        } />
        <Route path="/scanner" element={
          <ScannerPage onBack={() => navigate('/dashboard')} />
        } />
        {/* V-03: Multi-System-Verwaltung */}
        <Route path="/systems" element={<SystemsListPage />} />
        <Route path="/systems/:id" element={<SystemDetailPage />} />
        <Route path="/systems/:id/edit" element={<SystemDetailPage />} />
      </Route>

      {/* Demo Access Page (protected but doesn't require demo access) */}
      <Route
        path="/demo-access"
        element={
          <ProtectedRoute requireAuth hasDemoAccess={hasDemoAccess}>
            <DemoAccessPage
              onDemoGranted={handleDemoGranted}
              onBack={() => navigate('/dashboard')}
            />
          </ProtectedRoute>
        }
      />

      {/* Audit Tools (requires demo access) */}
      <Route
        path="/audit-tools"
        element={
          <ProtectedRoute requireAuth requireDemo hasDemoAccess={hasDemoAccess}>
            <AuditToolsPage
              onBack={() => navigate('/dashboard')}
              demoLead={demoLead}
            />
          </ProtectedRoute>
        }
      />

      {/* Audit Flow Routes */}
      <Route
        path="/audit/new"
        element={
          <ProtectedRoute requireAuth hasDemoAccess={hasDemoAccess}>
            <AuditFlowPage
              step={state.currentStep}
              onBack={() => navigate('/dashboard')}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit/:id"
        element={
          <ProtectedRoute requireAuth hasDemoAccess={hasDemoAccess}>
            <AuditFlowPage
              step={state.currentStep}
              onBack={() => navigate('/dashboard')}
            />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 - Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-6">Seite nicht gefunden</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Zur Startseite
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Audit Flow Component
interface AuditFlowPageProps {
  step: number;
  onBack: () => void;
}

const AuditFlowPage: React.FC<AuditFlowPageProps> = ({ step, onBack }) => {
  const renderAuditStep = () => {
    switch (step) {
      case 0:
        return <LandingPage />;
      case 1:
        return <RiskAssessmentPage />;
      case 2:
        return <AuditPage />;
      case 3:
        return <ActionPlanPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 flex items-center px-4 py-2 bg-white shadow-lg rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Zurück
      </button>
      {renderAuditStep()}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuditProvider>
        <SystemsProvider>
          <AppContent />
        </SystemsProvider>
      </AuditProvider>
    </ErrorBoundary>
  );
}

export default App;
