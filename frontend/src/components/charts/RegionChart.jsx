import { Bar } from 'react-chartjs-2'
import { regionData as defaultData } from '../../data/mockData'

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: '#64748b' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: '#64748b' },
    },
  },
}

export default function RegionChart({ regionInfo }) {
  const source = regionInfo || defaultData

  const data = {
    labels: source.labels,
    datasets: [
      {
        label: 'Total Patients',
        data: source.patients,
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(20, 184, 166, 0.65)',
          'rgba(20, 184, 166, 0.5)',
          'rgba(20, 184, 166, 0.4)',
          'rgba(20, 184, 166, 0.3)',
        ],
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'High Risk',
        data: source.highRisk,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="chart-container">
      <Bar options={options} data={data} />
    </div>
  )
}
