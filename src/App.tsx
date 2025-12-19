import React, { useState, useEffect } from "react";
import { AuditProvider, useAudit } from "./context/AuditContext";
import { Navigation } from "./components/Navigation";
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
import authService from "./services/authService";
import demoService, { DemoLead } from "./services/demoService";

type AppView =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'scanner'
  | 'demo-access'
  | 'audit-tools'
  | 'audit-flow';

const AppContent: React.FC = () => {
  const { state, setCurrentStep, resetAudit } = useAudit();
  const [view, setView] = useState<AppView>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAuditId, setCurrentAuditId] = useState<number | null>(null);
  const [hasDemoAccess, setHasDemoAccess] = useState(false);
  const [demoLead, setDemoLead] = useState<DemoLead | null>(null);
  const [demoEnabled, setDemoEnabled] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setView(authenticated ? 'dashboard' : 'login');

    // Check demo status
    checkDemoStatus();
  }, []);

  const checkDemoStatus = async () => {
    // Check if demo feature is enabled
    const status = await demoService.getStatus();
    setDemoEnabled(status.enabled);

    // Check if user has demo access
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
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setView('login');
    resetAudit();
    setCurrentAuditId(null);
  };

  const handleNavigate = (targetView: string) => {
    if (targetView === 'audit-tools' && !hasDemoAccess) {
      setView('demo-access');
    } else {
      setView(targetView as AppView);
    }
  };

  const handleDemoGranted = async (token: string) => {
    demoService.setDemoToken(token);
    const verification = await demoService.verifyAccess();
    if (verification.valid && verification.lead) {
      setHasDemoAccess(true);
      setDemoLead(verification.lead);
      setView('audit-tools');
    }
  };

  const handleCreateNewAudit = () => {
    resetAudit();
    setCurrentAuditId(null);
    setCurrentStep(0);
    setView('audit-flow');
  };

  const handleOpenExistingAudit = (auditId: number) => {
    setCurrentAuditId(auditId);
    setCurrentStep(2);
    setView('audit-flow');
  };

  const user = authService.getCurrentUser();
  const userName = user ? `${user.firstName} ${user.lastName}` : undefined;

  // Render based on view
  if (!isAuthenticated) {
    if (view === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToRegister={() => setView('register')}
      />
    );
  }

  // Pages with Navigation
  const renderWithNavigation = (content: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={view}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={userName}
        hasDemoAccess={hasDemoAccess}
        demoEnabled={demoEnabled}
      />
      {content}
    </div>
  );

  // Demo Access Page
  if (view === 'demo-access') {
    return (
      <DemoAccessPage
        onDemoGranted={handleDemoGranted}
        onBack={() => setView('dashboard')}
      />
    );
  }

  // Audit Tools (Demo) Page
  if (view === 'audit-tools') {
    if (!hasDemoAccess) {
      setView('demo-access');
      return null;
    }
    return (
      <AuditToolsPage
        onBack={() => setView('dashboard')}
        demoLead={demoLead}
      />
    );
  }

  // Scanner Page
  if (view === 'scanner') {
    return renderWithNavigation(
      <ScannerPage onBack={() => setView('dashboard')} />
    );
  }

  // Dashboard
  if (view === 'dashboard') {
    return renderWithNavigation(
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DashboardContent
          onCreateAudit={handleCreateNewAudit}
          onOpenAudit={handleOpenExistingAudit}
        />
      </div>
    );
  }

  // Audit Flow (existing pages)
  if (view === 'audit-flow') {
    const renderAuditStep = () => {
      switch (state.currentStep) {
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
          onClick={() => setView('dashboard')}
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
  }

  // Default to dashboard
  return renderWithNavigation(
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardContent
        onCreateAudit={handleCreateNewAudit}
        onOpenAudit={handleOpenExistingAudit}
      />
    </div>
  );
};

// Extracted Dashboard Content (reuses DashboardPage logic but without its own header)
interface DashboardContentProps {
  onCreateAudit: () => void;
  onOpenAudit: (auditId: number) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  onCreateAudit,
  onOpenAudit,
}) => {
  // Import DashboardPage content here or use as-is
  return (
    <DashboardPage
      onCreateAudit={onCreateAudit}
      onOpenAudit={onOpenAudit}
      onLogout={() => {}}  // Logout is handled by Navigation now
    />
  );
};

function App() {
  return (
    <AuditProvider>
      <AppContent />
    </AuditProvider>
  );
}

export default App;
