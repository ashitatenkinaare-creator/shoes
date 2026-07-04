import type { SneakerPhase } from "@/types/radar";

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDateJa(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const phaseLabels: Record<SneakerPhase, string> = {
  announced: "発表済み",
  upcoming: "発売間近",
  today: "本日発売",
};

const phaseStyles: Record<SneakerPhase, string> = {
  announced: "bg-slate-700 text-slate-200",
  upcoming: "bg-amber-500/20 text-amber-300",
  today: "bg-radar-accent/20 text-radar-accent",
};

export function getPhaseLabel(phase: SneakerPhase): string {
  return phaseLabels[phase];
}

export function getPhaseStyle(phase: SneakerPhase): string {
  return phaseStyles[phase];
}
