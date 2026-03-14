/**
 * Demo scenarios for /?demo=1, /?demo=2, /?demo=3
 *
 * Each scenario spotlights a different design principle:
 *
 *   demo=1  MAYA (WA) — Progressive reveal + benefits cliff math. The full arc.
 *   demo=2  DEJA (IL) — Continuous attunement. The interaction as intervention.
 *           Emotional arc: past bad experience + skepticism → trust → deepening.
 *   demo=3  TOMÁS (TX) — Income uncertainty. Honest about limitations.
 *           Variable gig income at the SNAP threshold. Simulator as hero.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DEMO 1: MAYA
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
    documentsNeeded: [
      "Photo ID — driver's license, state ID, or passport",
      "Something showing your Washington address — a utility bill, lease agreement, or any piece of official mail",
      "Proof of income — your most recent 1-2 pay stubs. If you don't get formal stubs, a screenshot of your bank deposit records works",
      "Your kids' birth dates — you don't need birth certificates for the initial application, just the dates",
    ],
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
    documentsNeeded: [
      "Same application as SNAP — no extra paperwork needed if you apply at the same time",
      "If applying separately: photo ID + proof of Washington address (same as SNAP)",
      "Your kids are automatically enrolled as children — their coverage doesn't require separate documentation",
    ],
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
    documentsNeeded: [
      "W-2 form from your employer — you'll get this in January. If you've had multiple jobs, you'll need one from each",
      "Social Security numbers for you and both kids — you don't need the physical cards, just the numbers",
      "Photo ID — driver's license or state ID",
      "VITA is free and they handle all the forms — you just bring the documents and they do the rest",
    ],
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
    documentsNeeded: [
      "Photo ID — driver's license or state ID",
      "Proof of address — a utility bill, lease, or piece of mail",
      "Your 4-year-old's immunization record — most pediatricians can print this at your next visit, or your child's school may have a copy",
      "Proof of income — 1-2 recent pay stubs. A bank statement showing deposits also works if you don't have formal stubs",
    ],
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

// ─────────────────────────────────────────────────────────────────────────────
// DEMO 2: DEJA
// Persona: Deja — single mom, 1 child (age 3), Chicago, Illinois.
// Income: 20 hrs/week × $15/hr = $1,300/month gross.
//
// Design principle demonstrated: CONTINUOUS ATTUNEMENT — The interaction as
// intervention. The tool's attuned response to her past bad experience and
// skepticism about the benefit amounts is what shifts the conversation. By the
// end, she's motivated not just by the dollar amounts but by the experience
// of being treated with basic dignity.
//
// Key emotional beats:
//   demo2-1: PREVIOUS BAD EXPERIENCE + PROTECTIVE DEFLECTION — "just tell me"
//   demo2-2: Response validates experience, doesn't defend the system, asks ONE question.
//   demo2-3: AVOIDANCE LANGUAGE — "i keep putting it off. theres just a lot"
//   demo2-4: REFLECTION — brief, uses her words, checks in. SET_BASE_INCOME here.
//   demo2-6: SNAP presented alone (ONE benefit at a time, per pacing rule).
//   demo2-7: SKEPTICISM — "that sounds like a lot, thought i made too much"
//   demo2-8: Responds to DISTRUST, not the information gap. Explains the WHY.
//   demo2-10: Medicaid presented. Checks in. Cards revealed (SNAP + Medicaid).
//   demo2-11: SURPRISE / RELIEF — "wait both of us?"
//   demo2-12: Let it breathe. DEEPENING QUESTION.
//   demo2-13: Deepening response — reveals what she really wants.
//   demo2-14: EITC + CCAP. Closing acknowledges what it took to come back.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_2_BENEFIT_CARDS: BenefitPrediction[] = [
  {
    programName: 'Food Assistance',
    officialName: 'SNAP',
    confidence: 'high',
    estimatedValue: 'Around $270-300/month for your household',
    exactAmount: '$284/month',
    citation: '7 USC § 2014; 7 CFR § 273.10; 89 Ill. Adm. Code § 121.1',
    verifiedBy: 'rule-atlas',
    description: "At $1,300/month for a household of two in Illinois, the federal SNAP formula calculates your benefit precisely. The income limit is $2,311/month — you're well within range.",
    whatItCovers: "Groceries at most major stores — produce, meat, dairy, bread, pantry staples. Does not cover prepared hot foods, alcohol, or household supplies.",
    howToApply: "Apply online at ABE Illinois — takes about 20 minutes and you can do it from your phone.",
    timeEstimate: "About 20 minutes online",
    documentsNeeded: [
      "Photo ID — driver's license, state ID, or passport",
      "Something showing your Illinois address — a utility bill, lease, or any piece of mail",
      "Proof of income — your most recent pay stubs. A screenshot of your bank deposits also works",
      "Your daughter's birth date — you don't need her birth certificate for the initial application, just the date",
    ],
    applicationUrl: "https://abe.illinois.gov",
  },
  {
    programName: 'Health Coverage',
    officialName: 'Illinois Medicaid',
    confidence: 'high',
    estimatedValue: '$0 premium — full coverage for both of you',
    exactAmount: '$0 premium — full coverage for both',
    citation: '42 USC § 1396a; 305 ILCS 5/5-2; 89 Ill. Adm. Code § 120.310',
    verifiedBy: 'rule-atlas',
    description: "Illinois expanded Medicaid to adults with incomes up to 138% FPL ($1,732/month for a single adult). You qualify as an adult. Your daughter qualifies through CHIP at 313% FPL. Same application covers both.",
    whatItCovers: "Doctor visits, prescriptions, dental, vision, mental health, and hospital care. No copays at your income level.",
    howToApply: "Apply at ABE Illinois — same application as food assistance. You can do both at once.",
    timeEstimate: "Done in the same application as food assistance",
    documentsNeeded: [
      "Same application as SNAP — no additional paperwork if you apply at the same time",
      "If applying separately: photo ID + proof of Illinois address (same as SNAP)",
      "Your daughter's Medicaid card will arrive by mail — her doctor doesn't need it the same day",
    ],
    applicationUrl: "https://abe.illinois.gov",
  },
  {
    programName: 'Tax Refund Boost',
    officialName: 'Earned Income Tax Credit (EITC)',
    confidence: 'high',
    estimatedValue: 'Around $3,900-4,100 at tax time',
    exactAmount: '$3,995/year (~$333/month)',
    citation: '26 USC § 32; IRS Rev. Proc. 2024-40',
    verifiedBy: 'rule-atlas',
    description: "With one qualifying child and $15,600 in annual earned income, you're in the maximum credit range. This arrives as a refund in late January or February after you file.",
    whatItCovers: "Direct cash refund — no restrictions on use. Many families use it for emergency savings, debt, or a large one-time expense.",
    howToApply: "File your federal taxes and claim the credit. Free filing through VITA in Chicago — usually a 1-2 hour appointment.",
    timeEstimate: "VITA appointments are free, usually 1-2 hours",
    documentsNeeded: [
      "Your W-2 from your employer — arrives in January. If you worked multiple jobs, one from each",
      "Your daughter's Social Security number — just the number, not the card",
      "Your own Social Security number and photo ID",
      "VITA handles everything else — you just bring the documents",
    ],
    applicationUrl: "https://www.irs.gov/vita",
  },
  {
    programName: 'Childcare Assistance',
    officialName: 'CCAP (Illinois Child Care Assistance Program)',
    confidence: 'high',
    estimatedValue: 'Up to $970/month for a 3-year-old',
    exactAmount: 'Up to $970/month (Cook County licensed center rate)',
    citation: '305 ILCS 5/9A; 89 Ill. Adm. Code § 50.210',
    verifiedBy: 'rule-atlas',
    description: "Your income ($1,300/month) is well below the 185% FPL limit for a household of two ($2,615/month). CCAP covers most or all of the cost of licensed childcare for your 3-year-old, with a small copay based on income.",
    whatItCovers: "Licensed childcare centers, family day care homes, and some license-exempt providers. Covers full-day or part-day care depending on your work schedule.",
    howToApply: "Apply through your local Child Care Resource and Referral agency in Cook County.",
    timeEstimate: "Application takes 1-2 hours; processing takes 2-4 weeks",
    documentsNeeded: [
      "Photo ID and proof of Illinois address",
      "Proof of income — same pay stubs as SNAP",
      "Proof of your daughter's age — birth certificate or hospital discharge papers",
      "Proof of your work schedule — a letter from your employer or a printed schedule works",
    ],
    applicationUrl: "https://www.dhs.state.il.us/page.aspx?item=30359",
  },
];

export const DEMO_2_CARD_REVEAL: Record<string, BenefitPrediction[]> = {
  'demo2-6':  [DEMO_2_BENEFIT_CARDS[0]],                          // SNAP alone (pacing rule)
  'demo2-10': [DEMO_2_BENEFIT_CARDS[1]],                          // Medicaid
  'demo2-14': [DEMO_2_BENEFIT_CARDS[2], DEMO_2_BENEFIT_CARDS[3]], // EITC + CCAP
};

export const DEMO_2_MESSAGES: Message[] = [
  {
    id: 'demo2-0',
    role: 'assistant',
    // Reference only — matches INITIAL_MESSAGE, not used in playback.
    content: "Most people qualify for more support than they realize — food assistance, healthcare, childcare, and more. I can help figure out what's available for your situation. What's going on?",
    timestamp: Date.now() - 1400000,
  },
  {
    id: 'demo2-1',
    role: 'user',
    // PREVIOUS BAD EXPERIENCE + PROTECTIVE DEFLECTION.
    // She's been burned before. Protective part says: be efficient, don't get vulnerable again.
    // But she's here — which is itself something.
    content: "ive done this before. got treated like a criminal at the county office, basically gave up after that. my friend said to try this so whatever. just tell me what i qualify for — single mom, one kid shes 3, im in illinois, i work about 20 hrs a week at $15/hr",
    timestamp: Date.now() - 1300000,
  },
  {
    id: 'demo2-2',
    role: 'assistant',
    // Validates the experience. Doesn't defend the system. Doesn't dwell on it either.
    // Respects the "just tell me" deflection — asks ONE clarifying question, efficiently.
    content: "What happened at that office shouldn't have happened — that's not what this is.\n\nOne thing before I run the numbers: do you have health coverage right now, for you or your daughter?",
    timestamp: Date.now() - 1200000,
  },
  {
    id: 'demo2-3',
    role: 'user',
    // AVOIDANCE LANGUAGE — "i keep putting it off" — signals a protector managing overwhelm.
    content: "no neither of us. i keep putting it off. theres just a lot",
    timestamp: Date.now() - 1100000,
  },
  {
    id: 'demo2-4',
    role: 'assistant',
    // Brief acknowledgment of the avoidance ("that makes sense"), then REFLECTION.
    // Uses her words. Brief. Checks in. SET_BASE_INCOME dispatched when this plays.
    content: "That makes sense — it's hard to add one more thing when there's already a lot.\n\nLet me make sure I've got this right. You and your daughter in Illinois, she's 3. Working 20 hours at $15/hour — about $1,300/month. No health coverage for either of you right now.\n\nDoes that sound right?",
    timestamp: Date.now() - 1000000,
  },
  {
    id: 'demo2-5',
    role: 'user',
    content: "yeah",
    timestamp: Date.now() - 900000,
  },
  {
    id: 'demo2-6',
    role: 'assistant',
    // ONE benefit (SNAP) — following the pacing rule. Precise figure.
    // Ends with a check-in, not a data dump.
    // → DEMO_2_CARD_REVEAL reveals SNAP when this plays.
    content: "Okay. First thing, and I want to give you the exact number.\n\nAt $1,300/month for a household of two in Illinois, you'd receive **$284/month** in food assistance. That's a precise figure based on the federal formula — not a range.\n\nDoes that land, or does something about it seem off?",
    timestamp: Date.now() - 800000,
  },
  {
    id: 'demo2-7',
    role: 'user',
    // SKEPTICISM — the key emotional moment in this demo.
    // Her experience has taught her that things like this don't work out for her.
    content: "honestly that sounds like a lot. i thought i made too much for that kind of thing",
    timestamp: Date.now() - 700000,
  },
  {
    id: 'demo2-8',
    role: 'assistant',
    // Responds to the DISTRUST, not the information gap.
    // Explains WHY the number is grounded — income limits, formula, purpose of program.
    // The implicit message: you're not too much. You're exactly who this is for.
    content: "The income limit for food assistance for a household of two is $2,311/month. You're at $1,300 — well inside it.\n\nThat feeling of 'I probably don't qualify' is one of the most common things I hear, and it's partly by design — the programs are underpublicized and the thresholds are higher than people expect. Working part-time as a single parent is exactly the situation the program is built for.\n\nThe $284 isn't an estimate. It's what the federal formula produces for your household.",
    timestamp: Date.now() - 600000,
  },
  {
    id: 'demo2-9',
    role: 'user',
    content: "ok. what about health",
    timestamp: Date.now() - 500000,
  },
  {
    id: 'demo2-10',
    role: 'assistant',
    // Second benefit (Medicaid) — one at a time, per pacing rule.
    // Names the adult coverage surprise. Lets it breathe at the end.
    // → DEMO_2_CARD_REVEAL reveals Medicaid when this plays.
    content: "Both of you qualify for Illinois Medicaid — **$0 in premiums**, covering doctor visits, prescriptions, dental, and vision. No copays at your income level.\n\nIllinois expanded Medicaid to working adults, so you qualify too — not just your daughter. Your daughter qualifies through CHIP automatically. Same application covers both of you at ABE Illinois, about 20 minutes.\n\nTake a second with that if you need to.",
    timestamp: Date.now() - 400000,
  },
  {
    id: 'demo2-11',
    role: 'user',
    // SURPRISE / RELIEF — the shift moment.
    content: "wait both of us? i thought only kids got medicaid. i didnt know i was covered too",
    timestamp: Date.now() - 300000,
  },
  {
    id: 'demo2-12',
    role: 'assistant',
    // Let it breathe. Confirm. Then DEEPENING QUESTION — only because she seems open.
    // The question goes beyond eligibility. It's the research instrument.
    content: "Both of you. That's one of the things people most often don't know — especially in states that expanded Medicaid, working adults qualify too.\n\nI want to ask you something, and you can skip it if you'd rather keep things practical: if groceries and health coverage were handled for the next year — what would you do differently?",
    timestamp: Date.now() - 200000,
  },
  {
    id: 'demo2-13',
    role: 'user',
    // Responds to the deepening question. Opens up about what she actually wants.
    // This is the data point the system is designed to surface.
    content: "honestly id stop chasing extra shifts and just be home more. i feel like i never have time for her",
    timestamp: Date.now() - 150000,
  },
  {
    id: 'demo2-14',
    role: 'assistant',
    // EITC + CCAP surfaced. The CCAP framing connects directly to her deepening answer.
    // Closing: acknowledges what it took to come back after a bad experience.
    // → DEMO_2_CARD_REVEAL reveals EITC + CCAP when this plays.
    content: "That answer points to two more things worth knowing.\n\nThe Earned Income Tax Credit — with one child and your income, that's **$3,995** back as a tax refund in late January or February. Free filing through VITA in Chicago, usually a two-hour appointment. Most people in your situation don't know to claim it.\n\nAnd Illinois has a childcare subsidy. For a 3-year-old in a licensed center in Cook County, that's up to **$970/month** covered. If that were in place, fewer random shifts might actually be possible — not just a wish.\n\nI've added both to your panel.\n\nWhen you're ready: ABE Illinois for food assistance and Medicaid, one application, about 20 minutes. EITC is next tax season through VITA. Childcare assistance is a separate application, but worth starting this week.\n\nIt takes something to walk back in after a bad experience.",
    timestamp: Date.now() - 100000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO 3: TOMÁS
// Persona: Tomás — gig worker (rideshare + handyman), Austin, Texas.
// Income: variable ~$1,800-2,400/month gross (~$2,100 average).
// Household: size 2 (Tomás + partner, no kids).
//
// Design principle demonstrated: HONEST UNCERTAINTY + INCOME SIMULATOR AS HERO.
// This demo is specifically about the income on the bubble: variable income near
// the SNAP cliff, the Texas Medicaid gap (adult non-expansion), and the simulator
// making the cliff visceral rather than abstract.
//
// Key emotional beats:
//   demo3-1: Complicated income + assumes he won't qualify much ("income limits...")
//   demo3-2: Engages with variable income directly. Asks the tax question.
//   demo3-3: Self-employment nuance — mileage deductions lower net income.
//   demo3-4: REFLECTION — accounts for SE deduction, honest framing. SET_BASE_INCOME here.
//   demo3-6: SNAP — medium confidence, variable amount, directs to income slider.
//   demo3-7: Health is the real worry (partner has chronic conditions).
//   demo3-8: HONEST about Texas Medicaid gap. Marketplace pivot. "Worth exploring" card.
//   demo3-9: BENEFITS CLIFF ANXIETY — "does everything disappear if I earn more?"
//  demo3-10: Cliff math + income simulator + EITC. Honest about what's a cliff vs gradual.
//  demo3-11: RELIEF at finding something in Texas — low expectations exceeded.
//  demo3-12: Action-oriented closing. Variable income as asset, not problem.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_3_BENEFIT_CARDS: BenefitPrediction[] = [
  {
    programName: 'Food Assistance',
    officialName: 'SNAP',
    confidence: 'medium',
    // No exactAmount — variable income means different months = different benefits.
    estimatedValue: 'Around $90-165/month on average months',
    description: "On months where your gross income is around $2,100, you'd receive roughly $90-165/month. The income limit for a household of two is $2,311/month — you're typically under that. In a month above $2,311, the benefit drops to zero. Use the income slider to see the full range across your income cycle.",
    whatItCovers: "Groceries at most major stores — produce, meat, dairy, bread, pantry staples. Same items as other states.",
    howToApply: "Apply online at Texas Health and Human Services — about 30 minutes. If you certify during a lower-income month, the benefit applies for the full 6-month certification period.",
    timeEstimate: "About 30 minutes online",
    documentsNeeded: [
      "Photo ID — driver's license or state ID",
      "Proof of Texas address — utility bill, lease, or piece of mail",
      "3 months of bank statements — for variable income, this shows your average better than a single pay stub",
      "Your mileage log or Schedule C from taxes — shows your net income is lower than your gross deposits",
    ],
    applicationUrl: "https://yourtexasbenefits.com",
  },
  {
    programName: 'Health Coverage',
    officialName: 'ACA Marketplace (Healthcare.gov)',
    confidence: 'lower',
    estimatedValue: 'As low as $50-200/month for both after subsidies',
    description: "Texas did not expand Medicaid — adults without children don't qualify regardless of income. The Marketplace is the realistic path. At your income level, subsidies could bring coverage down substantially from unsubsidized rates. The right plan depends on your partner's medications and your income stability through the year.",
    whatItCovers: "Depends on plan chosen — subsidized plans typically cover doctor visits, prescriptions, preventive care, and hospital care. Bronze plans have lower premiums but higher out-of-pocket costs.",
    howToApply: "Apply at Healthcare.gov during open enrollment (Nov 1 – Jan 15) or within 60 days of a qualifying life event like losing a job or moving.",
    timeEstimate: "30-60 minutes to compare plans; check that your partner's prescriptions are covered before choosing",
    documentsNeeded: [
      "Social Security numbers for both of you",
      "Estimated annual income — use your average, not your best month",
      "A list of your partner's current prescriptions — check coverage before selecting a plan",
      "Healthcare.gov walks you through the rest — no documents needed upfront",
    ],
    applicationUrl: "https://healthcare.gov",
  },
  {
    programName: 'Tax Refund Boost',
    officialName: 'Earned Income Tax Credit (EITC)',
    confidence: 'high',
    estimatedValue: 'Around $600-650 at tax time',
    exactAmount: '$649/year',
    citation: '26 USC § 32; IRS Rev. Proc. 2024-40',
    verifiedBy: 'rule-atlas',
    description: "With no qualifying children and self-employment income around $18,000-20,000 net, you're in the range for the childless EITC. Most gig workers don't know to claim it. VITA can file your self-employment return for free.",
    whatItCovers: "Direct cash refund at tax time — no restrictions on use.",
    howToApply: "Claim on your federal tax return. Free filing through VITA in Austin — they handle self-employment returns.",
    timeEstimate: "VITA appointment: 1-2 hours",
    documentsNeeded: [
      "Your 1099-NEC forms from all rideshare/gig platforms",
      "Your mileage log for the year — this is your biggest deduction",
      "Social Security numbers for both you and your partner if filing jointly",
      "VITA handles Schedule C (self-employment) — just bring your 1099s and mileage records",
    ],
    applicationUrl: "https://www.irs.gov/vita",
  },
];

export const DEMO_3_CARD_REVEAL: Record<string, BenefitPrediction[]> = {
  'demo3-6':  [DEMO_3_BENEFIT_CARDS[0]], // SNAP (medium confidence)
  'demo3-8':  [DEMO_3_BENEFIT_CARDS[1]], // Marketplace (worth exploring)
  'demo3-10': [DEMO_3_BENEFIT_CARDS[2]], // EITC
};

export const DEMO_3_MESSAGES: Message[] = [
  {
    id: 'demo3-0',
    role: 'assistant',
    // Reference only — matches INITIAL_MESSAGE, not used in playback.
    content: "Most people qualify for more support than they realize — food assistance, healthcare, childcare, and more. I can help figure out what's available for your situation. What's going on?",
    timestamp: Date.now() - 1200000,
  },
  {
    id: 'demo3-1',
    role: 'user',
    // Variable income + Texas + no kids + low expectations.
    // Already skeptical about qualifying. Comes in with the assumption encoded.
    content: "my situation is kind of complicated income wise. im in texas, do rideshare and some handyman work, live with my partner no kids. some months its like $2200-2400, some months closer to $1800. dont have health insurance for either of us and honestly i assumed we probably dont qualify for much because the income limits arent that high right",
    timestamp: Date.now() - 1100000,
  },
  {
    id: 'demo3-2',
    role: 'assistant',
    // Engages with variable income directly — this is the core complexity.
    // Asks the tax question because SE deductions matter for the calculation.
    content: "The variable income is worth taking seriously — it changes the picture month to month in ways that actually matter.\n\nQuick question before I get into it: are you filing taxes on the gig income, and are you tracking deductions like mileage or equipment?",
    timestamp: Date.now() - 1000000,
  },
  {
    id: 'demo3-3',
    role: 'user',
    // Self-employment nuance — mileage deductions reduce net income, which matters.
    content: "yeah 1099s from the rideshare apps. i track mileage and deduct that stuff so my taxable income is lower than what actually hits my bank",
    timestamp: Date.now() - 900000,
  },
  {
    id: 'demo3-4',
    role: 'assistant',
    // REFLECTION — accounts for SE deduction nuance honestly.
    // Sets up the income figure that the simulator will use.
    // SET_BASE_INCOME dispatched when this plays.
    content: "That matters for the calculation — after mileage and the self-employment deduction, your net income for benefits purposes is probably closer to $1,700-1,900 on an average month.\n\nLet me make sure I've got the picture: you and your partner in Texas, averaging around $2,100 gross but probably $1,700-1,900 net after deductions. No health coverage. No kids.\n\nDoes that sound about right?",
    timestamp: Date.now() - 800000,
  },
  {
    id: 'demo3-5',
    role: 'user',
    content: "yeah thats pretty close",
    timestamp: Date.now() - 700000,
  },
  {
    id: 'demo3-6',
    role: 'assistant',
    // SNAP — medium confidence (not "Strong match") because variable income.
    // Explains the nuance honestly. Points to the income slider.
    // → DEMO_3_CARD_REVEAL reveals SNAP when this plays.
    content: "For food assistance, I can give you a range with an honest caveat.\n\nOn an average month at around $2,100 gross, you'd receive somewhere between **$90-165/month** toward groceries. The income limit for a household of two is $2,311/month gross — you're typically under that.\n\nHere's where the variable income matters: in a month where you bring in $2,400 gross, you'd be over the limit and receive nothing. In a month at $1,800, you'd receive the full benefit.\n\nI've set the income slider in your Benefits panel to your average. Try dragging it — you can see exactly where the cliff is.",
    timestamp: Date.now() - 600000,
  },
  {
    id: 'demo3-7',
    role: 'user',
    // Health is the real concern. Partner has chronic conditions — stakes are real.
    content: "yeah the health thing is what really worries us. my partner has some chronic conditions and needs regular prescriptions",
    timestamp: Date.now() - 500000,
  },
  {
    id: 'demo3-8',
    role: 'assistant',
    // HONEST about Texas Medicaid gap. Doesn't sugarcoat.
    // Pivots to Marketplace as the realistic path. Marks it "Worth exploring."
    // → DEMO_3_CARD_REVEAL reveals Marketplace when this plays.
    content: "I have to be straight with you about Texas, because the honest answer matters more than a reassuring one.\n\nTexas did not expand Medicaid. For adults without children, Medicaid in Texas basically requires a disability determination — a separate, slow process. Your partner's chronic conditions might eventually qualify under that pathway, but it's not the quick path.\n\nWhat IS available is the ACA Marketplace. At your income level, you'd qualify for subsidies that could bring coverage down to as low as **$50-200/month for both of you** — compared to $700+ without subsidies. Your partner's prescriptions would be covered under most plans.\n\nI've marked this as 'Worth exploring' in your panel because the right plan depends on your partner's specific medications and your income stability. It needs a closer look — but the subsidies are real.",
    timestamp: Date.now() - 400000,
  },
  {
    id: 'demo3-9',
    role: 'user',
    // BENEFITS CLIFF ANXIETY — the right question to ask given variable income.
    content: "what if i have a really good stretch and my income goes up. does everything just disappear",
    timestamp: Date.now() - 300000,
  },
  {
    id: 'demo3-10',
    role: 'assistant',
    // Cliff math — honest about what's a real cliff (SNAP) vs gradual (Marketplace).
    // Points to income slider. EITC surfaced.
    // → DEMO_3_CARD_REVEAL reveals EITC when this plays.
    content: "The short answer is: SNAP has a hard cliff, Marketplace doesn't.\n\nFor SNAP, when your gross income crosses $2,311/month for a household of two, the benefit drops to zero — that's a real cliff, not gradual. On a $2,400 month, you'd receive nothing. The income slider shows this exactly.\n\nMarketplace subsidies phase out gradually — earn more, subsidies reduce, but you keep coverage. There's a reconciliation at tax time, but it's not catastrophic.\n\nThere's also the Earned Income Tax Credit. With gig income and no qualifying children, that's about **$649** back at tax time. Most gig workers don't claim it — VITA can file a self-employment return for free.\n\nThe honest picture: your variable income is actually an asset here. You can time your SNAP application and renewals around your income cycles in ways a salaried person can't.",
    timestamp: Date.now() - 200000,
  },
  {
    id: 'demo3-11',
    role: 'user',
    // Low expectations exceeded. This is the relief moment for Demo 3.
    content: "ok this actually helps. wasnt expecting to find much in texas honestly",
    timestamp: Date.now() - 150000,
  },
  {
    id: 'demo3-12',
    role: 'assistant',
    // Validates the low expectations (Texas IS harder). Action-oriented closing.
    // Reframes variable income as something to work with, not just a complication.
    content: "Texas is genuinely harder than most states on health coverage — you weren't wrong to expect less.\n\nBut here's what's real: SNAP application first, during a lower-income stretch — Texas Health and Human Services online, about 30 minutes. Healthcare.gov for Marketplace coverage — open enrollment is November 1 to January 15, or within 60 days of a qualifying event.\n\nKeep monthly records of your deposits and deductions — that paper trail matters for SNAP renewals and makes the EITC clean at tax time.\n\nThe income slider is yours to keep playing with. Come back anytime — nothing carries over, but I'll be here.",
    timestamp: Date.now() - 100000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO SCENARIOS — master lookup used by Chat.tsx
// ─────────────────────────────────────────────────────────────────────────────

export interface DemoScenario {
  messages: Message[];
  cardReveal: Record<string, BenefitPrediction[]>;
  baseIncome: number;
  household: { size: number; numChildren: number; childrenUnder5: number };
  state: string; // two-letter state code — drives state-specific simulator calculations
  chipLabel: string;
  incomeMessageId: string; // message ID that triggers SET_BASE_INCOME dispatch
}

export const DEMO_SCENARIOS: Record<number, DemoScenario> = {
  1: {
    messages: DEMO_MESSAGES,
    cardReveal: DEMO_CARD_REVEAL,
    baseIncome: DEMO_BASE_INCOME,
    household: DEMO_HOUSEHOLD,
    state: 'WA',
    chipLabel: '▶ Walk me through an example',
    incomeMessageId: 'demo-4',
  },
  2: {
    messages: DEMO_2_MESSAGES,
    cardReveal: DEMO_2_CARD_REVEAL,
    baseIncome: 1300,
    household: { size: 2, numChildren: 1, childrenUnder5: 1 },
    state: 'IL',
    chipLabel: '▶ Walk me through a harder conversation',
    incomeMessageId: 'demo2-4',
  },
  3: {
    messages: DEMO_3_MESSAGES,
    cardReveal: DEMO_3_CARD_REVEAL,
    baseIncome: 2100,
    household: { size: 2, numChildren: 0, childrenUnder5: 0 },
    state: 'TX',
    chipLabel: '▶ Show me income uncertainty',
    incomeMessageId: 'demo3-4',
  },
};
