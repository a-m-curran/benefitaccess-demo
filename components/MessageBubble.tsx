'use client';

import type { Message } from '@/lib/types';
import BenefitCard from './BenefitCard';
import { parseMessageContent } from '@/lib/parseResponse';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const { textBlocks, benefitCards } = parseMessageContent(message.content);

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
          <p key={i} className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {block}
          </p>
        ))}

        {benefitCards.map((card, i) => (
          <BenefitCard key={i} prediction={card} />
        ))}
      </div>
    </div>
  );
}
