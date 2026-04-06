// frontend/src/components/StatsCard.js
import React from 'react';

const StatsCard = ({ title, value, change, changeType, icon, color }) => {
  return (
    <div className="card stats-card" style={{ color }}>
      <div className="card-header">
        <span className="card-title" style={{ color: 'var(--text-secondary)' }}>{title}</span>
        <div className="card-icon" style={{ background: `${color}18` }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        </div>
      </div>

      <div className="stat-value" style={{ color }}>
        {value}
      </div>

      <div className="stat-label" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>

      {change != null && (
        <div className={`stat-change ${changeType ?? 'neutral'}`}>
          {changeType === 'positive' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          )}
          {changeType === 'negative' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
          <span>{change} vs período anterior</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
