import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleOAuth from './GoogleOAuth';
import ErrorMessage from './ErrorMessage';
import './Auth.css';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await login(email, password);
      // Success - will redirect automatically via AuthContext
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.log('Login error caught:', errorMessage); // Temporary debug
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <div className="auth-form">
          {error && <ErrorMessage message={error} onClose={() => setError('')} />}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>

          <button 
            type="button" 
            className="auth-button" 
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <GoogleOAuth onError={setError} />

        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-button" 
              onClick={onSwitchToRegister}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;