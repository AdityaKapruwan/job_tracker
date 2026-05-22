import { useState, useEffect } from "react";
import { toInputDate } from "../utils";
import RoundEditor from "./RoundEditor";

const empty = {
  company: "",
  role: "",
  status: "Applied",
  appliedDate: new Date().toISOString().slice(0, 10),
  deadline: "",
  followUpDate: "",
  location: "",
  jobUrl: "",
  salary: "",
  notes: "",
  priority: "Medium",
  source: "Other",
  expectedRounds: 0,
  rounds: [],
};

export default function ApplicationForm({
  statuses,
  sources,
  roundStatuses,
  editing,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) {
      setForm({
        company: editing.company,
        role: editing.role,
        status: editing.status,
        appliedDate: toInputDate(editing.appliedDate),
        deadline: toInputDate(editing.deadline),
        followUpDate: toInputDate(editing.followUpDate),
        location: editing.location || "",
        jobUrl: editing.jobUrl || "",
        salary: editing.salary || "",
        notes: editing.notes || "",
        priority: editing.priority || "Medium",
        source: editing.source || "Other",
        expectedRounds: editing.expectedRounds || 0,
        rounds: (editing.rounds || []).map((r) => ({
          _id: r._id,
          name: r.name,
          status: r.status,
          scheduledDate: toInputDate(r.scheduledDate),
          notes: r.notes || "",
        })),
      });
    } else {
      setForm({ ...empty, appliedDate: new Date().toISOString().slice(0, 10) });
    }
  }, [editing]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      expectedRounds: Number(form.expectedRounds) || 0,
      appliedDate: form.appliedDate || undefined,
      deadline: form.deadline || null,
      followUpDate: form.followUpDate || null,
      rounds: form.rounds.map((r) => ({
        ...(r._id ? { _id: r._id } : {}),
        name: r.name,
        status: r.status,
        scheduledDate: r.scheduledDate || null,
        notes: r.notes || "",
      })),
    };
    onSave(payload);
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <h2>{editing ? "Edit application" : "Add application"}</h2>
      <div className="form-grid">
        <div>
          <label>Company</label>
          <input value={form.company} onChange={set("company")} required />
        </div>
        <div>
          <label>Role</label>
          <input value={form.role} onChange={set("role")} required />
        </div>
        <div className="row-2">
          <div>
            <label>Status</label>
            <select value={form.status} onChange={set("status")}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={form.priority} onChange={set("priority")}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <div className="row-2">
          <div>
            <label>Source</label>
            <select value={form.source} onChange={set("source")}>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Expected rounds</label>
            <input
              type="number"
              min="0"
              value={form.expectedRounds}
              onChange={set("expectedRounds")}
              placeholder="e.g. 4"
            />
          </div>
        </div>
        <RoundEditor
          rounds={form.rounds}
          roundStatuses={roundStatuses}
          onChange={(rounds) => setForm((f) => ({ ...f, rounds }))}
        />
        <div className="row-2">
          <div>
            <label>Applied</label>
            <input
              type="date"
              value={form.appliedDate}
              onChange={set("appliedDate")}
            />
          </div>
          <div>
            <label>Follow-up</label>
            <input
              type="date"
              value={form.followUpDate}
              onChange={set("followUpDate")}
            />
          </div>
        </div>
        <div className="row-2">
          <div>
            <label>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={set("deadline")}
            />
          </div>
          <div>
            <label>Location</label>
            <input value={form.location} onChange={set("location")} />
          </div>
        </div>
        <div>
          <label>Job URL</label>
          <input
            type="url"
            value={form.jobUrl}
            onChange={set("jobUrl")}
            placeholder="https://..."
          />
        </div>
        <div>
          <label>Salary / range</label>
          <input value={form.salary} onChange={set("salary")} />
        </div>
        <div>
          <label>Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Recruiter name, interview tips..."
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editing ? "Save changes" : "Add application"}
        </button>
        {editing && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
