import { STATUSES, getRoundProgress } from "../models/Application.js";

const ACTIVE = ["Applied", "Screening", "Interview"];
const TERMINAL = ["Rejected", "Ghosted", "Withdrawn", "Offer"];

export function buildAnalytics(apps) {
  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(weekAhead.getDate() + 7);
  const staleCutoff = new Date(now);
  staleCutoff.setDate(staleCutoff.getDate() - 14);

  const byStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  const byMonth = {};
  const byPriority = { Low: 0, Medium: 0, High: 0 };
  const bySource = {};
  const roundStatusCounts = {
    Pending: 0,
    Scheduled: 0,
    Completed: 0,
    Passed: 0,
    Failed: 0,
  };

  let withResponse = 0;
  let offers = 0;
  let totalPendingRounds = 0;
  let totalRoundsTracked = 0;
  let activePipelineCount = 0;
  const upcoming = [];
  const activePipelines = [];
  const staleApplications = [];
  let daysInProcessSum = 0;
  let daysInProcessCount = 0;

  const hiringFunnel = {
    Applied: 0,
    Screening: 0,
    Interview: 0,
    Offer: 0,
  };

  for (const app of apps) {
    byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    byPriority[app.priority] = (byPriority[app.priority] || 0) + 1;
    bySource[app.source || "Other"] = (bySource[app.source || "Other"] || 0) + 1;

    if (["Interview", "Offer", "Rejected"].includes(app.status)) {
      withResponse++;
    }
    if (app.status === "Offer") offers++;

    if (hiringFunnel[app.status] !== undefined) {
      hiringFunnel[app.status]++;
    }

    const monthKey = new Date(app.appliedDate).toISOString().slice(0, 7);
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;

    for (const field of ["deadline", "followUpDate"]) {
      const d = app[field];
      if (d && new Date(d) >= now && new Date(d) <= weekAhead) {
        upcoming.push({
          id: app._id,
          company: app.company,
          role: app.role,
          type: field === "deadline" ? "Deadline" : "Follow-up",
          date: d,
        });
      }
    }

    const rounds = app.rounds || [];
    for (const r of rounds) {
      roundStatusCounts[r.status] = (roundStatusCounts[r.status] || 0) + 1;
      totalRoundsTracked++;
    }

    const progress = getRoundProgress(rounds);
    totalPendingRounds += progress.pending;

    if (["Screening", "Interview"].includes(app.status) && rounds.length > 0) {
      activePipelineCount++;
      const expected =
        app.expectedRounds > 0 ? app.expectedRounds : rounds.length;
      activePipelines.push({
        id: app._id,
        company: app.company,
        role: app.role,
        status: app.status,
        completed: progress.done,
        passed: progress.passed,
        pending: progress.pending,
        failed: progress.failed,
        total: rounds.length,
        expected,
        remaining: Math.max(0, expected - progress.done),
        nextRound: progress.nextRound,
        nextDate: progress.nextDate,
        percent: expected
          ? Math.round((progress.done / expected) * 100)
          : Math.round((progress.passed / rounds.length) * 100) || 0,
      });
    }

    if (
      ACTIVE.includes(app.status) &&
      new Date(app.updatedAt) < staleCutoff
    ) {
      const daysStale = Math.floor(
        (now - new Date(app.updatedAt)) / (1000 * 60 * 60 * 24)
      );
      staleApplications.push({
        id: app._id,
        company: app.company,
        role: app.role,
        status: app.status,
        daysStale,
      });
    }

    if (ACTIVE.includes(app.status)) {
      const days = Math.floor(
        (now - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24)
      );
      daysInProcessSum += days;
      daysInProcessCount++;
    }
  }

  upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
  activePipelines.sort((a, b) => b.pending - a.pending);
  staleApplications.sort((a, b) => b.daysStale - a.daysStale);

  const total = apps.length;
  const inInterview = byStatus.Interview || 0;
  const rejected = byStatus.Rejected || 0;
  const ghosted = byStatus.Ghosted || 0;
  const terminal = TERMINAL.reduce((n, s) => n + (byStatus[s] || 0), 0);

  return {
    total,
    byStatus,
    byMonth: Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    byPriority,
    bySource: Object.entries(bySource)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count })),
    responseRate: total ? Math.round((withResponse / total) * 100) : 0,
    offerRate: total ? Math.round((offers / total) * 100) : 0,
    interviewRate: total ? Math.round((inInterview / total) * 100) : 0,
    ghostRate: total ? Math.round((ghosted / total) * 100) : 0,
    rejectionRate: total ? Math.round((rejected / total) * 100) : 0,
    activeCount: ACTIVE.reduce((n, s) => n + (byStatus[s] || 0), 0),
    terminalCount: terminal,
    upcoming: upcoming.slice(0, 10),
    hiringFunnel: Object.entries(hiringFunnel).map(([stage, count]) => ({
      stage,
      count,
    })),
    roundStats: {
      ...roundStatusCounts,
      totalTracked: totalRoundsTracked,
      pendingRounds: totalPendingRounds,
      activePipelineCount,
    },
    activePipelines: activePipelines.slice(0, 12),
    staleApplications: staleApplications.slice(0, 8),
    avgDaysInProcess: daysInProcessCount
      ? Math.round(daysInProcessSum / daysInProcessCount)
      : 0,
    funnelConversion: {
      appliedToScreening: pct(hiringFunnel.Screening, hiringFunnel.Applied),
      screeningToInterview: pct(inInterview, hiringFunnel.Screening),
      interviewToOffer: pct(offers, inInterview),
    },
  };
}

function pct(num, den) {
  return den ? Math.round((num / den) * 100) : 0;
}
