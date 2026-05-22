const BASE = "/api/applications";

export async function fetchApplications(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
}

export async function fetchMeta() {
  const res = await fetch(`${BASE}/meta`);
  if (!res.ok) throw new Error("Failed to load metadata");
  return res.json();
}

export async function createApplication(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Create failed");
  return res.json();
}

export async function updateApplication(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Update failed");
  return res.json();
}

export async function deleteApplication(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}
