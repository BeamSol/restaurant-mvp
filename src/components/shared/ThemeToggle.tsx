"use client";

import { useEffect, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "../Icons";

type Mode = "light" | "dark" | "system";
const NEXT: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" };
const LABEL: Record<Mode, string> = { light: "Light mode", dark: "Dark mode", system: "Theme follows your device" };

/** Applies a mode to <html data-theme> and remembers it (see the inline script in layout.tsx). */
function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** One button cycling Light → Dark → System. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    let saved: Mode = "system";
    try {
      saved = (localStorage.getItem("theme") as Mode) || "system";
    } catch {}
    setMode(saved);
    // Follow the phone setting live while in "system" mode
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if ((localStorage.getItem("theme") || "system") === "system") apply("system");
      } catch {}
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const Icon = mode === "dark" ? MoonIcon : mode === "light" ? SunIcon : MonitorIcon;
  return (
    <button
      type="button"
      aria-label={`${LABEL[mode ?? "system"]}. Click to change.`}
      title={LABEL[mode ?? "system"]}
      onClick={() => {
        const next = NEXT[mode ?? "system"];
        setMode(next);
        try {
          localStorage.setItem("theme", next);
        } catch {}
        apply(next);
      }}
      className={`relative inline-flex size-10 items-center justify-center rounded-[10px] text-current transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${className}`}
    >
      <Icon size={19} />
    </button>
  );
}
