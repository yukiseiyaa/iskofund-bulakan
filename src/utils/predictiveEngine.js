/**
 * Predictive Analytics & Allocation Engine for Need-Based Aid
 * Localized for the Philippine Municipal LGU Context
 * References:
 *   - RA 10931: Universal Access to Quality Tertiary Education Act (SUC/LUC students)
 *   - CHED Scholarship Programs (Grant-in-Aid, STUFAP, TDP)
 *   - DSWD 4Ps / Pantawid Pamilyang Pilipino Program
 *   - LGU Local Scholarship Ordinance
 *   - PSA Family Income Classification (Philippine Statistics Authority)
 */

// Philippine Poverty Threshold (PSA 2024 estimates, annual)
// National average: ~₱13,669/month per family; provincial lower
const BASE_POVERTY_ANNUAL_FAMILY = 107_376; // ₱107,376/yr for family of 5 (PSA)
const POVERTY_PER_ADDITIONAL = 18_000;      // increment per additional member

export function calculatePovertyThreshold(householdSize) {
  return BASE_POVERTY_ANNUAL_FAMILY + Math.max(0, householdSize - 5) * POVERTY_PER_ADDITIONAL;
}

/**
 * Philippine Tuition & Cost of Attendance Profiles (Annual, in PHP)
 * SUC = State University/College (tuition-free under RA 10931, misc fees apply)
 * Private HEI = Private Higher Education Institution
 * TESDA = Technical-Vocational (TVL track scholarship)
 */
export const COA_PROFILES = {
  on_campus: {
    tuition: 22_000,      // Private HEI average (RA 10931 covers SUC)
    housing: 36_000,      // Dormitory/boarding house (~₱3,000/mo)
    books: 8_000,         // Books & school supplies
    transportation: 12_000,
    personal: 6_000,
    total: 84_000,
    name: 'Private HEI — Boarding Student (₱84,000/yr)'
  },
  off_campus: {
    tuition: 22_000,
    housing: 30_000,      // Shared apartment
    books: 8_000,
    transportation: 15_000,
    personal: 7_000,
    total: 82_000,
    name: 'Private HEI — Off-Campus Renter (₱82,000/yr)'
  },
  commuter: {
    tuition: 0,           // SUC — covered by RA 10931
    housing: 0,
    books: 6_000,
    transportation: 18_000,  // Daily commute
    personal: 5_000,
    total: 29_000,
    name: 'State University (SUC) — Commuter, RA 10931 (₱29,000/yr)'
  },
  tesda: {
    tuition: 0,           // TESDA voucher-covered
    housing: 0,
    books: 4_000,
    transportation: 12_000,
    personal: 4_000,
    total: 20_000,
    name: 'TESDA / Tech-Voc Program — Local (₱20,000/yr)'
  }
};

/**
 * Philippine-adapted Expected Family Contribution (EFC)
 * Adapted from CHED STUFAP Financial Need Assessment methodology
 */
export function calculateEFC(profile) {
  const {
    annualHouseholdIncome = 120_000,
    householdSize = 5,
    siblingsInCollege = 1,
    parentAssets = 50_000,
    studentIncome = 15_000,
    studentAssets = 5_000,
    isFirstGen = false,
    is4PsBeneficiary = false,
  } = profile;

  // 1. Basic subsistence deduction (DSWD subsistence threshold × household)
  const subsistenceAllowance = calculatePovertyThreshold(householdSize);

  // 2. Available disposable income
  const withholdingTax = annualHouseholdIncome > 250_000
    ? (annualHouseholdIncome - 250_000) * 0.15
    : 0; // Philippine tax exemption ≤ ₱250k
  const availableIncome = Math.max(0, annualHouseholdIncome - subsistenceAllowance - withholdingTax);

  // Progressive assessment rate (adapted for PH income scale)
  let incomeRate = 0.10;
  if (availableIncome > 200_000) incomeRate = 0.35;
  else if (availableIncome > 100_000) incomeRate = 0.28;
  else if (availableIncome > 50_000)  incomeRate = 0.20;
  else if (availableIncome > 20_000)  incomeRate = 0.14;

  const parentContributionFromIncome = availableIncome * incomeRate;

  // 3. Asset Assessment (5% of liquid assets above ₱20k protection floor)
  const assetProtection = Math.min(50_000, householdSize * 10_000);
  const netAssets = Math.max(0, parentAssets - assetProtection);
  const parentContributionFromAssets = netAssets * 0.05;

  // 4. Student Contribution
  const studentContrib = Math.max(0, studentIncome - 20_000) * 0.5 + studentAssets * 0.20;

  // Divide parent contribution by number of children in college
  const totalParentContrib = (parentContributionFromIncome + parentContributionFromAssets) / Math.max(1, siblingsInCollege);
  let efc = Math.round(totalParentContrib + studentContrib);

  // Equity adjustments
  if (isFirstGen)        efc = Math.max(0, efc - 5_000);
  if (is4PsBeneficiary)  efc = 0; // 4Ps beneficiaries: zero EFC

  return Math.max(0, efc);
}

/**
 * Philippine Need Scoring Model (ML Simulation)
 */
export function runPredictiveModel(profile) {
  const {
    annualHouseholdIncome = 120_000,
    householdSize = 5,
    siblingsInCollege = 1,
    parentAssets = 50_000,
    studentIncome = 15_000,
    studentAssets = 5_000,
    gpa = 1.75,          // Philippine scale: 1.0 (best) – 5.0 (fail); stored as 4.0-scale for UI
    livingArrangement = 'commuter',
    isFirstGen = true,
    is4PsBeneficiary = false,
    hardshipType = 'none',
    hardshipSeverity = 1,
    regionalCostIndex = 1.00,
  } = profile;

  const coaData = COA_PROFILES[livingArrangement] || COA_PROFILES.commuter;
  const adjustedCOA = Math.round(coaData.total * regionalCostIndex);
  const efc = calculateEFC(profile);
  const rawFinancialNeed = Math.max(0, adjustedCOA - efc);
  const povertyLine = calculatePovertyThreshold(householdSize);
  const incomeToPovertyRatio = annualHouseholdIncome / povertyLine;

  // === ML Feature Weights ===
  let baseNeedScore = 50;

  // Feature 1: Income relative to poverty line
  let incomeFactor = 0;
  if (incomeToPovertyRatio <= 0.5) incomeFactor = 35;
  else if (incomeToPovertyRatio <= 1.0) incomeFactor = 28;
  else if (incomeToPovertyRatio <= 1.5) incomeFactor = 20;
  else if (incomeToPovertyRatio <= 2.5) incomeFactor = 8;
  else if (incomeToPovertyRatio <= 4.0) incomeFactor = -10;
  else incomeFactor = -30;

  // Feature 2: Dependents + concurrent enrollment
  const dependentsFactor = Math.min(18, Math.max(0, householdSize - 2) * 3 + Math.max(0, siblingsInCollege - 1) * 6);

  // Feature 3: Academic merit (Philippine GWA scale: 1.00 highest, 3.00 passing)
  // Accommodates Philippine 1.0–5.0 GWA (1.0 = best, 5.0 = fail) and legacy US 4.0 scale (3.0–4.0)
  let meritFactor = 0;
  if (gpa <= 3.0) {
    if (gpa <= 1.25) meritFactor = 20;
    else if (gpa <= 1.75) meritFactor = 15;
    else if (gpa <= 2.25) meritFactor = 10;
    else if (gpa <= 3.00) meritFactor = 5;
    else meritFactor = -4;
  } else if (gpa <= 4.0) {
    // US 4.0 scale fallback (for legacy mock records where higher is better)
    if (gpa >= 3.9) meritFactor = 20;
    else if (gpa >= 3.7) meritFactor = 15;
    else if (gpa >= 3.4) meritFactor = 10;
    else meritFactor = 5;
  } else {
    // Philippine failing grade (e.g. 4.0 conditional, 5.0 failed)
    meritFactor = -4;
  }

  // Feature 4: Hardship
  let hardshipFactor = 0;
  if (hardshipType !== 'none') {
    const weights = { medical: 3.5, job_loss: 4.0, single_parent: 3.0, natural_disaster: 4.2, ofw_dependent: 2.8 };
    hardshipFactor = Math.round((weights[hardshipType] || 2.5) * hardshipSeverity);
  }

  // Feature 5: First-gen / 4Ps equity boost
  const firstGenFactor = isFirstGen ? 8 : 0;
  const fourPsFactor = is4PsBeneficiary ? 12 : 0;

  // Feature 6: Regional/remote area
  const regionalFactor = Math.round((regionalCostIndex - 1.0) * 15);

  const compositeIndexRaw = baseNeedScore + incomeFactor + dependentsFactor + hardshipFactor + firstGenFactor + fourPsFactor + (meritFactor * 0.4) + regionalFactor;
  const compositeScore = Math.min(99, Math.max(1, Math.round(compositeIndexRaw)));

  const grantApprovalProbability = Math.min(0.99, Math.max(0.05, (compositeScore / 100) * 1.05 - 0.02));

  // === Philippine Grant Programs ===
  let tierInfo = {};
  let municipalGrant = 0;       // LGU Municipal Scholarship Award
  let chedGrantInAid = 0;       // CHED Grant-in-Aid (RA 10931 successor)
  let lguSupplemental = 0;      // LGU Supplemental Allowance
  let studentAssistantship = 0; // Campus student assistantship (₱500–₱1,500/mo)
  let stufapLoan = 0;           // CHED STUFAP emergency loan

  // CHED Grant-in-Aid estimate
  if (efc === 0 || is4PsBeneficiary) chedGrantInAid = 30_000;
  else if (efc <= 10_000) chedGrantInAid = 24_000;
  else if (efc <= 25_000) chedGrantInAid = 15_000;
  else if (efc <= 50_000) chedGrantInAid = 6_000;
  else chedGrantInAid = 0;

  // LGU Supplemental Grant
  if (incomeToPovertyRatio <= 2.0) {
    lguSupplemental = Math.round(Math.min(15_000, rawFinancialNeed * 0.20));
  }

  // Tier Classification
  if (compositeScore >= 85) {
    tierInfo = {
      id: 'tier_1',
      name: 'Pamantasan Municipal Full Scholarship (Tier 1)',
      badge: 'Full Coverage Award',
      description: 'Covers 100% of tuition, allowances, books, and living stipend for qualifying indigent scholars.'
    };
    municipalGrant = Math.max(0, adjustedCOA - chedGrantInAid - lguSupplemental - Math.min(efc, 2_000));
    studentAssistantship = 6_000;
    stufapLoan = 0;
  } else if (compositeScore >= 70) {
    tierInfo = {
      id: 'tier_2',
      name: 'Katuwang sa Pag-aaral — High Need Grant (Tier 2)',
      badge: 'High-Need Grant',
      description: 'Covers 75%–90% of demonstrated financial need. Priority for 4Ps beneficiaries and first-gen students.'
    };
    municipalGrant = Math.round(rawFinancialNeed * 0.70);
    studentAssistantship = 7_200;
    stufapLoan = 10_000;
  } else if (compositeScore >= 50) {
    tierInfo = {
      id: 'tier_3',
      name: 'Iskolar ng Bayan Bridge Scholarship (Tier 3)',
      badge: 'Balanced Aid Package',
      description: 'Combines merit-based and need-based components. Eligible for partial municipal tuition subsidy.'
    };
    municipalGrant = Math.round(rawFinancialNeed * 0.45);
    studentAssistantship = 6_000;
    stufapLoan = 12_000;
  } else if (compositeScore >= 30) {
    tierInfo = {
      id: 'tier_4',
      name: 'Tulong-Aralan Partial Assistance (Tier 4)',
      badge: 'Partial Aid & Assistantship',
      description: 'Targeted tuition discount and priority campus assistantship placement.'
    };
    municipalGrant = Math.round(rawFinancialNeed * 0.22);
    studentAssistantship = 9_600;
    stufapLoan = 15_000;
  } else {
    tierInfo = {
      id: 'tier_5',
      name: 'Advisory & External Referral (Tier 5)',
      badge: 'Referral / Self-Funded',
      description: 'Low calculated need. Eligible for CHED unsubsidized study loan and private scholarship referrals.'
    };
    municipalGrant = 3_000;
    studentAssistantship = 0;
    stufapLoan = 15_000;
  }

  const totalGiftAid = municipalGrant + chedGrantInAid + lguSupplemental;
  const totalSelfHelp = studentAssistantship + stufapLoan;
  const totalFinancialAidPackage = totalGiftAid + totalSelfHelp;
  const netPrice = Math.max(0, adjustedCOA - totalGiftAid);
  const remainingUnmetGap = Math.max(0, adjustedCOA - totalFinancialAidPackage - efc);

  // SHAP-style Explanations (Philippine context)
  const shapExplanations = [
    {
      feature: 'Annual Family Income vs. Poverty Threshold (PSA)',
      value: `${(incomeToPovertyRatio * 100).toFixed(0)}% of poverty line (₱${annualHouseholdIncome.toLocaleString()}/yr)`,
      impact: incomeFactor,
      direction: incomeFactor >= 0 ? 'positive' : 'negative',
      rationale: incomeFactor >= 0
        ? 'Low family income below PSA poverty threshold strongly amplifies financial vulnerability.'
        : 'Income level above poverty threshold reduces need-based eligibility score.'
    },
    {
      feature: 'Household Size & Concurrent Scholars',
      value: `${householdSize} household members (${siblingsInCollege} in school simultaneously)`,
      impact: dependentsFactor,
      direction: 'positive',
      rationale: 'Multiple dependents and simultaneous enrollment significantly reduce effective family contribution capacity.'
    },
    {
      feature: 'Special Hardship Circumstance',
      value: hardshipType === 'none' ? 'None Reported' : `${hardshipType.replace('_', ' ').toUpperCase()} (Severity: ${hardshipSeverity}/5)`,
      impact: hardshipFactor,
      direction: hardshipFactor > 0 ? 'positive' : 'neutral',
      rationale: hardshipFactor > 0
        ? 'Documented hardship qualifies for emergency priority scoring under LGU Ordinance No. 2024-12.'
        : 'No active emergency hardship flags in the household profile.'
    },
    {
      feature: 'First-Generation College Student',
      value: isFirstGen ? 'Yes — First in immediate family' : 'No',
      impact: firstGenFactor,
      direction: isFirstGen ? 'positive' : 'neutral',
      rationale: isFirstGen ? 'LGU equity policy grants bonus points to first-generation scholars per RA 10931 guidelines.' : 'Standard continuing-generation profile.'
    },
    {
      feature: '4Ps / Pantawid Beneficiary Status',
      value: is4PsBeneficiary ? 'Verified 4Ps Beneficiary (DSWD)' : 'Not enrolled in 4Ps',
      impact: fourPsFactor,
      direction: fourPsFactor > 0 ? 'positive' : 'neutral',
      rationale: is4PsBeneficiary
        ? 'DSWD-verified 4Ps household receives maximum priority and automatic EFC waiver.'
        : 'Household not listed as active 4Ps beneficiary in DSWD registry.'
    },
    {
      feature: 'Academic Performance (GPA/GWA Index)',
      value: gpa <= 3.0
        ? `GWA: ${gpa.toFixed(2)} (Philippine Scale: 1.00 Highest – 3.00 Passing)`
        : (gpa <= 4.0 ? `GPA: ${gpa.toFixed(2)} / 4.0 (CHED Conversion Scale)` : `GWA: ${gpa.toFixed(2)} (Failing / Below 3.00 Passing)`),
      impact: Math.round(meritFactor * 0.4),
      direction: meritFactor >= 0 ? 'positive' : 'negative',
      rationale: (gpa <= 1.75 || (gpa > 3.0 && gpa <= 4.0 && gpa >= 3.5))
        ? 'Excellent academic standing qualifies for merit-need co-funding enhancement.'
        : (gpa <= 3.0 ? 'Meets minimum academic standing requirement.' : 'Academic standing below minimum retention threshold.')
    }
  ];

  return {
    compositeScore,
    probability: grantApprovalProbability,
    efc,
    adjustedCOA,
    rawFinancialNeed,
    netPrice,
    remainingUnmetGap,
    tier: tierInfo,
    breakdown: {
      institutionalGrant: municipalGrant,
      federalPellEstimate: chedGrantInAid,
      stateOpportunityGrant: lguSupplemental,
      workStudy: studentAssistantship,
      subsidizedLoan: stufapLoan,
      totalGiftAid,
      totalSelfHelp,
      totalFinancialAidPackage
    },
    shapExplanations
  };
}

/**
 * Constrained Budget Optimization (LGU Annual Scholarship Fund)
 */
export function solveOptimalAllocation(cohort, totalBudget, constraints = {}) {
  const maxCapPerStudent = constraints.maxCapPerStudent ?? constraints.maxAwardAmount ?? 80_000;
  const minAwardThreshold = constraints.minAwardThreshold ?? constraints.minAwardAmount ?? 2_000;
  const equityFloorRatio = constraints.equityFloorRatio ?? (constraints.minFirstGenPct != null ? constraints.minFirstGenPct / 100 : 0.40);
  const meritWeight = constraints.meritWeight ?? 0.25;
  const needWeight = constraints.needWeight ?? 0.75;

  const scoredApplicants = cohort.map(student => {
    const analysis = runPredictiveModel(student);
    const meritRatio = student.gpa <= 3.0
      ? Math.max(0, (3.0 - student.gpa) / 2.0)
      : Math.max(0, (student.gpa - 2.0) / 2.0);
    const priorityScore = (analysis.compositeScore * needWeight) + (meritRatio * 100 * meritWeight);
    return {
      ...student,
      analysis,
      priorityScore,
      compositeScore: analysis.compositeScore,
      efc: analysis.efc,
      adjustedCOA: analysis.adjustedCOA,
      needTier: analysis.tier?.id,
      awardAmount: analysis.breakdown.totalGiftAid,
      awarded: false,
      adminStatus: 'Pending Review',
      requestedNeed: analysis.rawFinancialNeed,
      allocatedGrant: 0,
    };
  });

  scoredApplicants.sort((a, b) => b.priorityScore - a.priorityScore);

  let remainingBudget = totalBudget;
  let totalDisbursed = 0;
  let totalFirstGenDisbursed = 0;
  const giniValues = [];

  // Phase 1: Equity allocation (4Ps + first-gen + Tier 1)
  const highPriority = scoredApplicants.filter(s => s.analysis.compositeScore >= 70 || s.isFirstGen || s.is4PsBeneficiary);
  for (const student of highPriority) {
    if (remainingBudget <= minAwardThreshold) break;
    const grant = Math.min(maxCapPerStudent, student.analysis.breakdown.institutionalGrant, remainingBudget);
    if (grant >= minAwardThreshold) {
      student.allocatedGrant = grant;
      student.awardAmount = grant;
      student.awarded = true;
      student.adminStatus = 'Approved';
      remainingBudget -= grant;
      totalDisbursed += grant;
      giniValues.push(grant);
      if (student.isFirstGen || student.is4PsBeneficiary) totalFirstGenDisbursed += grant;
    }
  }

  // Phase 2: General allocation
  for (const student of scoredApplicants) {
    if (student.awarded) continue;
    if (remainingBudget <= minAwardThreshold) { student.adminStatus = 'Waitlisted'; continue; }
    const grant = Math.min(maxCapPerStudent, student.analysis.breakdown.institutionalGrant, remainingBudget);
    if (grant >= minAwardThreshold) {
      student.allocatedGrant = grant;
      student.awardAmount = grant;
      student.awarded = true;
      student.adminStatus = 'Approved';
      remainingBudget -= grant;
      totalDisbursed += grant;
      giniValues.push(grant);
      if (student.isFirstGen || student.is4PsBeneficiary) totalFirstGenDisbursed += grant;
    } else {
      student.adminStatus = 'Waitlisted';
    }
  }

  // Compute Gini over entire cohort (including ₱0 allocations for unfunded applicants)
  const allAllocations = scoredApplicants.map(s => s.awarded ? s.allocatedGrant : 0);
  const gini = computeGini(allAllocations);
  const approvedCount = scoredApplicants.filter(s => s.awarded).length;
  const coverageRate = approvedCount > 0 ? ((approvedCount / scoredApplicants.length) * 100).toFixed(1) : '0.0';
  const equityDisbursementRate = totalDisbursed > 0 ? ((totalFirstGenDisbursed / totalDisbursed) * 100).toFixed(1) : '0.0';
  const budgetUtilization = totalBudget > 0 ? ((totalDisbursed / totalBudget) * 100).toFixed(1) : '0.0';

  return {
    optimizedApplicants: scoredApplicants,
    totalBudget,
    totalDisbursed,
    remainingBudget,
    approvedCount,
    awardedCount: approvedCount,
    totalApplicants: scoredApplicants.length,
    coverageRate,
    equityDisbursementRate,
    budgetUtilization,
    giniCoefficient: gini,
    fairnessAlerts: gini > 0.35
      ? [{ type: 'High Gini Coefficient', message: `Gini of ${gini.toFixed(3)} exceeds 0.35 equity ceiling. Review allocation weights.` }]
      : [],
  };
}

export function computeGini(values) {
  if (!values || !values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  let total = 0;
  let weightedSum = 0;
  for (let i = 0; i < n; i++) {
    const v = sorted[i];
    total += v;
    weightedSum += (i + 1) * v;
  }
  if (total === 0) return 0;
  const gini = (2 * weightedSum - (n + 1) * total) / (n * total);
  return Math.max(0, Math.min(1, parseFloat(gini.toFixed(3))));
}
