import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdoptionsChart = ({ data }) => {
  const colors = [
    '#8b5cf6', // Púrpura para perros
    '#f59e0b', // Naranja para gatos
    '#10b981', // Verde para otros
    '#ef4444', // Rojo para otros
  ];

  const chartData = {
    labels: data.map(item => {
      // Traducir tipos de mascotas
      const translations = {
        'Perro': 'Perros',
        'Gato': 'Gatos',
        'Conejo': 'Conejos',
        'Ave': 'Aves'
      };
      return translations[item.pet_type] || item.pet_type;
    }),
    datasets: [
      {
        data: data.map(item => item.adoption_count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color),
        borderWidth: 3,
        hoverBackgroundColor: colors.slice(0, data.length).map(color => color + 'CC'),
        hoverBorderColor: colors.slice(0, data.length),
        hoverBorderWidth: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label}: ${value} adopciones (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} adopciones (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 3
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#64748b',
        fontSize: '0.875rem'
      }}>
        No hay datos de adopciones disponibles
      </div>
    );
  }

  return <Pie data={chartData} options={options} />;
};

export default AdoptionsChart;
