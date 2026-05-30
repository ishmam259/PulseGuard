import { Doughnut } from 'react-chartjs-2'
import { useLocale } from '../../context/LocaleContext'

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
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
}

export default function RiskDistributionChart({ distributionData }) {
  const { t } = useLocale()
  const values = distributionData || [47, 62, 248]

  const data = {
    labels: [t('CHART_HIGH_RISK'), t('CHART_MODERATE_RISK'), t('CHART_LOW_RISK')],
    datasets: [
      {
        data: values,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }

  return (
    <div className="chart-container">
      <Doughnut options={options} data={data} />
    </div>
  )
}
