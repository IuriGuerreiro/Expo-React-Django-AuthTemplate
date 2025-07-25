import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

import AuthScreen from './components/Auth/AuthScreen';
import Dashboard from './components/Dashboard/Dashboard';
import EmailVerification from './components/Auth/EmailVerification';
import './App.css';

// Email verification wrapper to get token from route params
const EmailVerificationWrapper: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  return <EmailVerification token={token || ''} />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return (
    <Routes>
      <Route path="/" element={<AuthScreen />} />
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/register" element={<AuthScreen />} />
      <Route path="/forgot-password" element={<AuthScreen />} />
      <Route path="/reset-password/:token" element={<AuthScreen />} />
      <Route path="/verify-email/:token" element={<EmailVerificationWrapper />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
