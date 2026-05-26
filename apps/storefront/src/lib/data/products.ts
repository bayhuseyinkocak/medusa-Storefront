"use server"

import { sdk } from "@lib/config"
import {
  PRODUCT_LISTING_FIELDS,
  TIRE_CATALOG_FIELDS,
} from "@lib/constants/product-fields"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          region_id: region?.id,
          ...queryParams,
          limit,
          offset,
          fields: queryParams?.fields ?? PRODUCT_LISTING_FIELDS,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * Paginated product listing using real API offset/limit.
 * Price sorting applies to the current page only (MVP).
 */
export const listProductsPaginated = async ({
  page = 1,
  limit = 12,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  limit?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
}> => {
  const apiQuery: HttpTypes.FindParams & HttpTypes.StoreProductListParams = {
    ...queryParams,
    limit,
    fields: queryParams?.fields ?? PRODUCT_LISTING_FIELDS,
  }

  if (sortBy === "created_at") {
    apiQuery.order = "created_at"
  }

  const {
    response: { products, count },
    nextPage,
  } = await listProducts({
    pageParam: page,
    queryParams: apiQuery,
    countryCode,
  })

  let sortedProducts = products

  if (sortBy === "price_asc" || sortBy === "price_desc") {
    sortedProducts = sortProducts(products, sortBy)
  }

  return {
    response: {
      products: sortedProducts,
      count,
    },
    nextPage,
  }
}

const CATEGORY_CATALOG_BATCH_SIZE = 200
const CATEGORY_CATALOG_MAX_PAGES = 50

const fetchAllCategoryProducts = async ({
  countryCode,
  categoryId,
  batchSize,
}: {
  countryCode: string
  categoryId: string
  batchSize: number
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> => {
  const catalogQuery = {
    category_id: [categoryId],
    limit: batchSize,
    fields: TIRE_CATALOG_FIELDS,
  }

  const first = await listProducts({
    countryCode,
    pageParam: 1,
    queryParams: catalogQuery,
  })

  const totalCount = first.response.count
  const allProducts = [...first.response.products]

  if (
    first.response.products.length === 0 ||
    allProducts.length >= totalCount
  ) {
    return { products: allProducts, count: totalCount }
  }

  const totalPages = Math.min(
    Math.ceil(totalCount / batchSize),
    CATEGORY_CATALOG_MAX_PAGES
  )

  if (totalPages <= 1) {
    return { products: allProducts, count: totalCount }
  }

  const remainingPageNumbers = Array.from(
    { length: totalPages - 1 },
    (_, index) => index + 2
  )

  const remainingBatches = await Promise.all(
    remainingPageNumbers.map((page) =>
      listProducts({
        countryCode,
        pageParam: page,
        queryParams: catalogQuery,
      }).then((result) => result.response.products)
    )
  )

  for (const batch of remainingBatches) {
    allProducts.push(...batch)
    if (allProducts.length >= totalCount) {
      break
    }
  }

  return {
    products: allProducts.slice(0, totalCount),
    count: totalCount,
  }
}

/**
 * Fetches all products in a category (parallel batches).
 * Used for tire filter facets and client-side filtered pagination.
 *
 * Not wrapped in unstable_cache: full tire catalogs exceed Next.js Data Cache
 * 2MB entry limit (~35MB with variants). Per-page listProducts still uses
 * force-cache via getCacheOptions("products").
 */
export const listAllCategoryProducts = async ({
  countryCode,
  categoryId,
  batchSize = CATEGORY_CATALOG_BATCH_SIZE,
}: {
  countryCode: string
  categoryId: string
  batchSize?: number
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> => {
  return fetchAllCategoryProducts({ countryCode, categoryId, batchSize })
}
