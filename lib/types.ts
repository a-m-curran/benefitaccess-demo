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
  estimatedValue: string;        // "$450-580/month" or "Covers most doctor visits"
  description: string;           // 1-2 sentences, personalized
  whatItCovers: string;          // Brief plain-language
  howToApply: string;            // Single clearest next step
  timeEstimate: string;          // "About 20-30 minutes online"
  documentsNeeded: string[];     // Plain language list
  applicationUrl?: string;       // Direct link if available
}

export interface ConversationState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  phase: 'welcome' | 'story' | 'reflection' | 'predictions' | 'deepening';
}
