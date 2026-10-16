import { describe, expect, it } from 'vitest';
import { isCustomDriverSelected } from './isCustomDriverSelected';

describe('isCustomDriverSelected', () => {
  it('returns false when selected driver is missing or has no name', () => {
    expect(isCustomDriverSelected(undefined)).toBe(false);
    expect(isCustomDriverSelected(null)).toBe(false);
    expect(isCustomDriverSelected({ firstName: '', lastName: '', driverId: undefined })).toBe(false);
  });

  it('returns true when driver has name and no policy id', () => {
    expect(
      isCustomDriverSelected({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'j@example.com',
        mobileNumber: '5551234567'
      })
    ).toBe(true);
  });

  it('returns false when driver has driverId', () => {
    expect(
      isCustomDriverSelected({
        firstName: 'Jane',
        lastName: 'Doe',
        driverId: 'policy-driver-1'
      })
    ).toBe(false);
  });

  it('returns false when driver has id only', () => {
    expect(
      isCustomDriverSelected({
        firstName: 'Jane',
        lastName: 'Doe',
        id: 'id-1'
      })
    ).toBe(false);
  });
});
