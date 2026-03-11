import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Home from './pages/Home';

// Lazy-load heavy pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('sington_admin_token');
  return token ? children : <Navigate to="/sington-cms-portal" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/sington-cms-portal" element={<AdminLogin />} />
          <Route
            path="/sington-cms-portal/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
