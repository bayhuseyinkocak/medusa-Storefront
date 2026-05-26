import { HttpTypes } from "@medusajs/types"

import { getCheapestVariant } from "@lib/util/product-metadata"

export type TireFilters = {
  brand?: string
  model?: string
  width?: string
  height?: string
  inch?: string
  season?: string
}

export type TireSpecOptions = {
  brands: string[]
  models: string[]
  widths: string[]
  heights: string[]
  inches: string[]
  seasons: string[]
}

/** URL / filter keys stored on parent product metadata (not variant). */
export const TIRE_PRODUCT_FILTER_KEYS = ["brand", "model"] as const

/** URL / filter keys stored on variant metadata or options. */
export const TIRE_VARIANT_FILTER_KEYS = [
  "width",
  "height",
  "inch",
  "season",
] as const

export const TIRE_FILTER_PARAM_KEYS = [
  ...TIRE_PRODUCT_FILTER_KEYS,
  ...TIRE_VARIANT_FILTER_KEYS,
] as const

export type TireFilterParamKey = (typeof TIRE_FILTER_PARAM_KEYS)[number]
export type TireProductFilterKey = (typeof TIRE_PRODUCT_FILTER_KEYS)[number]
export type TireVariantFilterKey = (typeof TIRE_VARIANT_FILTER_KEYS)[number]

type VariantOptionLike = {
  value?: string | null
  title?: string | null
  option?: { title?: string | null } | null
}

type ProductLike = HttpTypes.StoreProduct & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const isScalar = (value: unknown): value is string | number | boolean =>
  value != null && typeof value !== "object"

const normalizeFilterValue = (value: string): string =>
  String(value).trim()

export const matchesOptionTitle = (key: string, titleLower: string): boolean => {
  const k = key.toLowerCase()
  if (k === "inch") {
    return (
      titleLower === "inch" ||
      titleLower === "diameter" ||
      titleLower === "zoll" ||
      titleLower.includes("diameter size")
    )
  }
  if (k === "width") {
    return (
      titleLower === "width" ||
      titleLower === "rim width" ||
      titleLower === "section width"
    )
  }
  if (k === "height") {
    return titleLower === "height" || titleLower === "aspect ratio"
  }
  if (k === "season") {
    return titleLower === "season"
  }
  return titleLower === k
}

/** Collect unique attribute values from product + all variants (metadata and Medusa options). */
export const getAttrValues = (
  product: ProductLike,
  key: string
): string[] => {
  const values = new Set<string>()

  const parentMetaVal = product.metadata?.[key]
  if (isScalar(parentMetaVal)) {
    values.add(normalizeFilterValue(String(parentMetaVal)))
  }

  const parentDirectVal = product[key]
  if (isScalar(parentDirectVal)) {
    values.add(normalizeFilterValue(String(parentDirectVal)))
  }

  product.variants?.forEach((variant) => {
    const varMetaVal = variant.metadata?.[key]
    if (isScalar(varMetaVal)) {
      values.add(normalizeFilterValue(String(varMetaVal)))
    }

    const optsList = variant.options as VariantOptionLike[] | undefined
    optsList?.forEach((opt) => {
      const optTitle = opt.option?.title || opt.title || ""
      const optVal = opt.value
      if (optVal != null && optTitle) {
        const titleLower = String(optTitle).toLowerCase().trim()
        if (matchesOptionTitle(key, titleLower)) {
          values.add(normalizeFilterValue(String(optVal)))
        }
      }
    })
  })

  return Array.from(values).filter((v) => v !== "")
}

const sortNumericStrings = (values: string[]): string[] =>
  [...values].sort((a, b) => parseFloat(a) - parseFloat(b))

const sortAlphabetically = (values: string[]): string[] =>
  [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))

/** Parent product metadata only (brand, model). */
export const getProductMetadataAttrValue = (
  product: HttpTypes.StoreProduct,
  key: TireProductFilterKey
): string => {
  const metaVal = product.metadata?.[key]
  if (isScalar(metaVal)) {
    return normalizeFilterValue(String(metaVal))
  }
  return ""
}

export const collectTireSpecOptions = (
  products: HttpTypes.StoreProduct[]
): TireSpecOptions => {
  const brands = new Set<string>()
  const models = new Set<string>()
  const widths = new Set<string>()
  const heights = new Set<string>()
  const inches = new Set<string>()
  const seasons = new Set<string>()

  products.forEach((product) => {
    const brand = getProductMetadataAttrValue(product, "brand")
    const model = getProductMetadataAttrValue(product, "model")
    if (brand) {
      brands.add(brand)
    }
    if (model) {
      models.add(model)
    }

    getAttrValues(product, "width").forEach((v) => widths.add(v))
    getAttrValues(product, "height").forEach((v) => heights.add(v))
    getAttrValues(product, "inch").forEach((v) => inches.add(v))
    getAttrValues(product, "season").forEach((v) => seasons.add(v))
  })

  return {
    brands: sortAlphabetically(Array.from(brands)),
    models: sortAlphabetically(Array.from(models)),
    widths: sortNumericStrings(Array.from(widths)),
    heights: sortNumericStrings(Array.from(heights)),
    inches: sortNumericStrings(Array.from(inches)),
    seasons: Array.from(seasons).sort(),
  }
}

export const hasActiveVariantTireFilters = (filters?: TireFilters): boolean =>
  Boolean(
    filters?.width || filters?.height || filters?.inch || filters?.season
  )

export const hasActiveTireFilters = (filters?: TireFilters): boolean =>
  Boolean(
    filters?.brand ||
      filters?.model ||
      hasActiveVariantTireFilters(filters)
  )

const seasonMatchesFilter = (
  variantSeason: string,
  filterSeason: string
): boolean => {
  const s = variantSeason.toLowerCase()
  const sel = filterSeason.toLowerCase()
  if (sel === "summer" || sel === "sommer") {
    return s === "summer" || s === "sommer"
  }
  if (sel === "winter") {
    return s === "winter"
  }
  if (sel === "allseason" || sel === "all" || sel === "allwetter") {
    return s.includes("all") || s === "allwetter" || s === "allseason"
  }
  return s === sel
}

const getVariantAttrValue = (
  variant: HttpTypes.StoreProductVariant,
  key: string
): string => {
  const metaVal = variant.metadata?.[key]
  if (isScalar(metaVal)) {
    return normalizeFilterValue(String(metaVal))
  }

  const optsList = variant.options as VariantOptionLike[] | undefined
  for (const opt of optsList ?? []) {
    const optTitle = opt.option?.title || opt.title || ""
    const optVal = opt.value
    if (optVal != null && optTitle) {
      const titleLower = String(optTitle).toLowerCase().trim()
      if (matchesOptionTitle(key, titleLower)) {
        return normalizeFilterValue(String(optVal))
      }
    }
  }

  return ""
}

export const variantMatchesTireFilters = (
  variant: HttpTypes.StoreProductVariant,
  filters: TireFilters
): boolean => {
  if (filters.width) {
    const value = getVariantAttrValue(variant, "width")
    if (value !== normalizeFilterValue(filters.width)) {
      return false
    }
  }
  if (filters.height) {
    const value = getVariantAttrValue(variant, "height")
    if (value !== normalizeFilterValue(filters.height)) {
      return false
    }
  }
  if (filters.inch) {
    const value = getVariantAttrValue(variant, "inch")
    if (value !== normalizeFilterValue(filters.inch)) {
      return false
    }
  }
  if (filters.season) {
    const value = getVariantAttrValue(variant, "season")
    if (!value || !seasonMatchesFilter(value, filters.season)) {
      return false
    }
  }
  return true
}

const productMatchesProductLevelFilters = (
  product: HttpTypes.StoreProduct,
  filters: TireFilters
): boolean => {
  if (filters.brand) {
    const brand = getProductMetadataAttrValue(product, "brand")
    if (brand !== normalizeFilterValue(filters.brand)) {
      return false
    }
  }
  if (filters.model) {
    const model = getProductMetadataAttrValue(product, "model")
    if (model !== normalizeFilterValue(filters.model)) {
      return false
    }
  }
  return true
}

export const productMatchesTireFilters = (
  product: HttpTypes.StoreProduct,
  filters?: TireFilters
): boolean => {
  if (!hasActiveTireFilters(filters) || !filters) {
    return true
  }

  if (!productMatchesProductLevelFilters(product, filters)) {
    return false
  }

  if (!hasActiveVariantTireFilters(filters)) {
    return true
  }

  if (!product.variants?.length) {
    return false
  }

  return product.variants.some((variant) =>
    variantMatchesTireFilters(variant, filters)
  )
}

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: { calculated_amount?: number | null }
}

const pickCheapestFromVariants = (
  variants: HttpTypes.StoreProductVariant[]
): HttpTypes.StoreProductVariant | undefined => {
  if (!variants.length) {
    return undefined
  }

  const withPrice = (variants as VariantWithPrice[]).filter(
    (v) => v.calculated_price?.calculated_amount != null
  )

  if (withPrice.length > 0) {
    return withPrice.sort(
      (a, b) =>
        (a.calculated_price?.calculated_amount ?? 0) -
        (b.calculated_price?.calculated_amount ?? 0)
    )[0]
  }

  return variants[0]
}

/** Variant shown on the card: matches active filters, else cheapest variant. */
export const resolveDisplayVariant = (
  product: HttpTypes.StoreProduct,
  filters?: TireFilters
): HttpTypes.StoreProductVariant | undefined => {
  if (!hasActiveVariantTireFilters(filters) || !filters) {
    return getCheapestVariant(product)
  }

  const matching =
    product.variants?.filter((v) => variantMatchesTireFilters(v, filters)) ?? []

  if (matching.length > 0) {
    return pickCheapestFromVariants(matching)
  }

  return getCheapestVariant(product)
}

export const parseTireFiltersFromSearchParams = (
  searchParams: Record<string, string | string[] | undefined>
): TireFilters => {
  const read = (key: TireFilterParamKey): string | undefined => {
    const raw = searchParams[key]
    const value = Array.isArray(raw) ? raw[0] : raw
    if (!value || value.trim() === "") {
      return undefined
    }
    return value.trim()
  }

  return {
    brand: read("brand"),
    model: read("model"),
    width: read("width"),
    height: read("height"),
    inch: read("inch"),
    season: read("season"),
  }
}
