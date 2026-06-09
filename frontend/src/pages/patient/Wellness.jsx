import { useState, useEffect, useCallback } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import { Droplets, Plus, ShieldAlert, Check } from 'lucide-react'

const QUICK_AMOUNTS = [250, 350, 500, 1000]

export default function Wellness() {
  const { connectivity, locale } = useApp()
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

  const loadData = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    let active = true
    api.getWellnessDaily().then((daily) => {
      if (!active) return
      if (daily) {
        setWater(daily.water)
        setVomit(daily.vomit)
      }
      return api.getWaterWeekTrend()
    }).then((weekTrend) => {
      if (!active) return
      if (weekTrend) setTrend(weekTrend)
      setLoading(false)
    }).catch((err) => {
      console.error('Wellness load error:', err)
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  // Hydration reminder: after 14:00, if < 30% of goal
  const showReminder = !loading && new Date().getHours() >= 14 && water.hydration_pct < 30

  async function handleAddWater(ml) {
    if (connectivity === 'offline') {
      const queue = JSON.parse(localStorage.getItem('pg_offline_queue:v1') || '[]')
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
  
  const severityColor = (n) => {
    if (n === 3) return 'oklch(0.6 0.22 27)'
    if (n === 2) return 'oklch(0.72 0.16 50)'
    return 'oklch(0.62 0.17 150)'
  }

  const fmtN = (n) => locale === 'bn' ? n.toLocaleString('bn-BD') : String(n)

  const t = (en, bn) => (locale === 'en' ? en : bn)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_WELLNESS', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <p className="muted animate-pulse">{$('WELLNESS_LOADING', locale)}</p>
          </div>
        ) : (
          <>
            {/* Alerts & Warnings Panel */}
            {water.dehydration_risk && (
              <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert className="h-5 w-5" style={{ color: '#ef4444' }} />
                <strong style={{ color: '#ef4444' }}>{$('WELLNESS_DEHYDRATION_WARNING', locale)}</strong>
              </div>
            )}
            {vomit.excessive_vomiting && !water.dehydration_risk && (
              <div className="alert-panel" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert className="h-5 w-5" style={{ color: '#f59e0b' }} />
                <strong style={{ color: '#f59e0b' }}>{$('WELLNESS_EXCESSIVE_VOMITING', locale)}</strong>
              </div>
            )}
            {showReminder && (
              <div className="alert-panel" style={{ background: 'var(--color-primary-dim)', borderColor: 'var(--color-primary-glow)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplets className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <strong style={{ color: 'var(--color-primary)' }}>{$('WELLNESS_REMINDER', locale)}</strong>
              </div>
            )}

            {/* Wellness Container Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              
              {/* Tab Switcher Capsule */}
              <div className="tabs-capsule">
                {['Water', 'Vomit'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActiveTab(k)}
                    className={`tab-capsule-btn ${activeTab === k ? 'active' : ''}`}
                  >
                    {k === 'Water' ? $('WELLNESS_TAB_WATER', locale) : $('WELLNESS_TAB_VOMIT', locale)}
                  </button>
                ))}
              </div>

              {/* ── Water Tab ── */}
              {activeTab === 'Water' && (
                <div className="animate-fade-in">
                  
                  {/* KPI Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>
                        {$('WELLNESS_WATER_TOTAL', locale)}
                      </p>
                      <p className="kpi" style={{ fontSize: '3rem', marginTop: '0.25rem', fontFamily: 'var(--font-display)', background: 'none', webkitTextFillColor: 'initial', color: 'var(--color-primary)' }}>
                        {fmtN(water.total_ml)}
                        <span className="muted" style={{ fontSize: '1rem', marginLeft: '4px', fontFamily: 'var(--font-display)' }}>{$('WELLNESS_WATER_ML_SUFFIX', locale)}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>
                        {$('WELLNESS_WATER_GOAL', locale)}
                      </p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
                        {fmtN(water.goal_ml)} {$('WELLNESS_WATER_ML_SUFFIX', locale)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress" style={{ marginTop: '1rem' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${water.hydration_pct}%`,
                        background: 'var(--color-primary)'
                      }}
                    />
                  </div>
                  <p className="muted" style={{ textAlign: 'right', marginTop: '4px', fontSize: '11px', fontWeight: '600' }}>
                    {fmtN(water.hydration_pct)}%
                  </p>

                  {/* Quick add grid */}
                  <div className="grid four" style={{ marginTop: '1.5rem' }}>
                    {QUICK_AMOUNTS.map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => handleAddWater(ml)}
                        className="btn btn--secondary"
                        style={{ padding: '12px 6px', fontSize: '0.85rem' }}
                      >
                        +{ml >= 1000 ? '1L' : `${fmtN(ml)}ml`}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const val = parseInt(customMl, 10)
                      if (!isNaN(val) && val >= 100 && val <= 2000) {
                        handleAddWater(val)
                        setCustomMl('')
                      }
                    }}
                    style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}
                  >
                    <input
                      type="number"
                      value={customMl}
                      onChange={(e) => setCustomMl(e.target.value)}
                      placeholder={t('Enter ml (100–2000)', 'ml লিখুন (১০০–২০০০)')}
                      min={100}
                      max={2000}
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      disabled={!customMl || parseInt(customMl, 10) < 100 || parseInt(customMl, 10) > 2000}
                      className="btn btn--primary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Plus style={{ height: '16px', width: '16px', marginRight: '4px' }} />
                      <span>{$('WELLNESS_WATER_ADD_BTN', locale) || t('Add', 'যোগ')}</span>
                    </button>
                  </form>

                  {/* Today's log list */}
                  {water.entries.length === 0 ? (
                    <p className="muted" style={{ textAlign: 'center', margin: '2rem 0' }}>{$('WELLNESS_WATER_EMPTY', locale)}</p>
                  ) : (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '1rem' }}>{t("Today's Entries", "আজকের ভুক্তিসমূহ")}</p>
                      <div className="list stagger">
                        {[...water.entries].reverse().map((e, i) => (
                          <div key={e.id || i} className="list-item">
                            <div>
                              <strong>{fmtN(e.amount_ml)} {$('WELLNESS_WATER_ML_SUFFIX', locale)}</strong>
                              <p className="muted" style={{ fontSize: '10px', marginTop: '2px' }}>
                                {new Date(e.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleUndoWater(e.id)}
                              className="btn btn--ghost"
                              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            >
                              {$('WELLNESS_WATER_UNDO', locale)}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7-day trend chart */}
                  {trend.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <p className="muted" style={{ fontSize: '12px', fontWeight: '600' }}>{$('WELLNESS_WATER_TREND', locale)}</p>
                      <div className="trend-graph">
                        {trend.map((day, i) => {
                          const pct = Math.min(100, Math.round((day.total_ml / day.goal_ml) * 100))
                          const isToday = i === trend.length - 1
                          const barH = Math.max(4, Math.round((pct / 100) * 50))
                          return (
                            <div key={day.date} className="trend-col">
                              <div className="trend-bar-wrapper">
                                <div
                                  className={`trend-bar ${isToday ? 'today' : ''}`}
                                  style={{
                                    height: `${barH}px`,
                                    background: isToday
                                      ? undefined
                                      : pct >= 80 ? 'oklch(0.62 0.17 150)' : pct >= 40 ? 'oklch(0.72 0.16 50)' : 'var(--color-primary-dim)',
                                  }}
                                />
                              </div>
                              <span className="trend-label">
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
                  
                  {/* KPI Count */}
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      {$('WELLNESS_VOMIT_COUNT', locale)}
                    </p>
                    <p 
                      className="kpi" 
                      style={{ 
                        fontSize: '4.5rem', 
                        marginTop: '0.5rem',
                        fontWeight: '800',
                        color: vomit.count >= 5 ? 'oklch(0.6 0.22 27)' : vomit.count >= 3 ? 'oklch(0.72 0.16 50)' : 'var(--color-text)',
                        background: 'none',
                        webkitTextFillColor: 'initial'
                      }}
                    >
                      {fmtN(vomit.count)}
                    </p>
                    {vomit.excessive_vomiting && (
                      <span className="badge badge--high" style={{ marginTop: '0.5rem' }}>
                        {$('WELLNESS_EXCESSIVE_BADGE', locale)}
                      </span>
                    )}
                  </div>

                  {/* Add Vomit Button */}
                  {!showVomitForm ? (
                    <button
                      type="button"
                      onClick={() => setShowVomitForm(true)}
                      className="btn btn--primary"
                      style={{ width: '100%', marginTop: '1rem' }}
                    >
                      <Plus style={{ height: '16px', width: '16px' }} />
                      <span>{$('WELLNESS_VOMIT_LOG', locale)}</span>
                    </button>
                  ) : (
                    /* inline form card */
                    <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--color-surface-elevated)' }}>
                      
                      {/* Severity Selector */}
                      <div>
                        <p className="muted" style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>
                          {$('WELLNESS_VOMIT_SEVERITY', locale)}
                        </p>
                        <div className="severity-row">
                          {[1, 2, 3].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setVSeverity(n)}
                              className="severity-btn"
                              style={{
                                border: vSeverity === n ? 'none' : `2px solid ${severityColor(n)}`,
                                color: vSeverity === n ? '#ffffff' : severityColor(n),
                                backgroundColor: vSeverity === n ? severityColor(n) : 'transparent',
                              }}
                            >
                              {vSeverity === n && <Check className="h-3.5 w-3.5" />}
                              {severityLabel(n)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kept Food Toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1.25rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={vKeptFood} 
                          onChange={(e) => setVKeptFood(e.target.checked)} 
                          style={{ height: '18px', width: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                          {$('WELLNESS_VOMIT_KEPT_FOOD', locale)}
                        </span>
                      </label>

                      {/* Notes input */}
                      <div style={{ marginTop: '1.25rem' }}>
                        <label className="muted" style={{ fontSize: '11px', fontWeight: '600' }}>
                          {$('WELLNESS_VOMIT_NOTES', locale)}
                        </label>
                        <div className="input-wrapper" style={{ marginTop: '6px' }}>
                          <input
                            type="text"
                            value={vNotes}
                            onChange={(e) => setVNotes(e.target.value)}
                            placeholder={$('WELLNESS_VOMIT_NOTES_PH', locale)}
                            className="input"
                          />
                        </div>
                      </div>

                      {/* Save / Cancel buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
                        <button
                          type="button"
                          onClick={handleSaveVomit}
                          disabled={saving}
                          className="btn btn--primary"
                          style={{ flex: 1 }}
                        >
                          <span>{saving ? '…' : $('WELLNESS_VOMIT_SAVE', locale)}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowVomitForm(false); resetVomitForm() }}
                          className="btn btn--secondary"
                          style={{ flex: 1 }}
                        >
                          {$('WELLNESS_VOMIT_CANCEL', locale)}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Today's vomit log list */}
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '1rem' }}>{t("Today's Episodes", "আজকের এপিসোডসমূহ")}</p>
                    {vomit.entries.length === 0 ? (
                      <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>{$('WELLNESS_VOMIT_EMPTY', locale)}</p>
                    ) : (
                      <div className="list stagger">
                        {[...vomit.entries].reverse().map((e, i) => (
                          <div key={e.id || i} className="list-item" style={{ alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <strong style={{ color: severityColor(e.severity) }}>
                                {severityLabel(e.severity)}
                              </strong>
                              <p className="muted" style={{ fontSize: '11px' }}>
                                {new Date(e.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                                {' · '}
                                <span style={{ color: e.kept_food ? 'var(--color-success)' : 'var(--color-danger-light)' }}>
                                  {e.kept_food ? t('kept food', 'খাবার ধরে রেখেছে') : t('did not keep food', 'খাবার ধরে রাখতে পারেনি')}
                                </span>
                              </p>
                              {e.notes && (
                                <p className="muted" style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>
                                  {e.notes}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUndoVomit(e.id)}
                              className="btn btn--ghost"
                              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            >
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
