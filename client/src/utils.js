export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export const STATUS_COLORS = {
  Applied: "#6366f1",
  Screening: "#8b5cf6",
  Interview: "#0ea5e9",
  Offer: "#22c55e",
  Rejected: "#ef4444",
  Ghosted: "#94a3b8",
  Withdrawn: "#f59e0b",
};

export const PRIORITY_COLORS = {
  Low: "#94a3b8",
  Medium: "#6366f1",
  High: "#ef4444",
};

export const ROUND_STATUS_COLORS = {
  Pending: "#94a3b8",
  Scheduled: "#0ea5e9",
  Completed: "#8b5cf6",
  Passed: "#22c55e",
  Failed: "#ef4444",
};

export const FUNNEL_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#22c55e"];

export function getRoundSummary(rounds = [], expectedRounds = 0) {
  const total = rounds.length;
  const pending = rounds.filter((r) =>
    ["Pending", "Scheduled"].includes(r.status)
  ).length;
  const passed = rounds.filter((r) => r.status === "Passed").length;
  const expected = expectedRounds > 0 ? expectedRounds : total;
  return { total, pending, passed, expected };
}
