import React from 'react';

const Filters = ({ filters, onFilterChange }) => {
  const handlePeriodChange = (e) => {
    onFilterChange({ period: e.target.value });
  };

  const handleDateChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label className="filter-label">Período</label>
        <select 
          className="filter-select"
          value={filters.period}
          onChange={handlePeriodChange}
        >
          <option value="all">Todos los datos</option>
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
          <option value="custom">Rango personalizado</option>
        </select>
      </div>

      {filters.period === 'custom' && (
        <>
          <div className="filter-group">
            <label className="filter-label">Fecha inicio</label>
            <input
              type="date"
              className="filter-input"
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Fecha fin</label>
            <input
              type="date"
              className="filter-input"
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="filter-group">
        <button
          onClick={() => onFilterChange({ 
            period: 'month', 
            startDate: '', 
            endDate: '' 
          })}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Resetear filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;
