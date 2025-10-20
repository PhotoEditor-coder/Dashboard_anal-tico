import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="loading-text">Cargando Dashboard...</div>
      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.875rem', 
        opacity: 0.8 
      }}>
        Preparando datos analíticos
      </div>
    </div>
  );
};

export default LoadingSpinner;
