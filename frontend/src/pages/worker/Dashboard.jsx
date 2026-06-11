import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/layout/MobileLayout';
import { useApp } from '../../context/AppContext';
import { workerNavItems } from '../../data/navItems';
import * as api from '../../services/api';
import $ from '../../config/strings';
import { Users, AlertTriangle, ShieldAlert, CheckCircle, Sparkles, RefreshCw, ArrowRight, Activity } from 'lucide-react';

export default function WorkerDashboard() {
  const { currentUser, locale } = useApp();
  const [patients, setPatients] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatients();
      setPatients(data);
      setLoading(false);
    };
    load();
  }, []);

  const highRisk = (patients || []).filter(
    (p) => p.risk_level === 'high',
  ).length;
  const total = (patients || []).length;

  const summaryText = loading
    ? $('W_DASH_LOADING', locale)
    : `${$('W_DASH_SUMMARY_A', locale)} ${total} ${$('W_DASH_SUMMARY_B', locale)} ${highRisk} ${highRisk === 1 ? $('W_DASH_HIGH_RISK_CASE', locale) : $('W_DASH_HIGH_RISK_CASES', locale)}`;

  const nameParts = currentUser?.name ? currentUser.name.split(' ') : ['Health', 'Worker'];
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <MobileLayout
      title={$('W_PAGE_TITLE_DASHBOARD', locale)}
      navItems={workerNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Greeting Card */}
        <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: 'clamp(16px, 5vw, 32px)' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
            {$('W_DASH_GREETING_PREFIX', locale)}
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em', color: 'var(--color-text)', lineHeight: 1.2 }}>
            {firstName} {lastName && <span className="italic text-gradient-primary" style={{ fontWeight: '500' }}>{lastName}</span>}
          </h2>
          <p className="muted" style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{summaryText}</p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid rgba(249, 115, 22, 0.25)', backgroundColor: 'rgba(249, 115, 22, 0.08)', color: '#f97316', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '16px' }}>
            <Activity className="h-3.5 w-3.5" strokeWidth={2.5} style={{ animation: 'pulse 1.5s infinite' }} />
            <span>{$('W_DASH_ON_DUTY', locale)}</span>
          </div>
        </div>

        {/* Vitals Summary Statistics */}
        <section>
          <h3 className="font-display" style={{ fontSize: '1.45rem', marginBottom: '16px', fontWeight: '700' }}>{$('W_DASH_KPI_HEADING', locale)}</h3>
          <div className="detail-cards-grid">
            
            {/* Total Patients */}
            <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.01)', minHeight: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="detail-card-label" style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  {$('W_DASH_KPI_TOTAL', locale)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(219, 39, 119, 0.08)', color: 'var(--color-primary)' }}>
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="font-display" style={{ fontSize: '2.8rem', fontWeight: '700', color: 'var(--color-primary)', margin: '12px 0 0 0', lineHeight: 1 }}>
                {loading ? '—' : total}
              </p>
            </div>

            {/* High Risk */}
            <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.01)', minHeight: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="detail-card-label" style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  {$('W_DASH_KPI_HIGH', locale)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)' }}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className="font-display" style={{ fontSize: '2.8rem', fontWeight: '700', color: 'var(--color-danger)', margin: '12px 0 0 0', lineHeight: 1 }}>
                {loading ? '—' : highRisk}
              </p>
            </div>

            {/* Moderate Risk */}
            <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.01)', minHeight: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="detail-card-label" style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  {$('W_DASH_KPI_MODERATE', locale)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(249, 115, 22, 0.08)', color: 'var(--color-warning)' }}>
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <p className="font-display" style={{ fontSize: '2.8rem', fontWeight: '700', color: 'var(--color-warning)', margin: '12px 0 0 0', lineHeight: 1 }}>
                {loading ? '—' : (patients || []).filter((p) => p.risk_level === 'moderate').length}
              </p>
            </div>

            {/* Low Risk */}
            <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.01)', minHeight: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="detail-card-label" style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  {$('W_DASH_KPI_LOW', locale)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)' }}>
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <p className="font-display" style={{ fontSize: '2.8rem', fontWeight: '700', color: 'var(--color-success)', margin: '12px 0 0 0', lineHeight: 1 }}>
                {loading ? '—' : (patients || []).filter((p) => p.risk_level === 'low').length}
              </p>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="font-display" style={{ fontSize: '1.45rem', marginBottom: '16px', fontWeight: '700' }}>{$('W_DASH_SECTION_QUICK', locale)}</h3>
          <div className="grid two" style={{ gap: '16px' }}>
            
            {/* Patients List */}
            <Link className="action-card" to="/worker/patients" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', minHeight: '160px', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(219, 39, 119, 0.08)', color: 'var(--color-primary)' }}>
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px', color: 'var(--color-muted)' }} />
              </div>
              <div style={{ marginTop: '16px' }}>
                <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                  {$('W_DASH_QUICK_PATIENTS', locale)}
                </h4>
                <p className="muted" style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.4' }}>
                  {$('W_DASH_QUICK_PATIENTS_DESC', locale)}
                </p>
              </div>
            </Link>

            {/* AI Risk Analysis */}
            <Link className="action-card" to="/worker/ai-analysis" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', minHeight: '160px', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(219, 39, 119, 0.08)', color: 'var(--color-primary)' }}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px', color: 'var(--color-muted)' }} />
              </div>
              <div style={{ marginTop: '16px' }}>
                <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                  {$('W_DASH_QUICK_AI', locale)}
                </h4>
                <p className="muted" style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.4' }}>
                  {$('W_DASH_QUICK_AI_DESC', locale)}
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* High Risk Patients */}
        <section className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px', borderLeft: '4px solid var(--color-danger)', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.45rem', margin: 0, fontWeight: '700' }}>{$('W_DASH_SECTION_HIGH_RISK', locale)}</h3>
            <span className="badge badge--high" style={{ padding: '6px 14px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {highRisk} {$('W_DASH_HIGH_RISK_SUFFIX', locale)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <p className="muted text-center" style={{ padding: '24px 0', animation: 'pulse 2s infinite' }}>
                {$('W_DASH_LOADING_LIST', locale)}
              </p>
            ) : (
              (patients || []).flatMap((patient) =>
                patient.risk_level === 'high'
                  ? [
                      <div key={patient.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', transition: 'all 0.2s' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--color-text)', fontWeight: '600' }}>{patient.name}</strong>
                          <p className="muted" style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-muted)' }}>
                            {$('W_PATIENTS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'} &middot;{' '}
                            {patient.village || $('W_PATIENTS_UNKNOWN', locale)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="badge badge--high" style={{ fontWeight: '700', fontSize: '11px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)' }}>
                            {((patient.risk_score || 0) * 100).toFixed(0)}%
                          </span>
                          <Link
                            className="btn btn--secondary"
                            to={`/worker/patient/${patient.id}`}
                            style={{ borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', textDecoration: 'none', transition: 'all 0.2s' }}
                          >
                            {$('W_DASH_VIEW_BTN', locale)}
                          </Link>
                        </div>
                      </div>,
                    ]
                  : [],
              )
            )}
            {!loading && highRisk === 0 && (
              <p className="muted text-center" style={{ padding: '24px 0' }}>
                {$('W_DASH_NO_HIGH_RISK', locale)}
              </p>
            )}
          </div>
        </section>

      </div>
    </MobileLayout>
  );
}
