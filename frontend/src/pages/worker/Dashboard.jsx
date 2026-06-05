import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/layout/MobileLayout';
import { useApp } from '../../context/AppContext';
import { workerNavItems } from '../../data/navItems';
import * as api from '../../services/api';
import $ from '../../config/strings';
import { Users, AlertTriangle, ShieldAlert, CheckCircle, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

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
      banner={{
        tone: 'syncing',
        title: $('W_DASH_BANNER_TITLE', locale),
        message: `${total} ${$('W_DASH_PATIENTS_SUFFIX', locale)}`,
        action: { label: $('W_DASH_BANNER_ACTION', locale), onClick: () => navigate('/worker/sync') },
      }}
      navItems={workerNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Greeting Card */}
        <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
          <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            {$('W_DASH_GREETING_PREFIX', locale)} {firstName} {lastName && <span className="italic text-gradient-primary">{lastName}</span>}
          </h2>
          <p className="muted" style={{ fontSize: '14px', lineHeight: 1.5 }}>{summaryText}</p>
        </div>

        {/* Vitals Summary Statistics */}
        <section>
          <h3 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>{$('W_DASH_KPI_HEADING', locale)}</h3>
          <div className="detail-cards-grid">
            
            {/* Total Patients */}
            <div className="detail-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="detail-card-label">{$('W_DASH_KPI_TOTAL', locale)}</span>
                <span style={{ color: 'var(--color-primary)' }}><Users className="h-5 w-5" /></span>
              </div>
              <p className="detail-card-value--accent" style={{ marginTop: '12px' }}>{loading ? '—' : total}</p>
            </div>

            {/* High Risk */}
            <div className="detail-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="detail-card-label">{$('W_DASH_KPI_HIGH', locale)}</span>
                <span style={{ color: 'var(--color-danger)' }}><AlertTriangle className="h-5 w-5" /></span>
              </div>
              <p className="detail-card-value--accent" style={{ marginTop: '12px', color: 'var(--color-danger)' }}>{loading ? '—' : highRisk}</p>
            </div>

            {/* Moderate Risk */}
            <div className="detail-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="detail-card-label">{$('W_DASH_KPI_MODERATE', locale)}</span>
                <span style={{ color: 'var(--color-warning)' }}><ShieldAlert className="h-5 w-5" /></span>
              </div>
              <p className="detail-card-value--accent" style={{ marginTop: '12px', color: 'var(--color-warning)' }}>
                {loading ? '—' : (patients || []).filter((p) => p.risk_level === 'moderate').length}
              </p>
            </div>

            {/* Low Risk */}
            <div className="detail-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="detail-card-label">{$('W_DASH_KPI_LOW', locale)}</span>
                <span style={{ color: 'var(--color-success)' }}><CheckCircle className="h-5 w-5" /></span>
              </div>
              <p className="detail-card-value--accent" style={{ marginTop: '12px', color: 'var(--color-success)' }}>
                {loading ? '—' : (patients || []).filter((p) => p.risk_level === 'low').length}
              </p>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>{$('W_DASH_SECTION_QUICK', locale)}</h3>
          <div className="grid three" style={{ gap: '16px' }}>
            
            {/* Patients List */}
            <Link className="action-card" to="/worker/patients" style={{ textDecoration: 'none' }}>
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <Users style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginTop: '12px' }}>
                {$('W_DASH_QUICK_PATIENTS', locale)}
              </h4>
            </Link>

            {/* AI Risk Analysis */}
            <Link className="action-card" to="/worker/ai-analysis" style={{ textDecoration: 'none' }}>
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <Sparkles style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginTop: '12px' }}>
                {$('W_DASH_QUICK_AI', locale)}
              </h4>
            </Link>

            {/* Offline Sync */}
            <Link className="action-card" to="/worker/sync" style={{ textDecoration: 'none' }}>
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <RefreshCw style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginTop: '12px' }}>
                {$('W_DASH_QUICK_SYNC', locale)}
              </h4>
            </Link>

          </div>
        </section>

        {/* High Risk Patients */}
        <section className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
          <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.4rem', margin: 0 }}>{$('W_DASH_SECTION_HIGH_RISK', locale)}</h3>
            <span className="badge badge--high" style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
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
                      <div key={patient.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'color-mix(in oklab, var(--color-surface) 50%, transparent)' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--color-text)' }}>{patient.name}</strong>
                          <p className="muted" style={{ fontSize: '12px', marginTop: '4px', margin: '4px 0 0' }}>
                            {$('W_PATIENTS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'} &middot;{' '}
                            {patient.village || $('W_PATIENTS_UNKNOWN', locale)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="badge badge--high" style={{ fontWeight: '700', fontSize: '11px' }}>
                            {((patient.risk_score || 0) * 100).toFixed(0)}%
                          </span>
                          <Link
                            className="btn btn--secondary"
                            to={`/worker/patient/${patient.id}`}
                            style={{ borderRadius: '9999px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', textDecoration: 'none' }}
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
