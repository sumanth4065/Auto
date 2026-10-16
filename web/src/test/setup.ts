import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as hooks from '../hooks';
import sclIconSerializer from './sclIconSerializer';

expect.addSnapshotSerializer(sclIconSerializer);

// Node 25+ exposes a broken global localStorage when --localstorage-file is not set.
// Use jsdom's localStorage so tests that need it keep working.
// We only fix localStorage; sessionStorage is left alone so tests that stub it (useGetInitialData,
// RedirectToSafelite) continue to work.
const ensureWebStorage = () => {
  if (typeof globalThis.window === 'undefined') return;
  const w = globalThis.window as Window & { localStorage?: Storage };
  const local = w.localStorage;
  const isWorking = (s: unknown): s is Storage =>
    !!s &&
    typeof (s as Storage).clear === 'function' &&
    typeof (s as Storage).removeItem === 'function';
  if (isWorking(local)) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: local,
      writable: true,
      configurable: true
    });
    return;
  }
  const store = new Map<string, string>();
  const stub: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null
  };
  Object.defineProperty(globalThis, 'localStorage', { value: stub, writable: true });
  Object.defineProperty(w, 'localStorage', { value: stub, writable: true });
};

/** MUI Select (and others) call `new ResizeObserver(...)`. A vi.fn factory is not a reliable constructor. */
class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(_callback: ResizeObserverCallback) {}
}

process.env.TZ = 'America/Los_Angeles';
export let useTaggingSpy;
export const fireTagSpy = vi.fn();
ensureWebStorage();

beforeEach(() => {
  ensureWebStorage();
  useTaggingSpy = vi
    .spyOn(hooks, 'useTagging')
    .mockImplementation(() => ({ tags: {}, fireTag: fireTagSpy } as any));
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  cleanup();
});

// configure({ testIdAttribute: 'data-quid' });
