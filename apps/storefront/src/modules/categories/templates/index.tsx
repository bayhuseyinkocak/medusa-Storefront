import { notFound } from "next/navigation"
import { Suspense } from "react"

import { listAllCategoryProducts } from "@lib/data/products"
import {
  collectTireSpecOptions,
  parseTireFiltersFromSearchParams,
} from "@lib/util/tire-filters"
import InteractiveLink from "@modules/common/components/interactive-link"
import CategoryFilterPlaceholder from "@modules/categories/components/category-filter-placeholder"
import TireFiltersSidebar from "@modules/categories/components/tire-filters-sidebar"
import CategoryListingLayout from "@modules/categories/templates/category-listing-layout"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ViewMode } from "@modules/store/components/view-mode-toggle"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type TireFilterSearchParams = {
  brand?: string
  model?: string
  width?: string
  height?: string
  inch?: string
  season?: string
  vehicle?: string
  speed_rating?: string
  load_index?: string
  fuel_efficiency?: string
  wet_grip?: string
  noise_class?: string
  dot?: string
  m_s?: string
  ice_grip?: string
  snow_condition?: string
}

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  view,
  countryCode,
  tireFilterSearchParams,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  view?: ViewMode
  countryCode: string
  tireFilterSearchParams?: TireFilterSearchParams
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const viewMode: ViewMode = view === "list" ? "list" : "grid"
  const isTiresCategory = category.handle === "tires"

  if (!category || !countryCode) notFound()

  const tireFilters = parseTireFiltersFromSearchParams(
    tireFilterSearchParams ?? {}
  )

  let tireSpecOptions = {
    brands: [] as string[],
    models: [] as string[],
    widths: [] as string[],
    heights: [] as string[],
    inches: [] as string[],
    seasons: [] as string[],
    vehicles: [] as string[],
    speedRatings: [] as string[],
    loadIndices: [] as string[],
    fuelEfficiencies: [] as string[],
    wetGrips: [] as string[],
    noiseClasses: [] as string[],
  }

  let tireCatalogProducts: HttpTypes.StoreProduct[] | undefined

  if (isTiresCategory) {
    const { products } = await listAllCategoryProducts({
      countryCode,
      categoryId: category.id,
    })
    tireCatalogProducts = products
    tireSpecOptions = collectTireSpecOptions(products)
  }

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  const sidebar = isTiresCategory ? (
    <Suspense
      fallback={
        <aside className="rounded-large border border-ui-border-base bg-ui-bg-subtle p-4">
          <p className="text-small-regular text-ui-fg-subtle">Loading filters…</p>
        </aside>
      }
    >
      <TireFiltersSidebar specOptions={tireSpecOptions} />
    </Suspense>
  ) : (
    <CategoryFilterPlaceholder />
  )

  return (
    <div className="content-container" data-testid="category-container">
      <div className="flex flex-row mb-8 gap-4 text-2xl-semi pt-6" style={{ display: "none" }}>
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
        <div className="mb-8 text-base-regular text-ui-fg-subtle max-w-3xl" style={{ display: "none" }}>
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
      <CategoryListingLayout sidebar={sidebar}>
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            categoryHandle={category.handle}
            countryCode={countryCode}
            view={viewMode}
            showToolbar
            tireFilters={isTiresCategory ? tireFilters : undefined}
            tireCatalogProducts={tireCatalogProducts}
          />
        </Suspense>
      </CategoryListingLayout>
    </div>
  )
}
