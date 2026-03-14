/**
 * Mock benefit calculation engine — approximates Washington state rules (2025).
 * In production this would be replaced by a Rule Atlas API call.
 *
 * All figures are monthly unless noted. Income is monthly gross.
 */

import type { ScenarioProgramResult, ScenarioResult } from './types';

// ─── SNAP (Food Assistance) ───────────────────────────────────────────────────
// Source: 7 USC § 2014; 7 CFR § 273.10; USDA FY2025 COLA
// WA uses broad-based categorical eligibility → gross limit 200% FPL

const SNAP_MAX_ALLOTMENT: Record<number, number> = {
  1: 292, 2: 536, 3: 975, 4: 1239, 5: 1420, 6: 1704, 7: 1889,
};
const SNAP_STANDARD_DEDUCTION: Record<number, number> = {
  1: 198, 2: 198, 3: 198, 4: 209, 5: 220, 6: 231,
};
const SNAP_GROSS_LIMIT: Record<number, number> = {
  1: 2311, 2: 3120, 3: 3929, 4: 4737, 5: 5546,
};

export function calculateSNAP(monthlyGross: number, householdSize = 3): number {
  const grossLimit = SNAP_GROSS_LIMIT[householdSize] ?? 5546;
  if (monthlyGross > grossLimit) return 0;

  const maxAllotment = SNAP_MAX_ALLOTMENT[householdSize] ?? 1889;
  const stdDeduction = SNAP_STANDARD_DEDUCTION[householdSize] ?? 231;

  // Net income: apply 20% earned income deduction, then standard deduction
  const netIncome = Math.max(0, monthlyGross * 0.8 - stdDeduction);

  // Benefit = max allotment − 30% of net income (benefit reduction rate)
  return Math.max(0, Math.round(maxAllotment - netIncome * 0.3));
}

// ─── Apple Health (Medicaid / CHIP) ──────────────────────────────────────────
// Source: 42 USC § 1396a; WAC 182-505-0100
// Adult Medicaid: 138% FPL; CHIP (children): 312% FPL

const FPL_2025_ANNUAL: Record<number, number> = {
  1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580,
};

export interface MedicaidStatus {
  adultCovered: boolean;
  childrenCovered: boolean;
  adultThresholdMonthly: number;
  childrenThresholdMonthly: number;
  // Monthly premium value saved (if covered)
  estimatedMonthlySavings: number;
}

export function getMedicaidStatus(monthlyGross: number, householdSize = 3): MedicaidStatus {
  const annualFPL = FPL_2025_ANNUAL[householdSize] ?? 36580;
  const adultThreshold  = (annualFPL * 1.38) / 12;
  const childrenThreshold = (annualFPL * 3.12) / 12;

  const adultCovered    = monthlyGross <= adultThreshold;
  const childrenCovered = monthlyGross <= childrenThreshold;

  // Rough market rate for comparable ACA coverage (single adult + 2 kids, WA)
  const estimatedMonthlySavings = (adultCovered ? 480 : 0) + (childrenCovered ? 340 : 0);

  return { adultCovered, childrenCovered, adultThresholdMonthly: Math.round(adultThreshold), childrenThresholdMonthly: Math.round(childrenThreshold), estimatedMonthlySavings };
}

// ─── EITC (Earned Income Tax Credit) ─────────────────────────────────────────
// Source: 26 USC § 32; IRS Rev. Proc. 2024-40 (2025 parameters, estimated)
// Returns MONTHLY equivalent

interface EITCParams { maxCredit: number; phaseInRate: number; phaseInEnd: number; plateauEnd: number; phaseOutRate: number; phaseOutEnd: number; }
const EITC_PARAMS_2025_SINGLE: Record<number, EITCParams> = {
  0: { maxCredit: 649,  phaseInRate: 0.0765, phaseInEnd: 8490,  plateauEnd: 10620, phaseOutRate: 0.0765, phaseOutEnd: 19524  },
  1: { maxCredit: 4328, phaseInRate: 0.34,   phaseInEnd: 10730, plateauEnd: 19524, phaseOutRate: 0.1598, phaseOutEnd: 46560  },
  2: { maxCredit: 7152, phaseInRate: 0.40,   phaseInEnd: 15060, plateauEnd: 19524, phaseOutRate: 0.2106, phaseOutEnd: 52918  },
  3: { maxCredit: 8046, phaseInRate: 0.45,   phaseInEnd: 15060, plateauEnd: 19524, phaseOutRate: 0.2106, phaseOutEnd: 56838  },
};

export function calculateMonthlyEITC(monthlyGross: number, numChildren = 2): number {
  const annual = monthlyGross * 12;
  const p = EITC_PARAMS_2025_SINGLE[Math.min(numChildren, 3)];
  if (!p) return 0;

  let credit = 0;
  if (annual <= p.phaseInEnd) {
    credit = annual * p.phaseInRate;
  } else if (annual <= p.plateauEnd) {
    credit = p.maxCredit;
  } else if (annual <= p.phaseOutEnd) {
    credit = Math.max(0, p.maxCredit - (annual - p.plateauEnd) * p.phaseOutRate);
  }

  return Math.round(credit / 12);
}

// ─── WIC ──────────────────────────────────────────────────────────────────────
// Source: 42 USC § 1786; WAC 246-790
// Income limit: 185% FPL. Monthly average WA benefit ~$68/child under 5 + pregnant/postpartum

export function calculateWIC(monthlyGross: number, householdSize = 3, childrenUnder5 = 1): number {
  const annualFPL = FPL_2025_ANNUAL[householdSize] ?? 36580;
  const limit = (annualFPL * 1.85) / 12;
  if (monthlyGross > limit) return 0;
  return childrenUnder5 * 68;
}

// ─── Working Connections Child Care (WA) ──────────────────────────────────────
// Source: RCW 43.216.136; WAC 170-290
// Available to working parents below 85% state median income (~$5,200/month for family of 3)
// Co-pay tiers based on income

export function calculateWCCC(monthlyGross: number, householdSize = 3, numChildren = 2): number {
  const SMI_85PCT = 5200; // ~85% SMI for family of 3, WA 2025
  if (monthlyGross > SMI_85PCT) return 0;

  // Full-day childcare market rate for 2 kids in WA: ~$2,400/month
  // Co-pay scales with income; rough approximation
  const marketRate = numChildren * 1200;
  const copayRate  = Math.min(0.07, monthlyGross / 50000);
  const copay      = Math.round(monthlyGross * copayRate);

  return Math.max(0, marketRate - copay);
}

// ─── Scenario modeler ─────────────────────────────────────────────────────────
// Computes impact of an income change across all programs

export function calculateScenario(
  baseIncome: number,
  newIncome: number,
  opts: { householdSize?: number; numChildren?: number; childrenUnder5?: number } = {}
): ScenarioResult {
  const { householdSize = 3, numChildren = 2, childrenUnder5 = 1 } = opts;

  const snapCurrent = calculateSNAP(baseIncome, householdSize);
  const snapNew     = calculateSNAP(newIncome,  householdSize);

  const medCurrent  = getMedicaidStatus(baseIncome, householdSize);
  const medNew      = getMedicaidStatus(newIncome,  householdSize);
  const medCurrentValue = medCurrent.estimatedMonthlySavings;
  const medNewValue     = medNew.estimatedMonthlySavings;

  const eitcCurrent = calculateMonthlyEITC(baseIncome, numChildren);
  const eitcNew     = calculateMonthlyEITC(newIncome,  numChildren);

  const wicCurrent  = calculateWIC(baseIncome, householdSize, childrenUnder5);
  const wicNew      = calculateWIC(newIncome,  householdSize, childrenUnder5);

  const programs: ScenarioProgramResult[] = [
    {
      programName: 'Food Assistance', officialName: 'SNAP',
      currentAmount: snapCurrent, newAmount: snapNew,
      change: snapNew - snapCurrent, lostEligibility: snapNew === 0 && snapCurrent > 0,
    },
    {
      programName: 'Health Coverage', officialName: 'Apple Health',
      currentAmount: medCurrentValue, newAmount: medNewValue,
      change: medNewValue - medCurrentValue,
      lostEligibility: medCurrentValue > 0 && medNewValue < medCurrentValue,
    },
    {
      programName: 'Tax Credit', officialName: 'EITC',
      currentAmount: eitcCurrent, newAmount: eitcNew,
      change: eitcNew - eitcCurrent, lostEligibility: false,
    },
    {
      programName: 'Nutrition (WIC)', officialName: 'WIC',
      currentAmount: wicCurrent, newAmount: wicNew,
      change: wicNew - wicCurrent, lostEligibility: wicNew === 0 && wicCurrent > 0,
    },
  ].filter(p => p.currentAmount > 0 || p.newAmount > 0);

  const totalBenefitChange = programs.reduce((s, p) => s + p.change, 0);
  const incomeChange = newIncome - baseIncome;
  const netChange = incomeChange + totalBenefitChange;

  // Cliff warning: net gain < 30% of gross income gain (benefits eroding most of the raise)
  let cliffWarning: string | undefined;
  if (incomeChange > 0 && netChange < incomeChange * 0.3 && netChange < incomeChange) {
    cliffWarning = `Earning $${incomeChange}/month more only nets you $${netChange}/month after benefit changes — a ${Math.round((netChange / incomeChange) * 100)}¢ return on each $1 earned.`;
  }

  return { baseIncome, newIncome, incomeChange, programs, totalBenefitChange, netChange, cliffWarning };
}
