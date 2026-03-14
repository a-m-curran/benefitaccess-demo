'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start message-enter">
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/40" />
          <div className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/40" />
          <div className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
    </div>
  );
}
