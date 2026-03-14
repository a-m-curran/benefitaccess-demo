'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic } from 'lucide-react';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputArea({ onSend, disabled }: InputAreaProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`; // Max 160px height
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="flex-shrink-0 border-t bg-card/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Mobile mic hint */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 sm:hidden">
          <Mic className="w-3 h-3" />
          <span>Tap the mic on your keyboard to talk instead of type</span>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            disabled={disabled}
            rows={1}
            style={{ fontSize: '16px' }} // CRITICAL: Prevents iOS Safari zoom on focus
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50 min-h-[48px]"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 transition-all mb-0.5"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
