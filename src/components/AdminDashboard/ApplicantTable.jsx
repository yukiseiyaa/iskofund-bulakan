import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, CheckCircle2, Clock, XCircle, Filter, Eye, X, User } from 'lucide-react';
import { colors, card, inputStyle } from '../../styles/tokens';
import { useToast } from '../Toast';

const TIER_COLORS = {
  tier_1: { text: colors.success, bg: '#dcfce7', label: 'Tier 1' },
  tier_2: { text: colors.accent,  bg: '#dbeafe', label: 'Tier 2' },
  tier_3: { text: colors.purple,  bg: '#ede9fe', label: 'Tier 3' },
  tier_4: { text: colors.warning, bg: '#fef3c7', label: 'Tier 4' },
  tier_5: { text: colors.slate500,bg: '#f1f5f9', label: 'Tier 5' },
};

export default function ApplicantTable({ cohort, onUpdateStudentStatus }) {
  const [query, setQuery]           = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortKey, setSortKey]       = useState('compositeScore');
  const [sortDir, setSortDir]       = useState('desc');
  const [page, setPage]             = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const toast = useToast();

  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    let rows = [...cohort];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }
    if (tierFilter !== 'all') rows = rows.filter(s => s.needTier === tierFilter);
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === 'string' || typeof bv === 'string') {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      } else {
        cmp = (av ?? 0) - (bv ?? 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [cohort, query, tierFilter, sortKey, sortDir]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleApprove = (s) => {
    onUpdateStudentStatus(s.id, { adminStatus: 'Approved', awarded: true });
    toast.success(`${s.name} approved for financial aid.`);
  };
  const handleReject = (s) => {
    onUpdateStudentStatus(s.id, { adminStatus: 'Rejected', awarded: false });
    toast.error(`${s.name} application rejected.`);
  };
  const handlePend = (s) => {
    onUpdateStudentStatus(s.id, { adminStatus: 'Pending Review' });
    toast.info(`${s.name} set to Pending Review.`);
  };

  const Th = ({ col, label, sortable }) => {
    const active = sortKey === col;
    return (
      <th
        onClick={sortable ? () => toggleSort(col) : undefined}
        style={{
          padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          color: active ? colors.accent : colors.slate400,
          cursor: sortable ? 'pointer' : 'default', whiteSpace: 'nowrap',
          borderBottom: `1px solid ${colors.slate100}`,
          userSelect: 'none',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {label}
          {sortable && (active ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronsUpDown size={12} color={colors.slate300} />)}
        </span>
      </th>
    );
  };

  return (
    <div style={{ ...card(), overflow: 'hidden', animation: 'fadeUp 0.25s ease forwards' }}>
      {/* Toolbar */}
      <div style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', borderBottom: `1px solid ${colors.slate100}` }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} color={colors.slate400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Search by name or ID…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            style={{ ...inputStyle(), paddingLeft: 32, fontSize: 12 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.slate500 }}>
          <Filter size={13} />
          {['all','tier_1','tier_2','tier_3','tier_4','tier_5'].map(t => {
            const tc = t === 'all' ? null : TIER_COLORS[t];
            const active = tierFilter === t;
            return (
              <button
                key={t}
                onClick={() => { setTierFilter(t); setPage(1); }}
                style={{
                  padding: '4px 9px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
                  background: active ? (tc?.bg || colors.accentLight) : colors.slate100,
                  color: active ? (tc?.text || colors.accent) : colors.slate500,
                }}
              >
                {t === 'all' ? 'All' : tc?.label}
              </button>
            );
          })}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.slate400, whiteSpace: 'nowrap' }}>
          {total} record{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div style={{ padding: 50, textAlign: 'center', color: colors.slate400 }}>
          <p style={{ fontWeight: 600, color: colors.slate500, margin: 0 }}>No applicants found</p>
        </div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ background: colors.slate50 }}>
              <tr>
                <Th col="name"           label="Applicant"     sortable />
                <Th col="compositeScore" label="Need Score"    sortable />
                <Th col="needTier"       label="Tier"          sortable />
                <Th col="awardAmount"    label="Award"         sortable />
                <Th col="adminStatus"    label="Status"        />
                <Th col="actions"        label="Actions"       />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const tier = TIER_COLORS[s.needTier] || TIER_COLORS.tier_5;
                const statusConfig = {
                  'Approved':      { icon: <CheckCircle2 size={11} />, color: colors.success, bg: colors.successLight },
                  'Rejected':      { icon: <XCircle size={11} />,      color: colors.error,   bg: colors.errorLight },
                  'Pending Review':{ icon: <Clock size={11} />,         color: colors.warning, bg: colors.warningLight },
                  'Waitlisted':    { icon: <Clock size={11} />,         color: colors.slate500,bg: colors.slate100 },
                }[s.adminStatus] || { icon: <Clock size={11} />, color: colors.slate500, bg: colors.slate100 };

                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: `1px solid ${colors.slate50}`, transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = colors.slate50}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <p style={{ fontWeight: 700, color: colors.slate900, margin: 0, fontSize: 12 }}>{s.name}</p>
                      <p style={{ fontSize: 10, color: colors.slate400, margin: 0, fontFamily: 'monospace' }}>{s.id}</p>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: colors.accent }}>{s.compositeScore}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tier.text, background: tier.bg, padding: '2px 8px', borderRadius: 99 }}>
                        {tier.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: s.awarded ? colors.success : colors.slate400 }}>
                      {s.awarded ? `₱${(s.awardAmount || 0).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: statusConfig.color, background: statusConfig.bg, padding: '2px 8px', borderRadius: 99 }}>
                        {statusConfig.icon}
                        {s.adminStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedStudent(s)}
                          title="View Details"
                          style={{
                            padding: '4px 8px', borderRadius: 5, border: `1px solid ${colors.slate200}`,
                            background: '#fff', fontSize: 11, fontWeight: 600, color: colors.slate600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
                          }}
                        >
                          <Eye size={11} /> Details
                        </button>
                        <SmallBtn color={colors.success} onClick={() => handleApprove(s)} title="Approve">✓</SmallBtn>
                        <SmallBtn color={colors.warning}  onClick={() => handlePend(s)} title="Pending">⏸</SmallBtn>
                        <SmallBtn color={colors.error}    onClick={() => handleReject(s)} title="Reject">✕</SmallBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${colors.slate100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: colors.slate500 }}>
          <span>Page {page} of {pages} · {total} total</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <PageBtn disabled={page <= 1}  onClick={() => setPage(p => p - 1)}>← Prev</PageBtn>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
            ))}
            <PageBtn disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</PageBtn>
          </div>
        </div>
      )}

      {/* ── Progressive Disclosure: Student Details Modal ── */}
      {selectedStudent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
          zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{ ...card(), maxWidth: 500, width: '100%', padding: 24, background: '#fff', position: 'relative' }}>
            <button
              onClick={() => setSelectedStudent(null)}
              style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', cursor: 'pointer', color: colors.slate400 }}
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${colors.slate100}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 99, background: colors.accentLight, color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: colors.slate900 }}>{selectedStudent.name}</h3>
                <span style={{ fontSize: 11, color: colors.slate400, fontFamily: 'monospace' }}>ID: {selectedStudent.id}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
              <div style={{ background: colors.slate50, padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Need Score</span>
                <strong style={{ color: colors.accent, fontSize: 16, fontFamily: 'monospace' }}>{selectedStudent.compositeScore}/100</strong>
              </div>
              <div style={{ background: colors.slate50, padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Award Amount</span>
                <strong style={{ color: selectedStudent.awarded ? colors.success : colors.slate500, fontSize: 16, fontFamily: 'monospace' }}>
                  {selectedStudent.awarded ? `₱${(selectedStudent.awardAmount || 0).toLocaleString()}` : 'None'}
                </strong>
              </div>
              <div style={{ background: colors.slate50, padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Expected EFC</span>
                <strong style={{ fontFamily: 'monospace' }}>₱${(selectedStudent.efc || 0).toLocaleString()}</strong>
              </div>
              <div style={{ background: colors.slate50, padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Adjusted COA</span>
                <strong style={{ fontFamily: 'monospace' }}>₱${(selectedStudent.adjustedCOA || 0).toLocaleString()}</strong>
              </div>
              <div style={{ background: colors.slate50, padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Household Income</span>
                <strong style={{ fontFamily: 'monospace' }}>₱${(selectedStudent.annualHouseholdIncome || 0).toLocaleString()}/yr</strong>
              </div>
              <div style={{ background: colors.slate50, padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>First-Gen Status</span>
                <strong>{selectedStudent.isFirstGen ? 'Yes (Priority)' : 'No'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18, paddingTop: 12, borderTop: `1px solid ${colors.slate100}` }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ padding: '6px 14px', background: colors.accent, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallBtn({ color, onClick, title, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 24, height: 24, borderRadius: 5, border: `1px solid ${color}44`,
        background: hover ? `${color}22` : `${color}11`,
        color, fontWeight: 700, fontSize: 11, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  );
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '3px 8px', borderRadius: 5,
        border: `1px solid ${active ? colors.accent : colors.slate200}`,
        background: active ? colors.accentLight : '#fff',
        color: active ? colors.accent : disabled ? colors.slate300 : colors.slate600,
        fontWeight: 600, fontSize: 11, cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
