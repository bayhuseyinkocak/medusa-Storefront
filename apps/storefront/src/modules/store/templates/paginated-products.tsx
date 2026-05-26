import { listProductsPaginated } from "@lib/data/products"
import { sortProducts } from "@lib/util/sort-products"
import {
  hasActiveTireFilters,
  productMatchesTireFilters,
  TireFilters,
} from "@lib/util/tire-filters"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"
import ProductListingToolbar from "@modules/store/components/product-listing-toolbar"
import { ViewMode } from "@modules/store/components/view-mode-toggle"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { clx } from "@modules/common/components/ui"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  categoryHandle,
  productsIds,
  countryCode,
  view = "grid",
  showToolbar = true,
  tireFilters,
  tireCatalogProducts,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  categoryHandle?: string
  productsIds?: string[]
  countryCode: string
  view?: ViewMode
  showToolbar?: boolean
  tireFilters?: TireFilters
  tireCatalogProducts?: HttpTypes.StoreProduct[]
}) {
  const sort = sortBy || "created_at"
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const isList = view === "list"
  const isTiresCategory = categoryHandle === "tires"
  const useTireCatalog =
    isTiresCategory &&
    tireCatalogProducts != null &&
    tireCatalogProducts.length > 0

  let visibleProducts: HttpTypes.StoreProduct[] = []
  let resultCount = 0
  let totalPages = 0

  if (useTireCatalog) {
    const filtered = hasActiveTireFilters(tireFilters)
      ? tireCatalogProducts.filter((product) =>
          productMatchesTireFilters(product, tireFilters)
        )
      : tireCatalogProducts

    const sorted = sortProducts(filtered, sort)
    resultCount = sorted.length
    totalPages = Math.max(1, Math.ceil(resultCount / PRODUCT_LIMIT))
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const offset = (safePage - 1) * PRODUCT_LIMIT
    visibleProducts = sorted.slice(offset, offset + PRODUCT_LIMIT)
  } else {
    const {
      response: { products, count },
    } = await listProductsPaginated({
      page,
      limit: PRODUCT_LIMIT,
      queryParams,
      sortBy: sort,
      countryCode,
    })

    visibleProducts = products
    resultCount = count
    totalPages = Math.ceil(count / PRODUCT_LIMIT)
  }

  return (
    <>
      {showToolbar && (
        <ProductListingToolbar
          count={resultCount}
          sortBy={sort}
          view={view}
        />
      )}
      {visibleProducts.length === 0 ? (
        <p className="py-12 text-center text-small-regular text-ui-fg-subtle">
          {hasActiveTireFilters(tireFilters)
            ? "No products match the selected filters."
            : "No products found."}
        </p>
      ) : (
        <ul
          className={clx(
            "w-full",
            isList
              ? "flex flex-col gap-4"
              : isTiresCategory
                ? "grid grid-cols-1 gap-x-4 gap-y-6 xsmall:grid-cols-2 medium:grid-cols-3"
                : "grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4"
          )}
          data-testid="products-list"
        >
          {visibleProducts.map((p) => (
            <li key={p.id} className={clx(isList && "w-full")}>
              <ProductCard
                product={p}
                region={region}
                categoryHandle={categoryHandle}
                view={view}
                isFeatured={!isList}
                tireFilters={tireFilters}
              />
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
