export const TRACKED_NODES_KEY = "xanscope:tracked-nodes";

export function getTrackedNodes(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = window.localStorage.getItem(TRACKED_NODES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveTrackedNodes(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TRACKED_NODES_KEY, JSON.stringify(ids));
}
