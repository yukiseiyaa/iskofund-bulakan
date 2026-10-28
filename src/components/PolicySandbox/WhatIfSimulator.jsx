import React, { useState } from 'react';
import { SlidersHorizontal, Play, TrendingUp, AlertTriangle } from 'lucide-react';
import { colors, card, labelStyle, hintStyle } from '../../styles/tokens';
import { runPredictiveModel } from '../../utils/predictiveEngine';
import { useToast } from '../Toast';

const METRICS = [
  { key: 'budgetChange',    label: 'Budget Change',              format: v => `${v > 0 ? '+' : ''}${v}%`,    min: -50, max: 100, step: 5, default: 0,  hint: 'Increase or decrease total scholarship pool' },
  { key: 'gpaWeight',       label: 'Academic Merit Weight',      format: v => `${v}%`,                        min: 0,   max: 100, step: 5, default: 15, hint: 'Fraction of score from GPA (vs. pure need)' },
  { key: 'firstGenBonus',   label: 'First-Gen Equity Bonus',     format: v => `+${v} pts`,                   min: 0,   max: 20,  step: 1, default: 8,  hint: 'Extra score awarded to first-gen students' },
  { key: 'hardshipWeight',  label: 'Hardship Impact Weight',     format: v => `${v}%`,                        min: 0,   max: 30,  step: 5, default: 10, hint: 'Relative importance of documented hardship cases' },
  { key: 'incomeCap',       label: 'Income Eligibility Ceiling', format: v => `₱${(v * 1000).toLocaleString()}`, min: 80, max: 700, step: 20, default: 450, hint: 'Max household income (×₱1000) for aid eligibility' },
];

export default function WhatIfSimulator({ cohort }) {
  const toast = useToast();
  const [params, setParams] = useState(Object.fromEntries(METRICS.map(m => [m.key, m.default])));
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      // Simulate policy effect on cohort
      const budgetMultiplier = 1 + params.budgetChange / 100;
      const incomeCapAmt = params.incomeCap * 1000;

      const eligible = cohort.filter(s => (s.annualHouseholdIncome || 50000) <= incomeCapAmt);
      const totalNewBudget = 5000000 * budgetMultiplier;
      const avgAward = 28000 * (1 + params.budgetChange / 200);
      const maxRecipients = Math.floor(totalNewBudget / avgAward);
      const actualRecipients = Math.min(eligible.length, maxRecipients);

      // Score applicants based on the user-selected policy weights
      const meritWeight = params.gpaWeight / 100;
      const needWeight = Math.max(0, 1 - meritWeight);
      const scored = eligible.map(s => {
        const meritScore = s.gpa <= 3.0
          ? Math.max(0, (3.0 - s.gpa) / 2.0) * 100
          : Math.max(0, (s.gpa - 2.0) / 2.0) * 100;
        const hardshipBonus = s.hardshipType !== 'none' ? (params.hardshipWeight / 30) * 15 : 0;
        const firstGenBonus = s.isFirstGen ? params.firstGenBonus : 0;
        const simScore = ((s.compositeScore || 50) * needWeight) + (meritScore * meritWeight) + hardshipBonus + firstGenBonus;
        return { ...s, simScore };
      });
      scored.sort((a, b) => b.simScore - a.simScore);

      const fundedStudents = scored.slice(0, actualRecipients);
      const fundedFirstGenCount = fundedStudents.filter(s => s.isFirstGen).length;
      const coverageRate = eligible.length > 0 ? Math.round((actualRecipients / eligible.length) * 100) : 0;
      const firstGenShare = actualRecipients > 0 ? Math.min(100, Math.round((fundedFirstGenCount / actualRecipients) * 100)) : 0;

      setResult({
        eligible: eligible.length,
        totalBudget: totalNewBudget,
        recipients: actualRecipients,
        coverageRate,
        firstGenShare,
        avgAward: Math.round(avgAward),
        giniEst: Math.max(0.15, 0.30 - (params.firstGenBonus / 200) - (params.hardshipWeight / 500)).toFixed(3),
      });
      setRan(true);
      setRunning(false);
      toast.success('Simulation complete — see results on the right.');
    }, 700);
  };

  const handleReset = () => {
    setParams(Object.fromEntries(METRICS.map(m => [m.key, m.default])));
    setResult(null);
    setRan(false);
    toast.info('Parameters reset to baseline defaults.');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, animation: 'fadeUp 0.25s ease forwards' }}>
      {/* Controls */}
      <div style={{ ...card(), padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <SlidersHorizontal size={16} color={colors.accent} />
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: 0 }}>Policy Sandbox</h2>
            <p style={{ fontSize: 12, color: colors.slate500, margin: 0 }}>Adjust parameters and simulate the impact on the cohort.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {METRICS.map(m => (
            <div key={m.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'flex-start' }}>
                <label style={labelStyle}>{m.label}</label>
                <span style={{ fontSize: 13, fontWeight: 800, color: colors.accent, fontFamily: 'monospace', flexShrink: 0 }}>
                  {m.format(params[m.key])}
                </span>
              </div>
              <input
                type="range" min={m.min} max={m.max} step={m.step} value={params[m.key]}
                onChange={e => setParams(p => ({ ...p, [m.key]: Number(e.target.value) }))}
              />
              <p style={hintStyle}>{m.hint}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button
            onClick={handleReset}
            style={{ padding: '8px 16px', background: colors.slate100, color: colors.slate600, border: `1.5px solid ${colors.slate200}`, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
              background: running ? colors.slate200 : colors.accent, color: running ? colors.slate400 : '#fff',
              fontSize: 13, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: running ? 'none' : `0 2px 8px ${colors.accent}44`, transition: 'all 0.2s',
            }}
          >
            {running ? (
              <><span style={{ width: 14, height: 14, border: `2px solid #94a3b8`, borderTopColor: colors.accent, borderRadius: '50%', display: 'inline-block' }} className="animate-spin-css" /> Simulating…</>
            ) : (
              <><Play size={14} /> Run Simulation</>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ ...card(), padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <TrendingUp size={16} color={colors.success} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: 0 }}>Simulation Results</h2>
        </div>

        {!ran ? (
          <div style={{ padding: 40, textAlign: 'center', color: colors.slate400 }}>
            <SlidersHorizontal size={40} color={colors.slate200} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: colors.slate500 }}>Adjust the parameters and run the simulation</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Results will compare your policy vs. the current baseline.</p>
          </div>
        ) : result ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Eligible Applicants',  value: result.eligible,             color: colors.accent },
                { label: 'Recipients Awarded',    value: result.recipients,           color: colors.success },
                { label: 'Coverage Rate',         value: `${result.coverageRate}%`,   color: result.coverageRate >= 75 ? colors.success : colors.warning },
                { label: 'First-Gen Share',       value: `${result.firstGenShare}%`,  color: result.firstGenShare >= 40 ? colors.success : colors.warning },
                { label: 'Avg. Award',            value: `₱${result.avgAward.toLocaleString()}`, color: colors.purple },
                { label: 'Est. Gini Coefficient', value: result.giniEst,             color: parseFloat(result.giniEst) <= 0.30 ? colors.success : colors.error },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 14px', background: colors.slate50, border: `1px solid ${colors.slate100}`, borderRadius: 9 }}>
                  <p style={{ fontSize: 10, color: colors.slate400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>{item.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: item.color, fontFamily: 'monospace', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 10, background: result.coverageRate >= 75 ? colors.successLight : colors.warningLight, border: `1px solid ${result.coverageRate >= 75 ? colors.successBorder : colors.warningBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {result.coverageRate >= 75
                  ? <TrendingUp size={14} color={colors.success} />
                  : <AlertTriangle size={14} color={colors.warning} />
                }
                <span style={{ fontWeight: 700, fontSize: 13, color: result.coverageRate >= 75 ? colors.success : colors.warning }}>
                  {result.coverageRate >= 75 ? 'Policy Meets Equity Targets' : 'Policy Adjustment Recommended'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: colors.slate600, margin: 0, lineHeight: 1.5 }}>
                {result.coverageRate >= 75
                  ? `This configuration awards ${result.recipients} students at an average of ₱${result.avgAward.toLocaleString()}, within budget and equity targets.`
                  : `Coverage rate of ${result.coverageRate}% falls below the 75% institutional target. Consider increasing budget or reducing income cap.`
                }
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
