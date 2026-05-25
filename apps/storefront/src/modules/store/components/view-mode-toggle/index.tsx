"use client"

import { GridLayout, GridList } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export type ViewMode = "grid" | "list"

type ViewModeToggleProps = {
  view: ViewMode
}

const ViewModeToggle = ({ view }: ViewModeToggleProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams)
    params.set("view", next)
    if (params.get("page") === "1") {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className="flex items-center border border-ui-border-base rounded-md overflow-hidden"
      data-testid="view-mode-toggle"
    >
      <button
        type="button"
        onClick={() => setView("grid")}
        className={clx(
          "flex h-9 w-9 items-center justify-center transition-colors",
          view === "grid"
            ? "bg-ui-bg-subtle text-ui-fg-base"
            : "text-ui-fg-muted hover:text-ui-fg-base hover:bg-ui-bg-subtle"
        )}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
      >
        <GridLayout />
      </button>
      <button
        type="button"
        onClick={() => setView("list")}
        className={clx(
          "flex h-9 w-9 items-center justify-center border-l border-ui-border-base transition-colors",
          view === "list"
            ? "bg-ui-bg-subtle text-ui-fg-base"
            : "text-ui-fg-muted hover:text-ui-fg-base hover:bg-ui-bg-subtle"
        )}
        aria-label="List view"
        aria-pressed={view === "list"}
      >
        <GridList />
      </button>
    </div>
  )
}

export default ViewModeToggle
