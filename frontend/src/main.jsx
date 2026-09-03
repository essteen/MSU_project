import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthModal from './components/AuthModal.jsx';
import LandingPage from './components/LandingPage.jsx';
import HouseholdOverview from './components/HouseholdOverview.jsx';
import NotificationBell from './components/NotificationBell.jsx';
import './styles.css';

function App() {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState('login');

  return (
    <main className="app-shell">
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo" aria-label="Homely-logo">
            <div className="logo-mark">H</div>
            <span>Homely</span>
          </div>
        </div>

        <div className="navbar-right">
          {user ? <NotificationBell /> : null}
          <div className="auth-buttons">
            {user ? (
              <>
                <span className="auth-username">{user.username}</span>
                <button type="button" className="auth-button" onClick={logout}>Logg ut</button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="auth-button"
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                >
                  Logg inn
                </button>
                <button
                  type="button"
                  className="auth-button primary"
                  onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                >
                  Registrer deg
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <HouseholdOverview />
      ) : (
        <LandingPage
          onLogin={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          onSignUp={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
