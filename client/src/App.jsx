import { useState, useEffect, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import ApplicationForm from "./components/ApplicationForm";
import ApplicationList from "./components/ApplicationList";
import {
  fetchApplications,
  fetchAnalytics,
  fetchMeta,
  createApplication,
  updateApplication,
  deleteApplication,
} from "./api";

export default function App() {
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [roundStatuses, setRoundStatuses] = useState([]);
  const [sources, setSources] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const [apps, stats, meta] = await Promise.all([
        fetchApplications(params),
        fetchAnalytics(),
        fetchMeta(),
      ]);
      setApplications(apps);
      setAnalytics(stats);
      setStatuses(meta.statuses);
      setRoundStatuses(meta.roundStatuses || []);
      setSources(meta.sources || []);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to server. Is MongoDB running and the API started?"
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateApplication(editing._id, data);
        setEditing(null);
      } else {
        await createApplication(data);
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this application?")) return;
    try {
      await deleteApplication(id);
      if (editing?._id === id) setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickStatus = async (id, status) => {
    try {
      await updateApplication(id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Job Application Tracker</h1>
          <p>Track status, follow-ups, and deadlines across 50+ applications</p>
        </div>
        <nav className="tabs">
          <button
            type="button"
            className={`tab ${tab === "applications" ? "active" : ""}`}
            onClick={() => setTab("applications")}
          >
            Applications
          </button>
          <button
            type="button"
            className={`tab ${tab === "dashboard" ? "active" : ""}`}
            onClick={() => setTab("dashboard")}
          >
            Analytics
          </button>
        </nav>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : tab === "dashboard" && analytics ? (
        <Dashboard analytics={analytics} />
      ) : (
        <>
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search company, role, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setEditing(null);
                setSearch("");
                setStatusFilter("");
              }}
            >
              Clear filters
            </button>
          </div>

          <div className="layout with-form">
            <ApplicationForm
              statuses={statuses}
              sources={sources}
              roundStatuses={roundStatuses}
              editing={editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
            <ApplicationList
              applications={applications}
              selectedId={editing?._id}
              onSelect={setEditing}
              onDelete={handleDelete}
              onQuickStatus={handleQuickStatus}
              statuses={statuses}
            />
          </div>
        </>
      )}
    </div>
  );
}
