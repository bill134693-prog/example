import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

function App() {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <Router>
      <div className="app">
        <nav className="app-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <span className="brand-icon">📋</span>
              <span className="brand-text">민원분류</span>
            </div>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveNav('home')}
                >
                  민원 접수
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveNav('dashboard')}
                >
                  대시보드
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 민원 자동분류 시스템 | AI 기반 지능형 민원 처리</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
