// frontend/src/pages/SalesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchSales } from '../services/api';
import SalesChart from '../components/SalesChart';

const SalesPage = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({ period: 'month', startDate: '', endDate: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSales({
        period:    filters.period !== 'custom' ? filters.period : undefined,
        startDate: filters.startDate || undefined,
        endDate:   filters.endDate   || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const stats    = data?.statistics ?? {};
  const sales    = data?.sales      ?? [];
  const monthly  = data?.monthly_data ?? [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Ventas</h2>
        <p style={{ color: '#64748b' }}>Historial y análisis de ventas</p>
      </div>

      {/* KPI mini-cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Ventas totales',     value: stats.total_sales,       fmt: v => v,                               color: '#10b981' },
          { label: 'Ingresos',           value: stats.total_revenue,     fmt: v => `$${parseFloat(v||0).toLocaleString('es-ES')}`, color: '#f59e0b' },
          { label: 'Venta media',        value: stats.average_sale,      fmt: v => `$${parseFloat(v||0).toFixed(2)}`, color: '#3b82f6' },
          { label: 'Clientes únicos',    value: stats.unique_customers,  fmt: v => v,                               color: '#8b5cf6' },
        ].map(({ label, value, fmt, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color }}>{value !== undefined ? fmt(value) : '—'}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-group">
          <label className="filter-label">Período</label>
          <select className="filter-select" value={filters.period}
            onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
            <option value="custom">Rango personalizado</option>
          </select>
        </div>
        {filters.period === 'custom' && (<>
          <div className="filter-group">
            <label className="filter-label">Desde</label>
            <input type="date" className="filter-input" value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="filter-group">
            <label className="filter-label">Hasta</label>
            <input type="date" className="filter-input" value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </>)}
      </div>

      {/* Gráfico mensual */}
      {!loading && monthly.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Evolución de Ventas</h3>
          </div>
          <div className="chart-container"><SalesChart data={monthly} /></div>
        </div>
      )}

      {/* Tabla de ventas */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : error ? (
        <div className="error-message"><p>{error}</p><button onClick={load} className="btn-primary" style={{ marginTop: '0.75rem' }}>Reintentar</button></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Producto', 'Cantidad', 'Precio unitario', 'Total', 'Cliente', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay ventas en este período</td></tr>
                ) : sales.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: '500', color: '#1e293b' }}>{s.product_name}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{s.quantity}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>${parseFloat(s.amount||0).toFixed(2)}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: '600', color: '#10b981' }}>${parseFloat(s.total_amount||0).toLocaleString('es-ES')}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{s.user_email || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{s.sale_date ? new Date(s.sale_date).toLocaleDateString('es-ES') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem' }}>
            Mostrando {sales.length} registros
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
