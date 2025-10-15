// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeContextProvider } from "./context/ThemeContext";
import { CssBaseline } from '@mui/material'; // ✅ Import here
import './i18n'; // ← Initializes i18n
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <CssBaseline /> {/* ✅ Applies global styles based on theme */}
      <App />
    </ThemeContextProvider>
  </React.StrictMode>
);

reportWebVitals();