"use client"

import { Moon, Sun } from "@medusajs/icons"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { clx } from "@modules/common/components/ui"

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        className="h-9 w-9 rounded-md border border-ui-border-base"
        aria-label="Toggle theme"
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={clx(
        "flex h-9 w-9 items-center justify-center rounded-md border border-ui-border-base",
        "text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="theme-toggle"
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  )
}

export default ThemeToggle
