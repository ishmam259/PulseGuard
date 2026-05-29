import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import RiskTrendChart from '../../components/charts/RiskTrendChart'
import RiskDistributionChart from '../../components/charts/RiskDistributionChart'
import * as api from '../../services/api'

export default function Analytics() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState('All Regions')
  const [riskType, setRiskType] = useState('All Types')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getPatients()
        setPatients(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter patients based on selected filters
  const getFilteredPatients = () => {
    let result = [...(patients || [])]

    if (region !== 'All Regions') {
      result = result.filter(
        (p) => p.village && p.village.toLowerCase().includes(region.toLowerCase())
      )
    }

    return result
  }

  const filteredPatients = getFilteredPatients()

  // Calculate risk distribution
  const highCount = filteredPatients.filter((p) => p.risk_level === 'high').length
  const moderateCount = filteredPatients.filter((p) => p.risk_level === 'moderate').length
  const lowCount = filteredPatients.filter((p) => p.risk_level === 'low').length

  const distributionData = [highCount, moderateCount, lowCount]

  // Get distinct list of villages/regions for filter dropdown
  const getRegionsList = () => {
    const list = new Set()
    patients.forEach((p) => {
      if (p.village) {
        // Assume first word is region or use full village name
        const match = p.village.match(/^(\w+)/)
        if (match) list.add(match[1])
      }
    })
    return Array.from(list)
  }

  const regionsList = getRegionsList()

  return (
    <AdminLayout title="AI Analytics">
      {/* Filters */}
      <section className="filters animate-fade-in" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          Region
          <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="All Regions">All Regions</option>
            {regionsList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          Risk Condition
          <select className="input" value={riskType} onChange={(e) => setRiskType(e.target.value)}>
            <option value="All Types">All Conditions</option>
            <option value="Preeclampsia">Preeclampsia</option>
            <option value="Anemia">Anemia</option>
            <option value="Gestational Diabetes">Gestational Diabetes</option>
          </select>
        </label>
      </section>

      {loading ? (
        <div className="card text-center animate-pulse" style={{ padding: '2rem' }}>
          <p className="muted">Loading analytical datasets…</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <section className="grid two" style={{ marginBottom: 'var(--spacing-5)' }}>
            <div className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
              <h3>Risk Distribution</h3>
              <RiskDistributionChart distributionData={distributionData} />
            </div>
            <div className="card animate-fade-in" style={{ animationDelay: '160ms' }}>
              <h3>Risk Trends Over Time</h3>
              <RiskTrendChart />
            </div>
          </section>

          {/* AI Model Performance */}
          <section className="card animate-fade-in" style={{ animationDelay: '240ms', marginBottom: 'var(--spacing-5)' }}>
            <h3>AI Model Performance</h3>
            <p className="muted" style={{ marginBottom: 'var(--spacing-4)' }}>
              XGBoost risk prediction model, last updated May 25, 2026
            </p>
            <div className="summary-grid">
              <div className="kpi-card">
                <span className="muted">Accuracy</span>
                <span className="kpi" style={{ color: 'var(--color-success)' }}>94.2%</span>
              </div>
              <div className="kpi-card">
                <span className="muted">Precision</span>
                <span className="kpi" style={{ color: 'var(--color-success)' }}>91.8%</span>
              </div>
              <div className="kpi-card">
                <span className="muted">Recall</span>
                <span className="kpi" style={{ color: 'var(--color-primary)' }}>89.5%</span>
              </div>
              <div className="kpi-card">
                <span className="muted">F1 Score</span>
                <span className="kpi" style={{ color: 'var(--color-primary)' }}>90.6%</span>
              </div>
            </div>
          </section>

          {/* Risk Breakdown */}
          <section className="card animate-fade-in" style={{ animationDelay: '320ms' }}>
            <h3>Prediction Breakdown</h3>
            <div className="list stagger" style={{ marginTop: '1rem' }}>
              <div className="list-item">
                <div>
                  <strong>Preeclampsia Risk</strong>
                  <p className="muted">{highCount} critical cases currently monitored</p>
                </div>
                <span className="badge badge--high">Critical</span>
              </div>
              <div className="list-item">
                <div>
                  <strong>Moderate Risk Cases</strong>
                  <p className="muted">{moderateCount} patients requiring routine follow-ups</p>
                </div>
                <span className="badge badge--moderate">Moderate</span>
              </div>
              <div className="list-item">
                <div>
                  <strong>Low Risk Cases</strong>
                  <p className="muted">{lowCount} patients within normal thresholds</p>
                </div>
                <span className="badge badge--online">Normal</span>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  )
}
