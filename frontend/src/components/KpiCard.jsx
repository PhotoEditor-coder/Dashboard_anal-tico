// frontend/src/components/KpiCard.jsx
import React from "react";

const KpiCard = ({ label, value, subtitle }) => {
  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <h2 className="kpi-value">{value}</h2>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
    </div>
  );
};

export default KpiCard;
