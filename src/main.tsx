import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { JobsProvider } from './contexts/JobsContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <JobsProvider>
          <App />
        </JobsProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);