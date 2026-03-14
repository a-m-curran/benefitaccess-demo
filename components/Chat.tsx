'use client';

import { useReducer, useCallback, useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';
import InputArea from './InputArea';
import WelcomeBanner from './WelcomeBanner';
import TypingIndicator from './TypingIndicator';
import BenefitPanel from './BenefitPanel';
import { parseMessageContent } from '@/lib/parseResponse';
import type { Message, ConversationState, BenefitPrediction } from '@/lib/types';
import { Sparkles, MessageSquare, FlaskConical } from 'lucide-react';
import {
  DEMO_MESSAGES, DEMO_BENEFIT_CARDS, DEMO_BASE_INCOME, DEMO_HOUSEHOLD,
} from '@/lib/demoData';

type Action =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'START_STREAMING' }
  | { type: 'UPDATE_STREAM'; content: string }
  | { type: 'FINISH_STREAMING'; message: Message }
  | { type: 'ADD_CARDS'; cards: BenefitPrediction[] }
  | { type: 'SET_BASE_INCOME'; income: number }
  | { type: 'SET_PHASE'; phase: ConversationState['phase'] }
  | { type: 'SET_ERROR'; error: string };

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: "Tell me a little about what's going on in your life right now — whatever feels most pressing. I'm here to help figure out what support might be available to you.",
  timestamp: Date.now(),
};

function initialState(demoMode: boolean): ConversationState {
  if (demoMode) {
    return {
      messages: DEMO_MESSAGES,
      benefitCards: DEMO_BENEFIT_CARDS,
      baseIncome: DEMO_BASE_INCOME,
      isStreaming: false,
      streamingContent: '',
      phase: 'deepening',
    };
  }
  return {
    messages: [INITIAL_MESSAGE],
    benefitCards: [],
    baseIncome: undefined,
    isStreaming: false,
    streamingContent: '',
    phase: 'story',
  };
}

// Very rough income extraction from conversation text — good enough for demo
function extractIncome(text: string): number | undefined {
  // Look for patterns like "$1,733/month", "1733/month", "$16/hour × 25", etc.
  const monthlyMatch = text.match(/\$?([\d,]+)\s*(?:\/month|per month|\/mo)/i);
  if (monthlyMatch) {
    const n = parseInt(monthlyMatch[1].replace(/,/g, ''), 10);
    if (n > 200 && n < 20000) return n;
  }
  // Hourly × hours → monthly
  const hourlyMatch = text.match(/\$?([\d.]+)\s*(?:\/hour|per hour|\/hr|an hour)[\s\S]{0,60}?(\d+)\s*hours?\s*(?:\/week|a week|per week)/i);
  if (hourlyMatch) {
    const rate = parseFloat(hourlyMatch[1]);
    const hours = parseInt(hourlyMatch[2], 10);
    if (rate > 5 && rate < 200 && hours > 0 && hours <= 80) {
      return Math.round(rate * hours * 52 / 12);
    }
  }
  return undefined;
}

function reducer(state: ConversationState, action: Action): ConversationState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'START_STREAMING':
      return { ...state, isStreaming: true, streamingContent: '' };
    case 'UPDATE_STREAM':
      return { ...state, streamingContent: action.content };
    case 'FINISH_STREAMING':
      return {
        ...state,
        isStreaming: false,
        streamingContent: '',
        messages: [...state.messages, action.message],
      };
    case 'ADD_CARDS': {
      const existing = new Set(state.benefitCards.map(c => c.programName));
      const newCards = action.cards.filter(c => !existing.has(c.programName));
      return { ...state, benefitCards: [...state.benefitCards, ...newCards] };
    }
    case 'SET_BASE_INCOME':
      return { ...state, baseIncome: action.income };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_ERROR':
      return {
        ...state,
        isStreaming: false,
        streamingContent: '',
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'assistant',
            content: "I'm having a moment — give me a second and try sending that again.",
            timestamp: Date.now(),
          },
        ],
      };
    default:
      return state;
  }
}

interface ChatProps {
  demoMode?: boolean;
}

export default function Chat({ demoMode = false }: ChatProps) {
  const [state, dispatch] = useReducer(reducer, demoMode, initialState);
  const [promptsUsed, setPromptsUsed] = useState(demoMode);
  const [activeTab, setActiveTab] = useState<'chat' | 'benefits'>(demoMode ? 'benefits' : 'chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.streamingContent]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Try to extract income from user messages
    const income = extractIncome(content);
    if (income && !state.baseIncome) {
      dispatch({ type: 'SET_BASE_INCOME', income });
    }

    setPromptsUsed(true);
    setActiveTab('chat');
    dispatch({ type: 'ADD_MESSAGE', message: userMessage });
    dispatch({ type: 'START_STREAMING' });

    try {
      const history = [...state.messages, userMessage].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        dispatch({ type: 'UPDATE_STREAM', content: fullText });
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: fullText,
        timestamp: Date.now(),
      };

      dispatch({ type: 'FINISH_STREAMING', message: assistantMessage });

      // Extract income from assistant response if not yet set
      if (!state.baseIncome) {
        const income = extractIncome(fullText);
        if (income) dispatch({ type: 'SET_BASE_INCOME', income });
      }

      // Extract benefit cards
      const { benefitCards } = parseMessageContent(fullText);
      if (benefitCards.length > 0) {
        dispatch({ type: 'ADD_CARDS', cards: benefitCards });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Request failed' });
    }
  }, [state.messages, state.baseIncome]);

  const cardCount = state.benefitCards.length;

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm px-4 py-3 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-primary">BenefitAccess</span>
            {demoMode && (
              <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded px-1.5 py-0.5">
                <FlaskConical className="w-2.5 h-2.5" />
                demo
              </span>
            )}
          </div>

          {/* Mobile tab bar */}
          <div className="flex md:hidden items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'chat' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'benefits' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Benefits
              {cardCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cardCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-muted-foreground hidden sm:block">Private · Nothing stored</span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Benefit Panel */}
        <div className={`
          w-full md:w-80 lg:w-96 flex-shrink-0
          ${activeTab === 'benefits' ? 'flex' : 'hidden'} md:flex
          flex-col overflow-hidden
        `}>
          <BenefitPanel
            cards={state.benefitCards}
            baseIncome={state.baseIncome}
            householdSize={demoMode ? DEMO_HOUSEHOLD.size : undefined}
            numChildren={demoMode ? DEMO_HOUSEHOLD.numChildren : undefined}
            childrenUnder5={demoMode ? DEMO_HOUSEHOLD.childrenUnder5 : undefined}
          />
        </div>

        {/* RIGHT — Chat */}
        <div className={`
          flex-1 flex flex-col overflow-hidden
          ${activeTab === 'chat' ? 'flex' : 'hidden'} md:flex
        `}>
          <WelcomeBanner />

          <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {state.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {!promptsUsed && state.messages.length === 1 && !state.isStreaming && (
                <SuggestedPrompts onSelect={(prompt) => {
                  setPromptsUsed(true);
                  sendMessage(prompt);
                }} />
              )}

              {state.isStreaming && state.streamingContent && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: state.streamingContent,
                    timestamp: Date.now(),
                  }}
                />
              )}

              {state.isStreaming && !state.streamingContent && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <InputArea onSend={sendMessage} disabled={state.isStreaming} />
        </div>
      </div>
    </div>
  );
}
