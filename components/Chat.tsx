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
import { Sparkles, MessageSquare } from 'lucide-react';

type Action =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'START_STREAMING' }
  | { type: 'UPDATE_STREAM'; content: string }
  | { type: 'FINISH_STREAMING'; message: Message }
  | { type: 'ADD_CARDS'; cards: BenefitPrediction[] }
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

function initialState(): ConversationState {
  return {
    messages: [INITIAL_MESSAGE],
    benefitCards: [],
    isStreaming: false,
    streamingContent: '',
    phase: 'story',
  };
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

export default function Chat() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [promptsUsed, setPromptsUsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'benefits'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.streamingContent]);

  // Switch to benefits tab when first card arrives (mobile UX)
  const prevCardCount = useRef(0);
  useEffect(() => {
    if (state.benefitCards.length > prevCardCount.current && prevCardCount.current === 0) {
      // First card appeared — nudge the user (but don't auto-switch; let them finish reading)
    }
    prevCardCount.current = state.benefitCards.length;
  }, [state.benefitCards.length]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setPromptsUsed(true);
    setActiveTab('chat'); // Always switch to chat when sending
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

      // Extract any benefit cards from this response and add to persistent panel
      const { benefitCards } = parseMessageContent(fullText);
      if (benefitCards.length > 0) {
        dispatch({ type: 'ADD_CARDS', cards: benefitCards });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Request failed' });
    }
  }, [state.messages]);

  const cardCount = state.benefitCards.length;

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-none">
          <span className="font-semibold text-sm text-primary">BenefitAccess</span>

          {/* Mobile tab bar — shown only on small screens */}
          <div className="flex md:hidden items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'benefits'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
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

      {/* ── Body: two-column on desktop, single-panel on mobile ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Benefit Panel (always visible on md+, tab-controlled on mobile) */}
        <div className={`
          w-full md:w-80 lg:w-96 flex-shrink-0
          ${activeTab === 'benefits' ? 'flex' : 'hidden'} md:flex
          flex-col overflow-hidden
        `}>
          <BenefitPanel cards={state.benefitCards} />
        </div>

        {/* RIGHT — Chat (always visible on md+, tab-controlled on mobile) */}
        <div className={`
          flex-1 flex flex-col overflow-hidden
          ${activeTab === 'chat' ? 'flex' : 'hidden'} md:flex
        `}>
          <WelcomeBanner />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {state.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Suggested prompts */}
              {!promptsUsed && state.messages.length === 1 && !state.isStreaming && (
                <SuggestedPrompts onSelect={(prompt) => {
                  setPromptsUsed(true);
                  sendMessage(prompt);
                }} />
              )}

              {/* Streaming message */}
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

              {/* Typing indicator */}
              {state.isStreaming && !state.streamingContent && (
                <TypingIndicator />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <InputArea onSend={sendMessage} disabled={state.isStreaming} />
        </div>
      </div>
    </div>
  );
}
