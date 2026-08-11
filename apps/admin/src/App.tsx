import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LicensesPage from './pages/LicensesPage';
import ActivationsPage from './pages/ActivationsPage';
import AuditLogPage from './pages/AuditLogPage';
import { AuthProvider, useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoutes() {
  return (
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/licenses"
        element={
          <ProtectedRoute>
            <LicensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activations"
        element={
          <ProtectedRoute>
            <ActivationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <AdminRoutes />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
