/**
 * Mock benefit calculation engine — approximates state-specific rules (2025).
 * Supports WA (Washington), IL (Illinois), TX (Texas).
 * In production this would be replaced by a Rule Atlas API call.
 *
 * All figures are monthly unless noted. Income is monthly gross.
 */

import type { ScenarioProgramResult, ScenarioResult } from './types';

// ─── FPL 2025 (annual, by household size) ─────────────────────────────────────
const FPL_2025_ANNUAL: Record<number, number> = {
  1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580,
};

// ─── SNAP (Food Assistance) ───────────────────────────────────────────────────
// Source: 7 USC § 2014; 7 CFR § 273.10; USDA FY2025 COLA
// Gross income limits vary by state BBCE policy:
//   WA → 200% FPL (broad-based categorical eligibility)
//   IL / TX → 165% FPL
const SNAP_GROSS_LIMIT: Record<string, Record<number, number>> = {
  WA: { 1: 2510, 2: 3407, 3: 4303, 4: 5200, 5: 6097 }, // 200% FPL
  IL: { 1: 2071, 2: 2811, 3: 3550, 4: 4290, 5: 5030 }, // 165% FPL
  TX: { 1: 2071, 2: 2811, 3: 3550, 4: 4290, 5: 5030 }, // 165% FPL
};

const SNAP_MAX_ALLOTMENT: Record<number, number> = {
  1: 292, 2: 536, 3: 975, 4: 1239, 5: 1420, 6: 1704, 7: 1889,
};
const SNAP_STANDARD_DEDUCTION: Record<number, number> = {
  1: 198, 2: 198, 3: 198, 4: 209, 5: 220, 6: 231,
};

export function calculateSNAP(monthlyGross: number, householdSize = 3, state = 'WA'): number {
  const stateLimits = SNAP_GROSS_LIMIT[state] ?? SNAP_GROSS_LIMIT.WA;
  const grossLimit = stateLimits[householdSize] ?? 6097;
  if (monthlyGross > grossLimit) return 0;

  const maxAllotment = SNAP_MAX_ALLOTMENT[householdSize] ?? 1889;
  const stdDeduction = SNAP_STANDARD_DEDUCTION[householdSize] ?? 231;

  // Net income: apply 20% earned income deduction, then standard deduction
  const netIncome = Math.max(0, monthlyGross * 0.8 - stdDeduction);

  // Benefit = max allotment − 30% of net income (benefit reduction rate)
  return Math.max(0, Math.round(maxAllotment - netIncome * 0.3));
}

// ─── Medicaid ─────────────────────────────────────────────────────────────────
// WA: Apple Health — adult at 138% FPL; CHIP (children) at 312% FPL
// IL: Medicaid — expanded; adult at 138% FPL; AllKids (children) at 300% FPL
// TX: Did NOT expand Medicaid. Adults without disability/pregnancy/caretaker role
//     generally ineligible. TX CHIP covers children at 201% FPL.
//     → Adult health coverage modeled as Marketplace Credits instead (see below).

export interface MedicaidStatus {
  adultCovered: boolean;
  childrenCovered: boolean;
  adultThresholdMonthly: number;
  childrenThresholdMonthly: number;
  estimatedMonthlySavings: number;
}

export function getMedicaidStatus(monthlyGross: number, householdSize = 3, state = 'WA'): MedicaidStatus {
  const annualFPL = FPL_2025_ANNUAL[householdSize] ?? 36580;

  if (state === 'TX') {
    // TX: Adults generally fall into the coverage gap — no expansion, no APTC below 100% FPL.
    // Modeled separately as Marketplace Credits. CHIP covers children at 201% FPL.
    const childrenThreshold = (annualFPL * 2.01) / 12;
    const childrenCovered = monthlyGross <= childrenThreshold;
    return {
      adultCovered: false,
      childrenCovered,
      adultThresholdMonthly: 0,
      childrenThresholdMonthly: Math.round(childrenThreshold),
      estimatedMonthlySavings: childrenCovered ? 280 : 0,
    };
  }

  // WA and IL: both expanded Medicaid at 138% FPL
  const adultThreshold    = (annualFPL * 1.38) / 12;
  const childrenThreshold = state === 'IL'
    ? (annualFPL * 3.00) / 12  // IL AllKids (CHIP) at 300% FPL
    : (annualFPL * 3.12) / 12; // WA CHIP at 312% FPL

  const adultCovered    = monthlyGross <= adultThreshold;
  const childrenCovered = monthlyGross <= childrenThreshold;

  // Rough market-rate premium savings for comparable ACA coverage
  const adultSavings = state === 'IL' ? 400 : 480;
  const childSavings = state === 'IL' ? 280 : 340;
  const estimatedMonthlySavings = (adultCovered ? adultSavings : 0) + (childrenCovered ? childSavings : 0);

  return {
    adultCovered,
    childrenCovered,
    adultThresholdMonthly: Math.round(adultThreshold),
    childrenThresholdMonthly: Math.round(childrenThreshold),
    estimatedMonthlySavings,
  };
}

// ─── ACA Marketplace Credits (TX primary adult health coverage) ───────────────
// Source: 26 USC § 36B; IRS Rev. Proc. 2024-40 (2025 parameters)
// Available at 100–400% FPL. In non-expansion states like TX, adults at 100–138%
// FPL qualify for APTCs (not Medicaid). Subsidies phase out gradually above 138%.

export function calculateMarketplaceCredits(monthlyGross: number, householdSize = 2): number {
  const annualFPL  = FPL_2025_ANNUAL[householdSize] ?? 36580;
  const annualGross = monthlyGross * 12;
  const fplPct     = annualGross / annualFPL;

  // Below 100% FPL → TX coverage gap (no Medicaid, no APTC)
  // Above 400% FPL → subsidies phase out
  if (fplPct < 1.0 || fplPct > 4.0) return 0;

  // Benchmark silver plan monthly premium in TX (2025 estimate, scales with household)
  const benchmarkPremium = Math.min(1400, 650 + (householdSize - 1) * 550);

  // Required contribution slides: ~2% at 100% FPL → ~8.5% at 300%+ FPL
  const requiredPct = fplPct <= 1.5
    ? 0.02 + (fplPct - 1.0) * 0.04       // 2%–4% at 100–150% FPL
    : fplPct <= 3.0
      ? 0.04 + (fplPct - 1.5) * 0.03     // 4%–8.5% at 150–300% FPL
      : 0.085;                            // capped at 8.5% above 300% FPL

  const requiredContribution = Math.round((annualGross * requiredPct) / 12);
  return Math.max(0, benchmarkPremium - requiredContribution);
}

// ─── EITC (Earned Income Tax Credit) ─────────────────────────────────────────
// Federal: 26 USC § 32; IRS Rev. Proc. 2024-40 (2025 parameters)
// IL state supplement: 20% of federal EITC (effective 2023+)
// TX: Federal only (no state EITC)
// Returns MONTHLY equivalent

interface EITCParams {
  maxCredit: number; phaseInRate: number; phaseInEnd: number;
  plateauEnd: number; phaseOutRate: number; phaseOutEnd: number;
}
const EITC_PARAMS_2025_SINGLE: Record<number, EITCParams> = {
  0: { maxCredit: 649,  phaseInRate: 0.0765, phaseInEnd: 8490,  plateauEnd: 10620, phaseOutRate: 0.0765, phaseOutEnd: 19524 },
  1: { maxCredit: 4328, phaseInRate: 0.34,   phaseInEnd: 10730, plateauEnd: 19524, phaseOutRate: 0.1598, phaseOutEnd: 46560 },
  2: { maxCredit: 7152, phaseInRate: 0.40,   phaseInEnd: 15060, plateauEnd: 19524, phaseOutRate: 0.2106, phaseOutEnd: 52918 },
  3: { maxCredit: 8046, phaseInRate: 0.45,   phaseInEnd: 15060, plateauEnd: 19524, phaseOutRate: 0.2106, phaseOutEnd: 56838 },
};

export function calculateMonthlyEITC(monthlyGross: number, numChildren = 2, state = 'WA'): number {
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

  // IL state supplement: 20% of federal EITC (Source: 35 ILCS 5/212)
  if (state === 'IL') credit *= 1.20;

  return Math.round(credit / 12);
}

// ─── WIC ──────────────────────────────────────────────────────────────────────
// Source: 42 USC § 1786
// Income limit: 185% FPL. Monthly benefit per child under 5 varies by state.

export function calculateWIC(monthlyGross: number, householdSize = 3, childrenUnder5 = 1, state = 'WA'): number {
  if (childrenUnder5 === 0) return 0;
  const annualFPL = FPL_2025_ANNUAL[householdSize] ?? 36580;
  const limit = (annualFPL * 1.85) / 12;
  if (monthlyGross > limit) return 0;

  const perChild = state === 'IL' ? 60 : state === 'TX' ? 65 : 68;
  return childrenUnder5 * perChild;
}

// ─── WA Working Connections Child Care (WCCC) ─────────────────────────────────
// Source: RCW 43.216.136; WAC 170-290
// Available to working parents below 85% state median income (~$5,200/month for family of 3)

export function calculateWCCC(monthlyGross: number, householdSize = 3, numChildren = 2): number {
  const SMI_85PCT = 5200; // ~85% SMI for family of 3, WA 2025
  if (monthlyGross > SMI_85PCT || numChildren === 0) return 0;

  const marketRate = numChildren * 1200; // Full-day childcare market rate for WA
  const copayRate  = Math.min(0.07, monthlyGross / 50000);
  const copay      = Math.round(monthlyGross * copayRate);

  return Math.max(0, marketRate - copay);
}

// ─── IL Child Care Assistance Program (CCAP) ──────────────────────────────────
// Source: 305 ILCS 5/9A-11; 89 Ill. Admin. Code § 50
// Available to working parents below 185% state median income
// IL SMI 185% for family of 2 ≈ $4,220/month (IL DHS 2025)

export function calculateCCAP(monthlyGross: number, householdSize = 2, numChildren = 1): number {
  const IL_SMI_185PCT = householdSize <= 2 ? 4220 : 5100;
  if (monthlyGross > IL_SMI_185PCT || numChildren === 0) return 0;

  // Full-day infant/toddler care market rate in IL (metro average, 2025)
  const marketRate = numChildren * 1350;

  // Sliding co-pay scale based on income (IL DHS co-pay table approximation)
  const copay = monthlyGross < 1000
    ? 35
    : Math.min(200, Math.round(monthlyGross * 0.05));

  return Math.max(0, marketRate - copay);
}

// ─── State attribution labels ─────────────────────────────────────────────────
export const STATE_RULE_LABELS: Record<string, string> = {
  WA: 'WA state',
  IL: 'IL state',
  TX: 'TX state',
};

// ─── Scenario modeler ─────────────────────────────────────────────────────────
// Computes impact of an income change across programs appropriate to the state

export function calculateScenario(
  baseIncome: number,
  newIncome: number,
  opts: { householdSize?: number; numChildren?: number; childrenUnder5?: number; state?: string } = {}
): ScenarioResult {
  const { householdSize = 3, numChildren = 2, childrenUnder5 = 1, state = 'WA' } = opts;

  const programs: ScenarioProgramResult[] = [];

  // ── SNAP ────────────────────────────────────────────────────────────────────
  const snapCurrent = calculateSNAP(baseIncome, householdSize, state);
  const snapNew     = calculateSNAP(newIncome,  householdSize, state);
  if (snapCurrent > 0 || snapNew > 0) {
    programs.push({
      programName: 'Food Assistance', officialName: 'SNAP',
      currentAmount: snapCurrent, newAmount: snapNew,
      change: snapNew - snapCurrent, lostEligibility: snapNew === 0 && snapCurrent > 0,
    });
  }

  // ── Health coverage — state-specific ────────────────────────────────────────
  if (state === 'TX') {
    // TX did not expand Medicaid. Show ACA Marketplace Credits for income-eligible adults.
    const mktCurrent = calculateMarketplaceCredits(baseIncome, householdSize);
    const mktNew     = calculateMarketplaceCredits(newIncome,  householdSize);
    if (mktCurrent > 0 || mktNew > 0) {
      programs.push({
        programName: 'Marketplace Credits', officialName: 'ACA APTC',
        currentAmount: mktCurrent, newAmount: mktNew,
        change: mktNew - mktCurrent, lostEligibility: mktNew === 0 && mktCurrent > 0,
      });
    }
    // TX CHIP for children (if any) — folded into children's health note rather than separate row
  } else {
    // WA / IL: Medicaid expansion covers adults at 138% FPL
    const medCurrent      = getMedicaidStatus(baseIncome, householdSize, state);
    const medNew          = getMedicaidStatus(newIncome,  householdSize, state);
    const medCurrentValue = medCurrent.estimatedMonthlySavings;
    const medNewValue     = medNew.estimatedMonthlySavings;
    const officialName    = state === 'IL' ? 'Medicaid' : 'Apple Health';
    if (medCurrentValue > 0 || medNewValue > 0) {
      programs.push({
        programName: 'Health Coverage', officialName: officialName,
        currentAmount: medCurrentValue, newAmount: medNewValue,
        change: medNewValue - medCurrentValue,
        lostEligibility: medCurrentValue > 0 && medNewValue < medCurrentValue,
      });
    }
  }

  // ── EITC ─────────────────────────────────────────────────────────────────────
  const eitcCurrent = calculateMonthlyEITC(baseIncome, numChildren, state);
  const eitcNew     = calculateMonthlyEITC(newIncome,  numChildren, state);
  if (eitcCurrent > 0 || eitcNew > 0) {
    const eitcOfficialName = state === 'IL' ? 'EITC + IL EITC' : 'EITC';
    programs.push({
      programName: 'Tax Credit', officialName: eitcOfficialName,
      currentAmount: eitcCurrent, newAmount: eitcNew,
      change: eitcNew - eitcCurrent, lostEligibility: false,
    });
  }

  // ── WIC ──────────────────────────────────────────────────────────────────────
  const wicCurrent = calculateWIC(baseIncome, householdSize, childrenUnder5, state);
  const wicNew     = calculateWIC(newIncome,  householdSize, childrenUnder5, state);
  if (childrenUnder5 > 0 && (wicCurrent > 0 || wicNew > 0)) {
    programs.push({
      programName: 'Nutrition (WIC)', officialName: 'WIC',
      currentAmount: wicCurrent, newAmount: wicNew,
      change: wicNew - wicCurrent, lostEligibility: wicNew === 0 && wicCurrent > 0,
    });
  }

  // ── Childcare — state-specific ───────────────────────────────────────────────
  if (numChildren > 0) {
    if (state === 'WA') {
      const wcccCurrent = calculateWCCC(baseIncome, householdSize, numChildren);
      const wcccNew     = calculateWCCC(newIncome,  householdSize, numChildren);
      if (wcccCurrent > 0 || wcccNew > 0) {
        programs.push({
          programName: 'Childcare', officialName: 'WCCC',
          currentAmount: wcccCurrent, newAmount: wcccNew,
          change: wcccNew - wcccCurrent, lostEligibility: wcccNew === 0 && wcccCurrent > 0,
        });
      }
    } else if (state === 'IL') {
      const ccapCurrent = calculateCCAP(baseIncome, householdSize, numChildren);
      const ccapNew     = calculateCCAP(newIncome,  householdSize, numChildren);
      if (ccapCurrent > 0 || ccapNew > 0) {
        programs.push({
          programName: 'Childcare', officialName: 'CCAP',
          currentAmount: ccapCurrent, newAmount: ccapNew,
          change: ccapNew - ccapCurrent, lostEligibility: ccapNew === 0 && ccapCurrent > 0,
        });
      }
    }
    // TX: No state childcare subsidy modeled (Demo 3 persona has no children)
  }

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
