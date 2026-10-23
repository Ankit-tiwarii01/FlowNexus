import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/Spinner';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

const EditorPage = lazy(() => import('./pages/EditorPage').then((module) => ({ default: module.EditorPage })));

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/workflows" element={<DashboardPage />} />
        <Route path="/workflows/:workflowId" element={<Suspense fallback={<div className="grid min-h-screen place-items-center bg-canvas"><Spinner className="h-7 w-7 text-brand-600" /></div>}><EditorPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/workflows" replace />} />
    </Routes>
  );
}
