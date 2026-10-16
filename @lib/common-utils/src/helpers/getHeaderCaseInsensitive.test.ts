import { getHeaderCaseInsensitive } from './getHeaderCaseInsensitive';

describe('getHeaderCaseInsensitive', () => {
  it('returns undefined when headers are missing', () => {
    expect(getHeaderCaseInsensitive(undefined, 'X-Ace-Test-Track')).toBeUndefined();
  });

  it('finds header regardless of key casing', () => {
    const headers = { 'X-ACE-TEST-TRACK': 'track-a' };
    expect(getHeaderCaseInsensitive(headers, 'X-Ace-Test-Track')).toBe('track-a');
  });

  it('matches requested name case-insensitively', () => {
    const headers = { foo: 'bar' };
    expect(getHeaderCaseInsensitive(headers, 'FOO')).toBe('bar');
  });
});
