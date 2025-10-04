import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/Expenses';
import ExpenseDetail from './pages/Expenses/ExpenseDetail';
import CreateExpense from './pages/Expenses/CreateExpense';
import Approvals from './pages/Approvals/Approvals';
import Users from './pages/Users/Users';
import UserDetail from './pages/Users/UserDetail';
import Notifications from './pages/Notifications/Notifications';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';

// Simple Error Boundary to catch render errors and show a helpful message
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in component tree:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred while rendering the app. The error details are shown below — please share them if you need help.</p>
            <pre className="text-xs bg-background p-3 rounded overflow-auto">{this.state.error?.toString()}</pre>
            <details className="mt-3 text-xs text-muted-foreground">
              <summary>Component stack</summary>
              <pre className="whitespace-pre-wrap">{this.state.info?.componentStack}</pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// App Content Component (to use hooks inside Provider)
const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const tokenDebug = localStorage.getItem('token');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Load user on app start
    dispatch(loadUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Debug panel to help diagnose blank-screen issues locally
  const DebugPanel = () => {
    if (process.env.NODE_ENV === 'production') return null;
    return (
      <div style={{position: 'fixed', right: 12, bottom: 12, zIndex: 9999}}>
        <div className="bg-card p-2 rounded shadow text-xs text-foreground">
          <div><strong>Auth</strong></div>
          <div>isAuthenticated: <strong>{String(isAuthenticated)}</strong></div>
          <div>loading: <strong>{String(loading)}</strong></div>
          <div>token: <strong style={{wordBreak: 'break-all', maxWidth: 240}}>{tokenDebug ? 'present' : 'missing'}</strong></div>
          <div>theme: <strong>{theme}</strong></div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <DebugPanel />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/forgot-password" 
            element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/reset-password/:token" 
            element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Expense Routes */}
            <Route path="expenses" element={<Expenses />} />
            <Route path="expenses/create" element={<CreateExpense />} />
            <Route path="expenses/:id" element={<ExpenseDetail />} />
            
            {/* Approval Routes */}
            <Route path="approvals" element={<Approvals />} />
            
            {/* User Management Routes (Admin only) */}
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            
            {/* Other Routes */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'hsl(var(--destructive-foreground))',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

// Main App Component
const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;

