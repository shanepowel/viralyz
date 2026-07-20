"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "viralyz-theme";

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.querySelector(".vz");
  if (root instanceof HTMLElement) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = readTheme();
    setTheme(next);
    applyTheme(next);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      <span className={`opt${theme === "light" ? " active" : ""}`} data-opt="light">
        Light
      </span>
      <span className={`opt${theme === "dark" ? " active" : ""}`} data-opt="dark">
        Dark
      </span>
    </button>
  );
}
