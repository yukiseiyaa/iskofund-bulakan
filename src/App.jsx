import React, { useState } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import IskoFundPortal from './components/StudentPortal/IskoFundPortal';
import AnalyticsOverview from './components/AdminDashboard/AnalyticsOverview';
import ApplicantTable from './components/AdminDashboard/ApplicantTable';
import OptimizationSolver from './components/AdminDashboard/OptimizationSolver';
import FairnessAudit from './components/AdminDashboard/FairnessAudit';
import ArchitectureDiagram from './components/SystemDesign/ArchitectureDiagram';
import MLPipelineView from './components/SystemDesign/MLPipelineView';
import MathFormulations from './components/SystemDesign/MathFormulations';
import DataFlowSequence from './components/SystemDesign/DataFlowSequence';
import WhatIfSimulator from './components/PolicySandbox/WhatIfSimulator';
import ApiDocs from './components/ApiExplorer/ApiDocs';
import { ENRICHED_STUDENTS } from './data/mockData';
import { runPredictiveModel, solveOptimalAllocation } from './utils/predictiveEngine';

const DEFAULT_PROFILE = {
  annualHouseholdIncome: 34000, householdSize: 4, siblingsInCollege: 1,
  parentAssets: 6500, studentIncome: 2400, studentAssets: 450,
  gpa: 3.78, livingArrangement: 'on_campus', isFirstGen: true,
  hardshipType: 'medical', hardshipSeverity: 3, regionalCostIndex: 1.15,
};

function AppInner() {
  const toast = useToast();

  const [activeTab, setActiveTab]         = useState('student');
  const [studentSubTab, setStudentSubTab] = useState('calculator');
  const [adminSubTab, setAdminSubTab]     = useState('overview');
  const [archSubTab, setArchSubTab]       = useState('topology');

  const [profile, setProfile]         = useState(DEFAULT_PROFILE);
  const [result, setResult]           = useState(() => runPredictiveModel(DEFAULT_PROFILE));
  const [isCalc, setIsCalc]           = useState(false);
  const [cohort, setCohort]           = useState(ENRICHED_STUDENTS);
  const [solver, setSolver]           = useState(() => solveOptimalAllocation(ENRICHED_STUDENTS, 5000000));
  const [isSolving, setIsSolving]     = useState(false);

  const handleCalculate = (p) => {
    setIsCalc(true);
    setTimeout(() => {
      const r = runPredictiveModel(p);
      setResult(r);
      setIsCalc(false);
      toast.success(`Aid estimate ready — ${r.tier?.badge || 'Tier result'} (Score: ${r.compositeScore}/100)`);
    }, 380);
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setResult(runPredictiveModel(DEFAULT_PROFILE));
    toast.info('Profile reset to example defaults.');
  };

  const handleRunSolver = ({ totalBudget, constraints }) => {
    setIsSolving(true);
    setTimeout(() => {
      const solved = solveOptimalAllocation(cohort, totalBudget, constraints);
      setCohort(solved.optimizedApplicants || cohort);
      setSolver(solved);
      setIsSolving(false);
      toast.success(`Solver complete — ${solved.awardedCount || '?'} awards disbursed (₱${((solved.totalDisbursed || 0) / 1e6).toFixed(2)}M).`);
    }, 600);
  };

  const handleUpdateStatus = (id, updates) => {
    setCohort(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleExport = () => {
    const lines = [
      `# IskoFund Executive Summary`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `## Cohort`,
      `- Applicants: ${cohort.length}`,
      `- Awarded: ${cohort.filter(s => s.awarded).length}`,
      `- Total Disbursed: ₱${(solver.totalDisbursed || 0).toLocaleString()}`,
      `- Coverage Rate: ${solver.coverageRate || 0}%`,
      `- First-Gen Share: ${solver.equityDisbursementRate || 0}%`,
      `- Gini Coefficient: ${(solver.giniCoefficient || 0).toFixed(3)}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `iskofund_summary_${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary exported as Markdown.');
  };

  const SubTabBar = ({ tabs, active, setActive }) => (
    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10, border: '1px solid #e2e8f0', width: 'fit-content' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{
            padding: '6px 14px', borderRadius: 7, border: 'none',
            background: active === t.id ? '#fff' : 'transparent',
            color: active === t.id ? '#2563eb' : '#64748b',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
            boxShadow: active === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  if (activeTab === 'student') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper, #f4f2ed)' }}>
        <IskoFundPortal onSwitchToAdmin={() => setActiveTab('admin')} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onExportReport={handleExport} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* ── ADMIN DASHBOARD ── */}
        {activeTab === 'admin' && (
          <section>
            <div style={{ marginBottom: 20 }}>
              <SubTabBar
                tabs={[
                  { id: 'overview',   label: '📊 Overview' },
                  { id: 'applicants', label: `👥 Applicants (${cohort.length})` },
                  { id: 'solver',     label: '⚙️ Optimizer' },
                  { id: 'fairness',   label: '🛡️ Fairness Audit' },
                ]}
                active={adminSubTab}
                setActive={setAdminSubTab}
              />
            </div>
            {adminSubTab === 'overview'   && <AnalyticsOverview cohort={cohort} solverMetrics={solver} />}
            {adminSubTab === 'applicants' && <ApplicantTable cohort={cohort} onUpdateStudentStatus={handleUpdateStatus} />}
            {adminSubTab === 'solver'     && <OptimizationSolver onRunSolver={handleRunSolver} isSolving={isSolving} solverMetrics={solver} />}
            {adminSubTab === 'fairness'   && <FairnessAudit cohort={cohort} solverMetrics={solver} />}
          </section>
        )}

        {/* ── ARCHITECTURE ── */}
        {activeTab === 'architecture' && (
          <section>
            <div style={{ marginBottom: 20 }}>
              <SubTabBar
                tabs={[
                  { id: 'topology', label: '🗺️ System Topology' },
                  { id: 'ml',       label: '🤖 ML Pipeline' },
                  { id: 'math',     label: '📐 Math Formulas' },
                  { id: 'flow',     label: '🔄 Data Flow' },
                ]}
                active={archSubTab}
                setActive={setArchSubTab}
              />
            </div>
            {archSubTab === 'topology' && <ArchitectureDiagram />}
            {archSubTab === 'ml'       && <MLPipelineView />}
            {archSubTab === 'math'     && <MathFormulations />}
            {archSubTab === 'flow'     && <DataFlowSequence />}
          </section>
        )}

        {/* ── POLICY SANDBOX ── */}
        {activeTab === 'sandbox' && <WhatIfSimulator cohort={cohort} />}

        {/* ── API EXPLORER ── */}
        {activeTab === 'api' && <ApiDocs />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 48, borderTop: '1px solid #e2e8f0',
        background: '#fff', padding: '20px 24px', textAlign: 'center',
        fontSize: 12, color: '#94a3b8',
      }}>
        <strong style={{ color: '#475569' }}>IskoFund Decision Intelligence Platform</strong>
        &nbsp;·&nbsp;Capstone: System Design &amp; Predictive Analytics for Need-Based Aid
        &nbsp;·&nbsp;FERPA Compliant &nbsp;·&nbsp; EEOC Audited
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
