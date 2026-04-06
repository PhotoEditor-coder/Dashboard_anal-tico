// frontend/src/pages/UsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchUsers }        from '../services/api';
import { SkeletonStatCard, SkeletonTableRows } from '../components/Skeleton';

const activityBadge = {
  recent:   'badge badge-green',
  active:   'badge badge-blue',
  inactive: 'badge badge-gray',
};
const activityLabel = { recent: 'Reciente', active: 'Activo', inactive: 'Inactivo' };

const UsersPage = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({ active: undefined, role: '' });
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchUsers({ active: filters.active, role: filters.role || undefined });
      setData(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const users = (data?.users ?? []).filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = data?.statistics ?? {};

  return (
    <div>
      <div className="page-header">
        <h2>Usuarios</h2>
        <p>Gestión y análisis de la base de usuarios</p>
      </div>

      {/* KPIs */}
      <div className="dashboard-grid">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonStatCard key={i} />)
        ) : (
          <>
            {[
              { label: 'Total',         value: stats.total_users,   color: 'var(--blue)',   icon: '👥' },
              { label: 'Activos',       value: stats.active_users,  color: 'var(--green)',  icon: '✅' },
              { label: 'Últimos 7 días',value: stats.recent_users,  color: 'var(--amber)',  icon: '🕐' },
              { label: 'Admins',        value: stats.admin_users,   color: 'var(--purple)', icon: '🔐' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="card stats-card" style={{ color }}>
                <div className="card-header">
                  <span className="card-title" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <div className="card-icon" style={{ background: `${color}18` }}>{icon}</div>
                </div>
                <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Filters */}
      <div className="filters" style={{ marginTop: '1.5rem' }}>
        <div className="filter-group">
          <label className="filter-label">Buscar</label>
          <div className="search-input-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Nombre o email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <select className="filter-select"
            value={filters.active === undefined ? 'all' : String(filters.active)}
            onChange={e => setFilters(f => ({
              ...f, active: e.target.value === 'all' ? undefined : e.target.value === 'true',
            }))}>
            <option value="all">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Rol</label>
          <select className="filter-select"
            value={filters.role}
            onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="user">Usuario</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={load} className="btn-primary" style={{ marginTop: '0.75rem' }}>Reintentar</button>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-header">
            <h3>Lista de usuarios</h3>
            <span className="badge badge-gray">{users.length} usuarios</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Nombre', 'Email', 'Rol', 'Actividad', 'Último acceso', 'Registrado'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonTableRows rows={8} cols={6} />
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay usuarios que coincidan
                  </td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600' }}>{u.name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={activityBadge[u.activity_status] ?? 'badge badge-gray'}>
                        {activityLabel[u.activity_status] ?? u.activity_status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">Mostrando {users.length} de {data?.pagination?.total ?? 0} usuarios</div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
