'use client';

import { useReducer, useCallback, useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';
import InputArea from './InputArea';
import WelcomeBanner from './WelcomeBanner';
import TypingIndicator from './TypingIndicator';
import type { Message, ConversationState } from '@/lib/types';

type Action =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'START_STREAMING' }
  | { type: 'UPDATE_STREAM'; content: string }
  | { type: 'FINISH_STREAMING'; message: Message }
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
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

    setPromptsUsed(true); // Hide suggested prompts once user sends anything
    dispatch({ type: 'ADD_MESSAGE', message: userMessage });
    dispatch({ type: 'START_STREAMING' });

    try {
      // Build message history for Claude (exclude IDs and timestamps)
      const history = [...state.messages, userMessage].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        throw new Error('Chat request failed');
      }

      // Stream the response
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
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Request failed' });
    }
  }, [state.messages]);

  return (
    <div className="flex flex-col h-dvh max-h-dvh">
      {/* Header — minimal, warm */}
      <header className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-semibold text-sm text-primary">BenefitAccess</span>
          <span className="text-xs text-muted-foreground">Private · Nothing stored</span>
        </div>
      </header>

      {/* Welcome banner — shown above first message */}
      <WelcomeBanner />

      {/* Messages area — scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Suggested prompts — shown only before user's first message */}
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

          {/* Typing indicator — shown when streaming but no content yet */}
          {state.isStreaming && !state.streamingContent && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area — fixed at bottom */}
      <InputArea
        onSend={sendMessage}
        disabled={state.isStreaming}
      />
    </div>
  );
}
