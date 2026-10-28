import React, { useState } from 'react';
import { Play, DollarSign, Sliders, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { colors, card, inputStyle, labelStyle, hintStyle } from '../../styles/tokens';
import { useToast } from '../Toast';

export default function OptimizationSolver({ onRunSolver, isSolving, solverMetrics }) {
  const toast = useToast();
  const [totalBudget, setTotalBudget] = useState(5000000);
  const [constraints, setConstraints] = useState({
    minFirstGenPct: 40,
    minTier1Coverage: 90,
    maxAwardAmount: 65000,
    minAwardAmount: 5000,
    giniTarget: 0.25,
  });

  const handleRun = () => {
    if (totalBudget < 100000) { toast.error('Budget must be at least ₱100,000.'); return; }
    onRunSolver({
      totalBudget,
      constraints: {
        ...constraints,
        maxCapPerStudent: constraints.maxAwardAmount,
        minAwardThreshold: constraints.minAwardAmount,
        equityFloorRatio: constraints.minFirstGenPct / 100,
      }
    });
    toast.info('Optimization solver running… please wait.');
  };

  const sm = solverMetrics || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, animation: 'fadeUp 0.25s ease forwards' }}>
      {/* Config Panel */}
      <div style={{ ...card(), padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Sliders size={16} color={colors.accent} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: 0 }}>Allocation Parameters</h2>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Total Allocation Budget (₱)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: colors.slate400 }}>₱</span>
            <input
              type="number" min="100000" step="50000" value={totalBudget}
              onChange={e => setTotalBudget(Number(e.target.value))}
              style={{ ...inputStyle(), paddingLeft: 22 }}
            />
          </div>
          <p style={hintStyle}>Available: ₱${(totalBudget / 1e6).toFixed(2)}M for cohort disbursement</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SliderField
            label="Minimum First-Generation Equity Share"
            hint="Minimum % of total awards for first-gen students"
            min={0} max={100} step={5} value={constraints.minFirstGenPct}
            format={v => `${v}%`}
            onChange={v => setConstraints(c => ({ ...c, minFirstGenPct: v }))}
          />
          <SliderField
            label="Tier 1 Minimum Coverage Guarantee"
            hint="% of Tier 1 applicants who must receive full awards"
            min={50} max={100} step={5} value={constraints.minTier1Coverage}
            format={v => `${v}%`}
            onChange={v => setConstraints(c => ({ ...c, minTier1Coverage: v }))}
          />
          <SliderField
            label="Maximum Single Award Cap (₱)"
            hint="No individual student may receive above this amount"
            min={10000} max={80000} step={1000} value={constraints.maxAwardAmount}
            format={v => `₱${v.toLocaleString()}`}
            onChange={v => setConstraints(c => ({ ...c, maxAwardAmount: v }))}
          />
          <SliderField
            label="Gini Inequality Ceiling"
            hint="Max Gini coefficient allowed in the allocation (lower = more equal)"
            min={0.1} max={0.5} step={0.01} value={constraints.giniTarget}
            format={v => v.toFixed(2)}
            onChange={v => setConstraints(c => ({ ...c, giniTarget: v }))}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={isSolving}
          style={{
            width: '100%', marginTop: 28,
            padding: '11px 0',
            background: isSolving ? colors.slate200 : colors.accent,
            color: isSolving ? colors.slate400 : '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: isSolving ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: isSolving ? 'none' : `0 2px 10px ${colors.accent}44`,
            transition: 'all 0.2s',
          }}
        >
          {isSolving ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid #94a3b8', borderTopColor: colors.accent, borderRadius: '50%', display: 'inline-block' }} className="animate-spin-css" />
              Solving Allocation…
            </>
          ) : (
            <>
              <Play size={15} />
              Run Optimization Solver
            </>
          )}
        </button>
      </div>

      {/* Results Panel */}
      <div style={{ ...card(), padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <CheckCircle2 size={16} color={colors.success} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: 0 }}>Solver Results</h2>
        </div>

        {!sm.totalDisbursed ? (
          <div style={{ padding: 40, textAlign: 'center', color: colors.slate400 }}>
            <Play size={40} color={colors.slate200} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: colors.slate500 }}>Run the solver to see results</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Results and metrics will appear here after optimization.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Disbursed',       value: `₱${(sm.totalDisbursed / 1e6).toFixed(2)}M`,  color: colors.accent },
                { label: 'Coverage Rate',         value: `${sm.coverageRate}%`,                         color: colors.success },
                { label: 'Budget Utilization',    value: `${sm.budgetUtilization}%`,                    color: colors.purple },
                { label: 'Gini Coefficient',      value: (sm.giniCoefficient || 0).toFixed(3),          color: colors.warning },
                { label: 'Avg. Award',            value: `₱${Math.round((sm.totalDisbursed || 0) / Math.max(1, sm.awardedCount || 1)).toLocaleString()}`, color: colors.accent },
                { label: 'Equity Share',          value: `${sm.equityDisbursementRate}%`,               color: colors.success },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 14px', background: colors.slate50, border: `1px solid ${colors.slate100}`, borderRadius: 9 }}>
                  <p style={{ fontSize: 10, color: colors.slate400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>{item.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: 'monospace', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Constraint compliance */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.slate400, marginBottom: 10 }}>
                Constraint Compliance
              </p>
              {[
                { label: `First-Gen Share ≥ ${constraints.minFirstGenPct}%`, pass: (sm.equityDisbursementRate || 0) >= constraints.minFirstGenPct },
                { label: `Tier 1 Coverage ≥ ${constraints.minTier1Coverage}%`, pass: (sm.coverageRate || 0) >= constraints.minTier1Coverage },
                { label: `Gini ≤ ${constraints.giniTarget.toFixed(2)}`, pass: (sm.giniCoefficient || 0) <= constraints.giniTarget },
                { label: `Budget ≤ ₱${(totalBudget / 1e6).toFixed(1)}M`, pass: (sm.totalDisbursed || 0) <= totalBudget },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${colors.slate100}`, fontSize: 12 }}>
                  {c.pass
                    ? <CheckCircle2 size={14} color={colors.success} />
                    : <AlertTriangle size={14} color={colors.error} />
                  }
                  <span style={{ color: c.pass ? colors.slate700 : colors.error, fontWeight: 500 }}>{c.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c.pass ? colors.successLight : colors.errorLight, color: c.pass ? colors.success : colors.error }}>
                    {c.pass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SliderField({ label, hint, min, max, step, value, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={labelStyle}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.accent, fontFamily: 'monospace' }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
      <p style={hintStyle}>{hint}</p>
    </div>
  );
}
