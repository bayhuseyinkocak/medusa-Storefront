import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ViewMode } from "@modules/store/components/view-mode-toggle"
import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  view,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  view?: ViewMode
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const viewMode: ViewMode = view === "list" ? "list" : "grid"

  return (
    <div className="py-6 content-container" data-testid="store-container">
      <div className="mb-8 text-2xl-semi">
        <h1 data-testid="store-page-title">All products</h1>
      </div>
      <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          view={viewMode}
          showToolbar
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
