import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Award, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { colors, card } from '../../styles/tokens';

export default function AnalyticsOverview({ cohort, solverMetrics }) {
  const sm = solverMetrics || {};
  const awarded = cohort.filter(s => s.awarded).length;
  const avgScore = cohort.length ? Math.round(cohort.reduce((a, s) => a + (s.compositeScore || 0), 0) / cohort.length) : 0;
  const [showSolverDetails, setShowSolverDetails] = useState(false);

  const kpis = [
    {
      label: 'Applicants',
      value: cohort.length,
      icon: Users, color: colors.accent, bg: colors.accentLight,
      sub: `${awarded} awarded (${Math.round((awarded / (cohort.length || 1)) * 100)}%)`,
    },
    {
      label: 'Disbursed',
      value: `₱${((sm.totalDisbursed || 0) / 1e6).toFixed(2)}M`,
      icon: DollarSign, color: colors.success, bg: colors.successLight,
      sub: `${sm.budgetUtilization || 0}% of budget`,
    },
    {
      label: 'Coverage Rate',
      value: `${sm.coverageRate || 0}%`,
      icon: TrendingUp, color: colors.purple, bg: colors.purpleLight,
      sub: 'Tier-1 Priority Aid',
    },
    {
      label: 'Equity Share',
      value: `${sm.equityDisbursementRate || 0}%`,
      icon: ShieldCheck, color: colors.warning, bg: colors.warningLight,
      sub: 'First-Gen Scholars',
    },
  ];

  const tierCounts = {};
  cohort.forEach(s => {
    tierCounts[s.needTier || 'tier_5'] = (tierCounts[s.needTier || 'tier_5'] || 0) + 1;
  });
  const tiers = [
    { id: 'tier_1', label: 'Tier 1 — Full Coverage', color: colors.success },
    { id: 'tier_2', label: 'Tier 2 — High Aid',       color: colors.accent },
    { id: 'tier_3', label: 'Tier 3 — Moderate Aid',   color: colors.purple },
    { id: 'tier_4', label: 'Tier 4 — Partial Aid',    color: colors.warning },
    { id: 'tier_5', label: 'Tier 5 — Limited Aid',    color: colors.slate400 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.25s ease forwards' }}>

      {/* 4 Essential KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={{ ...card(), padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={kpi.color} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: colors.slate400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px' }}>{kpi.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: colors.slate900, fontFamily: 'monospace', margin: '0 0 1px' }}>{kpi.value}</p>
                <p style={{ fontSize: 10, color: colors.slate400, margin: 0 }}>{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Cohort Distribution & Solver Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        {/* Tier Bar Chart */}
        <div style={{ ...card(), padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.slate800, margin: '0 0 14px' }}>
            Cohort Distribution by Need Tier
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tiers.map(tier => {
              const count = tierCounts[tier.id] || 0;
              const pct = cohort.length ? Math.round((count / cohort.length) * 100) : 0;
              return (
                <div key={tier.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: colors.slate600, fontWeight: 500 }}>{tier.label}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: tier.color }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: colors.slate100, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99, background: tier.color,
                      width: `${pct}%`, transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solver Quick Snapshot + Progressive Disclosure */}
        <div style={{ ...card(), padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.slate800, margin: 0 }}>
                Solver Performance
              </h3>
              <span style={{ fontSize: 10, color: colors.success, fontWeight: 700, background: colors.successLight, padding: '2px 8px', borderRadius: 99 }}>
                Optimal
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.slate500 }}>Budget Disbursed</span>
                <strong style={{ fontFamily: 'monospace' }}>₱{((sm.totalDisbursed || 0) / 1e6).toFixed(2)}M / ₱{((sm.totalBudget || 5e6) / 1e6).toFixed(1)}M</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.slate500 }}>Avg. Award per Scholar</span>
                <strong style={{ fontFamily: 'monospace' }}>{awarded ? `₱${Math.round((sm.totalDisbursed || 0) / awarded).toLocaleString()}` : '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.slate500 }}>Gini Inequality Index</span>
                <strong style={{ fontFamily: 'monospace', color: colors.success }}>{(sm.giniCoefficient || 0).toFixed(3)}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSolverDetails(d => !d)}
            style={{
              marginTop: 14, padding: '7px 0', background: colors.slate50, border: `1px solid ${colors.slate200}`,
              borderRadius: 6, fontSize: 11, fontWeight: 700, color: colors.slate600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}
          >
            {showSolverDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showSolverDetails ? 'Hide Technical Parameters' : 'View Technical Parameters'}
          </button>
        </div>
      </div>

      {/* Collapsible Technical Parameters */}
      {showSolverDetails && (
        <div style={{ ...card(), padding: 16, background: colors.slate50, animation: 'fadeUp 0.2s ease forwards' }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: colors.slate400, margin: '0 0 10px' }}>
            Mathematical Optimization Formulation &amp; Parameters
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 11 }}>
            <div><span style={{ color: colors.slate400 }}>Algorithm:</span> <strong style={{ color: colors.slate800 }}>MILP Knapsack (ε-constraint)</strong></div>
            <div><span style={{ color: colors.slate400 }}>Solver Engine:</span> <strong style={{ color: colors.slate800 }}>Branch &amp; Bound + Cutting Planes</strong></div>
            <div><span style={{ color: colors.slate400 }}>Objective:</span> <strong style={{ color: colors.slate800 }}>Maximize Utility + Equity Penalty</strong></div>
          </div>
        </div>
      )}

      {/* Fairness Alerts */}
      {sm.fairnessAlerts?.length > 0 && (
        <div style={{ ...card(), padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <AlertCircle size={14} color={colors.warning} />
            <h3 style={{ fontSize: 12, fontWeight: 700, color: colors.slate800, margin: 0 }}>
              Policy Audit Alerts ({sm.fairnessAlerts.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {sm.fairnessAlerts.map((alert, i) => (
              <div key={i} style={{ padding: '8px 12px', background: colors.warningLight, border: `1px solid ${colors.warningBorder}`, borderRadius: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: colors.warning, margin: '0 0 2px' }}>{alert.type}</p>
                <p style={{ fontSize: 10, color: colors.slate600, margin: 0 }}>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
