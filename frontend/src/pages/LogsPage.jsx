// frontend/src/pages/LogsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchLogs } from '../services/api';
import { SkeletonTableRows } from '../components/Skeleton';

const levelMap = {
  error:   { cls: 'badge-red',   label: 'Error'   },
  warning: { cls: 'badge-amber', label: 'Warning' },
  info:    { cls: 'badge-blue',  label: 'Info'    },
  debug:   { cls: 'badge-green', label: 'Debug'   },
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
      setLogs(Array.isArray(result) ? result : result?.logs ?? []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <h2>Logs del sistema</h2>
        <p>Registro de actividad y eventos</p>
      </div>

      <div className="filters">
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

      {error ? (
        <div className="error-message"><p>{error}</p>
          <button onClick={load} className="btn-primary" style={{ marginTop: '0.75rem' }}>Reintentar</button>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-header">
            <h3>Eventos del sistema</h3>
            <span className="badge badge-gray">{logs.length} eventos</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Tipo', 'Mensaje', 'Usuario', 'IP', 'Fecha'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonTableRows rows={10} cols={5} /> :
                  logs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay logs disponibles
                    </td></tr>
                  ) : logs.map((log, i) => {
                    const lvl = levelMap[log.type?.toLowerCase()] ?? { cls: 'badge-gray', label: log.type };
                    return (
                      <tr key={i}>
                        <td><span className={`badge ${lvl.cls}`}>{lvl.label}</span></td>
                        <td style={{ maxWidth: '380px', color: 'var(--text-primary)' }}>{log.message ?? log.action ?? '—'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{log.user_id ?? '—'}</td>
                        <td><span className="mono" style={{ color: 'var(--text-secondary)' }}>{log.ip_address ?? '—'}</span></td>
                        <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString('es-ES') : '—'}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          <div className="table-footer">{logs.length} eventos registrados</div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
