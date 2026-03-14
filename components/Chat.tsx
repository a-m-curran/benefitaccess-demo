'use client';

import { useReducer, useCallback, useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import SuggestedPrompts, { STANDARD_PROMPTS } from './SuggestedPrompts';
import InputArea from './InputArea';
import WelcomeBanner from './WelcomeBanner';
import TypingIndicator from './TypingIndicator';
import BenefitPanel from './BenefitPanel';
import { parseMessageContent } from '@/lib/parseResponse';
import type { Message, ConversationState, BenefitPrediction } from '@/lib/types';
import { Sparkles, MessageSquare } from 'lucide-react';
import { DEMO_SCENARIOS } from '@/lib/demoData';

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
  // Leads with normalizing ("most people qualify for more than they realize") before
  // asking anything — pre-empts "do I even belong here?" without naming it.
  // Short enough that the chips below feel like the natural first move.
  content: "Most people qualify for more support than they realize — food assistance, healthcare, childcare, and more. I can help figure out what's available for your situation. What's going on?",
  timestamp: Date.now(),
};

// Both demo and live mode start fresh — same opening message + chips.
// In demo mode, chips include a special scenario-specific trigger chip.
function initialState(): ConversationState {
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
  const monthlyMatch = text.match(/\$?([\d,]+)\s*(?:\/month|per month|\/mo)/i);
  if (monthlyMatch) {
    const n = parseInt(monthlyMatch[1].replace(/,/g, ''), 10);
    if (n > 200 && n < 20000) return n;
  }
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

// Typing duration scales with message length to feel realistic
function typingDuration(content: string): number {
  if (content.length < 150) return 1500;
  if (content.length < 400) return 2000;
  return 2600;
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
  // Numeric demo mode: 1 = Maya (WA), 2 = Deja (IL), 3 = Tomás (TX).
  // Undefined / falsy = live mode (real API).
  demoMode?: number;
}

export default function Chat({ demoMode }: ChatProps) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [promptsUsed, setPromptsUsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'benefits'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Look up the active scenario (undefined in live mode).
  const scenario = demoMode ? (DEMO_SCENARIOS[demoMode] ?? null) : null;

  // Demo auto-play: null = not playing, number = next scenario.messages index to show.
  // Playback starts at index 1 (index 0 is the opening message, already shown by INITIAL_MESSAGE).
  const [demoPlayback, setDemoPlayback] = useState<number | null>(null);

  const isDemoPlaying = demoPlayback !== null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.streamingContent]);

  // ── Demo auto-play engine ──────────────────────────────────────────────────
  // Advances through scenario.messages one at a time with realistic delays.
  // User messages appear after a short pause; assistant messages show a typing
  // indicator, then the full message. Cards are revealed per scenario.cardReveal.
  useEffect(() => {
    if (demoPlayback === null || !scenario) return;

    // Skip index 0 (it's the same as the opening message already shown)
    const idx = demoPlayback === 0 ? 1 : demoPlayback;

    if (idx >= scenario.messages.length) {
      setDemoPlayback(null); // finished
      return;
    }

    const msg = scenario.messages[idx];

    if (msg.role === 'assistant') {
      // Show typing indicator immediately, then reveal message after a duration
      dispatch({ type: 'START_STREAMING' });
      const t = setTimeout(() => {
        dispatch({ type: 'FINISH_STREAMING', message: msg });

        // Reveal cards mapped to this message
        const cards = scenario.cardReveal[msg.id];
        if (cards?.length) dispatch({ type: 'ADD_CARDS', cards });

        // Set income when the scenario's designated income message plays
        if (msg.id === scenario.incomeMessageId) {
          dispatch({ type: 'SET_BASE_INCOME', income: scenario.baseIncome });
        }

        setDemoPlayback(idx + 1);
      }, typingDuration(msg.content));
      return () => clearTimeout(t);
    } else {
      // User messages appear after a short pause (gives the reader a moment)
      const t = setTimeout(() => {
        dispatch({ type: 'ADD_MESSAGE', message: msg });
        setDemoPlayback(idx + 1);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [demoPlayback, scenario]);

  // Start demo playback from message index 1
  const startDemoPlayback = useCallback(() => {
    setPromptsUsed(true);
    setDemoPlayback(1);
  }, []);

  // ── Live message send ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const income = extractIncome(content);
    if (income && !state.baseIncome) dispatch({ type: 'SET_BASE_INCOME', income });

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

      if (!state.baseIncome) {
        const income = extractIncome(fullText);
        if (income) dispatch({ type: 'SET_BASE_INCOME', income });
      }

      const { benefitCards } = parseMessageContent(fullText);
      if (benefitCards.length > 0) dispatch({ type: 'ADD_CARDS', cards: benefitCards });
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Request failed' });
    }
  }, [state.messages, state.baseIncome]);

  const cardCount = state.benefitCards.length;
  const showChips = !promptsUsed && state.messages.length === 1 && !state.isStreaming;

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm px-4 py-3 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-primary">BenefitAccess</span>
            {demoMode && (
              <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                prototype
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
            householdSize={scenario?.household.size}
            numChildren={scenario?.household.numChildren}
            childrenUnder5={scenario?.household.childrenUnder5}
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

              {/* Chips: shown until user sends first message.
                  In demo mode, includes a scenario-specific featured chip that
                  triggers auto-play of the pre-written arc. Regular chips still
                  work and go to the live API for real conversations. */}
              {showChips && (
                <SuggestedPrompts
                  prompts={STANDARD_PROMPTS}
                  onSelect={sendMessage}
                  featuredChip={scenario ? {
                    label: scenario.chipLabel,
                    onSelect: startDemoPlayback,
                  } : undefined}
                />
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

          {/* Input is disabled during demo playback so the arc isn't interrupted */}
          <InputArea
            onSend={sendMessage}
            disabled={state.isStreaming || isDemoPlaying}
          />
        </div>
      </div>
    </div>
  );
}
