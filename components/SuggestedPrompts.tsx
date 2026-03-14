'use client';

const PROMPTS = [
  "I recently lost my job and I'm not sure where to start",
  "I'm working but it's not enough to cover everything",
  "I need help with groceries and medical bills",
  "I want to understand what's available for my family",
  "Things have changed and I'm trying to figure out my options",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-0 message-enter">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-sm px-3.5 py-2 rounded-full border border-primary/20 bg-primary/5 text-foreground/80 hover:bg-primary/10 hover:border-primary/30 transition-colors text-left leading-snug"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
