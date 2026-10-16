import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LogCannon from '@ace-clublabs/log-cannon';
import { Pages } from '../../shared/pages';
import { AppErrorBoundary } from './AppErrorBoundary';

const ThrowingChild = (): never => {
  throw new Error('Test render error');
};

const renderWithRoutes = (child: React.ReactNode, logData = {}) =>
  render(
    <MemoryRouter initialEntries={['/test']}>
      <AppErrorBoundary logData={logData}>
        <Routes>
          <Route path="/test" element={child} />
          <Route path={Pages.SystemError} element={<div>system error</div>} />
        </Routes>
      </AppErrorBoundary>
    </MemoryRouter>
  );

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(LogCannon, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('redirects to SystemError and logs when a child throws during render', () => {
    renderWithRoutes(<ThrowingChild />, { page: 'test' });

    expect(LogCannon.error).toHaveBeenCalledWith(
      'Unexpected render error caught by boundary',
      expect.objectContaining({
        page: 'test',
        error: 'Test render error'
      })
    );
  });

  it('navigates to SystemError path when a child throws', () => {
    const { getByText } = renderWithRoutes(<ThrowingChild />);

    expect(getByText('system error')).toBeInTheDocument();
  });

  it('renders children normally when no error occurs', () => {
    const { getByText } = render(
      <MemoryRouter>
        <AppErrorBoundary logData={{}}>
          <div>Normal content</div>
        </AppErrorBoundary>
      </MemoryRouter>
    );

    expect(getByText('Normal content')).toBeInTheDocument();
  });

  it('dispatches serialized error and error reason when dispatch is provided', () => {
    const dispatch = vi.fn();
    render(
      <MemoryRouter initialEntries={['/test']}>
        <AppErrorBoundary logData={{ page: 'test' }} dispatch={dispatch}>
          <Routes>
            <Route path="/test" element={<ThrowingChild />} />
            <Route path={Pages.SystemError} element={<div>system error</div>} />
          </Routes>
        </AppErrorBoundary>
      </MemoryRouter>
    );

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        payload: expect.objectContaining({
          errorType: 'client',
          errorLabel: 'Error',
          errorMessage: 'Test render error',
          errorLocation: 'AppErrorBoundary'
        })
      })
    );
  });
});
