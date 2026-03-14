/**
 * Pre-populated demo data for /?demo=1
 * Persona: Maya — single parent, 2 kids (ages 4 & 7), Washington state.
 * Income: 25 hrs/week × $16/hr = $1,733/month gross.
 *
 * This arc is specifically designed to surface and model the design principles
 * that make BenefitAccess different from a benefits eligibility screener:
 *
 *   demo-1: SHAME + IDENTITY THREAT — rough, informal, trailing off.
 *           "never thought id be the kind of person..."
 *   demo-2: Response treats it as worthy without making the shame itself A Thing.
 *   demo-3: PRIVACY / DISTRUST — natural mid-conversation "is this like private?"
 *   demo-4: Direct, complete privacy answer in two sentences. Then moves on.
 *   demo-5: COGNITIVE OVERLOAD — "theres just a lot going on" signal.
 *   demo-6: REFLECTION PHASE — slows down, reflects back in her words, checks.
 *   demo-8: Benefits presented. CHECK-IN at end. Cards revealed here (SNAP + Apple Health).
 *   demo-9: HOPE / RELIEF + BENEFITS CLIFF ANXIETY — often come together.
 *  demo-10: Cliff response: RATIONAL concern, not irrational. Actual math. Honest.
 *  demo-11: User asks about more options (rough).
 *  demo-12: EITC + WIC surfaced. Wrap-up: clear next step. Cards revealed here.
 *
 * DEMO_BENEFIT_CARDS is defined before DEMO_MESSAGES so DEMO_CARD_REVEAL can reference it.
 * Benefit figures computed via mockCalculations.ts and rounded for readability.
 * In a live Rule Atlas integration, these would come from the API.
 */

import type { Message, BenefitPrediction } from './types';

export const DEMO_BASE_INCOME = 1733; // monthly gross
export const DEMO_HOUSEHOLD = { size: 3, numChildren: 2, childrenUnder5: 1 };

// ─── Benefit cards defined first so DEMO_CARD_REVEAL can reference them ───────

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

// Cards revealed progressively as demo playback reaches each message.
// Keyed by message ID. Chat.tsx dispatches ADD_CARDS when each message plays.
export const DEMO_CARD_REVEAL: Record<string, BenefitPrediction[]> = {
  'demo-8':  [DEMO_BENEFIT_CARDS[0], DEMO_BENEFIT_CARDS[1]], // SNAP + Apple Health
  'demo-12': [DEMO_BENEFIT_CARDS[2], DEMO_BENEFIT_CARDS[3]], // EITC + WIC
};

// ─── Conversation arc ─────────────────────────────────────────────────────────

export const DEMO_MESSAGES: Message[] = [
  {
    id: 'demo-0',
    role: 'assistant',
    // Not used in playback (opening message already shown by INITIAL_MESSAGE).
    // Kept here for reference — must match INITIAL_MESSAGE in Chat.tsx.
    content: "Most people qualify for more support than they realize — food assistance, healthcare, childcare, and more. I can help figure out what's available for your situation. What's going on?",
    timestamp: Date.now() - 1050000,
  },
  {
    id: 'demo-1',
    role: 'user',
    // SHAME + IDENTITY THREAT. Rough, lowercase, trailing off — real person typing.
    content: "honestly im not even sure i should be here lol. have 2 kids 4 and 7, lost my job a few months back and just started something part time. its been a rough stretch. just... never thought id be the kind of person who needed to look for this kind of help. feels weird to even say that",
    timestamp: Date.now() - 990000,
  },
  {
    id: 'demo-2',
    role: 'assistant',
    // Shame/identity threat response: matter-of-fact warmth, no speech, no "don't minimize!"
    // Treats her situation as worthy. One natural follow-up question.
    content: "It's not a weird thing to say — a job loss with two kids and a new part-time situation is genuinely a lot to be managing.\n\nTell me more about the part-time work. Does the schedule work okay around school pickup, or is that part of what's strained too?",
    timestamp: Date.now() - 930000,
  },
  {
    id: 'demo-3',
    role: 'user',
    // Shares info naturally + PRIVACY / DISTRUST concern, mid-conversation.
    content: "the hours work ok for pickup. im in washington state, 25 hrs a week at $16/hr. groceries are what really gets me — some weeks its super tight. also is this like private? like does anyone see what im saying here",
    timestamp: Date.now() - 870000,
  },
  {
    id: 'demo-4',
    role: 'assistant',
    // PRIVACY: direct, concrete, complete in two sentences. No hedging. Then continues.
    // Note: SET_BASE_INCOME dispatched when this message plays (income confirmed here).
    content: "Yes — completely. Nothing here is stored or recorded. When you close this tab, there's no file, no database, no record of any of this. It's designed that way on purpose.\n\nGroceries being the pressure point makes sense. At 25 hours at $16, you're bringing in around $1,733 a month — roughly right? And what's rent looking like?",
    timestamp: Date.now() - 810000,
  },
  {
    id: 'demo-5',
    role: 'user',
    // COGNITIVE OVERLOAD signal: lowercase, shortened sentences, "theres just a lot"
    content: "yeah thats about right. rent went up to $1700 last month which is why its so tight. we dont have health insurance either ive just been putting that off. theres just a lot going on",
    timestamp: Date.now() - 750000,
  },
  {
    id: 'demo-6',
    role: 'assistant',
    // REFLECTION PHASE: slows down before presenting anything.
    // Uses her words ("groceries" not "food security"). Reflects the full picture. Checks.
    content: "Let me make sure I've got this right before we go further.\n\nYou're a household of three in Washington — you and your two kids, ages 4 and 7. Working 25 hours a week at $16/hour, about $1,733/month. Rent is $1,700. No health coverage for any of you right now, and groceries are where it's hitting hardest.\n\nDoes that sound right, or am I missing something?",
    timestamp: Date.now() - 690000,
  },
  {
    id: 'demo-7',
    role: 'user',
    content: "yeah thats it",
    timestamp: Date.now() - 630000,
  },
  {
    id: 'demo-8',
    role: 'assistant',
    // Benefits: precise verified figure, not a range.
    // Names the adult coverage surprise ("which people are often surprised by").
    // CHECK-IN at end — respects bandwidth, not therapy.
    // → DEMO_CARD_REVEAL reveals SNAP + Apple Health when this plays.
    content: "Based on what you've shared, two programs stand out as very likely available to you right now — and together they'd make a real difference.\n\nThe first is food assistance. Washington's rules engine calculates you'd receive **$619/month** toward groceries at your income and household size. That's a precise figure based on your net income after the standard deductions the law allows — not a range.\n\nThe second is health coverage. At $1,733/month for a household of three, all three of you qualify for Washington's Apple Health. That's **$0 in premiums**, covering doctor visits, prescriptions, dental, and vision. You qualify as an adult too — which people are often surprised by.\n\nTogether that's about **$1,439/month** in real value, and both are covered by one application at Washington Connection.\n\nThat's a lot to take in. How are you feeling about all this?",
    timestamp: Date.now() - 570000,
  },
  {
    id: 'demo-9',
    role: 'user',
    // HOPE / RELIEF + BENEFITS CLIFF ANXIETY — often arrive together.
    content: "honestly more than i expected. i didnt know the health one covered me too not just the kids. but im nervous — what if i pick up more hours or find something better paying. i dont want to take these and then lose everything the second things start to improve",
    timestamp: Date.now() - 510000,
  },
  {
    id: 'demo-10',
    role: 'assistant',
    // Cliff anxiety: validates as RATIONAL, not irrational anxiety.
    // Doesn't dismiss. Engages with actual math. Honest that cliffs ARE real.
    // Points to the income simulator.
    content: "That's exactly the right thing to worry about — and it's a real concern, not an irrational one. The benefits cliff is a genuine structural problem.\n\nHere's the honest picture for your situation: if you went to 35 hours a week, your food assistance would drop from $619 to around **$555/month** — a **$64** reduction. But you'd still be well below the Medicaid threshold for all three of you, so health coverage stays.\n\nNet: you'd gain roughly **$667/month** in income and lose $64 in food assistance. That's a net gain of about **$603/month** — nearly the full value of the extra hours.\n\nThe cliff people worry about is real in some situations. At your income level right now, working more works in your favor — you're not trading one thing for another. I've set up an income simulator in your Benefits panel. Drag the slider and you can see exactly how each program responds before you make any decisions.",
    timestamp: Date.now() - 450000,
  },
  {
    id: 'demo-11',
    role: 'user',
    // Rough. Asks about more options.
    content: "ok that makes sense. are there other things i should probably be looking at",
    timestamp: Date.now() - 390000,
  },
  {
    id: 'demo-12',
    role: 'assistant',
    // EITC + WIC surfaced. WRAP-UP: clear next step. Plain language. No bullet lists.
    // → DEMO_CARD_REVEAL reveals EITC + WIC when this plays.
    content: "Two more worth knowing about.\n\nThe first is the Earned Income Tax Credit. With two kids and your income, you're in the maximum credit range — **$6,120** back as a tax refund. Most people get it in late January or early February after they file. There's free filing help through VITA locations all over Washington, usually about a two-hour appointment.\n\nThe second is WIC, which covers your 4-year-old specifically — milk, eggs, produce, whole grains — about **$68/month** in benefits until she turns 5. It's a separate appointment from SNAP, roughly an hour, but worth it.\n\nI've added both to your panel.\n\nWhen you're ready to move: SNAP and Apple Health are one application at washingtonconnection.org. EITC is part of your tax return, free VITA help for that. WIC is a quick separate appointment at your local office.\n\nIf you want to come back and think through any of this further, just open this page again.",
    timestamp: Date.now() - 330000,
  },
];
