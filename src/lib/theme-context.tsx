"use client"

import { createContext, useContext, useCallback, ReactNode, useState, useEffect } from "react"

export interface ThemePreset {
  label: string
  // Tailwind v4 CSS variable overrides (oklch format)
  primary: string
  "primary-foreground": string
  ring: string
  // hex for inline styles
  hex: string
}

const presets: Record<string, ThemePreset> = {
  indigo: {
    label: "Indigo",
    primary: "oklch(0.511 0.262 276.966)",
    "primary-foreground": "oklch(0.969 0.015 12.422)",
    ring: "oklch(0.511 0.262 276.966)",
    hex: "#4f46e5",
  },
  emerald: {
    label: "Emerald",
    primary: "oklch(0.527 0.154 158.553)",
    "primary-foreground": "oklch(0.969 0.015 12.422)",
    ring: "oklch(0.527 0.154 158.553)",
    hex: "#059669",
  },
  rose: {
    label: "Rose",
    primary: "oklch(0.554 0.233 17.672)",
    "primary-foreground": "oklch(0.969 0.015 12.422)",
    ring: "oklch(0.554 0.233 17.672)",
    hex: "#e11d48",
  },
  sky: {
    label: "Sky",
    primary: "oklch(0.585 0.197 244.756)",
    "primary-foreground": "oklch(0.969 0.015 12.422)",
    ring: "oklch(0.585 0.197 244.756)",
    hex: "#0284c7",
  },
  violet: {
    label: "Violet",
    primary: "oklch(0.543 0.263 292.716)",
    "primary-foreground": "oklch(0.969 0.015 12.422)",
    ring: "oklch(0.543 0.263 292.716)",
    hex: "#7c3aed",
  },
  orange: {
    label: "Orange",
    primary: "oklch(0.646 0.204 36.008)",
    "primary-foreground": "oklch(0.969 0.015 12.422)",
    ring: "oklch(0.646 0.204 36.008)",
    hex: "#ea580c",
  },
}

interface ThemeContextType {
  preset: string
  presets: Record<string, ThemePreset>
  setPreset: (key: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function apply(p: ThemePreset) {
  const root = document.documentElement
  root.style.setProperty("--color-primary", p.primary)
  root.style.setProperty("--primary", p.primary)
  root.style.setProperty("--color-primary-foreground", p["primary-foreground"])
  root.style.setProperty("--primary-foreground", p["primary-foreground"])
  root.style.setProperty("--color-ring", p.ring)
  root.style.setProperty("--ring", p.ring)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState("indigo")

  useEffect(() => {
    const saved = localStorage.getItem("bk_theme")
    if (saved && presets[saved]) {
      setPresetState(saved)
    }
  }, [])

  useEffect(() => {
    const p = presets[preset] || presets.indigo
    apply(p)
  }, [preset])

  const setPreset = useCallback((key: string) => {
    const p = presets[key]
    if (!p) return
    localStorage.setItem("bk_theme", key)
    apply(p)
    setPresetState(key)
  }, [])

  return (
    <ThemeContext.Provider value={{ preset, presets, setPreset }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
