import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/layout/MobileLayout';
import { useApp } from '../../context/AppContext';
import { workerNavItems } from '../../data/navItems';
import * as api from '../../services/api';
import $ from '../../config/strings';

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
      {/* ── KPI Section ── */}
      <section
        className="animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
        }}
      >
        <div className="card greeting-card">
          <h2>{$('W_DASH_GREETING_PREFIX', locale)} {currentUser?.name || $('W_DASH_GREETING_DEFAULT', locale)}</h2>
          <p className="muted">{summaryText}</p>
        </div>

        <h3>{$('W_DASH_KPI_HEADING', locale)}</h3>
        <div className="kpi-row">
          <div className="stat-card bg-appointments">
            <div className="stat-card-header">
              <img
                src="/assets/icons/appointments.svg"
                alt="appointments"
                className="stat-card-icon"
              />
              <h2 className="stat-card-count">{loading ? '—' : total}</h2>
            </div>
            <p className="stat-card-label">{$('W_DASH_KPI_TOTAL', locale)}</p>
          </div>

          <div className="stat-card bg-pending">
            <div className="stat-card-header">
              <img
                src="/assets/icons/pending.svg"
                alt="pending"
                className="stat-card-icon"
              />
              <h2 className="stat-card-count">{loading ? '—' : highRisk}</h2>
            </div>
            <p className="stat-card-label">{$('W_DASH_KPI_HIGH', locale)}</p>
          </div>

          <div className="stat-card bg-cancelled">
            <div className="stat-card-header">
              <img
                src="/assets/icons/cancelled.svg"
                alt="cancelled"
                className="stat-card-icon"
              />
              <h2 className="stat-card-count">
                {loading
                  ? '—'
                  : (patients || []).filter((p) => p.risk_level === 'moderate')
                      .length}
              </h2>
            </div>
            <p className="stat-card-label">{$('W_DASH_KPI_MODERATE', locale)}</p>
          </div>

          <div
            className="stat-card bg-appointments"
            style={{ borderBottomColor: '#24AE7C' }}
          >
            <div className="stat-card-header">
              <img
                src="/assets/icons/check-circle.svg"
                alt="low risk"
                className="stat-card-icon"
              />
              <h2 className="stat-card-count">
                {loading
                  ? '—'
                  : (patients || []).filter((p) => p.risk_level === 'low')
                      .length}
              </h2>
            </div>
            <p className="stat-card-label">{$('W_DASH_KPI_LOW', locale)}</p>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="animate-fade-in">
        <div className="section-header">
          <h3>{$('W_DASH_SECTION_QUICK', locale)}</h3>
        </div>
        <div className="grid three">
          <Link className="card action-card" to="/worker/patients">
            {$('W_DASH_QUICK_PATIENTS', locale)}
          </Link>
          <Link className="card action-card" to="/worker/ai-analysis">
            {$('W_DASH_QUICK_AI', locale)}
          </Link>
          <Link className="card action-card" to="/worker/sync">
            {$('W_DASH_QUICK_SYNC', locale)}
          </Link>
        </div>
      </section>

      {/* ── High Risk Patients ── */}
      <section className="card animate-fade-in">
        <div className="section-header">
          <h3>{$('W_DASH_SECTION_HIGH_RISK', locale)}</h3>
          <span className="muted">{highRisk} {$('W_DASH_HIGH_RISK_SUFFIX', locale)}</span>
        </div>
        <div className="list stagger">
          {loading ? (
            <p
              className="muted"
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              {$('W_DASH_LOADING_LIST', locale)}
            </p>
          ) : (
            (patients || []).flatMap((patient) =>
              patient.risk_level === 'high'
                ? [
                    <div className="list-item" key={patient.id}>
                      <div>
                        <strong>{patient.name}</strong>
                        <p className="muted">
                          {$('W_PATIENTS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'} •{' '}
                          {patient.village || $('W_PATIENTS_UNKNOWN', locale)}
                        </p>
                      </div>
                      <div className="inline-actions">
                        <span className="badge badge--high">
                          {((patient.risk_score || 0) * 100).toFixed(0)}%
                        </span>
                        <Link
                          className="btn btn--secondary"
                          to={`/worker/patient/${patient.id}`}
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
            <p
              className="muted"
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              {$('W_DASH_NO_HIGH_RISK', locale)}
            </p>
          )}
        </div>
      </section>
    </MobileLayout>
  );
}
