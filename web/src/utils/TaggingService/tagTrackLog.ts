/** sessionStorage key for local debugging of Tealium tag fires (no network). */
export const TAG_TRACK_STORAGE_KEY = 'ace_auto_efnol_tag_track_log';

type TagTrackStoredState = {
  previous?: TagTrackEntry;
  current?: TagTrackEntry;
};

const SENSITIVE_TAG_KEYS = new Set(['ins_claim_id', 'sessionid']);

export type TagTrackKind = 'utag_view' | 'utag_link';

export type TagTrackEntry = {
  t: number;
  pathname: string;
  kind: TagTrackKind;
  /** Subset of the Tealium payload with known identifiers stripped. */
  tag?: Record<string, unknown>;
};

export function sanitizeTagForTrackLog(tag: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!tag) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(tag)) {
    if (SENSITIVE_TAG_KEYS.has(k)) continue;
    out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

function parseStoredState(raw: string): TagTrackStoredState {
  const parsed = JSON.parse(raw) as unknown;
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return {};
    if (parsed.length === 1) return { current: parsed[0] as TagTrackEntry };
    return {
      previous: parsed[parsed.length - 2] as TagTrackEntry,
      current: parsed[parsed.length - 1] as TagTrackEntry
    };
  }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const o = parsed as TagTrackStoredState;
    return {
      ...(o.previous ? { previous: o.previous } : {}),
      ...(o.current ? { current: o.current } : {})
    };
  }
  return {};
}

function readStoredState(): TagTrackStoredState {
  try {
    const raw = sessionStorage.getItem(TAG_TRACK_STORAGE_KEY);
    if (!raw) return {};
    return parseStoredState(raw);
  } catch {
    return {};
  }
}

/** Ordered list: `[previous, current]` (0–2 entries). */
export function readTagTrackLog(): TagTrackEntry[] {
  const { previous, current } = readStoredState();
  const out: TagTrackEntry[] = [];
  if (previous) out.push(previous);
  if (current) out.push(current);
  return out;
}

export function clearTagTrackLog(): void {
  try {
    sessionStorage.removeItem(TAG_TRACK_STORAGE_KEY);
  } catch {
    /* private mode / quota */
  }
}

/** Keeps only the last two events: prior fire → `previous`, latest → `current`. */
export function appendTagTrackEntry(entry: TagTrackEntry): void {
  try {
    const { current } = readStoredState();
    const next: TagTrackStoredState = { previous: current, current: entry };
    sessionStorage.setItem(TAG_TRACK_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}
