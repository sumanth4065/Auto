import { vi, describe, it, expect, afterEach } from 'vitest';
import * as Router from 'react-router';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { useTimeout } from './useTimeout';

const ONE_MINUTE = 60 * 1000;

const mockDispatch = vi.fn();
describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('returns user IDLE state after given time passed', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeout(mockDispatch));

    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(61 * ONE_MINUTE); // after 61 minutes of no activity IDLE is true

    expect(result.current).toEqual({
      isIDLE: true
    });
  });

  it('returns user IDLE state after user mouse interaction is captured', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeout(mockDispatch));

    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(58 * ONE_MINUTE);

    userEvent.pointer({ coords: { x: 100, y: 100 } });

    vi.advanceTimersByTime(1 * ONE_MINUTE);

    await waitForNextUpdate();

    vi.advanceTimersByTime(59 * ONE_MINUTE);

    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(1 * ONE_MINUTE);

    await waitForNextUpdate();

    expect(result.current).toEqual({
      isIDLE: true
    });
  });

  it('returns user IDLE state after user mouse click is captured', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeout(mockDispatch));

    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(58 * ONE_MINUTE);

    fireEvent.click(document);

    vi.advanceTimersByTime(1 * ONE_MINUTE);

    // after 10 secs, idle still false
    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(59 * ONE_MINUTE);

    await waitForNextUpdate();
    expect(result.current).toEqual({
      isIDLE: true
    });
  });

  it('returns user IDLE state after user key press is captured', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeout(mockDispatch));

    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(58 * ONE_MINUTE);

    fireEvent.keyPress(document, { key: 'A', code: 'KeyA' });

    vi.advanceTimersByTime(1 * ONE_MINUTE);

    // after 29 minutes, idle still false
    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(59 * ONE_MINUTE);

    await waitForNextUpdate();
    expect(result.current).toEqual({
      isIDLE: true
    });
  });

  it('returns user IDLE state after user touch start is captured', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeout(mockDispatch));

    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(58 * ONE_MINUTE);

    fireEvent.touchStart(document);

    vi.advanceTimersByTime(1 * ONE_MINUTE);

    // after 10 secs, idle still false
    expect(result.current).toEqual({
      isIDLE: false
    });

    vi.advanceTimersByTime(59 * ONE_MINUTE);

    await waitForNextUpdate();
    expect(result.current).toEqual({
      isIDLE: true
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'session timeout'
    });
  });
});
