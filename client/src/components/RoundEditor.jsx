import { toInputDate } from "../utils";

const emptyRound = { name: "", status: "Pending", scheduledDate: "", notes: "" };

export default function RoundEditor({ rounds, roundStatuses, onChange }) {
  const update = (index, field, value) => {
    const next = rounds.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    onChange(next);
  };

  const addRound = () => {
    const n = rounds.length + 1;
    onChange([
      ...rounds,
      { ...emptyRound, name: `Round ${n}` },
    ]);
  };

  const removeRound = (index) => {
    onChange(rounds.filter((_, i) => i !== index));
  };

  return (
    <div className="rounds-section">
      <div className="rounds-header">
        <label>Interview rounds</label>
        <button type="button" className="btn-ghost btn-sm" onClick={addRound}>
          + Add round
        </button>
      </div>
      {rounds.length === 0 ? (
        <p className="rounds-hint">Add rounds to track OA, technical, HR, etc.</p>
      ) : (
        <div className="rounds-list">
          {rounds.map((round, i) => (
            <div key={round._id || i} className="round-card">
              <input
                value={round.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Round name"
              />
              <select
                value={round.status}
                onChange={(e) => update(i, "status", e.target.value)}
              >
                {roundStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={toInputDate(round.scheduledDate)}
                onChange={(e) => update(i, "scheduledDate", e.target.value)}
                title="Scheduled date"
              />
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => removeRound(i)}
                aria-label="Remove round"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
