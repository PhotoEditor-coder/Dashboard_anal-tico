import React from 'react';

const Header = ({ onMenuClick, sidebarOpen }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1>📊 Dashboard Analítico</h1>
      </div>
      
      <div className="header-controls">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#10b981' 
          }}></div>
          <span style={{ fontSize: '0.875rem' }}>Sistema Activo</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
