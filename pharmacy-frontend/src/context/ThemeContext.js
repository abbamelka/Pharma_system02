// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export function ThemeProvider({ children }) {
  // Load saved theme from localStorage or default to 'light'
  const getSavedTheme = () => localStorage.getItem("theme") || "light";
  const [mode, setMode] = useState(getSavedTheme);

  // Update theme
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  // Create MUI theme
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Light theme
            background: {
              default: "#f5f5f5",
              paper: "#ffffff"
            },
            text: {
              primary: "#2c3e50",
              secondary: "#7f8c8d"
            }
          }
        : {
            // Dark theme
            background: {
              default: "#121212",
              paper: "#1d1d1d"
            },
            text: {
              primary: "#ffffff",
              secondary: "#bbbbbb"
            },
            action: {
              hoverOpacity: 0.1
            }
          })
    },
    components: {
    MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: 'background-color 0.3s ease, color 0.3s ease',
        backgroundColor: mode === 'light' ? '#f5f5f5' : '#121212'
      }
    }
  }
}
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}