'use client';

import type { Message } from '@/lib/types';
import { parseMessageContent } from '@/lib/parseResponse';

interface MessageBubbleProps {
  message: Message;
}

// Reflection messages start with "Let me make sure I've got this right" or similar phrases.
// They summarize what the person said back to them — a distinct conversational move that
// deserves a distinct visual treatment (subtle left border, slight indent).
const REFLECTION_PATTERNS = [
  /^let me make sure/i,           // "Let me make sure I've got this right / the picture"
  /^so here'?s what i'?m hearing/i,
  /^if i'?ve got this right/i,
  /^before (i |we )?(go further|do anything)/i,
];

// Renders inline **bold** markers as <strong> — lets demo messages (and Claude when
// prompted) emphasize key figures like **$619/month** without a full markdown library.
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  // Extract text only — benefit cards are rendered in the persistent left panel
  const { textBlocks } = parseMessageContent(message.content);

  // If there's nothing to show (e.g., a message that was only cards), skip rendering
  if (textBlocks.length === 0 || textBlocks.every(b => !b.trim())) return null;

  // Reflection messages ("Let me make sure I've got this right...") get a subtle
  // left-border treatment to visually distinguish "what I heard" from other responses.
  // Split by \n\n so we catch reflection paragraphs that follow a brief acknowledgment
  // (e.g. "That makes sense.\n\nLet me make sure...") — detection only, rendering unchanged.
  const isReflection = isAssistant && textBlocks.some(b =>
    b.split(/\n\n+/).some(para =>
      REFLECTION_PATTERNS.some(p => p.test(para.trim()))
    )
  );

  return (
    <div className={`flex message-enter ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`
          max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3
          ${isAssistant
            ? 'bg-card border border-border rounded-tl-sm'
            : 'bg-primary/10 border border-primary/20 rounded-tr-sm'
          }
          ${isReflection ? 'border-l-[3px] border-l-primary/35' : ''}
        `}
      >
        {isReflection && (
          <p className="text-[11px] font-medium text-primary/60 uppercase tracking-wider mb-2">
            What I heard
          </p>
        )}
        {textBlocks.map((block, i) => (
          <p key={i} className={`text-[15px] leading-relaxed whitespace-pre-wrap ${i > 0 ? 'mt-3' : ''}`}>
            {renderInline(block)}
          </p>
        ))}
      </div>
    </div>
  );
}
