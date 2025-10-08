import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Auth from './pages/Auth';
import Index from './pages/Index';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect Supabase recovery tokens in URL and ensure we stay on /auth
  const searchParams = new URLSearchParams(location.search);
  const hash = location.hash?.startsWith('#') ? location.hash.slice(1) : '';
  const hashParams = new URLSearchParams(hash);
  const isRecovery =
    searchParams.get('mode') === 'update-password' ||
    searchParams.get('type') === 'recovery' ||
    hashParams.get('type') === 'recovery' ||
    ((searchParams.get('access_token') && searchParams.get('refresh_token')) ||
      (hashParams.get('access_token') && hashParams.get('refresh_token')));

  // If recovery tokens are present on a non-auth route, redirect to /auth preserving tokens
  if (isRecovery && location.pathname !== '/auth') {
    navigate(`/auth${location.search}${location.hash}`, { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route 
          path="/auth" 
          element={isRecovery ? <Auth /> : (user ? <Navigate to="/" replace /> : <Auth />)} 
        />
        <Route 
          path="/" 
          element={user ? <Index /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={user ? "/" : "/auth"} replace />} 
        />
      </Routes>
    </TooltipProvider>
  );
}

export default App;
