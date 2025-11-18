// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { fetchStats } from "../services/api";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchStats();
        if (!res.success) {
          throw new Error("Error fetching stats");
        }
        setStats(res.data);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p>{error}</p>;
  if (!stats) return <p>Sin datos disponibles.</p>;

  const { kpis, charts } = stats;

  // Line chart: revenue by day
  const revenueLabels = charts.revenueByDay.map((d) => d.date);
  const revenueValues = charts.revenueByDay.map((d) => parseFloat(d.revenue));

  const revenueData = {
    labels: revenueLabels,
    datasets: [
      {
        label: "Ingresos diarios (€)",
        data: revenueValues,
        tension: 0.3,
      },
    ],
  };

  // Bar chart: top products
  const productLabels = charts.topProducts.map((p) => p.name);
  const productValues = charts.topProducts.map((p) =>
    parseFloat(p.total_revenue)
  );

  const productsData = {
    labels: productLabels,
    datasets: [
      {
        label: "Ingresos por producto (€)",
        data: productValues,
      },
    ],
  };

  // Pie-like data (usando Bar) para eventos por tipo
  const eventLabels = charts.eventsByType.map((e) => e.type);
  const eventValues = charts.eventsByType.map((e) => parseInt(e.total, 10));

  const eventsData = {
    labels: eventLabels,
    datasets: [
      {
        label: "Eventos",
        data: eventValues,
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="kpi-grid">
        <KpiCard
          label="Ingresos totales"
          value={kpis.totalRevenue.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
          subtitle="Órdenes completadas"
        />
        <KpiCard
          label="Órdenes completadas"
          value={kpis.totalOrders}
          subtitle="Histórico"
        />
        <KpiCard
          label="Usuarios registrados"
          value={kpis.totalUsers}
          subtitle="Base total"
        />
        <KpiCard
          label="Usuarios activos (30 días)"
          value={kpis.activeUsers}
          subtitle="Último mes"
        />
      </div>

      <div className="chart-grid">
        <ChartCard title="Ingresos diarios (últimos 90 días)">
          <Line data={revenueData} />
        </ChartCard>

        <ChartCard title="Top productos por ingresos">
          <Bar data={productsData} />
        </ChartCard>

        <ChartCard title="Actividad por tipo de evento">
          <Bar data={eventsData} />
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
