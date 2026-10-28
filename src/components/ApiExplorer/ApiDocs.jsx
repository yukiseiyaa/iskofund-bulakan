import React, { useState } from 'react';
import { Terminal, Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { colors, card } from '../../styles/tokens';
import { useToast } from '../Toast';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/eligibility/score',
    desc: 'Calculate composite need score and tier classification for a student profile.',
    params: {
      annualHouseholdIncome: 34000, householdSize: 4, siblingsInCollege: 1,
      parentAssets: 6500, gpa: 3.78, livingArrangement: 'on_campus',
      isFirstGen: true, hardshipType: 'medical',
    },
    response: {
      studentId: 'STU-9921',
      compositeScore: 87,
      tier: 'tier_1',
      efc: 1840,
      adjustedCOA: 61755,
      demonstratedNeed: 59915,
      shapExplanations: [
        { feature: 'Household Income', impact: 28, direction: 'positive' },
        { feature: 'First-Generation Status', impact: 8, direction: 'positive' },
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/v1/allocation/run',
    desc: 'Execute MILP allocation solver over the full applicant cohort given a budget and equity constraints.',
    params: {
      totalBudget: 5000000,
      constraints: {
        minFirstGenPct: 40,
        minTier1Coverage: 90,
        maxAwardAmount: 65000,
        giniTarget: 0.25,
      },
    },
    response: {
      solverStatus: 'OPTIMAL',
      awardedCount: 142,
      totalDisbursed: 4872400,
      coverageRate: 88,
      giniCoefficient: 0.247,
      equityDisbursementRate: 43,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/applicants/:id',
    desc: 'Retrieve a single applicant record with full scoring history and award breakdown.',
    params: null,
    response: {
      id: 'STU-9921',
      name: 'Maria Santos',
      compositeScore: 87,
      tier: 'tier_1',
      awarded: true,
      awardAmount: 48960,
      adminStatus: 'Approved',
      isFirstGen: true,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/fairness/report',
    desc: 'Get the full equity and disparate impact compliance report for the current cohort.',
    params: null,
    response: {
      eeocFourFifths: 'PASS',
      giniCoefficient: 0.247,
      firstGenShare: 43,
      disparateImpactAlerts: [],
      reportGeneratedAt: '2026-08-27T09:00:00Z',
    },
  },
];

const METHOD_COLORS = {
  GET:    { text: colors.success, bg: colors.successLight, border: colors.successBorder },
  POST:   { text: colors.accent,  bg: colors.accentLight,  border: colors.accentBorder },
  PUT:    { text: colors.warning, bg: colors.warningLight, border: colors.warningBorder },
  DELETE: { text: colors.error,   bg: colors.errorLight,   border: colors.errorBorder },
};

export default function ApiDocs() {
  const [expanded, setExpanded] = useState(null);
  const toast = useToast();

  const copyCode = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Code snippet copied to clipboard!');
    });
  };

  return (
    <div style={{ animation: 'fadeUp 0.25s ease forwards' }}>
      <div style={{ ...card(), padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, background: colors.slate900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Terminal size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: colors.slate900, margin: 0 }}>IskoFund REST API</h2>
            <p style={{ fontSize: 12, color: colors.slate400, margin: 0 }}>
              Base URL: <code style={{ fontFamily: 'monospace', color: colors.accent }}>https://api.iskofund.bulakan.gov.ph/v1</code>
              &nbsp;·&nbsp;Auth: <code style={{ fontFamily: 'monospace' }}>Bearer &lt;JWT&gt;</code>
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {['JSON', 'REST', 'OpenAPI 3.0'].map(tag => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', background: colors.slate100, color: colors.slate500, borderRadius: 99 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ENDPOINTS.map((ep, i) => {
          const mc = METHOD_COLORS[ep.method];
          const isOpen = expanded === i;
          const curlSnippet = ep.params
            ? `curl -X ${ep.method} https://api.iskofund.bulakan.gov.ph/v1${ep.path} \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.params, null, 2)}'`
            : `curl -X ${ep.method} https://api.iskofund.bulakan.gov.ph/v1${ep.path} \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;

          return (
            <div key={i} style={{ ...card(), overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%', padding: '16px 20px', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = colors.slate50}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6,
                  background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`, flexShrink: 0,
                }}>
                  {ep.method}
                </span>
                <code style={{ fontSize: 13, fontFamily: 'monospace', color: colors.slate800, flex: 1 }}>
                  {ep.path}
                </code>
                <span style={{ fontSize: 12, color: colors.slate400, flex: 2, marginLeft: 8 }}>{ep.desc}</span>
                <span style={{ color: colors.slate400, flexShrink: 0 }}>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${colors.slate100}`, padding: '20px 20px', animation: 'fadeUp 0.15s ease forwards' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: ep.params ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
                    {ep.params && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.slate400, margin: '0 0 8px' }}>Request Body</p>
                        <CodeBlock code={JSON.stringify(ep.params, null, 2)} onCopy={copyCode} />
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.slate400, margin: '0 0 8px' }}>
                        200 OK Response
                      </p>
                      <CodeBlock code={JSON.stringify(ep.response, null, 2)} onCopy={copyCode} />
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.slate400, margin: '0 0 8px' }}>
                      cURL Example
                    </p>
                    <CodeBlock code={curlSnippet} onCopy={copyCode} dark />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CodeBlock({ code, onCopy, dark }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{
        background: dark ? colors.slate900 : colors.slate50,
        color: dark ? '#e2e8f0' : colors.slate800,
        border: `1px solid ${dark ? '#334155' : colors.slate200}`,
        borderRadius: 9, padding: '12px 14px',
        fontSize: 12, fontFamily: '"Fira Code", "JetBrains Mono", monospace',
        overflowX: 'auto', margin: 0, lineHeight: 1.6,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {code}
      </pre>
      <button
        onClick={() => { onCopy(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{
          position: 'absolute', top: 8, right: 8,
          padding: '4px 10px', borderRadius: 6, border: 'none',
          background: dark ? '#334155' : colors.slate100,
          color: dark ? '#94a3b8' : colors.slate500,
          fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
        }}
      >
        {copied ? <CheckCircle2 size={11} color={colors.success} /> : <Copy size={11} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
