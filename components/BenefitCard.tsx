'use client';

import type { BenefitPrediction } from '@/lib/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// Subtle confidence indicators: small colored dot + plain-language phrase.
// Deliberately understated — the card leads with the benefit amount, not a trust signal.
const confidenceConfig = {
  high:   {
    dot: 'bg-confidence-high',
    label: 'Strong match',
    tooltip: "Based on what you've shared, this is very likely available to you.",
  },
  medium: {
    dot: 'bg-confidence-medium',
    label: 'Likely available',
    tooltip: "This is probably available to you, but depends on details we haven't discussed.",
  },
  lower:  {
    dot: 'bg-confidence-lower',
    label: 'Worth exploring',
    tooltip: 'This might be available — it varies by location or has specific requirements worth checking.',
  },
};

export default function BenefitCard({ prediction }: { prediction: BenefitPrediction }) {
  const [expanded, setExpanded] = useState(false);
  const isVerified = prediction.verifiedBy === 'rule-atlas';
  const conf = confidenceConfig[prediction.confidence];

  return (
    <div className={`rounded-xl border bg-card p-4 space-y-3 ${isVerified ? 'border-primary/20' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-base">{prediction.programName}</h3>
          <p className="text-xs text-muted-foreground">({prediction.officialName})</p>
        </div>
        {/* Subtle confidence indicator: colored dot + plain-language phrase.
            No badge — leads with amount and name, not a trust signal. */}
        <div
          className="flex items-center gap-1.5 shrink-0 pt-0.5"
          title={conf.tooltip}
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${conf.dot}`} />
          <span className="text-xs text-muted-foreground">{conf.label}</span>
        </div>
      </div>

      {/* Value display — exact amount takes priority over estimate */}
      <div className={`rounded-lg px-3 py-2 ${isVerified ? 'bg-primary/8 border border-primary/15' : 'bg-primary/5'}`}>
        {prediction.exactAmount ? (
          <div>
            <p className="text-sm font-semibold">{prediction.exactAmount}</p>
            {prediction.estimatedValue !== prediction.exactAmount && (
              <p className="text-xs text-muted-foreground mt-0.5">Precise figure · {prediction.estimatedValue}</p>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium">{prediction.estimatedValue}</p>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {prediction.description}
      </p>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Show less' : 'Details & next steps'}
      </button>

      {expanded && (
        <div className="space-y-3 pt-1">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What this covers</p>
            <p className="text-sm leading-relaxed">{prediction.whatItCovers}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Suggested next step</p>
            <p className="text-sm leading-relaxed">{prediction.howToApply}</p>
            <p className="text-xs text-muted-foreground mt-1">Estimated time: {prediction.timeEstimate}</p>
          </div>
          {prediction.documentsNeeded.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">You'll likely need</p>
              <ul className="text-sm space-y-0.5">
                {prediction.documentsNeeded.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-0.5">—</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {prediction.applicationUrl && (
            <a
              href={prediction.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
              Go to application <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {/* Citation tucked here — for credibility, not for card-face legibility */}
          {isVerified && prediction.citation && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
              <div className="w-1.5 h-1.5 rounded-full bg-confidence-high/60 shrink-0" />
              <p className="text-[10px] font-mono text-muted-foreground/60">
                {prediction.citation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
