import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome to Todoist</h1>
          <div className="user-info">
            <span>Hello, {user?.first_name || user?.username}!</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Dashboard</h2>
            <p>You are now logged in successfully!</p>
            <div className="user-details">
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              {user?.first_name && (
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;