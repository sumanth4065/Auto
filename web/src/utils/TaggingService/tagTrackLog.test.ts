import { describe, it, expect, beforeEach } from 'vitest';
import {
  appendTagTrackEntry,
  clearTagTrackLog,
  readTagTrackLog,
  sanitizeTagForTrackLog,
  TAG_TRACK_STORAGE_KEY
} from './tagTrackLog';

describe('tagTrackLog', () => {
  beforeEach(() => {
    clearTagTrackLog();
  });

  it('sanitizeTagForTrackLog removes ins_claim_id and sessionid', () => {
    const out = sanitizeTagForTrackLog({
      page: 'my account:insurance:easy auto fnol:claimtype',
      ins_claim_id: 'secret',
      sessionid: 'sid'
    });
    expect(out).toEqual({ page: 'my account:insurance:easy auto fnol:claimtype' });
  });

  it('appendTagTrackEntry and readTagTrackLog round-trip', () => {
    appendTagTrackEntry({
      t: 1,
      pathname: '/transitionpage',
      kind: 'utag_view',
      tag: { flow: 'accident' }
    });
    expect(readTagTrackLog()).toEqual([
      { t: 1, pathname: '/transitionpage', kind: 'utag_view', tag: { flow: 'accident' } }
    ]);
  });

  it('keeps only previous and current (drops third-oldest)', () => {
    const e1 = { t: 1, pathname: '/a', kind: 'utag_view' as const };
    const e2 = { t: 2, pathname: '/b', kind: 'utag_view' as const };
    const e3 = { t: 3, pathname: '/c', kind: 'utag_view' as const };
    appendTagTrackEntry(e1);
    appendTagTrackEntry(e2);
    appendTagTrackEntry(e3);
    expect(readTagTrackLog()).toEqual([e2, e3]);
  });

  it('clearTagTrackLog removes storage', () => {
    appendTagTrackEntry({ t: 1, pathname: '/', kind: 'utag_view' });
    clearTagTrackLog();
    expect(sessionStorage.getItem(TAG_TRACK_STORAGE_KEY)).toBeNull();
    expect(readTagTrackLog()).toEqual([]);
  });
});
