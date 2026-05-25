import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ViewMode } from "@modules/store/components/view-mode-toggle"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  view,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  view?: ViewMode
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const viewMode: ViewMode = view === "list" ? "list" : "grid"

  return (
    <div className="py-6 content-container">
      <div className="mb-8 text-2xl-semi">
        <h1>{collection.title}</h1>
      </div>
      <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          collectionId={collection.id}
          countryCode={countryCode}
          view={viewMode}
          showToolbar
        />
      </Suspense>
    </div>
  )
}
