// frontend/src/pages/AdoptionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import AdoptionsChart from '../components/AdoptionsChart';

const AdoptionsPage = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Usamos el endpoint de stats para obtener adoption_types
      const response = await api.get('/stats.php', { params: { period: 'year' } });
      const result   = response.data?.data ?? response.data;
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar adopciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const eventsByType = data?.charts?.eventsByType ?? [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Adopciones</h2>
        <p style={{ color: '#64748b' }}>Estadísticas de adopciones por tipo de evento</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : error ? (
        <div className="error-message"><p>{error}</p><button onClick={load} className="btn-primary" style={{ marginTop: '0.75rem' }}>Reintentar</button></div>
      ) : (
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Distribución por Tipo</h3>
              <div className="card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>🐾</div>
            </div>
            <div className="chart-container" style={{ height: '360px' }}>
              <AdoptionsChart
                data={eventsByType.map(e => ({
                  pet_type:       e.type,
                  adoption_count: parseInt(e.total, 10) || 0,
                }))}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Resumen por tipo</h3>
            </div>
            <div>
              {eventsByType.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Sin datos disponibles</p>
              ) : eventsByType.map(e => (
                <div key={e.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#374151', fontWeight: '500' }}>{e.type}</span>
                  <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '0.2rem 0.75rem', borderRadius: '999px', fontWeight: '600', fontSize: '0.875rem' }}>
                    {e.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdoptionsPage;
