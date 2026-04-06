// frontend/src/components/Header.js
import React from 'react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <button className="menu-button" onClick={onMenuClick} aria-label="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="header-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>

        <h1>Dashboard Analítico</h1>
      </div>

      <div className="header-right">
        <div className="status-badge">
          <div className="status-dot" />
          Sistema Activo
        </div>
      </div>
    </header>
  );
};

export default Header;
