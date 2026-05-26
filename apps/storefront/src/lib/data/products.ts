"use server"

import { sdk } from "@lib/config"
import { PRODUCT_LISTING_FIELDS } from "@lib/constants/product-fields"
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

const CATEGORY_CATALOG_BATCH_SIZE = 100
const CATEGORY_CATALOG_MAX_PAGES = 50

/**
 * Fetches all products in a category by paging the Store API.
 * Used for tire filter facets and client-side filtered pagination.
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
  const allProducts: HttpTypes.StoreProduct[] = []
  let page = 1
  let totalCount = 0

  while (page <= CATEGORY_CATALOG_MAX_PAGES) {
    const { response } = await listProducts({
      countryCode,
      pageParam: page,
      queryParams: {
        category_id: [categoryId],
        limit: batchSize,
      },
    })

    if (page === 1) {
      totalCount = response.count
    }

    allProducts.push(...response.products)

    if (response.products.length === 0 || allProducts.length >= totalCount) {
      break
    }

    page += 1
  }

  return {
    products: allProducts,
    count: totalCount,
  }
}
