// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from "./context/ThemeContext";
import { CssBaseline } from '@mui/material'; // ✅ Import here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <CssBaseline /> {/* ✅ Applies global styles based on theme */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();