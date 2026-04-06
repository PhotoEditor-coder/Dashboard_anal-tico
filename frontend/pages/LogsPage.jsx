// frontend/src/pages/LogsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchLogs } from '../services/api';

const levelColors = {
  error:   { bg: '#fef2f2', color: '#dc2626' },
  warning: { bg: '#fffbeb', color: '#d97706' },
  info:    { bg: '#eff6ff', color: '#2563eb' },
  debug:   { bg: '#f0fdf4', color: '#16a34a' },
};

const LogsPage = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [type,    setType]    = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLogs({ limit: 200, type: type || undefined });
      // logs.php puede devolver { logs: [...] } o un array directo
      setLogs(Array.isArray(result) ? result : result?.logs ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Logs del sistema</h2>
        <p style={{ color: '#64748b' }}>Registro de actividad y eventos</p>
      </div>

      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-group">
          <label className="filter-label">Tipo de evento</label>
          <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="">Todos</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>

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
                  {['Tipo', 'Mensaje', 'Usuario', 'IP', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay logs disponibles</td></tr>
                ) : logs.map((log, i) => {
                  const lvl = levelColors[log.type?.toLowerCase()] ?? levelColors.info;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ background: lvl.bg, color: lvl.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {log.type ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#1e293b', maxWidth: '400px' }}>{log.message ?? log.action ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{log.user_id ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ip_address ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString('es-ES') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem' }}>
            {logs.length} eventos
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
