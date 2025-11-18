import React, { useState, useEffect } from "react";
import { fetchStats } from "../services/api"; // usamos este de verdad
import StatsCard from "./StatsCard";
import SalesChart from "./SalesChart";
import UsersChart from "./UsersChart";
import AdoptionsChart from "./AdoptionsChart";
import ActivityChart from "./ActivityChart";
import Filters from "./Filters";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    period: "month",
    startDate: "",
    endDate: "",
  });

  // 👇 función interna con otro nombre para no chocar con el import
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔹 OPCIÓN 1: si tu fetchStats acepta filtros como parámetros
      const response = await fetchStats(
        filters.period,
        filters.startDate || null,
        filters.endDate || null
      );

      // 🔹 OPCIÓN 2: si tu fetchStats NO acepta filtros y solo hace GET simple
      // const response = await fetchStats();

      // 👇 Ajusta según lo que devuelva tu API:
      // - si fetchStats devuelve response (axios): response.data.data
      // - si fetchStats devuelve ya data: response.data
      setStats(response.data?.data || response.data || response);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error al cargar el dashboard</h3>
        <p>{error}</p>
        <button
          onClick={loadStats}
          style={{
            background: "#667eea",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h3>No hay datos disponibles</h3>
        <p>No se pudieron cargar las estadísticas del dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "0.5rem",
          }}
        >
          Dashboard Analítico
        </h2>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Análisis completo de usuarios, ventas y actividad del sistema
        </p>
      </div>

      <Filters filters={filters} onFilterChange={handleFilterChange} />

      {/* Cards de estadísticas */}
      <div className="dashboard-grid">
        <StatsCard
          title="Total Usuarios"
          value={stats.statistics?.users?.total_users || 0}
          change="+12%"
          changeType="positive"
          icon="👥"
          color="#3b82f6"
        />

        <StatsCard
          title="Usuarios Activos"
          value={stats.statistics?.users?.active_users || 0}
          change="+8%"
          changeType="positive"
          icon="✅"
          color="#10b981"
        />

        <StatsCard
          title="Ventas Totales"
          value={`${
            stats.statistics?.sales?.total_revenue?.toLocaleString() || 0
          }`}
          change="+23%"
          changeType="positive"
          icon="💰"
          color="#f59e0b"
        />

        <StatsCard
          title="Adopciones"
          value={stats.statistics?.adoptions?.total_adoptions || 0}
          change="+15%"
          changeType="positive"
          icon="🐕"
          color="#8b5cf6"
        />
      </div>

      {/* Gráficos */}
      <div className="dashboard-grid" style={{ marginTop: "2rem" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas Mensuales</h3>
            <div
              className="card-icon"
              style={{ background: "#fef3c7", color: "#f59e0b" }}
            >
              📈
            </div>
          </div>
          <div className="chart-container">
            <SalesChart data={stats.charts_data?.monthly_sales || []} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Usuarios Activos</h3>
            <div
              className="card-icon"
              style={{ background: "#dbeafe", color: "#3b82f6" }}
            >
              👤
            </div>
          </div>
          <div className="chart-container">
            <UsersChart data={stats.charts_data?.daily_users || []} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: "2rem" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ventas por Categoría</h3>
            <div
              className="card-icon"
              style={{ background: "#f3e8ff", color: "#8b5cf6" }}
            >
              🎯
            </div>
          </div>
          <div className="chart-container">
            <ActivityChart data={stats.charts_data?.category_sales || []} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Adopciones por Tipo</h3>
            <div
              className="card-icon"
              style={{ background: "#fef2f2", color: "#ef4444" }}
            >
              🐾
            </div>
          </div>
          <div className="chart-container">
            <AdoptionsChart data={stats.charts_data?.adoption_types || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
