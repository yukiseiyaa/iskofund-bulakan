import React, { useState } from 'react';
import { colors, card } from '../../styles/tokens';
import { Cpu, ChevronRight } from 'lucide-react';

const STAGES = [
  {
    id: 'ingest',
    label: '1. Data Ingestion',
    color: colors.accent,
    icon: '📥',
    inputs: ['FAFSA XML Feed', 'IRS DRT Tax API', 'SAT/ACT Scores', 'Enrollment Records'],
    outputs: ['Validated Raw Profile', 'Missing Field Flags', 'Duplicate Detection'],
    detail: 'Raw data from multiple sources is collected, schema-validated, de-duplicated, and standardized into a unified student record before storage.',
  },
  {
    id: 'feature',
    label: '2. Feature Engineering',
    color: colors.purple,
    icon: '⚙️',
    inputs: ['Raw Profile', 'COA Schedule', 'Regional CPI Index', 'Hardship Codes'],
    outputs: ['EFC (SAI Estimate)', 'Need Ratio', 'Hardship Score', 'Adjusted COA', '14 ML Features'],
    detail: 'EFC is calculated using a simplified FAFSA SAI methodology. Regional cost adjustments, hardship multipliers, and dependency ratios are computed into 14 normalized features.',
  },
  {
    id: 'scoring',
    label: '3. ML Scoring',
    color: colors.success,
    icon: '🤖',
    inputs: ['14 Normalized Features', 'Trained XGBoost Model', 'SHAP Explainer'],
    outputs: ['Composite Need Score (0–100)', 'Tier Classification (1–5)', 'SHAP Feature Importances'],
    detail: 'XGBoost classifier (50k training samples, 87% AUC) generates a need score. SHAP values break down how each feature contributed — enabling explainability and appeals.',
  },
  {
    id: 'allocation',
    label: '4. MILP Allocation',
    color: colors.warning,
    icon: '📊',
    inputs: ['Ranked Applicant Pool', 'Budget Constraints', 'Equity Weights', 'Policy Rules'],
    outputs: ['Award Assignments', 'Allocation Report', 'Gini Coefficient', 'Coverage Rate'],
    detail: 'A Knapsack-variant MILP solver maximizes equity-weighted utility subject to: total budget ≤ cap, first-gen share ≥ 40%, Gini ≤ 0.30, Tier-1 coverage ≥ 90%.',
  },
  {
    id: 'audit',
    label: '5. Compliance Audit',
    color: colors.error,
    icon: '🛡️',
    inputs: ['Final Allocation', 'Demographic Flags', 'EEOC Rules', 'FERPA Checklist'],
    outputs: ['Disparate Impact Report', 'Audit Log (Immutable)', 'Fairness Alerts', 'Digital Signatures'],
    detail: 'EEOC four-fifths disparate impact testing is run on every cohort. All decisions are logged in an immutable audit trail with cryptographic signature for appeals.',
  },
];

export default function MLPipelineView() {
  const [active, setActive] = useState('scoring');

  const sel = STAGES.find(s => s.id === active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.25s ease forwards' }}>
      {/* Pipeline Steps */}
      <div style={{ ...card(), padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Cpu size={16} color={colors.accent} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: 0 }}>ML Pipeline — Click a Stage to Inspect</h2>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
          {STAGES.map((stage, i) => {
            const isActive = active === stage.id;
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => setActive(stage.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '14px 16px', borderRadius: 10, border: `2px solid ${isActive ? stage.color : colors.slate200}`,
                    background: isActive ? `${stage.color}12` : '#fff',
                    cursor: 'pointer', minWidth: 140, transition: 'all 0.2s',
                    transform: isActive ? 'translateY(-3px)' : 'none',
                    boxShadow: isActive ? `0 4px 12px ${stage.color}22` : 'none',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{stage.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? stage.color : colors.slate600, textAlign: 'center', lineHeight: 1.4 }}>
                    {stage.label}
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <ChevronRight size={18} color={colors.slate300} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage Detail */}
      {sel && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, animation: 'fadeUp 0.15s ease forwards' }}>
          <div style={{ ...card(), padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: colors.slate400, letterSpacing: '0.05em', margin: '0 0 12px' }}>Inputs</p>
            {sel.inputs.map((inp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${colors.slate100}`, fontSize: 12, color: colors.slate700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sel.color, flexShrink: 0 }} />
                {inp}
              </div>
            ))}
          </div>
          <div style={{ ...card(), padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: colors.slate400, letterSpacing: '0.05em', margin: '0 0 12px' }}>Outputs</p>
            {sel.outputs.map((out, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${colors.slate100}`, fontSize: 12, color: colors.slate700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.success, flexShrink: 0 }} />
                {out}
              </div>
            ))}
          </div>
          <div style={{ background: `${sel.color}08`, border: `1.5px solid ${sel.color}33`, borderRadius: 12, padding: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: sel.color, margin: '0 0 10px' }}>{sel.label}</p>
            <p style={{ fontSize: 13, color: colors.slate600, lineHeight: 1.7, margin: 0 }}>{sel.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}
