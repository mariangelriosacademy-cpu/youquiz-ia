"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ dark: boolean; toggleDark: () => void }>({
  dark: true,
  toggleDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("YouQuiz IA-theme");
    if (saved) setDark(saved === "dark");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    }
  }, [dark]);

  function toggleDark() {
    setDark(prev => {
      localStorage.setItem("YouQuiz IA-theme", !prev ? "dark" : "light");
      return !prev;
    });
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}