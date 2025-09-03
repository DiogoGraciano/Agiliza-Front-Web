import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Manifests from './pages/Manifests';
import Users from './pages/Users';
import Admins from './pages/Admins';
import Services from './pages/Services';
import Categories from './pages/Categories';
import Types from './pages/Types';
import EnterprisePage from './pages/Enterprise';
import Sectors from './pages/Sectors';
import Queues from './pages/Queues';
import Locations from './pages/Locations';
import Desks from './pages/Desks';
import Tickets from './pages/Tickets';
import Displays from './pages/Displays';
import DisplayPreview from './pages/DisplayPreview';
import './App.css';
import Devices from './pages/Devices';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manifests" 
          element={
            <ProtectedRoute>
              <Manifests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admins" 
          element={
            <ProtectedRoute>
              <Admins />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sectors" 
          element={
            <ProtectedRoute>
              <Sectors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/types" 
          element={
            <ProtectedRoute>
              <Types />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/enterprise" 
          element={
            <ProtectedRoute>
              <EnterprisePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/queues" 
          element={
            <ProtectedRoute>
              <Queues />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/locations" 
          element={
            <ProtectedRoute>
              <Locations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/desks" 
          element={
            <ProtectedRoute>
              <Desks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/displays" 
          element={
            <ProtectedRoute>
              <Displays />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/devices" 
          element={
            <ProtectedRoute>
              <Devices />
            </ProtectedRoute>
          } 
        />  
        <Route 
          path="/display/:id/preview" 
          element={<DisplayPreview />} 
        />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
};

// App principal com providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
