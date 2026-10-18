import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'mario-overworld' | 'mario-underground' | 'mario-castle' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isMarioTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('renderlab_theme') as Theme | null;
    if (saved && ['mario-overworld', 'mario-underground', 'mario-castle', 'dark', 'light'].includes(saved)) {
      return saved;
    }
    // Default to Mario Overworld on this branch!
    return 'mario-overworld';
  });

  const isMarioTheme = theme.startsWith('mario');

  useEffect(() => {
    const root = document.documentElement;
    // Clear previous theme classes
    root.classList.remove('light', 'dark', 'mario-theme', 'mario-overworld', 'mario-underground', 'mario-castle');

    if (theme === 'light') {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'mario-overworld') {
      root.classList.add('mario-theme', 'mario-overworld');
      root.style.colorScheme = 'light';
    } else if (theme === 'mario-underground') {
      root.classList.add('mario-theme', 'mario-underground', 'dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'mario-castle') {
      root.classList.add('mario-theme', 'mario-castle', 'dark');
      root.style.colorScheme = 'dark';
    }

    localStorage.setItem('renderlab_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      // Cycle through Mario modes, then dark/light
      switch (prev) {
        case 'mario-overworld':
          return 'mario-underground';
        case 'mario-underground':
          return 'mario-castle';
        case 'mario-castle':
          return 'dark';
        case 'dark':
          return 'light';
        case 'light':
        default:
          return 'mario-overworld';
      }
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isMarioTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
