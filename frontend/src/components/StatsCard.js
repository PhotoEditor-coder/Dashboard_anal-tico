import React from 'react';

const StatsCard = ({ title, value, change, changeType, icon, color }) => {
  return (
    <div className="card stats-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <div 
          className="card-icon" 
          style={{ 
            background: `${color}20`, 
            color: color,
            fontSize: '1.5rem'
          }}
        >
          {icon}
        </div>
      </div>
      
      <div className="stat-value" style={{ color: color }}>
        {value}
      </div>
      
      <div className="stat-label">
        {title.toLowerCase()}
      </div>
      
      {change && (
        <div className={`stat-change ${changeType}`}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            {changeType === 'positive' ? (
              <g>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </g>
            ) : (
              <g>
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </g>
            )}
          </svg>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
