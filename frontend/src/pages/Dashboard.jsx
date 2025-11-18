const loadStats = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await fetchStats(filters.period); // "week" | "month" | "year"
    setStats(data);

  } catch (err) {
    console.error("Error fetching stats:", err);
    setError("Error al cargar los datos del dashboard");
  } finally {
    setLoading(false);
  }
};
