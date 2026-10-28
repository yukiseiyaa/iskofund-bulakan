import React from 'react';
import { colors, card } from '../../styles/tokens';
import { Globe2, ShieldCheck, Cpu, BarChart3, Database, Users, ArrowRight } from 'lucide-react';

const NODES = [
  {
    id: 'client', label: 'Student & Admin\nPortals', icon: Users,
    color: colors.accent, bg: colors.accentLight, border: colors.accentBorder,
    x: 0, description: 'React SPA with form input validation, real-time aid estimation, and award letter generation.',
  },
  {
    id: 'api', label: 'API Gateway\n(REST + Auth)', icon: Globe2,
    color: colors.purple, bg: colors.purpleLight, border: colors.purpleBorder,
    x: 1, description: 'JWT-secured Express API with rate limiting and CORS. Routes requests to the ML inference layer.',
  },
  {
    id: 'ml', label: 'Predictive\nML Engine', icon: Cpu,
    color: colors.success, bg: colors.successLight, border: colors.successBorder,
    x: 2, description: 'XGBoost classification model trained on 50k historical applications. Returns need score, tier, and SHAP explainability.',
  },
  {
    id: 'optimizer', label: 'MILP Allocation\nOptimizer', icon: BarChart3,
    color: colors.warning, bg: colors.warningLight, border: colors.warningBorder,
    x: 3, description: 'Knapsack-based constrained optimization with equity constraints (Gini, first-gen minimum share).',
  },
  {
    id: 'db', label: 'PostgreSQL\nDatabase', icon: Database,
    color: colors.error, bg: colors.errorLight, border: colors.errorBorder,
    x: 4, description: 'FERPA-encrypted relational store for student profiles, EFC records, and audit logs. Read replica for reporting.',
  },
  {
    id: 'audit', label: 'Compliance &\nAudit Layer', icon: ShieldCheck,
    color: colors.slate600, bg: colors.slate100, border: colors.slate300,
    x: 5, description: 'EEOC four-fifths disparate impact checker. Real-time Gini monitoring and policy constraint validation.',
  },
];

export default function ArchitectureDiagram() {
  const [active, setActive] = React.useState('ml');
  const activeNode = NODES.find(n => n.id === active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.25s ease forwards' }}>
      {/* Diagram */}
      <div style={{ ...card(), padding: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, margin: '0 0 6px' }}>
          System Architecture Overview
        </h2>
        <p style={{ fontSize: 13, color: colors.slate500, margin: '0 0 28px' }}>
          Click any node to view technical details. Data flows left-to-right from user input to compliance audit.
        </p>

        {/* Node row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
          {NODES.map((node, i) => {
            const Icon = node.icon;
            const isActive = active === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setActive(node.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${isActive ? node.color : colors.slate200}`,
                    background: isActive ? node.bg : '#fff',
                    boxShadow: isActive ? `0 4px 16px ${node.color}22` : 'none',
                    transition: 'all 0.2s', minWidth: 110,
                    transform: isActive ? 'translateY(-4px)' : 'none',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: isActive ? node.color : colors.slate100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    <Icon size={20} color={isActive ? '#fff' : colors.slate400} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: isActive ? node.color : colors.slate600,
                    textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.4,
                  }}>
                    {node.label}
                  </span>
                </button>
                {i < NODES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 4px' }}>
                    <div style={{ width: 20, height: 1, background: colors.slate200 }} />
                    <ArrowRight size={14} color={colors.slate300} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detail Box */}
        {activeNode && (
          <div style={{
            marginTop: 24, padding: '18px 22px',
            background: activeNode.bg, border: `1.5px solid ${activeNode.border}`,
            borderRadius: 12, animation: 'fadeUp 0.15s ease forwards',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: activeNode.color, margin: '0 0 6px' }}>
              {activeNode.label.replace('\n', ' — ')}
            </p>
            <p style={{ fontSize: 13, color: colors.slate600, margin: 0, lineHeight: 1.6 }}>
              {activeNode.description}
            </p>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div style={{ ...card(), padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.slate800, margin: '0 0 18px' }}>
          Technology Stack
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { layer: 'Frontend',    items: ['React 18', 'Vite 6', 'Design Tokens', 'Lucide Icons'] },
            { layer: 'Backend API', items: ['Node.js / Express', 'JWT Auth', 'Rate Limiter', 'OpenAPI 3.0'] },
            { layer: 'ML Pipeline', items: ['XGBoost', 'SHAP', 'scikit-learn', 'ONNX Runtime'] },
            { layer: 'Data & Infra', items: ['PostgreSQL', 'Redis Cache', 'Docker', 'AWS Lambda'] },
          ].map((col, i) => (
            <div key={i} style={{ padding: 16, background: colors.slate50, border: `1px solid ${colors.slate100}`, borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.slate400, margin: '0 0 10px' }}>{col.layer}</p>
              {col.items.map((item, j) => (
                <p key={j} style={{ fontSize: 12, color: colors.slate700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors.accent, display: 'inline-block', flexShrink: 0 }} />
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
