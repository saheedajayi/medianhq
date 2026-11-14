const STORAGE_KEY = "median_visitor_id";
export const VISITOR_HEADER = "X-Median-Visitor";

let memoryId: string | null = null;

/**
 * A random ID for this browser, so signed-out visits can be counted once
 * each. It identifies the browser, not the person, and holds nothing else.
 */
export function getVisitorId() {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    const created = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    // Storage is blocked (private mode, strict settings): keep one for this page load
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}
