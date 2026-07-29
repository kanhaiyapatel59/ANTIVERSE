import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme || 'cream';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('appTheme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themes = [
    { id: 'cream', name: 'Cream & White', icon: '🍦', desc: 'Warm executive off-white & crisp white contrast' },
    { id: 'light', name: 'Executive Light', icon: '☀️', desc: 'Clean slate light corporate UI' },
    { id: 'dark', name: 'Slate Dark', icon: '🌙', desc: 'Refined deep charcoal dark mode' },
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
