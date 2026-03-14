'use client';

import type { Message } from '@/lib/types';
import { parseMessageContent } from '@/lib/parseResponse';

interface MessageBubbleProps {
  message: Message;
}

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

  return (
    <div className={`flex message-enter ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`
          max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3
          ${isAssistant
            ? 'bg-card border border-border rounded-tl-sm'
            : 'bg-primary/10 border border-primary/20 rounded-tr-sm'
          }
        `}
      >
        {textBlocks.map((block, i) => (
          <p key={i} className={`text-[15px] leading-relaxed whitespace-pre-wrap ${i > 0 ? 'mt-2' : ''}`}>
            {renderInline(block)}
          </p>
        ))}
      </div>
    </div>
  );
}
