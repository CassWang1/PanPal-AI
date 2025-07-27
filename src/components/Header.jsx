import React from 'react';
import './Header.css';
import logo from '../assets/images/logo.png';

function Header({ username, isAdmin, onLogout, currentView, onNavigate, VIEWS, PATHS }) {
  const displayName = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User';
  
  const handleNavClick = (view) => {
    if (currentView !== view) {
      onNavigate(view);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="app-title">
          <img src={logo} alt="PanPal AI Logo" className="header-logo" />
          <h1>PanPal AI</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li className={currentView === VIEWS.INGREDIENTS ? 'active' : ''}>
              <button onClick={() => handleNavClick(VIEWS.INGREDIENTS)}>
                My Ingredients
              </button>
            </li>
            <li className={currentView === VIEWS.SAVED_RECIPES ? 'active' : ''}>
              <button onClick={() => handleNavClick(VIEWS.SAVED_RECIPES)}>
                Saved Recipes
              </button>
            </li>
            <li className={currentView === VIEWS.COMMUNITY ? 'active' : ''}>
              <button onClick={() => handleNavClick(VIEWS.COMMUNITY)}>
                Community
              </button>
            </li>
            {isAdmin && (
              <li className={currentView === VIEWS.ADMIN ? 'active' : ''}>
                <button onClick={() => handleNavClick(VIEWS.ADMIN)}>
                  Admin Dashboard
                </button>
              </li>
            )}
          </ul>
        </nav>
        <div className="user-section">
          <span className="username">Hello, {displayName}</span>
          <button onClick={onLogout} className="logout-button">Log Out</button>
        </div>
      </div>
    </header>
  );
}

export default Header; 