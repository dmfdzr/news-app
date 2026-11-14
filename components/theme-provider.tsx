"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

export type ThemeContextType = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  systemTheme?: "light" | "dark"
  themes: string[]
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  themes: ["light", "dark", "system"],
})

export function useTheme() {
  return React.useContext(ThemeContext)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", callback)
  return () => {
    window.removeEventListener("storage", callback)
    media.removeEventListener("change", callback)
  }
}

function getSnapshot(): Theme {
  try {
    const s = localStorage.getItem("theme")
    return s === "dark" || s === "light" || s === "system" ? s : "system"
  } catch {
    return "system"
  }
}

function getServerSnapshot(): Theme {
  return "system"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [overrideTheme, setOverrideTheme] = React.useState<Theme | null>(null)
  const activeTheme = overrideTheme ?? theme

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const systemDark = isMounted && typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false

  const resolvedTheme: "light" | "dark" =
    activeTheme === "dark" || (activeTheme === "system" && systemDark) ? "dark" : "light"

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  }, [resolvedTheme])

  const applyTheme = React.useCallback((newTheme: Theme) => {
    setOverrideTheme(newTheme)
    try {
      localStorage.setItem("theme", newTheme)
    } catch {}
    window.dispatchEvent(new Event("storage"))
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key?.toLowerCase() !== "d" || isTypingTarget(event.target)) return
      applyTheme(resolvedTheme === "dark" ? "light" : "dark")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, applyTheme])

  const value = React.useMemo<ThemeContextType>(
    () => ({
      theme: activeTheme,
      resolvedTheme,
      setTheme: applyTheme,
      systemTheme: systemDark ? "dark" : "light",
      themes: ["light", "dark", "system"],
    }),
    [activeTheme, resolvedTheme, applyTheme, systemDark]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
