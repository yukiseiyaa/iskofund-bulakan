import React, { useState } from 'react';
import { colors, card } from '../../styles/tokens';
import { BookOpen } from 'lucide-react';

const SECTIONS = [
  {
    id: 'efc',
    label: 'Expected Family Contribution (EFC / SAI)',
    color: colors.accent,
    formulas: [
      { name: 'Adjusted Income', expr: 'AI = AGI − (0.22 × AGI) + (0.12 × Assets)', note: 'Parental income protection allowance applied' },
      { name: 'Available Income', expr: 'AVI = AI − State_Tax_Allowance − IPA', note: 'IPA = Income Protection Allowance per household size' },
      { name: 'Parent Contribution', expr: 'PC = AVI × AR + (0.12 × Assets) / n_college', note: 'AR = assessment rate, n_college = siblings in college' },
      { name: 'Student Contribution', expr: 'SC = (0.20 × StudentAssets) + (0.50 × StudentIncome)', note: 'Student assets assessed at higher rate than parental' },
      { name: 'EFC (SAI)', expr: 'EFC = max(0, PC + SC)', note: 'Floor of zero; negative becomes zero' },
    ],
  },
  {
    id: 'need',
    label: 'Financial Need & COA Calculation',
    color: colors.purple,
    formulas: [
      { name: 'Adjusted COA', expr: 'COA_adj = COA_base × RegionalCPI × (1 + ε_hardship)', note: 'ε_hardship ∈ [0, 0.15] based on hardship severity' },
      { name: 'Demonstrated Need', expr: 'DN = max(0, COA_adj − EFC)', note: 'Core eligibility threshold for need-based aid' },
      { name: 'Need Ratio', expr: 'NR = DN / COA_adj ∈ [0, 1]', note: 'Normalized need intensity metric' },
    ],
  },
  {
    id: 'composite',
    label: 'ML Composite Need Score',
    color: colors.success,
    formulas: [
      { name: 'XGBoost Score', expr: 'S_ML = XGBoost(φ) where φ = [NR, GPA, EFC_norm, FirstGen, Hardship, ...]', note: '14-feature vector, output ∈ [0, 100]' },
      { name: 'SHAP Decomposition', expr: 'f(x) = E[f(X)] + Σ_i SHAP_i(x)', note: 'Each feature\'s additive contribution to prediction' },
      { name: 'Composite Score', expr: 'CS = 0.65 × S_ML + 0.25 × NR_norm + 0.10 × Bonus', note: 'Bonus = first-gen (5pts) + hardship modifier (0–5pts)' },
    ],
  },
  {
    id: 'optimization',
    label: 'MILP Allocation Objective',
    color: colors.warning,
    formulas: [
      { name: 'Objective Function', expr: 'Maximize  Σ_i  w_i × CS_i × x_i', note: 'w_i = equity weight (higher for first-gen/Tier-1)' },
      { name: 'Budget Constraint', expr: 'Σ_i  a_i × x_i ≤ B  (total budget)', note: 'a_i = award amount for student i' },
      { name: 'Equity Constraint', expr: 'Σ_{i ∈ FirstGen} x_i / Σ_i x_i ≥ θ_eq', note: 'θ_eq = 0.40 (40% first-gen minimum share)' },
      { name: 'Gini Constraint', expr: 'G(awards) ≤ G_max  (e.g., 0.30)', note: 'Lorenz curve–derived Gini coefficient' },
      { name: 'Decision Variable', expr: 'x_i ∈ {0, 1}  (award or not)', note: 'Binary allocation per applicant' },
    ],
  },
];

export default function MathFormulations() {
  const [active, setActive] = useState('efc');

  const sel = SECTIONS.find(s => s.id === active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.25s ease forwards' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Sidebar */}
        <div style={{ ...card(), padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, width: 220 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.slate400, padding: '4px 8px', margin: 0 }}>Formula Sets</p>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none',
                background: active === s.id ? `${s.color}18` : 'transparent',
                color: active === s.id ? s.color : colors.slate600,
                fontWeight: active === s.id ? 700 : 500,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                borderLeft: `3px solid ${active === s.id ? s.color : 'transparent'}`,
              }}
            >
              {s.label.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Formula panel */}
        {sel && (
          <div style={{ flex: 1, ...card(), padding: 28, animation: 'fadeUp 0.15s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <BookOpen size={16} color={sel.color} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: 0 }}>{sel.label}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sel.formulas.map((f, i) => (
                <div key={i} style={{ padding: '14px 18px', borderRadius: 10, background: colors.slate50, border: `1px solid ${colors.slate200}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: sel.color, margin: '0 0 8px' }}>
                    {f.name}
                  </p>
                  <code style={{
                    display: 'block', fontSize: 13, lineHeight: 1.6, fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                    color: colors.slate800, background: '#fff', padding: '10px 14px',
                    borderRadius: 7, border: `1px solid ${colors.slate200}`, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {f.expr}
                  </code>
                  <p style={{ fontSize: 12, color: colors.slate500, margin: '8px 0 0', fontStyle: 'italic' }}>↳ {f.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
