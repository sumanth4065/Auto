import { describe, it, beforeEach, expect } from 'vitest';
import { getParams } from './HttpRequestHelper';

describe('HttpRequestHelper', () => {
  beforeEach(() => {});

  it('transforms the request input URL to expected object with given app information represented as string array', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?policyNumber=valid-policy-number&token=valid-token&another=one' }
    });
    const result = getParams(['policyNumber', 'token']);

    expect(result).toEqual({
      policyNumber: 'valid-policy-number',
      token: 'valid-token'
    });
  });

  it('returns empty object when empty array is given', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?unknown-params' }
    });    
    const result = getParams([]);

    expect(result).toEqual({});
  });

  it('displays a gentile error message when there is a wrong usage', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?token=valid-token&another=one' }
    });

    const result = getParams(['policyNumber', 'token']);

    expect(result).toEqual({
      policyNumber: `Typo Error! please check your url and/or parameter policyNumber`,
      token: 'valid-token'
    });
  });
});
