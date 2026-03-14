/**
 * Pre-populated demo data for /?demo=1
 * Persona: Maya — single parent, 2 kids (ages 4 & 7), Washington state.
 * Income: 25 hrs/week × $16/hr = $1,733/month gross.
 *
 * Benefit figures computed via mockCalculations.ts and rounded for readability.
 * In a live Rule Atlas integration, these would come from the API.
 */

import type { Message, BenefitPrediction } from './types';

export const DEMO_BASE_INCOME = 1733; // monthly gross
export const DEMO_HOUSEHOLD = { size: 3, numChildren: 2, childrenUnder5: 1 };

export const DEMO_MESSAGES: Message[] = [
  {
    id: 'demo-0',
    role: 'assistant',
    content: "Tell me a little about what's going on in your life right now — whatever feels most pressing. I'm here to help figure out what support might be available to you.",
    timestamp: Date.now() - 600000,
  },
  {
    id: 'demo-1',
    role: 'user',
    content: "I'm a single mom with two kids, ages 4 and 7. I lost my job a few months ago and just started a part-time position — 25 hours a week at $16 an hour. Rent just jumped from $1,400 to $1,700 and I'm not sure we can make it work. We don't have health insurance either.",
    timestamp: Date.now() - 540000,
  },
  {
    id: 'demo-2',
    role: 'assistant',
    content: "That's a lot to hold — a new job that doesn't quite cover what it used to, rent going up right when you need stability most, and no healthcare safety net for you or your kids.\n\nA couple of things would help me point you in the right direction. Where are you located? And is the part-time situation something you'd like to change, or does it work for now with the kids' schedules?",
    timestamp: Date.now() - 480000,
  },
  {
    id: 'demo-3',
    role: 'user',
    content: "Washington state. The hours work for school pickup but I'd take more if they were available. The grocery situation is what's really stressing me out.",
    timestamp: Date.now() - 420000,
  },
  {
    id: 'demo-4',
    role: 'assistant',
    content: "Washington is actually one of the better states for this situation — there's more available there than in a lot of places.\n\nLet me make sure I've got the full picture. You're a household of three in Washington — you, a 4-year-old, and a 7-year-old. You're working 25 hours/week at $16/hour, bringing in about $1,733/month before taxes. Rent is $1,700/month, and you have no health coverage for any of you right now.\n\nDoes that sound right, or am I missing anything?",
    timestamp: Date.now() - 360000,
  },
  {
    id: 'demo-5',
    role: 'user',
    content: "Yes, that's exactly right.",
    timestamp: Date.now() - 300000,
  },
  {
    id: 'demo-6',
    role: 'assistant',
    content: "Okay. Based on your situation, I can see two programs that would make a significant immediate difference — and I want to start there because they're both very likely available to you right now.\n\nThe first is food assistance. At your income and household size, Washington's rules engine calculates you'd receive $619/month toward groceries — that's the precise figure, not an estimate. It's based on your net income after the standard deductions the law allows.\n\nThe second is health coverage. At $1,733/month for a household of three, you fall below the threshold for Washington's Apple Health for all three of you — yourself included. That's $0 in premiums, covering doctor visits, prescriptions, dental, and vision.\n\nTogether, those two programs are worth about $1,439/month in real value. I've added both to your Benefits panel on the left.\n\nHow are you feeling about this? Want to keep going, or do you have questions about either of these first?",
    timestamp: Date.now() - 240000,
  },
  {
    id: 'demo-7',
    role: 'user',
    content: "That's more than I expected. What if I pick up more hours — like if I went to 35 hours a week? I don't want to take these and then lose them.",
    timestamp: Date.now() - 180000,
  },
  {
    id: 'demo-8',
    role: 'assistant',
    content: "That's exactly the right question to ask — and the answer is more encouraging than you might expect.\n\nAt 35 hours/week ($24,080/year), your SNAP benefit would decrease from $619 to $555/month — a $64/month reduction. But you'd still be well below the Medicaid threshold for your family, so all three of you stay covered.\n\nThe net picture: you'd gain roughly $667/month in income, lose $64/month in SNAP. That's a net gain of about $603/month — close to the full value of the extra hours.\n\nI've updated the income simulator in your Benefits panel so you can explore different scenarios. Drag the slider and you'll see exactly how each program responds.\n\nThe cliff people worry about is real in some situations, but at your income level, moving from 25 to 35 hours works in your favor. The system isn't a trap here.",
    timestamp: Date.now() - 120000,
  },
];

export const DEMO_BENEFIT_CARDS: BenefitPrediction[] = [
  {
    programName: 'Food Assistance',
    officialName: 'SNAP',
    confidence: 'high',
    estimatedValue: 'Around $580-640/month for your household',
    exactAmount: '$619/month',
    citation: '7 USC § 2014; 7 CFR § 273.10',
    verifiedBy: 'rule-atlas',
    description: "At $1,733/month for a household of three in Washington, the rules engine calculates your benefit precisely. This would cover most of your grocery budget.",
    whatItCovers: "Groceries at most major stores — produce, meat, dairy, bread, pantry staples. Does not cover prepared hot foods, alcohol, or household supplies.",
    howToApply: "Apply online at Washington Connection — takes about 20 minutes and you can do it from your phone.",
    timeEstimate: "About 20 minutes online",
    documentsNeeded: ["Photo ID", "Proof of Washington address", "Recent pay stubs or offer letter", "Your children's birth certificates"],
    applicationUrl: "https://www.washingtonconnection.org",
  },
  {
    programName: 'Health Coverage',
    officialName: 'Apple Health (Medicaid)',
    confidence: 'high',
    estimatedValue: 'Full coverage, $0 premium for all three',
    exactAmount: '$0 premium — full coverage for all three',
    citation: '42 USC § 1396a; WAC 182-505-0100',
    verifiedBy: 'rule-atlas',
    description: "Your income ($1,733/month) is below the 138% FPL threshold for adult Medicaid ($2,859/month for a family of three). Your children qualify easily under CHIP at 312% FPL.",
    whatItCovers: "Doctor visits, prescriptions, dental, vision, mental health, and hospital care. No copays at your income level.",
    howToApply: "Apply at Washington Connection — same application as SNAP, you can do both at once.",
    timeEstimate: "Done in the same application as food assistance",
    documentsNeeded: ["Same documents as SNAP — no additional paperwork needed"],
    applicationUrl: "https://www.washingtonconnection.org",
  },
  {
    programName: 'Tax Refund Boost',
    officialName: 'Earned Income Tax Credit (EITC)',
    confidence: 'high',
    estimatedValue: 'Around $5,800-6,200 at tax time',
    exactAmount: '$6,120/year (~$510/month)',
    citation: '26 USC § 32; IRS Rev. Proc. 2024-40',
    verifiedBy: 'rule-atlas',
    description: "With two qualifying children and $20,796 in annual earned income, you're in the maximum credit range. This arrives as a tax refund — most people file in January and receive it within 3 weeks.",
    whatItCovers: "A direct cash refund — you can use it for anything. Many families use it for emergency savings, debt, or a large one-time expense.",
    howToApply: "File your federal taxes and claim the credit. Free filing through VITA (Volunteer Income Tax Assistance) is available in King County and most WA counties.",
    timeEstimate: "VITA appointments are free and usually take 1-2 hours",
    documentsNeeded: ["W-2 or pay stubs for full year", "Social Security cards for you and your children", "Photo ID"],
    applicationUrl: "https://www.irs.gov/vita",
  },
  {
    programName: 'Nutrition for Your 4-Year-Old',
    officialName: 'WIC',
    confidence: 'high',
    estimatedValue: 'About $70/month in food benefits',
    exactAmount: '$68/month in food benefits',
    citation: '42 USC § 1786; WAC 246-790-013',
    verifiedBy: 'rule-atlas',
    description: "Your 4-year-old qualifies for WIC through age 5. Benefits include specific nutritious foods plus referrals to other services. Income limit is 185% FPL — you qualify.",
    whatItCovers: "Specific foods: milk, eggs, cheese, cereal, fruits and vegetables, whole grains, and legumes. Vouchers or EBT card loaded monthly.",
    howToApply: "Call your local WIC office or visit the Washington WIC website to schedule a certification appointment.",
    timeEstimate: "Initial appointment about 1 hour; renewal every 6 months",
    documentsNeeded: ["Photo ID", "Proof of address", "Your child's immunization record", "Proof of income (pay stubs)"],
    applicationUrl: "https://www.doh.wa.gov/YouandYourFamily/WIC",
  },
];
