import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

const QUICK_AMOUNTS = [250, 350, 500, 1000]
const SEVERITY_KEYS = ['WELLNESS_VOMIT_MILD', 'WELLNESS_VOMIT_MODERATE', 'WELLNESS_VOMIT_SEVERE']

export default function Wellness() {
  const { connectivity, locale } = useApp()
  const TABS = ['Water', 'Vomit']

  const [activeTab, setActiveTab] = useState('Water')
  const [loading, setLoading] = useState(true)
  const [water, setWater] = useState({ total_ml: 0, goal_ml: 2000, entries: [], dehydration_risk: false, hydration_pct: 0 })
  const [vomit, setVomit] = useState({ count: 0, entries: [], excessive_vomiting: false })
  const [trend, setTrend] = useState([])

  // Vomit log form state
  const [showVomitForm, setShowVomitForm] = useState(false)
  const [vSeverity, setVSeverity] = useState(1)
  const [vKeptFood, setVKeptFood] = useState(false)
  const [vNotes, setVNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [customMl, setCustomMl] = useState('')

  const patientId = localStorage.getItem('pg_wellness_pid') // cache patient id

  async function loadData() {
    try {
      const [daily, weekTrend] = await Promise.all([
        api.getWellnessDaily(),
        api.getWaterWeekTrend(),
      ])
      if (daily) {
        setWater(daily.water)
        setVomit(daily.vomit)
      }
      if (weekTrend) setTrend(weekTrend)
    } catch (err) {
      console.error('Wellness load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Hydration reminder: after 14:00, if < 30% of goal
  const showReminder = !loading && new Date().getHours() >= 14 && water.hydration_pct < 30

  async function handleAddWater(ml) {
    if (connectivity === 'offline') {
      const queue = JSON.parse(localStorage.getItem('pg_offline_queue:v1') || '[]')
      // Need patient_id — best effort from last loaded data or skip with note
      queue.push({ type: 'water', patient_id: null, data: { amount_ml: ml }, local_timestamp: new Date().toISOString() })
      localStorage.setItem('pg_offline_queue:v1', JSON.stringify(queue))
      setWater(prev => ({ ...prev, total_ml: prev.total_ml + ml, hydration_pct: Math.min(100, Math.round(((prev.total_ml + ml) / prev.goal_ml) * 100)) }))
      return
    }
    const res = await api.logWater(ml)
    if (res.ok) loadData()
  }

  async function handleUndoWater(id) {
    const res = await api.deleteWaterEntry(id)
    if (res.ok) loadData()
  }

  async function handleSaveVomit() {
    setSaving(true)
    if (connectivity === 'offline') {
      const queue = JSON.parse(localStorage.getItem('pg_offline_queue:v1') || '[]')
      queue.push({ type: 'vomit', patient_id: null, data: { severity: vSeverity, kept_food: vKeptFood, notes: vNotes || null }, local_timestamp: new Date().toISOString() })
      localStorage.setItem('pg_offline_queue:v1', JSON.stringify(queue))
      setVomit(prev => ({ ...prev, count: prev.count + 1 }))
      setShowVomitForm(false)
      resetVomitForm()
      setSaving(false)
      return
    }
    const res = await api.logVomit({ severity: vSeverity, kept_food: vKeptFood, notes: vNotes || null })
    setSaving(false)
    if (res.ok) {
      setShowVomitForm(false)
      resetVomitForm()
      loadData()
    }
  }

  async function handleUndoVomit(id) {
    const res = await api.deleteVomitEntry(id)
    if (res.ok) loadData()
  }

  function resetVomitForm() {
    setVSeverity(1)
    setVKeptFood(false)
    setVNotes('')
  }

  const severityLabel = (n) => $('WELLNESS_VOMIT_' + ['MILD', 'MODERATE', 'SEVERE'][n - 1], locale)
  const severityColor = (n) => n === 3 ? '#ef4444' : n === 2 ? '#f59e0b' : '#10b981'

  const fmtN = (n) => locale === 'bn' ? n.toLocaleString('bn-BD') : String(n)

  const tabLabels = {
    Water: () => $('WELLNESS_TAB_WATER', locale),
    Vomit: () => $('WELLNESS_TAB_VOMIT', locale),
  }

  return (
    <MobileLayout
      title={$('PAGE_TITLE_WELLNESS', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">{$('WELLNESS_LOADING', locale)}</p>
          </div>
        ) : (
          <>
            {/* Alerts */}
            {water.dehydration_risk && (
              <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#ef4444' }}>⚠ {$('WELLNESS_DEHYDRATION_WARNING', locale)}</strong>
              </div>
            )}
            {vomit.excessive_vomiting && !water.dehydration_risk && (
              <div className="alert-panel" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.4)', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#f59e0b' }}>⚠ {$('WELLNESS_EXCESSIVE_VOMITING', locale)}</strong>
              </div>
            )}
            {showReminder && (
              <div className="alert-panel" style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.3)', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: '#3b82f6' }}>💧 {$('WELLNESS_REMINDER', locale)}</strong>
              </div>
            )}

            {/* Tab switcher */}
            <div className="card animate-fade-in">
              <div className="tabs">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className={`tab${activeTab === tab ? ' active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                  >
                    {tabLabels[tab]()}
                  </button>
                ))}
              </div>

              {/* ── Water Tab ── */}
              {activeTab === 'Water' && (
                <div className="animate-fade-in">
                  {/* KPI row */}
                  <div className="card-row" style={{ marginTop: '1rem' }}>
                    <div>
                      <p className="muted">{$('WELLNESS_WATER_TOTAL', locale)}</p>
                      <div className="kpi" style={{ color: water.hydration_pct >= 80 ? '#10b981' : water.hydration_pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {fmtN(water.total_ml)} <span style={{ fontSize: '1rem', fontWeight: 400 }}>{$('WELLNESS_WATER_ML_SUFFIX', locale)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="muted">{$('WELLNESS_WATER_GOAL', locale)}</p>
                      <strong style={{ fontSize: '1.1rem' }}>{fmtN(water.goal_ml)} {$('WELLNESS_WATER_ML_SUFFIX', locale)}</strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="progress" style={{ marginTop: '0.75rem' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${water.hydration_pct}%`,
                        background: water.hydration_pct >= 80
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : water.hydration_pct >= 40
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)',
                      }}
                    />
                  </div>
                  <p className="muted" style={{ fontSize: '11px', marginTop: '4px', textAlign: 'right' }}>{fmtN(water.hydration_pct)}%</p>

                  {/* Quick-add buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {QUICK_AMOUNTS.map(ml => (
                      <button
                        key={ml}
                        type="button"
                        className="btn btn--secondary"
                        style={{ flex: 1, minWidth: '60px', fontSize: '0.85rem', padding: '8px 4px' }}
                        onClick={() => handleAddWater(ml)}
                      >
                        +{ml >= 1000 ? '1L' : `${fmtN(ml)}ml`}
                      </button>
                    ))}
                  </div>

                  {/* Manual amount input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const val = parseInt(customMl, 10)
                      if (!isNaN(val) && val >= 100 && val <= 2000) {
                        handleAddWater(val)
                        setCustomMl('')
                      }
                    }}
                    style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}
                  >
                    <input
                      type="number"
                      className="input"
                      placeholder="Enter ml (100–2000)"
                      min={100}
                      max={2000}
                      value={customMl}
                      onChange={(e) => setCustomMl(e.target.value)}
                      style={{ flex: 1, MozAppearance: 'textfield' }}
                      onWheel={(e) => e.target.blur()}
                    />
                    <button
                      type="submit"
                      className="btn btn--primary"
                      disabled={!customMl || parseInt(customMl, 10) < 100 || parseInt(customMl, 10) > 2000}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      + Add
                    </button>
                  </form>

                  {/* Today's log */}
                  <div style={{ marginTop: '1.25rem' }}>
                    {water.entries.length === 0 ? (
                      <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{$('WELLNESS_WATER_EMPTY', locale)}</p>
                    ) : (
                      <div className="list stagger">
                        {[...water.entries].reverse().map((e, i) => (
                          <div className="list-item" key={e.id || i}>
                            <div>
                              <strong>{fmtN(e.amount_ml)} {$('WELLNESS_WATER_ML_SUFFIX', locale)}</strong>
                              <p className="muted">{new Date(e.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <button type="button" className="btn btn--ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleUndoWater(e.id)}>
                              {$('WELLNESS_WATER_UNDO', locale)}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 7-day trend */}
                  {trend.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <p className="muted" style={{ fontSize: '12px', marginBottom: '0.5rem' }}>{$('WELLNESS_WATER_TREND', locale)}</p>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px' }}>
                        {trend.map((day, i) => {
                          const pct = Math.min(100, Math.round((day.total_ml / day.goal_ml) * 100))
                          const isToday = i === trend.length - 1
                          return (
                            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <div style={{
                                width: '100%',
                                height: `${Math.max(4, (pct / 100) * 48)}px`,
                                borderRadius: '3px 3px 0 0',
                                background: isToday
                                  ? 'var(--gradient-primary)'
                                  : pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : 'rgba(239,68,68,0.5)',
                              }} />
                              <span style={{ fontSize: '9px', color: 'var(--color-muted)' }}>
                                {new Date(day.date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'narrow' })}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Vomit Tab ── */}
              {activeTab === 'Vomit' && (
                <div className="animate-fade-in">
                  {/* KPI */}
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p className="muted">{$('WELLNESS_VOMIT_COUNT', locale)}</p>
                    <div className="kpi" style={{ color: vomit.count >= 5 ? '#ef4444' : vomit.count >= 3 ? '#f59e0b' : 'var(--color-text)' }}>
                      {fmtN(vomit.count)}
                    </div>
                    {vomit.excessive_vomiting && (
                      <span className="badge badge--high" style={{ marginTop: '0.25rem' }}>{$('WELLNESS_EXCESSIVE_BADGE', locale)}</span>
                    )}
                  </div>

                  {/* Log episode button / inline form */}
                  {!showVomitForm ? (
                    <button
                      type="button"
                      className="btn btn--primary"
                      style={{ width: '100%', marginTop: '1rem' }}
                      onClick={() => setShowVomitForm(true)}
                    >
                      + {$('WELLNESS_VOMIT_LOG', locale)}
                    </button>
                  ) : (
                    <div className="card" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-surface)' }}>
                      {/* Severity selector */}
                      <p className="muted" style={{ fontSize: '12px', marginBottom: '0.5rem' }}>{$('WELLNESS_VOMIT_SEVERITY', locale)}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {[1, 2, 3].map(n => (
                          <button
                            key={n}
                            type="button"
                            className={`btn${vSeverity === n ? ' btn--primary' : ' btn--secondary'}`}
                            style={{ flex: 1, fontSize: '0.8rem', padding: '6px 4px', border: vSeverity === n ? 'none' : `2px solid ${severityColor(n)}`, color: vSeverity === n ? undefined : severityColor(n) }}
                            onClick={() => setVSeverity(n)}
                          >
                            {severityLabel(n)}
                          </button>
                        ))}
                      </div>

                      {/* Kept food toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={vKeptFood} onChange={e => setVKeptFood(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                        {$('WELLNESS_VOMIT_KEPT_FOOD', locale)}
                      </label>

                      {/* Notes */}
                      <label style={{ fontSize: '0.85rem' }}>
                        {$('WELLNESS_VOMIT_NOTES', locale)}
                        <div className="input-wrapper" style={{ marginTop: '4px' }}>
                          <input
                            type="text"
                            className="input"
                            value={vNotes}
                            onChange={e => setVNotes(e.target.value)}
                            placeholder={$('WELLNESS_VOMIT_NOTES_PH', locale)}
                          />
                        </div>
                      </label>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={handleSaveVomit} disabled={saving}>
                          {saving ? '…' : $('WELLNESS_VOMIT_SAVE', locale)}
                        </button>
                        <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={() => { setShowVomitForm(false); resetVomitForm() }}>
                          {$('WELLNESS_VOMIT_CANCEL', locale)}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Today's vomit log */}
                  <div style={{ marginTop: '1.25rem' }}>
                    {vomit.entries.length === 0 ? (
                      <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{$('WELLNESS_VOMIT_EMPTY', locale)}</p>
                    ) : (
                      <div className="list stagger">
                        {[...vomit.entries].reverse().map((e, i) => (
                          <div className="list-item" key={e.id || i}>
                            <div>
                              <strong style={{ color: severityColor(e.severity) }}>{severityLabel(e.severity)}</strong>
                              <p className="muted">
                                {new Date(e.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                                {e.kept_food ? ' · ✓ kept food' : ' · ✗ did not keep food'}
                              </p>
                              {e.notes && <p className="muted" style={{ fontSize: '11px' }}>{e.notes}</p>}
                            </div>
                            <button type="button" className="btn btn--ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleUndoVomit(e.id)}>
                              {$('WELLNESS_VOMIT_UNDO', locale)}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
