// frontend/src/components/Skeleton.js
import React from 'react';

// ── KPI card skeleton ──────────────────────────────────────────
export const SkeletonStatCard = () => (
  <div className="card skeleton-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div className="skeleton skeleton-title" style={{ marginBottom: 0 }} />
      <div className="skeleton skeleton-icon" />
    </div>
    <div className="skeleton skeleton-number" />
    <div className="skeleton skeleton-label" />
    <div className="skeleton skeleton-badge" />
  </div>
);

// ── Chart card skeleton ────────────────────────────────────────
export const SkeletonChartCard = ({ tall = false }) => (
  <div className="card skeleton-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div className="skeleton skeleton-chart-title" style={{ marginBottom: 0 }} />
      <div className="skeleton skeleton-icon" />
    </div>
    <div className={`skeleton skeleton-chart${tall ? ' tall' : ''}`} />
  </div>
);

// ── Table rows skeleton ────────────────────────────────────────
export const SkeletonTableRows = ({ rows = 6, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={{ padding: '0.875rem 1.25rem' }}>
            <div
              className="skeleton"
              style={{
                height: '12px',
                width: j === 0 ? '70%' : j === cols - 1 ? '50%' : '80%',
              }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── Full dashboard skeleton (4 KPI + 2 charts) ────────────────
export const SkeletonDashboard = () => (
  <div>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
      <div className="skeleton" style={{ height: '28px', width: '220px', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '14px', width: '340px' }} />
    </div>

    {/* Filters bar */}
    <div className="card" style={{ marginBottom: '1.75rem', display: 'flex', gap: '1rem', padding: '1.125rem 1.25rem' }}>
      <div className="skeleton" style={{ height: '36px', width: '160px', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '36px', width: '100px', borderRadius: '8px' }} />
    </div>

    {/* KPI cards */}
    <div className="dashboard-grid">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>

    {/* Charts row */}
    <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
      <SkeletonChartCard />
      <SkeletonChartCard />
    </div>
    <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
      <SkeletonChartCard />
      <SkeletonChartCard />
    </div>
  </div>
);
