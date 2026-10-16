import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { AppStateProvider, useAppState } from './AppStateContext';
import { initialState } from './reducer';

describe('AppStateContext', () => {
  it('throws when useAppState is called outside AppStateProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAppState())).toThrow(
      'useAppState must be used within an AppStateProvider'
    );
    vi.restoreAllMocks();
  });

  it('returns appState and dispatch when used inside AppStateProvider', () => {
    const mockDispatch = vi.fn();
    const { result } = renderHook(() => useAppState(), {
      wrapper: ({ children }) => (
        <AppStateProvider value={{ appState: initialState, dispatch: mockDispatch }}>
          {children}
        </AppStateProvider>
      )
    });
    expect(result.current.appState).toBe(initialState);
    expect(result.current.dispatch).toBe(mockDispatch);
  });
});
