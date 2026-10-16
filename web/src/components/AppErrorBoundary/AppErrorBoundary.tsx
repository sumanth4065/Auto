import React from 'react';
import { useLocation, Navigate } from 'react-router';
import LogCannon from '@ace-clublabs/log-cannon';
import { Pages } from '../../shared/pages';
import { serializeError } from '../../utils/LogCannonHelper';
import { setErrorReason, setSerializedError } from '../../store/actions';
import type { Actions } from '../../store/actions';

interface CoreProps {
  children: React.ReactNode;
  logData: Record<string, unknown>;
  dispatch?: React.Dispatch<Actions>;
}

interface CoreState {
  hasError: boolean;
}

class AppErrorBoundaryCore extends React.Component<CoreProps, CoreState> {
  state: CoreState = { hasError: false };

  static getDerivedStateFromError(): CoreState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    LogCannon.error('Unexpected render error caught by boundary', {
      ...this.props.logData,
      error: error.message,
      componentStack: info.componentStack
    });

    if (this.props.dispatch) {
      try {
        const serialized = serializeError(error, 'AppErrorBoundary');
        this.props.dispatch(setSerializedError(serialized));
        this.props.dispatch(setErrorReason(serialized.errorMessage));
      } catch {
        // Gracefully degrade — the error page will render without errorData
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return <Navigate to={Pages.SystemError} replace />;
    }
    return this.props.children;
  }
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  logData: Record<string, unknown>;
  dispatch?: React.Dispatch<Actions>;
}

export const AppErrorBoundary = ({ children, logData, dispatch }: AppErrorBoundaryProps) => {
  const location = useLocation();
  return (
    <AppErrorBoundaryCore key={location.pathname} logData={logData} dispatch={dispatch}>
      {children}
    </AppErrorBoundaryCore>
  );
};
