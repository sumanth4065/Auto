import React from 'react';
import { createRoot } from 'react-dom/client';
import { installAxiosTestTrackInterceptor } from './api/axiosTestTrackInterceptor';
import App from './App';

installAxiosTestTrackInterceptor();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
