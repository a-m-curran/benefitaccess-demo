/**
 * Pre-populated demo data for /?demo=1
 * Persona: Maya — single parent, 2 kids (ages 4 & 7), Washington state.
 * Income: 25 hrs/week × $16/hr = $1,733/month gross.
 *
 * This arc is specifically designed to surface and model the design principles
 * that make BenefitAccess different from a benefits eligibility screener:
 *
 *   demo-1: SHAME + IDENTITY THREAT — "I feel silly... other people have it worse...
 *            I never thought I'd be the kind of person who..."
 *   demo-2: Response treats it as worthy without making the shame itself A Thing.
 *            No "don't minimize your situation!" — just matter-of-fact warmth.
 *   demo-3: PRIVACY / DISTRUST — "Is this conversation private?"
 *   demo-4: Direct, concrete privacy answer first. Then continues naturally.
 *            No hedging. Two sentences, then moves on.
 *   demo-5: COGNITIVE OVERLOAD — "there's just a lot."
 *   demo-6: REFLECTION PHASE — slows down, reflects back in her words,
 *            checks for accuracy before presenting anything.
 *   demo-8: Benefits presented. CHECK-IN at end: "That's a lot to take in."
 *            Respects bandwidth; not therapy.
 *   demo-9: HOPE / RELIEF + BENEFITS CLIFF ANXIETY — often come together.
 *  demo-10: Cliff response validates it as RATIONAL, not irrational anxiety.
 *            Engages with actual math. Honest that cliffs are real but shows
 *            the math here works out. Points to simulator.
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
    // No intake form, no list of questions — just an invitation to tell their story.
    content: "Tell me a little about what's going on in your life right now — whatever feels most pressing. I'm here to help figure out what support might be available to you.",
    timestamp: Date.now() - 1050000,
  },
  {
    id: 'demo-1',
    role: 'user',
    // Shame + identity threat. "I feel silly," "other people have it worse,"
    // "I never thought I'd be the kind of person who needs this."
    content: "I feel kind of silly reaching out, honestly. I know other people have it much worse. I'm a single mom — two kids, 4 and 7. I lost my job a few months ago and just started something part-time. It's been a hard stretch. I just... I never thought I'd be the kind of person looking for this kind of help.",
    timestamp: Date.now() - 990000,
  },
  {
    id: 'demo-2',
    role: 'assistant',
    // Shame/identity threat response: matter-of-fact warmth. No big speech.
    // Treats her situation as worthy without making the shame itself A Thing.
    // One natural follow-up question — not an intake item, genuine curiosity.
    content: "It's not a silly thing to reach out about. A job loss with two kids and a new part-time situation is genuinely a lot to be managing.\n\nTell me more about the part-time work — does the schedule work okay around school pickup, or is that part of what's strained too?",
    timestamp: Date.now() - 930000,
  },
  {
    id: 'demo-3',
    role: 'user',
    // Shares more info naturally — and asks about privacy (distrust/surveillance concern).
    content: "The hours work okay for pickup. I'm in Washington state, 25 hours a week at $16 an hour. Groceries are the biggest stress right now — some weeks I'm really cutting it close. Is this conversation private, by the way? Like, does any of this go anywhere?",
    timestamp: Date.now() - 870000,
  },
  {
    id: 'demo-4',
    role: 'assistant',
    // Privacy: direct, concrete, complete in two sentences. No hedging.
    // Answers it fully, then continues as if answering privacy questions is the most normal thing.
    // Starts to piece together her situation from what she's said — no intake form.
    content: "Yes — completely. Nothing here is stored or recorded. When you close this tab, there's no file, no database, no record of any of this. It's designed that way on purpose.\n\nGroceries being the pressure point makes sense. At 25 hours at $16, you're bringing in around $1,733 a month — roughly right? And what's rent looking like right now?",
    timestamp: Date.now() - 810000,
  },
  {
    id: 'demo-5',
    role: 'user',
    // Cognitive overload signal: "there's just a lot going on."
    // Also reveals the health coverage gap — naturally, not in response to a direct question.
    content: "Yeah, that's about right. Rent just went up from $1,400 to $1,700, which is why everything feels so tight. We also don't have any health insurance — I keep putting off dealing with that. There's just a lot.",
    timestamp: Date.now() - 750000,
  },
  {
    id: 'demo-6',
    role: 'assistant',
    // Reflection phase: slows down before presenting anything.
    // Uses her words — "groceries" not "food security." Reflects back the full picture.
    // Checks for accuracy. Shows it heard everything.
    content: "Let me make sure I've got this right before we go further.\n\nYou're a household of three in Washington — you and your two kids, ages 4 and 7. Working 25 hours a week at $16/hour, about $1,733/month. Rent is $1,700. No health coverage for any of you right now, and groceries are where it's hitting hardest.\n\nDoes that sound right, or am I missing something?",
    timestamp: Date.now() - 690000,
  },
  {
    id: 'demo-7',
    role: 'user',
    content: "That's exactly it.",
    timestamp: Date.now() - 630000,
  },
  {
    id: 'demo-8',
    role: 'assistant',
    // Benefits: leads with the precise verified figure, not a range.
    // Names her surprise explicitly ("which people are often surprised by").
    // Check-in at the end: "That's a lot to take in. How are you feeling?"
    // Respects bandwidth — doesn't pile on more right away.
    content: "Based on what you've shared, two programs stand out as very likely available to you right now — and together they'd make a real difference.\n\nThe first is food assistance. Washington's rules engine calculates you'd receive $619/month toward groceries at your income and household size. That's a precise figure based on your net income after the standard deductions the law allows — not a range.\n\nThe second is health coverage. At $1,733/month for a household of three, all three of you qualify for Washington's Apple Health. That's $0 in premiums, covering doctor visits, prescriptions, dental, and vision. You qualify as an adult too — which people are often surprised by.\n\nTogether that's about $1,439/month in real value, and both are covered by one application at Washington Connection.\n\nThat's a lot to take in. How are you feeling about all this?",
    timestamp: Date.now() - 570000,
  },
  {
    id: 'demo-9',
    role: 'user',
    // Hope/relief + benefits cliff anxiety — often come together.
    // "More than I expected" (relief) then immediately "but what if things improve" (cliff anxiety).
    content: "Honestly, more than I expected. I didn't realize the health one covered me too, not just the kids. But I'm nervous — what if I pick up more hours or find something that pays better? I don't want to take these and then lose everything the moment things start to improve.",
    timestamp: Date.now() - 510000,
  },
  {
    id: 'demo-10',
    role: 'assistant',
    // Cliff anxiety response: validates it as a RATIONAL concern, not irrational anxiety.
    // Does NOT dismiss or over-reassure. Engages with actual math. Honest that cliffs ARE real.
    // Shows the math works out here. Points to the simulator for ongoing exploration.
    content: "That's exactly the right thing to worry about — and it's a real concern, not an irrational one. The benefits cliff is a genuine structural problem.\n\nHere's the honest picture for your situation: if you went to 35 hours a week, your food assistance would drop from $619 to around $555/month — a $64 reduction. But you'd still be well below the Medicaid threshold for all three of you, so health coverage stays.\n\nNet: you'd gain roughly $667/month in income and lose $64 in food assistance. That's a net gain of about $603/month — nearly the full value of the extra hours.\n\nThe cliff people worry about is real in some situations. At your income level right now, working more works in your favor — you're not trading one thing for another. I've set up an income simulator in your Benefits panel. You can drag the slider and see exactly how each program responds before you make any decisions.",
    timestamp: Date.now() - 450000,
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
