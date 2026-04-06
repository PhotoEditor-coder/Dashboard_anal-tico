// frontend/src/pages/SalesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchSales } from '../services/api';
import { SkeletonStatCard, SkeletonChartCard, SkeletonTableRows } from '../components/Skeleton';
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const stats   = data?.statistics  ?? {};
  const sales   = data?.sales       ?? [];
  const monthly = data?.monthly_data ?? [];

  return (
    <div>
      <div className="page-header">
        <h2>Ventas</h2>
        <p>Historial y análisis de ventas</p>
      </div>

      {/* KPIs */}
      <div className="dashboard-grid">
        {loading ? [1,2,3,4].map(i => <SkeletonStatCard key={i} />) : (
          <>
            {[
              { label: 'Ventas totales',  value: stats.total_sales,      fmt: v => v,                                                color: 'var(--green)',  icon: '🛒' },
              { label: 'Ingresos',        value: stats.total_revenue,    fmt: v => `$${parseFloat(v||0).toLocaleString('es-ES')}`,   color: 'var(--amber)',  icon: '💰' },
              { label: 'Ticket medio',    value: stats.average_sale,     fmt: v => `$${parseFloat(v||0).toFixed(2)}`,                color: 'var(--blue)',   icon: '📊' },
              { label: 'Clientes únicos', value: stats.unique_customers, fmt: v => v,                                                color: 'var(--purple)', icon: '👤' },
            ].map(({ label, value, fmt, color, icon }) => (
              <div key={label} className="card stats-card" style={{ color }}>
                <div className="card-header">
                  <span className="card-title" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <div className="card-icon" style={{ background: `${color}18` }}>{icon}</div>
                </div>
                <div className="stat-value" style={{ color }}>{value !== undefined ? fmt(value) : '—'}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Filtros */}
      <div className="filters" style={{ marginTop: '1.5rem' }}>
        <div className="filter-group">
          <label className="filter-label">Período</label>
          <select className="filter-select" value={filters.period}
            onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
            <option value="custom">Personalizado</option>
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

      {/* Gráfico */}
      {loading ? (
        <SkeletonChartCard />
      ) : monthly.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Evolución de Ventas</h3>
            <div className="card-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>📈</div>
          </div>
          <div className="chart-container"><SalesChart data={monthly} /></div>
        </div>
      )}

      {/* Tabla */}
      {error ? (
        <div className="error-message"><p>{error}</p>
          <button onClick={load} className="btn-primary" style={{ marginTop: '0.75rem' }}>Reintentar</button>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-header">
            <h3>Detalle de ventas</h3>
            <span className="badge badge-gray">{sales.length} registros</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Producto', 'Cantidad', 'Precio unit.', 'Total', 'Cliente', 'Fecha'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonTableRows rows={8} cols={6} /> :
                  sales.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Sin ventas en este período
                    </td></tr>
                  ) : sales.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.product_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.quantity}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>${parseFloat(s.amount||0).toFixed(2)}</td>
                      <td style={{ fontWeight: '700', color: 'var(--green)' }}>${parseFloat(s.total_amount||0).toLocaleString('es-ES')}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.user_email || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {s.sale_date ? new Date(s.sale_date).toLocaleDateString('es-ES') : '—'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="table-footer">Mostrando {sales.length} registros</div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
