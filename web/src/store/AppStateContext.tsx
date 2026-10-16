import React, { createContext, useContext } from 'react';
import type { Actions } from './actions';
import type { State } from './reducer';

interface AppStateContextValue {
  appState: State;
  dispatch: React.Dispatch<Actions>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export const useAppState = (): AppStateContextValue => {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return value;
};

interface AppStateProviderProps {
  value: AppStateContextValue;
  children: React.ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ value, children }) => (
  <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
);
