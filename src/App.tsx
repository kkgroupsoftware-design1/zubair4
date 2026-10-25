import React, { Suspense } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { AppProvider, useApp } from './context/AppContext';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { Sidebar } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';

// ── Eagerly loaded: always needed on first render ─────────────────────────────
import { SplashView } from './views/SplashView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';

// ── Lazy loaded: each becomes a separate JS chunk, loaded on first navigation ─
const ForgotPasswordView = React.lazy(() => import('./views/ForgotPasswordView').then(m => ({ default: m.ForgotPasswordView })));
const DashboardView      = React.lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const PlansView          = React.lazy(() => import('./views/PlansView').then(m => ({ default: m.PlansView })));
const MyPlansView        = React.lazy(() => import('./views/MyPlansView').then(m => ({ default: m.MyPlansView })));
const RewardsView        = React.lazy(() => import('./views/RewardsView').then(m => ({ default: m.RewardsView })));
const LockedClaimsView   = React.lazy(() => import('./views/LockedClaimsView').then(m => ({ default: m.LockedClaimsView })));
const DepositView        = React.lazy(() => import('./views/DepositView').then(m => ({ default: m.DepositView })));
const WithdrawView       = React.lazy(() => import('./views/WithdrawView').then(m => ({ default: m.WithdrawView })));
const KycView            = React.lazy(() => import('./views/KycView').then(m => ({ default: m.KycView })));
const SupportView        = React.lazy(() => import('./views/SupportView').then(m => ({ default: m.SupportView })));
const TransactionsView   = React.lazy(() => import('./views/TransactionsView').then(m => ({ default: m.TransactionsView })));
const ProfileView        = React.lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));
const AdminPanelView     = React.lazy(() => import('./views/AdminPanelView').then(m => ({ default: m.AdminPanelView })));
const TermsOfServiceView = React.lazy(() => import('./views/TermsOfServiceView').then(m => ({ default: m.TermsOfServiceView })));
const PrivacyPolicyView  = React.lazy(() => import('./views/PrivacyPolicyView').then(m => ({ default: m.PrivacyPolicyView })));
const NotificationsView  = React.lazy(() => import('./views/NotificationsView').then(m => ({ default: m.NotificationsView })));

// Loading spinner shown while a lazy chunk downloads
const ViewLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-slate-400">Loading...</p>
  </div>
);


const MainContent: React.FC = () => {
  const { currentView, user, theme } = useApp();

  // Fullscreen standalone auth / splash screens
  if (currentView === 'splash') {
    return <SplashView />;
  }
  if (currentView === 'login') {
    return <LoginView />;
  }
  if (currentView === 'register') {
    return <RegisterView />;
  }
  if (currentView === 'forgot-password' || currentView === 'forgot') {
    return <ForgotPasswordView />;
  }
  if (currentView === 'terms' || currentView === 'terms-of-service') {
    return <TermsOfServiceView />;
  }
  if (currentView === 'privacy' || currentView === 'privacy-policy') {
    return <PrivacyPolicyView />;
  }

  // Unauthenticated users are redirected to LoginView
  if (!user) {
    return <LoginView />;
  }

  // Active view switcher
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'plans':
      case 'invest':
      case 'investment':
        return <PlansView />;
      case 'my-plans':
        return <MyPlansView />;
      case 'rewards':
        return <RewardsView />;
      case 'claims-locked':
        return <LockedClaimsView />;
      case 'deposit':
        return <DepositView />;
      case 'withdraw':
        return <WithdrawView />;
      case 'kyc':
        return <KycView />;
      case 'support':
        return <SupportView />;
      case 'transactions':
        return <TransactionsView />;
      case 'profile':
        return <ProfileView />;
      case 'notifications':
      case 'notification':
      case 'updates':
        return <NotificationsView />;
      case 'kkgroup':
        return user.role === 'admin' ? <AdminPanelView /> : <DashboardView />;
      case 'admin':
        return <DashboardView />;
      case 'terms':
      case 'terms-of-service':
        return <TermsOfServiceView />;
      case 'privacy':
      case 'privacy-policy':
        return <PrivacyPolicyView />;
      default:
        return <DashboardView />;
    }
  };

  const isAdminView = currentView === 'kkgroup';

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#07121E] text-slate-100'
      } flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}
    >
      {/* Top Header - hidden in Admin view so Admin panel has full edge-to-edge web layout */}
      {!isAdminView && <MobileHeader />}

      {/* Slide-out Drawers */}
      <Sidebar />
      <NotificationDrawer />

      {/* Main Page Area: 100% full-width for Admin view, standard max-w-5xl for all other views */}
      <main
        className={
          isAdminView
            ? "flex-1 w-full min-w-0"
            : "flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6"
        }
      >
        <ErrorBoundary>
          <Suspense fallback={<ViewLoadingFallback />}>
            {renderActiveView()}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Sticky Navigation - hidden in Admin view */}
      {!isAdminView && <BottomNavigation />}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
