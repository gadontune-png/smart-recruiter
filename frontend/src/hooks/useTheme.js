import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}