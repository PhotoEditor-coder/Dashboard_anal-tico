// frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { fetchStats }        from '../services/api';
import { SkeletonDashboard } from './Skeleton';
import StatsCard             from './StatsCard';
import SalesChart            from './SalesChart';
import UsersChart            from './UsersChart';
import ActivityChart         from './ActivityChart';
import AdoptionsChart        from './AdoptionsChart';
import Filters               from './Filters';

const Dashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({ period: 'month' });

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchStats(filters.period);
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters.period]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleFilterChange = (newFilters) =>
    setFilters(prev => ({ ...prev, ...newFilters }));

  const fmt    = (v)  => v >= 0 ? `+${v}%` : `${v}%`;
  const ctype  = (v)  => v == null ? 'neutral' : v >= 0 ? 'positive' : 'negative';

  // ── Skeleton mientras carga ──────────────────────────────────
  if (loading) return <SkeletonDashboard />;

  // ── Error ────────────────────────────────────────────────────
  if (error) return (
    <div className="error-message">
      <h3>Error al cargar el dashboard</h3>
      <p>{error}</p>
      <button onClick={loadStats} className="btn-primary" style={{ marginTop: '1rem' }}>
        Reintentar
      </button>
    </div>
  );

  if (!data) return null;

  const { kpis = {}, charts = {} } = data;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard Analítico</h2>
        <p>Análisis completo de usuarios, ventas y actividad del sistema</p>
      </div>

      <Filters filters={filters} onFilterChange={handleFilterChange} />

      {/* ── KPIs ──────────────────────────────────────────────── */}
      <div className="dashboard-grid">
        <StatsCard
          title="Ingresos Totales"
          value={`$${(kpis.totalRevenue ?? 0).toLocaleString('es-ES')}`}
          change={kpis.changes?.revenue != null ? fmt(kpis.changes.revenue) : null}
          changeType={ctype(kpis.changes?.revenue)}
          icon="💰"
          color="var(--amber)"
        />
        <StatsCard
          title="Pedidos"
          value={kpis.totalOrders ?? 0}
          change={kpis.changes?.orders != null ? fmt(kpis.changes.orders) : null}
          changeType={ctype(kpis.changes?.orders)}
          icon="🛒"
          color="var(--green)"
        />
        <StatsCard
          title="Total Usuarios"
          value={kpis.totalUsers ?? 0}
          change={null}
          icon="👥"
          color="var(--blue)"
        />
        <StatsCard
          title="Usuarios Activos"
          value={kpis.activeUsers ?? 0}
          change={kpis.changes?.activeUsers != null ? fmt(kpis.changes.activeUsers) : null}
          changeType={ctype(kpis.changes?.activeUsers)}
          icon="✅"
          color="var(--purple)"
        />
      </div>

      {/* ── Gráficos fila 1 ───────────────────────────────────── */}
      <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas Mensuales</h3>
            <div className="card-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>📈</div>
          </div>
          <div className="chart-container">
            <SalesChart data={charts.monthlySales ?? []} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ingresos por Día</h3>
            <div className="card-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>📊</div>
          </div>
          <div className="chart-container">
            <UsersChart
              data={(charts.revenueByDay ?? []).map(d => ({
                date: d.date,
                active_users: parseFloat(d.revenue) || 0,
              }))}
              label="Ingresos ($)"
              color="#3b82f6"
            />
          </div>
        </div>
      </div>

      {/* ── Gráficos fila 2 ───────────────────────────────────── */}
      <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top 5 Productos</h3>
            <div className="card-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>🎯</div>
          </div>
          <div className="chart-container">
            <ActivityChart
              data={(charts.topProducts ?? []).map(p => ({
                category: p.name,
                revenue:  parseFloat(p.total_revenue) || 0,
              }))}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Eventos por Tipo</h3>
            <div className="card-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>📋</div>
          </div>
          <div className="chart-container">
            <AdoptionsChart
              data={(charts.eventsByType ?? []).map(e => ({
                pet_type:       e.type,
                adoption_count: parseInt(e.total, 10) || 0,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
