'use client';

import type { Message } from '@/lib/types';
import { parseMessageContent } from '@/lib/parseResponse';

interface MessageBubbleProps {
  message: Message;
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
            {block}
          </p>
        ))}
      </div>
    </div>
  );
}
