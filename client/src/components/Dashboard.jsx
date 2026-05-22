import { formatDate } from "../utils";

function ProgressBar({ percent, color = "var(--accent)" }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, percent)}%`, background: color }}
      />
    </div>
  );
}

export default function Dashboard({ analytics }) {
  const {
    total,
    responseRate,
    offerRate,
    interviewRate,
    ghostRate,
    activeCount,
    roundStats,
    activePipelines,
    avgDaysInProcess,
    funnelConversion,
  } = analytics;

  return (
    <div className="dashboard">
      <div className="stats-row">
        <div className="stat-card">
          <div className="value">{total}</div>
          <div className="label">Total applications</div>
        </div>
        <div className="stat-card">
          <div className="value">{roundStats.pendingRounds}</div>
          <div className="label">Rounds pending</div>
        </div>
        <div className="stat-card">
          <div className="value">{activeCount}</div>
          <div className="label">Active pipelines</div>
        </div>
        <div className="stat-card">
          <div className="value">{responseRate}%</div>
          <div className="label">Response rate</div>
        </div>
        <div className="stat-card">
          <div className="value">{offerRate}%</div>
          <div className="label">Offer rate</div>
        </div>
        <div className="stat-card">
          <div className="value">{avgDaysInProcess}d</div>
          <div className="label">Avg days in process</div>
        </div>
      </div>

      <div className="stats-row stats-row-sm">
        <div className="stat-card stat-card-inline">
          <span className="label">Interview rate</span>
          <span className="value-sm">{interviewRate}%</span>
        </div>
        <div className="stat-card stat-card-inline">
          <span className="label">Ghost rate</span>
          <span className="value-sm">{ghostRate}%</span>
        </div>
        <div className="stat-card stat-card-inline">
          <span className="label">Applied → Screening</span>
          <span className="value-sm">{funnelConversion.appliedToScreening}%</span>
        </div>
        <div className="stat-card stat-card-inline">
          <span className="label">Screening → Interview</span>
          <span className="value-sm">{funnelConversion.screeningToInterview}%</span>
        </div>
        <div className="stat-card stat-card-inline">
          <span className="label">Interview → Offer</span>
          <span className="value-sm">{funnelConversion.interviewToOffer}%</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-card-wide">
          <h3>Active hiring pipelines</h3>
          {activePipelines.length > 0 ? (
            <ul className="pipeline-list">
              {activePipelines.map((p) => (
                <li key={p.id}>
                  <div className="pipeline-top">
                    <div>
                      <strong>{p.company}</strong>
                      <span className="pipeline-role">{p.role}</span>
                    </div>
                    <span className="pipeline-pending">
                      {p.pending} round{p.pending !== 1 ? "s" : ""} pending
                    </span>
                  </div>
                  <ProgressBar percent={p.percent} />
                  <div className="pipeline-meta">
                    <span>
                      {p.passed} passed · {p.completed}/{p.expected || p.total} done
                      {p.remaining > 0 && ` · ${p.remaining} left`}
                    </span>
                    {p.nextRound && (
                      <span>
                        Next: {p.nextRound}
                        {p.nextDate && ` (${formatDate(p.nextDate)})`}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No active pipelines with rounds</p>
          )}
        </div>
      </div>
    </div>
  );
}
