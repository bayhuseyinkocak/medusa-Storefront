import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import CategoryFilterPlaceholder from "@modules/categories/components/category-filter-placeholder"
import CategoryListingLayout from "@modules/categories/templates/category-listing-layout"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ViewMode } from "@modules/store/components/view-mode-toggle"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  view,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  view?: ViewMode
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const viewMode: ViewMode = view === "list" ? "list" : "grid"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="content-container" data-testid="category-container">
      <div className="flex flex-row mb-8 gap-4 text-2xl-semi pt-6">
        {parents.map((parent) => (
          <span key={parent.id} className="text-ui-fg-subtle">
            <LocalizedClientLink
              className="mr-4 hover:text-ui-fg-interactive transition-colors"
              href={`/categories/${parent.handle}`}
              data-testid="category-parent-link"
            >
              {parent.name}
            </LocalizedClientLink>
            /
          </span>
        ))}
        <h1 data-testid="category-page-title">{category.name}</h1>
      </div>
      {category.description && (
        <div className="mb-8 text-base-regular text-ui-fg-subtle max-w-3xl">
          <p>{category.description}</p>
        </div>
      )}
      {category.category_children && category.category_children.length > 0 && (
        <div className="mb-8 text-base-large">
          <ul className="flex flex-wrap gap-3">
            {category.category_children.map((c) => (
              <li key={c.id}>
                <InteractiveLink href={`/categories/${c.handle}`}>
                  {c.name}
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      <CategoryListingLayout
        sidebar={<CategoryFilterPlaceholder />}
      >
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            categoryHandle={category.handle}
            countryCode={countryCode}
            view={viewMode}
            showToolbar
          />
        </Suspense>
      </CategoryListingLayout>
    </div>
  )
}
