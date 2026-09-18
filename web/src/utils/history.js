/**
 * Analysis History Persistence Utility
 * Manages local storage records of simulations, AI diagnostics, and model runs.
 */

const STORAGE_KEY = "sentinel_analysis_history";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultHistory();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultHistory();
  } catch (e) {
    console.error("Failed to load history:", e);
    return getDefaultHistory();
  }
}

export function saveHistoryRecord(record) {
  try {
    const history = loadHistory();
    const entry = {
      id: "AN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      ...record
    };
    const updated = [entry, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save history record:", e);
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

function getDefaultHistory() {
  return [
    {
      id: "AN-INIT01",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      formattedDate: new Date(Date.now() - 3600000).toLocaleString(),
      system: "RLC Benchmark",
      module: "Circuit Workbench",
      result: "Resonance 71.18 Hz (ζ = 0.1581)",
      status: "healthy",
      summary: "Series RLC initial tuning passed nominal damping specifications."
    },
    {
      id: "AN-INIT02",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      formattedDate: new Date(Date.now() - 7200000).toLocaleString(),
      system: "NASA FD001",
      module: "AI Models",
      result: "MAE 18.3 cycles | RMSE 24.1 cycles",
      status: "healthy",
      summary: "Ridge regression baseline evaluated across 100 held-out test engines."
    }
  ];
}
