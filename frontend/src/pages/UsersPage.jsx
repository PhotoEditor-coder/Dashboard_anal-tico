// frontend/src/pages/UsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchUsers } from '../services/api';

const badge = {
  recent:   { bg: '#dcfce7', color: '#16a34a', label: 'Reciente' },
  active:   { bg: '#dbeafe', color: '#1d4ed8', label: 'Activo'   },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'Inactivo' },
};

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      {/* Cabecera */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Usuarios</h2>
        <p style={{ color: '#64748b' }}>Gestión y análisis de la base de usuarios</p>
      </div>

      {/* KPI mini-cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total',    value: stats.total_users,   color: '#3b82f6' },
          { label: 'Activos',  value: stats.active_users,  color: '#10b981' },
          { label: 'Recientes (7d)', value: stats.recent_users, color: '#f59e0b' },
          { label: 'Admins',   value: stats.admin_users,   color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color }}>{value ?? '—'}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          className="filter-input"
          style={{ minWidth: '240px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <select
            className="filter-select"
            value={filters.active === undefined ? 'all' : filters.active ? 'true' : 'false'}
            onChange={e => setFilters(f => ({
              ...f,
              active: e.target.value === 'all' ? undefined : e.target.value === 'true',
            }))}
          >
            <option value="all">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Rol</label>
          <select
            className="filter-select"
            value={filters.role}
            onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="user">Usuario</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="error-message"><p>{error}</p><button onClick={load} className="btn-primary" style={{ marginTop: '0.75rem' }}>Reintentar</button></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Nombre', 'Email', 'Rol', 'Estado', 'Último acceso', 'Creado'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay usuarios que coincidan con los filtros</td></tr>
                ) : users.map(u => {
                  const b = badge[u.activity_status] ?? badge.inactive;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: '500', color: '#1e293b' }}>{u.name || '—'}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ background: u.role === 'admin' ? '#ede9fe' : '#f1f5f9', color: u.role === 'admin' ? '#7c3aed' : '#64748b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ background: b.bg, color: b.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500' }}>{b.label}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('es-ES') : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem' }}>
            Mostrando {users.length} de {data?.pagination?.total ?? 0} usuarios
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
