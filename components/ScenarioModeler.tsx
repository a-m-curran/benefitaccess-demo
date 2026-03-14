'use client';

import { useState, useMemo } from 'react';
import { calculateScenario } from '@/lib/mockCalculations';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ScenarioModelerProps {
  baseIncome: number;  // monthly gross
  householdSize?: number;
  numChildren?: number;
  childrenUnder5?: number;
}

function fmt(n: number): string {
  return '$' + Math.abs(Math.round(n)).toLocaleString();
}

function ProgramRow({ name, current, next, change, lostEligibility }: {
  name: string; current: number; next: number; change: number; lostEligibility: boolean;
}) {
  const same = Math.abs(change) < 2;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{name}</span>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground/60 font-mono">{fmt(current)}</span>
        <span className="text-muted-foreground/40">→</span>
        <span className="font-mono font-medium">{lostEligibility ? 'Not eligible' : fmt(next)}</span>
        {!same && (
          <span className={`font-mono font-semibold w-14 text-right ${change > 0 ? 'text-confidence-high' : 'text-destructive'}`}>
            {change > 0 ? '+' : ''}{fmt(change)}
          </span>
        )}
        {same && <span className="w-14" />}
      </div>
    </div>
  );
}

export default function ScenarioModeler({
  baseIncome, householdSize = 3, numChildren = 2, childrenUnder5 = 1,
}: ScenarioModelerProps) {
  const [sliderValue, setSliderValue] = useState(baseIncome);

  const scenario = useMemo(() =>
    calculateScenario(baseIncome, sliderValue, { householdSize, numChildren, childrenUnder5 }),
    [baseIncome, sliderValue, householdSize, numChildren, childrenUnder5]
  );

  const incomeChange = sliderValue - baseIncome;
  const netIsPositive = scenario.netChange > 0;
  const isAtBase = Math.abs(incomeChange) < 5;

  const maxSlider = Math.max(baseIncome * 2.5, 5000);

  return (
    <div className="border-t bg-card/40">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-foreground/80">Income Simulator</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Drag to see how income changes affect your benefits</p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Monthly income</span>
            <span className="text-sm font-semibold font-mono">{fmt(sliderValue)}/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxSlider}
            step={50}
            value={sliderValue}
            onChange={e => setSliderValue(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground/50 font-mono">$0</span>
            <span className="text-[9px] text-muted-foreground/60 font-mono">Your current: {fmt(baseIncome)}/mo</span>
            <span className="text-[9px] text-muted-foreground/50 font-mono">{fmt(maxSlider)}</span>
          </div>
        </div>

        {/* Program breakdown */}
        {!isAtBase && (
          <div className="rounded-lg border bg-background/60 px-3 py-2">
            {scenario.programs.map(p => (
              <ProgramRow
                key={p.officialName}
                name={p.programName}
                current={p.currentAmount}
                next={p.newAmount}
                change={p.change}
                lostEligibility={p.lostEligibility}
              />
            ))}
          </div>
        )}

        {/* Net impact summary */}
        {!isAtBase && (
          <div className={`rounded-lg px-3 py-2.5 border ${netIsPositive ? 'bg-confidence-high/8 border-confidence-high/20' : 'bg-destructive/8 border-destructive/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {netIsPositive
                  ? <TrendingUp className="w-3.5 h-3.5 text-confidence-high" />
                  : <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                }
                <span className="text-xs font-medium">Net monthly change</span>
              </div>
              <span className={`text-sm font-bold font-mono ${netIsPositive ? 'text-confidence-high' : 'text-destructive'}`}>
                {scenario.netChange >= 0 ? '+' : ''}{fmt(scenario.netChange)}/mo
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Income change</span>
                <span className="font-mono">{incomeChange >= 0 ? '+' : ''}{fmt(incomeChange)}/mo</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Benefits change</span>
                <span className="font-mono">{scenario.totalBenefitChange >= 0 ? '+' : ''}{fmt(scenario.totalBenefitChange)}/mo</span>
              </div>
            </div>
          </div>
        )}

        {/* Cliff warning */}
        {scenario.cliffWarning && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed">{scenario.cliffWarning}</p>
          </div>
        )}

        {/* Attribution */}
        <p className="text-[9px] text-muted-foreground/40 text-center font-mono">
          Calculations approximate WA state rules (2025) · powered by Rule Atlas
        </p>
      </div>
    </div>
  );
}
