import { prisma } from "./prisma";

export const DEFAULT_SLA_HOURS: Record<string, number> = {
  NEW: 8,
  IN_PROGRESS: 8,
  CONTACTED: 24,
  NEGOTIATION: 24,
  RESERVED: 48,
  SOLD: 0,
  REJECTED: 0,
  UNREACHABLE: 24,
};

export const DEFAULT_SLA_FINAL: Record<string, boolean> = {
  NEW: false,
  IN_PROGRESS: false,
  CONTACTED: false,
  NEGOTIATION: false,
  RESERVED: false,
  SOLD: true,
  REJECTED: true,
  UNREACHABLE: false,
};

export async function getSlaRulesMap() {
  const rules = await prisma.slaRule.findMany();
  const map = new Map(rules.map((r) => [r.status, r]));
  return (status: string) =>
    map.get(status as any) ?? {
      status,
      hours: DEFAULT_SLA_HOURS[status] ?? 24,
      isFinal: DEFAULT_SLA_FINAL[status] ?? false,
    };
}

export interface SlaState {
  state: "ok" | "warning" | "breached" | "none";
  deadline: Date | null;
  remainingMs: number | null;
}

export function computeSlaState(
  statusChangedAt: Date,
  rule: { hours: number; isFinal: boolean },
  warningThresholdPct = 0.25
): SlaState {
  if (rule.isFinal) return { state: "none", deadline: null, remainingMs: null };

  const totalMs = rule.hours * 60 * 60 * 1000;
  const deadline = new Date(statusChangedAt.getTime() + totalMs);
  const remainingMs = deadline.getTime() - Date.now();

  let state: SlaState["state"] = "ok";
  if (remainingMs < 0) state = "breached";
  else if (totalMs > 0 && remainingMs / totalMs < warningThresholdPct) state = "warning";

  return { state, deadline, remainingMs };
}

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  return `${h}ч ${m}м`;
}
