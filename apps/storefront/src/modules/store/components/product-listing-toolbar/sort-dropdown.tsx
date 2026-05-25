"use client"

import { ChevronDown } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Recommendation" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

type SortDropdownProps = {
  sortBy: SortOptions
  onSortChange: (value: SortOptions) => void
}

const SortDropdown = ({ sortBy, onSortChange }: SortDropdownProps) => {
  const currentLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ?? "Recommendation"

  return (
    <div className="relative" data-testid="sort-dropdown">
      <label className="sr-only" htmlFor="product-sort">
        Sort products
      </label>
      <div className="relative flex items-center">
        <select
          id="product-sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOptions)}
          className={clx(
            "h-9 appearance-none rounded-md border border-ui-border-base bg-ui-bg-base",
            "pl-3 pr-9 txt-compact-small text-ui-fg-base cursor-pointer",
            "hover:bg-ui-bg-subtle focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          )}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 text-ui-fg-muted"
          aria-hidden
        />
      </div>
      <span className="sr-only">Sort by: {currentLabel}</span>
    </div>
  )
}

export default SortDropdown
