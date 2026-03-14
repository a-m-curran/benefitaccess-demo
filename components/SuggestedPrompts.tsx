'use client';

export const STANDARD_PROMPTS = [
  "I recently lost my job and I'm not sure where to start",
  "I'm working but it's not enough to cover everything",
  "I need help with groceries and medical bills",
  "I want to understand what's available for my family",
  "Things have changed and I'm trying to figure out my options",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  // In demo mode, Chat passes a truncated prompt list + a special walkthrough chip
  prompts?: string[];
  // Optional single featured chip shown above the regular chips (e.g. demo walkthrough)
  featuredChip?: { label: string; onSelect: () => void };
}

export default function SuggestedPrompts({
  onSelect,
  prompts = STANDARD_PROMPTS,
  featuredChip,
}: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col gap-2 pl-0 message-enter">
      {/* Featured chip (e.g. "Walk me through an example") */}
      {featuredChip && (
        <button
          onClick={featuredChip.onSelect}
          className="self-start flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-primary/12 border border-primary/30 text-primary font-medium hover:bg-primary/18 hover:border-primary/40 transition-colors"
        >
          {featuredChip.label}
        </button>
      )}
      {/* Regular chips */}
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-sm px-3.5 py-2 rounded-full border border-primary/20 bg-primary/5 text-foreground/80 hover:bg-primary/10 hover:border-primary/30 transition-colors text-left leading-snug"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
