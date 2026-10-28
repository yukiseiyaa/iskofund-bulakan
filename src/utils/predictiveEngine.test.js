import { describe, it, expect } from 'vitest';
import {
  calculatePovertyThreshold,
  calculateEFC,
  runPredictiveModel,
  solveOptimalAllocation,
  computeGini,
} from './predictiveEngine';

describe('calculatePovertyThreshold', () => {
  it('returns baseline threshold for family of 5', () => {
    expect(calculatePovertyThreshold(5)).toBe(107376);
  });

  it('increments threshold per additional member beyond 5', () => {
    expect(calculatePovertyThreshold(7)).toBe(107376 + 2 * 18000);
  });
});

describe('calculateEFC', () => {
  it('waives EFC for 4Ps beneficiaries', () => {
    const efc = calculateEFC({
      annualHouseholdIncome: 80000,
      householdSize: 4,
      is4PsBeneficiary: true,
      parentAssets: 10000,
    });
    expect(efc).toBe(0);
  });

  it('never returns negative EFC', () => {
    const efc = calculateEFC({
      annualHouseholdIncome: 10000,
      householdSize: 6,
      is4PsBeneficiary: false,
      parentAssets: 0,
      studentIncome: 0,
      studentAssets: 0,
    });
    expect(efc).toBeGreaterThanOrEqual(0);
  });
});

describe('runPredictiveModel', () => {
  it('does not penalize single-person households or only children', () => {
    const soloApplicant = {
      annualHouseholdIncome: 50000,
      householdSize: 1,
      siblingsInCollege: 0,
      parentAssets: 0,
      studentIncome: 0,
      studentAssets: 0,
      gpa: 1.75,
      livingArrangement: 'commuter',
      isFirstGen: true,
      hardshipType: 'none',
      hardshipSeverity: 1,
      regionalCostIndex: 1.0,
    };
    const result = runPredictiveModel(soloApplicant);
    expect(result.compositeScore).toBeGreaterThanOrEqual(50);
  });

  it('rewards Philippine GWA top honors (1.00 - 1.25)', () => {
    const summaStudent = {
      annualHouseholdIncome: 90000,
      householdSize: 4,
      siblingsInCollege: 1,
      gpa: 1.15,
      livingArrangement: 'commuter',
      isFirstGen: true,
    };
    const passingStudent = {
      ...summaStudent,
      gpa: 3.00,
    };
    const summaResult = runPredictiveModel(summaStudent);
    const passingResult = runPredictiveModel(passingStudent);

    const summaMerit = summaResult.shapExplanations.find(s => s.feature.includes('Academic'));
    const passingMerit = passingResult.shapExplanations.find(s => s.feature.includes('Academic'));

    expect(summaMerit.impact).toBeGreaterThan(passingMerit.impact);
    expect(summaResult.compositeScore).toBeGreaterThan(passingResult.compositeScore);
  });

  it('penalizes failing Philippine GWA (> 3.00)', () => {
    const failingStudent = {
      annualHouseholdIncome: 90000,
      householdSize: 4,
      siblingsInCollege: 1,
      gpa: 4.50,
      livingArrangement: 'commuter',
      isFirstGen: false,
    };
    const result = runPredictiveModel(failingStudent);
    const meritShap = result.shapExplanations.find(s => s.feature.includes('Academic'));
    expect(meritShap.direction).toBe('negative');
    expect(meritShap.impact).toBeLessThan(0);
  });
});

describe('computeGini', () => {
  it('returns 0 for identical non-zero values', () => {
    expect(computeGini([1000, 1000, 1000, 1000])).toBe(0);
  });

  it('returns 0 for empty array or all zeros', () => {
    expect(computeGini([])).toBe(0);
    expect(computeGini([0, 0, 0])).toBe(0);
  });

  it('correctly calculates high inequality when majority get zero', () => {
    // 1 recipient gets 1000, 3 get 0
    const gini = computeGini([0, 0, 0, 1000]);
    expect(gini).toBeGreaterThan(0.70);
  });
});

describe('solveOptimalAllocation', () => {
  const cohort = [
    { id: '1', name: 'Ana', annualHouseholdIncome: 60000, householdSize: 5, siblingsInCollege: 1, gpa: 1.25, isFirstGen: true, is4PsBeneficiary: true, livingArrangement: 'commuter' },
    { id: '2', name: 'Ben', annualHouseholdIncome: 75000, householdSize: 4, siblingsInCollege: 0, gpa: 1.50, isFirstGen: true, is4PsBeneficiary: false, livingArrangement: 'commuter' },
    { id: '3', name: 'Carla', annualHouseholdIncome: 250000, householdSize: 3, siblingsInCollege: 0, gpa: 2.20, isFirstGen: false, is4PsBeneficiary: false, livingArrangement: 'commuter' },
  ];

  it('enforces maximum award cap parameter', () => {
    const maxCap = 20000;
    const result = solveOptimalAllocation(cohort, 1000000, { maxAwardAmount: maxCap, minAwardAmount: 2000 });
    for (const applicant of result.optimizedApplicants) {
      if (applicant.awarded) {
        expect(applicant.awardAmount).toBeLessThanOrEqual(maxCap);
      }
    }
  });

  it('respects the total budget cap', () => {
    const budget = 30000;
    const result = solveOptimalAllocation(cohort, budget, { minAwardAmount: 2000 });
    expect(result.totalDisbursed).toBeLessThanOrEqual(budget);
  });
});
