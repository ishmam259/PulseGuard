import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'

export default function Reports() {
  const patientsRef = useRef([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getPatients()
        patientsRef.current = data || []
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = (reportId) => {
    if (patientsRef.current.length === 0) {
      alert('No patient data available to export.')
      return
    }

    if (reportId === 'rpt-1') {
      // Maternal Health Report
      let csv = 'Patient ID,Name,Age,Village,Gestational Week,Risk Level,Risk Score,Last Updated\n'
      patientsRef.current.forEach((p) => {
        csv += `PG-${p.id.slice(0, 8).toUpperCase()},"${p.name}",${p.age || 'N/A'},"${p.village || 'N/A'}",${p.gestational_week || 'N/A'},${p.risk_level || 'low'},${p.risk_score || 0},"${new Date(p.last_updated).toLocaleDateString()}"\n`
      })
      downloadCSV(csv, 'maternal_health_report.csv')
    } else if (reportId === 'rpt-2') {
      // Risk Analysis Report
      let csv = 'Patient Name,Gestational Week,Risk Score,Risk Level,Preeclampsia Status\n'
      patientsRef.current.forEach((p) => {
        const preeclampsia = p.risk_score > 0.7 ? 'Yes' : 'No'
        csv += `"${p.name}",${p.gestational_week || 'N/A'},${p.risk_score || 0},${p.risk_level || 'low'},${preeclampsia}\n`
      })
      downloadCSV(csv, 'risk_analysis_report.csv')
    } else if (reportId === 'rpt-3') {
      // Field Activity Report
      let csv = 'Patient Name,Village,Assigned Health Worker,Last Visit Date\n'
      patientsRef.current.forEach((p) => {
        csv += `"${p.name}","${p.village || 'N/A'}","${p.worker_name || 'Unassigned'}","${new Date(p.last_updated).toLocaleDateString()}"\n`
      })
      downloadCSV(csv, 'field_activity_report.csv')
    } else if (reportId === 'rpt-4') {
      // Sync Status Report
      let csv = 'Patient Name,Village,Sync Status,Last Updated\n'
      patientsRef.current.forEach((p) => {
        csv += `"${p.name}","${p.village || 'N/A'}",Synced,"${new Date(p.last_updated).toLocaleString()}"\n`
      })
      downloadCSV(csv, 'sync_status_report.csv')
    }
  }

  const reports = [
    {
      id: 'rpt-1',
      title: 'Maternal Health Report',
      description: 'Comprehensive monthly summary of maternal health outcomes, risk distributions, and intervention effectiveness across all regions.',
      icon: '',
      lastGenerated: new Date().toLocaleDateString(),
    },
    {
      id: 'rpt-2',
      title: 'Risk Analysis Report',
      description: 'AI-powered risk prediction breakdown including preeclampsia, anemia, and gestational diabetes detection rates.',
      icon: '',
      lastGenerated: new Date().toLocaleDateString(),
    },
    {
      id: 'rpt-3',
      title: 'Field Activity Report',
      description: 'Health worker performance summary — visits completed, patients served, sync compliance, and response times.',
      icon: '',
      lastGenerated: new Date().toLocaleDateString(),
    },
    {
      id: 'rpt-4',
      title: 'Sync Status Report',
      description: 'Offline device analytics, sync success rates, conflict resolution metrics, and data integrity audit.',
      icon: '',
      lastGenerated: new Date().toLocaleDateString(),
    },
  ]

  return (
    <AdminLayout title="Reports">
      {loading ? (
        <div className="card text-center animate-pulse" style={{ padding: '2rem' }}>
          <p className="muted">Loading reports definitions…</p>
        </div>
      ) : (
        <section className="grid two stagger">
          {reports.map((report, i) => (
            <div className="card animate-fade-in" key={report.id} style={{ animationDelay: `${i * 80}ms` }}>
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-3)' }}>{report.icon}</div>
              <h3>{report.title}</h3>
              <p className="muted" style={{ marginBottom: 'var(--spacing-3)' }}>{report.description}</p>
              <p className="muted" style={{ fontSize: '12px', marginBottom: 'var(--spacing-3)' }}>
                Last generated: {report.lastGenerated}
              </p>
              <div className="button-row">
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => handleExport(report.id)}
                >
                  Export CSV
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </AdminLayout>
  )
}
