import { Pages } from '../shared/pages';

// sessionStorage key that signals the user has navigated past the entry point.
// In-memory reducer state is lost on refresh, but sessionStorage survives —
// this asymmetry is how we detect a stale session.
export const CLAIM_SESSION_KEY = 'efnol_claim_in_progress';

// Pages that don't depend on in-memory reducer state and are safe to refresh.
// Every other route requires state that is lost on reload.
const ENTRY_PAGES = new Set<string>([
  Pages.IntroTransition,
  Pages.BehindLoginEntry,
  Pages.SystemError,
  Pages.SessionTimedOut,
  Pages.Knockout,
  Pages.PolicyError
]);

// Called by Layout on every navigation to a non-entry page.
// This is the "write" side - it leaves a breadcrumb in sessionStorage
// so that isStaleClaimSession can detect a refresh later.
export const markClaimInProgress = (): void => {
  try {
    sessionStorage.setItem(CLAIM_SESSION_KEY, 'true');
  } catch {
    // Best-effort — storage may be blocked in private/restricted mode
  }
};

// Called when the user intentionally leaves the flow (e.g. "Return to home")
// or when we redirect to SystemError after detecting a stale session.
export const clearClaimSession = (): void => {
  try {
    sessionStorage.removeItem(CLAIM_SESSION_KEY);
  } catch {
    // Best-effort — storage may be blocked in private/restricted mode
  }
};

export const isEntryOrErrorPage = (pathname: string): boolean => {
  const normalized = (pathname.replace(/\/+$/, '') || '/').toLowerCase();
  const behindLoginBase = Pages.BehindLoginEntry.toLowerCase();
  const isBehindLoginPath =
    normalized === behindLoginBase || normalized.startsWith(`${behindLoginBase}/`);
  return ENTRY_PAGES.has(normalized) || isBehindLoginPath;
};

// Returns true when the marker exists (user was mid-flow) but we're on a
// non-entry page — meaning the app re-mounted (refresh) and all reducer
// state was lost. Layout calls this once on initial render via a ref guard.
export const isStaleClaimSession = (pathname: string): boolean => {
  try {
    const hasMarker = sessionStorage.getItem(CLAIM_SESSION_KEY) === 'true';
    if (!hasMarker) return false;
  } catch {
    return false;
  }
  if (isEntryOrErrorPage(pathname)) return false;
  return true;
};
