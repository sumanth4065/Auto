import React, { useEffect, useReducer } from 'react';
import { Router } from './containers/Router';
import { initialState, reducer } from './store/reducer';
import { AppStateProvider } from './store/AppStateContext';
import { initLogCannon, registerUnhandledErrorLogging } from './utils';
import './index.css';

interface OptionalProps {
  basename?: string;
}

const App: React.FC<OptionalProps> = ({ basename }) => {
  const [appState, dispatch] = useReducer(reducer, initialState);
  initLogCannon();
  useEffect(() => {
    registerUnhandledErrorLogging();
  }, []);
  return (
    <AppStateProvider value={{ appState, dispatch }}>
      <Router basename={basename} />
    </AppStateProvider>
  );
};

export default App;
