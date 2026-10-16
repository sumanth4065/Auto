import { describe, it, expect } from 'vitest';
import {
  getEnvFromHostname,
  getMobileBridgeScriptUrl,
  type MobileBridgeEnv,
} from './mobileBridgeHelper';

describe('mobileBridgeHelper', () => {
  describe('getEnvFromHostname', () => {
    it('returns prod for app. hostnames', () => {
      expect(getEnvFromHostname('app.ace.aaa.com')).toBe('prod');
      expect(getEnvFromHostname('app.clublabs.net')).toBe('prod');
    });

    it('returns uat for appuat and app.uat hostnames', () => {
      expect(getEnvFromHostname('appuat1.ace.aaa.com')).toBe('uat');
      expect(getEnvFromHostname('appuat.ace.aaa.com')).toBe('uat');
      expect(getEnvFromHostname('app.uat.clublabs.net')).toBe('uat');
      expect(getEnvFromHostname('app.uat.ace.aaa.com')).toBe('uat');
    });

    it('returns qa for appqa and app.qa hostnames', () => {
      expect(getEnvFromHostname('appqa1.ace.aaa.com')).toBe('qa');
      expect(getEnvFromHostname('appqa.ace.aaa.com')).toBe('qa');
      expect(getEnvFromHostname('app.qa.clublabs.net')).toBe('qa');
      expect(getEnvFromHostname('app.qa.ace.aaa.com')).toBe('qa');
    });

    it('returns dev for appdev, app.dev, and localhost hostnames', () => {
      expect(getEnvFromHostname('appdev1.ace.aaa.com')).toBe('dev');
      expect(getEnvFromHostname('appdev.ace.aaa.com')).toBe('dev');
      expect(getEnvFromHostname('app.dev.clublabs.net')).toBe('dev');
      expect(getEnvFromHostname('app.dev.ace.aaa.com')).toBe('dev');
      expect(getEnvFromHostname('localhost')).toBe('dev');
      expect(getEnvFromHostname('localhost:5173')).toBe('dev');
    });

    it('returns undefined for unknown hostnames', () => {
      expect(getEnvFromHostname('example.com')).toBeUndefined();
      expect(getEnvFromHostname('unknown-host')).toBeUndefined();
    });
  });

  describe('getMobileBridgeScriptUrl', () => {
    it('returns prod URL for prod env', () => {
      expect(getMobileBridgeScriptUrl('prod')).toBe(
        'https://app.ace.aaa.com/enterprise/identity/ace-js-bridge.js'
      );
    });

    it('returns env-specific URL for non-prod envs', () => {
      expect(getMobileBridgeScriptUrl('uat')).toBe(
        'https://appuat1.ace.aaa.com/enterprise/identity/uat/ace-js-bridge.js'
      );
      expect(getMobileBridgeScriptUrl('qa')).toBe(
        'https://appqa1.ace.aaa.com/enterprise/identity/qa/ace-js-bridge.js'
      );
      expect(getMobileBridgeScriptUrl('dev')).toBe(
        'https://appdev1.ace.aaa.com/enterprise/identity/dev/ace-js-bridge.js'
      );
    });
  });
});
