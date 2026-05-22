import { formatDate, PRIORITY_COLORS, getRoundSummary } from "../utils";

export default function ApplicationList({
  applications,
  selectedId,
  onSelect,
  onDelete,
  onQuickStatus,
  statuses,
}) {
  if (applications.length === 0) {
    return (
      <div className="table-wrap">
        <p className="empty">
          No applications yet. Add your first company on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="applications-table">
        <thead>
          <tr>
            <th>Company / Role</th>
            <th>Status</th>
            <th>Rounds</th>
            <th>Applied</th>
            <th>Follow-up</th>
            <th>Priority</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const { pending, passed, expected, total } = getRoundSummary(
              app.rounds,
              app.expectedRounds
            );
            return (
              <tr
                key={app._id}
                className={selectedId === app._id ? "selected" : ""}
                onClick={() => onSelect(app)}
              >
                <td className="company-cell">
                  <strong>{app.company}</strong>
                  <span>{app.role}</span>
                  {app.source && app.source !== "Other" && (
                    <span className="source-tag">{app.source}</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status}
                    onChange={(e) => onQuickStatus(app._id, e.target.value)}
                    style={{
                      width: "auto",
                      fontSize: "0.8rem",
                      padding: "0.3rem 0.4rem",
                    }}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {total > 0 ? (
                    <span className="rounds-badge" title="Passed / pending / expected">
                      {passed}/{pending} pending
                      {expected > total ? ` · ${expected} planned` : ""}
                    </span>
                  ) : (
                    <span className="muted-cell">—</span>
                  )}
                </td>
                <td>{formatDate(app.appliedDate)}</td>
                <td>{formatDate(app.followUpDate)}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: `${PRIORITY_COLORS[app.priority]}22`,
                      color: PRIORITY_COLORS[app.priority],
                    }}
                  >
                    {app.priority}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => onSelect(app)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => onDelete(app._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
