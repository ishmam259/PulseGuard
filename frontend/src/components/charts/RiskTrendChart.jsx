import { Line } from 'react-chartjs-2'
import { riskTrendData as defaultData } from '../../data/mockData'
import { useLocale } from '../../context/LocaleContext'

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

export default function RiskTrendChart({ trendData }) {
  const { t } = useLocale()
  const source = trendData || defaultData

  const data = {
    labels: source.labels,
    datasets: [
      {
        label: t('CHART_HIGH_RISK'),
        data: source.high,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t('CHART_MODERATE_RISK'),
        data: source.moderate,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t('CHART_LOW_RISK'),
        data: source.low,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  return (
    <div className="chart-container">
      <Line options={options} data={data} />
    </div>
  )
}
