export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface BenefitPrediction {
  programName: string;           // Plain language: "Food Assistance"
  officialName: string;          // "SNAP"
  confidence: 'high' | 'medium' | 'lower';
  estimatedValue: string;        // "$450-580/month" — shown when no exact amount
  exactAmount?: string;          // Precise figure from rules engine: "$619/month"
  citation?: string;             // Statutory citation: "7 USC § 2014; 7 CFR § 273.10"
  verifiedBy?: 'rule-atlas';     // Verification source
  description: string;           // 1-2 sentences, personalized
  whatItCovers: string;          // Brief plain-language
  howToApply: string;            // Single clearest next step
  timeEstimate: string;          // "About 20-30 minutes online"
  documentsNeeded: string[];     // Plain language list
  applicationUrl?: string;       // Direct link if available
}

// Scenario modeler types
export interface ScenarioProgramResult {
  programName: string;
  officialName: string;
  currentAmount: number;         // monthly $$ at base income
  newAmount: number;             // monthly $$ at new income
  change: number;                // newAmount - currentAmount
  lostEligibility: boolean;
}

export interface ScenarioResult {
  baseIncome: number;            // monthly gross
  newIncome: number;
  incomeChange: number;          // newIncome - baseIncome
  programs: ScenarioProgramResult[];
  totalBenefitChange: number;    // sum of program changes
  netChange: number;             // incomeChange + totalBenefitChange
  cliffWarning?: string;
}

export interface ConversationState {
  messages: Message[];
  benefitCards: BenefitPrediction[];
  baseIncome?: number;           // monthly income extracted from conversation (for scenario modeler)
  isStreaming: boolean;
  streamingContent: string;
  phase: 'welcome' | 'story' | 'reflection' | 'predictions' | 'deepening';
}
