'use client';

import type { BenefitPrediction } from '@/lib/types';
import BenefitCard from './BenefitCard';
import ScenarioModeler from './ScenarioModeler';
import { Sparkles } from 'lucide-react';

interface BenefitPanelProps {
  cards: BenefitPrediction[];
  baseIncome?: number;
  householdSize?: number;
  numChildren?: number;
  childrenUnder5?: number;
}

export default function BenefitPanel({
  cards, baseIncome, householdSize, numChildren, childrenUnder5,
}: BenefitPanelProps) {
  const verifiedCount = cards.filter(c => c.verifiedBy === 'rule-atlas').length;

  return (
    <aside className="flex flex-col h-full border-r bg-muted/30 overflow-hidden">
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-card/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Benefits Found</span>
          {cards.length > 0 && (
            <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {cards.length}
            </span>
          )}
        </div>
        {verifiedCount > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
            {verifiedCount} verified · Rule Atlas rules engine
          </p>
        )}
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto chat-scroll px-3 py-3 space-y-2">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-primary/40" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Benefits you may qualify for will appear here as we talk.
            </p>
          </div>
        ) : (
          cards.map((card, i) => (
            <BenefitCard key={`${card.programName}-${i}`} prediction={card} />
          ))
        )}
      </div>

      {/* Scenario modeler — shown when we have an income figure */}
      {baseIncome !== undefined && baseIncome > 0 && (
        <ScenarioModeler
          baseIncome={baseIncome}
          householdSize={householdSize}
          numChildren={numChildren}
          childrenUnder5={childrenUnder5}
        />
      )}
    </aside>
  );
}
