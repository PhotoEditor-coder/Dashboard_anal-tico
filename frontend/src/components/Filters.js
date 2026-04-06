// frontend/src/components/Filters.js
import React from 'react';

const Filters = ({ filters, onFilterChange }) => (
  <div className="filters">
    <div className="filter-group">
      <label className="filter-label">Período</label>
      <select
        className="filter-select"
        value={filters.period}
        onChange={e => onFilterChange({ period: e.target.value })}
      >
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
          <label className="filter-label">Desde</label>
          <input
            type="date"
            className="filter-input"
            value={filters.startDate ?? ''}
            onChange={e => onFilterChange({ startDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Hasta</label>
          <input
            type="date"
            className="filter-input"
            value={filters.endDate ?? ''}
            onChange={e => onFilterChange({ endDate: e.target.value })}
          />
        </div>
      </>
    )}

    <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
      <label className="filter-label" style={{ opacity: 0 }}>_</label>
      <button
        className="btn-ghost"
        onClick={() => onFilterChange({ period: 'month', startDate: '', endDate: '' })}
      >
        Resetear
      </button>
    </div>
  </div>
);

export default Filters;
