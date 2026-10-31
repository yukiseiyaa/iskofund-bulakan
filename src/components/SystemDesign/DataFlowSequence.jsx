import React, { useState } from 'react';
import { colors, card } from '../../styles/tokens';
import { ArrowDown, User, Server, Cpu, Database, ShieldCheck } from 'lucide-react';

const FLOWS = [
  { actor: 'Student', icon: User,        color: colors.accent,  label: 'Submits FAFSA + profile to portal' },
  { actor: 'API',     icon: Server,      color: colors.purple,  label: 'Validates input, strips PII, queues request' },
  { actor: 'ML',      icon: Cpu,         color: colors.success, label: 'Computes EFC, runs XGBoost scorer, returns score + SHAP' },
  { actor: 'Firestore DB', icon: Database, color: colors.error, label: 'Persists application record in Cloud Firestore & syncs real-time to dashboard' },
  { actor: 'MILP',    icon: Cpu,         color: colors.warning, label: 'Runs nightly batch allocation with equity constraints' },
  { actor: 'Audit',   icon: ShieldCheck, color: colors.slate600,label: 'EEOC disparate impact check, Gini check, signs log' },
  { actor: 'API',     icon: Server,      color: colors.purple,  label: 'Returns award letter payload with SHAP explanation' },
  { actor: 'Student', icon: User,        color: colors.accent,  label: 'Views interactive award letter and aid breakdown' },
];

export default function DataFlowSequence() {
  const [step, setStep] = useState(null);

  return (
    <div style={{ ...card(), padding: 32, animation: 'fadeUp 0.25s ease forwards' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: '0 0 6px' }}>
        Data Flow Sequence Diagram
      </h2>
      <p style={{ fontSize: 13, color: colors.slate500, margin: '0 0 28px' }}>
        End-to-end flow from student submission to award notification. Click any step to highlight.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 640, margin: '0 auto' }}>
        {FLOWS.map((flow, i) => {
          const Icon = flow.icon;
          const isSelected = step === i;
          return (
            <React.Fragment key={i}>
              <div
                onClick={() => setStep(isSelected ? null : i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? flow.color : colors.slate200}`,
                  background: isSelected ? `${flow.color}10` : '#fff',
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isSelected ? `0 4px 12px ${flow.color}22` : 'none',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${flow.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={flow.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: flow.color }}>{flow.actor}</span>
                  <p style={{ fontSize: 13, color: colors.slate700, margin: '2px 0 0' }}>{flow.label}</p>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: colors.slate400, flexShrink: 0 }}>Step {i + 1}</span>
              </div>
              {i < FLOWS.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0' }}>
                  <ArrowDown size={14} color={colors.slate300} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
