"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Text } from "@modules/common/components/ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortDropdown from "./sort-dropdown"
import ViewModeToggle, { ViewMode } from "../view-mode-toggle"

type ProductListingToolbarProps = {
  count: number
  sortBy: SortOptions
  view: ViewMode
}

const ProductListingToolbar = ({
  count,
  sortBy,
  view,
}: ProductListingToolbarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleSortChange = (value: SortOptions) => {
    updateParam("sortBy", value)
  }

  return (
    <div
      className="mb-6 flex flex-col gap-4 small:flex-row small:items-center small:justify-between border-b border-ui-border-base pb-4"
      data-testid="product-listing-toolbar"
    >
      <Text className="txt-compact-medium-plus text-ui-fg-base shrink-0">
        <span className="font-semibold">{count}</span>{" "}
        {count === 1 ? "matching result" : "matching results"}
      </Text>
      <div className="flex flex-wrap items-center gap-3 small:gap-4">
        <div className="flex items-center gap-2 txt-compact-small text-ui-fg-subtle">
          <span className="hidden small:inline">Sort by:</span>
          <SortDropdown sortBy={sortBy} onSortChange={handleSortChange} />
        </div>
        <ViewModeToggle view={view} />
      </div>
    </div>
  )
}

export default ProductListingToolbar
