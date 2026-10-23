import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-canvas"><div className="animate-pulse"><Logo /></div></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
