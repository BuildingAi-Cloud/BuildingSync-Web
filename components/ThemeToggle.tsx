"use client";

import { useEffect, useState } from "react";

const THEMES = ["paper", "light", "dark"] as const;
type Theme = (typeof THEMES)[number];

const THEME_LABEL: Record<Theme, string> = {
  paper: "Paper",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("paper");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("bs-theme") as Theme | null) || "paper";
    setTheme(saved);
    setMounted(true);
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    try {
      localStorage.setItem("bs-theme", next);
    } catch {
      // localStorage may be blocked; theme just resets per page.
    }
    const html = document.documentElement;
    html.classList.remove("dark");
    html.removeAttribute("data-theme");
    if (next === "dark") html.setAttribute("data-theme", "dark");
    else if (next === "paper") html.setAttribute("data-theme", "paper");
    // light = no attribute (the :root default)
  }

  if (!mounted) {
    // Avoid hydration mismatch — render an inert placeholder until effect runs.
    return <div className="h-7 w-[150px] rounded-md border border-border" aria-hidden />;
  }

  return (
    <div className="inline-flex items-center gap-0.5 border border-border rounded-md p-0.5 text-xs bg-card">
      {THEMES.map((t) => {
        const active = theme === t;
        return (
          <button
            key={t}
            onClick={() => apply(t)}
            type="button"
            aria-pressed={active}
            className={`px-2 py-1 rounded-sm transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {THEME_LABEL[t]}
          </button>
        );
      })}
    </div>
  );
}
