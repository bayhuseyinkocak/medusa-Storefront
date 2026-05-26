import { HttpTypes } from "@medusajs/types"

import { getCheapestVariant } from "@lib/util/product-metadata"

export type TireFilters = {
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
  /** When true, only variants/products with metadata flag set to true. */
  dot?: boolean
  m_s?: boolean
  ice_grip?: boolean
  snow_condition?: boolean
}

export type TireSpecOptions = {
  brands: string[]
  models: string[]
  widths: string[]
  heights: string[]
  inches: string[]
  seasons: string[]
  vehicles: string[]
  speedRatings: string[]
  loadIndices: string[]
  fuelEfficiencies: string[]
  wetGrips: string[]
  noiseClasses: string[]
}

/** EU label grades (A = best). Worst grade selected = no filter for that dimension. */
export const TIRE_FUEL_EFFICIENCY_GRADES = ["A", "B", "C", "D", "E"] as const
export const TIRE_WET_GRIP_GRADES = ["A", "B", "C", "D", "E"] as const
export const TIRE_NOISE_CLASS_GRADES = ["A", "B", "C"] as const

export type EuGradeFilterKey =
  | "fuel_efficiency"
  | "wet_grip"
  | "noise_class"

/** URL / filter keys stored on parent product metadata (not variant). */
export const TIRE_PRODUCT_FILTER_KEYS = ["brand", "model"] as const

/** URL / filter keys stored on variant metadata or options. */
export const TIRE_VARIANT_FILTER_KEYS = [
  "width",
  "height",
  "inch",
  "season",
  "vehicle",
  "speed_rating",
  "load_index",
  "fuel_efficiency",
  "wet_grip",
  "noise_class",
] as const

export const TIRE_EU_GRADE_FILTER_KEYS = [
  "fuel_efficiency",
  "wet_grip",
  "noise_class",
] as const

/** Checkbox filters: only applied when enabled (URL param present). */
export const TIRE_BOOLEAN_FILTER_KEYS = [
  "dot",
  "m_s",
  "ice_grip",
  "snow_condition",
] as const

export type TireBooleanFilterKey = (typeof TIRE_BOOLEAN_FILTER_KEYS)[number]

export const TIRE_SELECT_FILTER_PARAM_KEYS = [
  ...TIRE_PRODUCT_FILTER_KEYS,
  ...TIRE_VARIANT_FILTER_KEYS,
] as const

export const TIRE_FILTER_PARAM_KEYS = [
  ...TIRE_SELECT_FILTER_PARAM_KEYS,
  ...TIRE_BOOLEAN_FILTER_KEYS,
] as const

export type TireSelectFilterParamKey =
  (typeof TIRE_SELECT_FILTER_PARAM_KEYS)[number]
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
  if (k === "speed_rating") {
    return (
      titleLower === "speed_rating" ||
      titleLower === "speed rating" ||
      titleLower === "speed"
    )
  }
  if (k === "load_index") {
    return (
      titleLower === "load_index" ||
      titleLower === "load index" ||
      titleLower === "load"
    )
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

const normalizeGradeLetter = (value: string): string =>
  value.trim().charAt(0).toUpperCase()

export const getGradesForEuFilter = (
  key: EuGradeFilterKey
): readonly string[] => {
  switch (key) {
    case "fuel_efficiency":
      return TIRE_FUEL_EFFICIENCY_GRADES
    case "wet_grip":
      return TIRE_WET_GRIP_GRADES
    case "noise_class":
      return TIRE_NOISE_CLASS_GRADES
  }
}

/** Selecting the worst grade (E or noise C) means no filter for that field. */
export const isEuGradeFilterActive = (
  selected: string | undefined,
  grades: readonly string[]
): boolean => {
  if (!selected?.trim()) {
    return false
  }
  const letter = normalizeGradeLetter(selected)
  const idx = grades.indexOf(letter)
  if (idx === -1) {
    return false
  }
  return idx < grades.length - 1
}

/**
 * Variant grade must be at least as good as the selected threshold (A best).
 * e.g. filter C → accepts A, B, C.
 */
export const gradeMatchesCumulativeFilter = (
  variantGrade: string,
  selectedGrade: string,
  grades: readonly string[]
): boolean => {
  const selectedLetter = normalizeGradeLetter(selectedGrade)
  const selectedIdx = grades.indexOf(selectedLetter)
  if (selectedIdx === -1) {
    return true
  }
  if (selectedIdx === grades.length - 1) {
    return true
  }

  const variantLetter = normalizeGradeLetter(variantGrade)
  const variantIdx = grades.indexOf(variantLetter)
  if (variantIdx === -1) {
    return false
  }

  return variantIdx <= selectedIdx
}

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
  const fuelEfficiencies = new Set<string>()
  const wetGrips = new Set<string>()
  const noiseClasses = new Set<string>()
  const vehicles = new Set<string>()
  const speedRatings = new Set<string>()
  const loadIndices = new Set<string>()

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
    getAttrValues(product, "vehicle").forEach((v) => vehicles.add(v))
    getAttrValues(product, "speed_rating").forEach((v) => speedRatings.add(v))
    getAttrValues(product, "load_index").forEach((v) => loadIndices.add(v))
    getAttrValues(product, "fuel_efficiency").forEach((v) =>
      fuelEfficiencies.add(normalizeGradeLetter(v))
    )
    getAttrValues(product, "wet_grip").forEach((v) =>
      wetGrips.add(normalizeGradeLetter(v))
    )
    getAttrValues(product, "noise_class").forEach((v) =>
      noiseClasses.add(normalizeGradeLetter(v))
    )
  })

  const sortGrades = (
    values: Set<string>,
    order: readonly string[]
  ): string[] =>
    order.filter((grade) => values.has(grade))

  return {
    brands: sortAlphabetically(Array.from(brands)),
    models: sortAlphabetically(Array.from(models)),
    widths: sortNumericStrings(Array.from(widths)),
    heights: sortNumericStrings(Array.from(heights)),
    inches: sortNumericStrings(Array.from(inches)),
    seasons: Array.from(seasons).sort(),
    vehicles: sortAlphabetically(Array.from(vehicles)),
    speedRatings: sortAlphabetically(Array.from(speedRatings)),
    loadIndices: sortNumericStrings(Array.from(loadIndices)),
    fuelEfficiencies: sortGrades(fuelEfficiencies, TIRE_FUEL_EFFICIENCY_GRADES),
    wetGrips: sortGrades(wetGrips, TIRE_WET_GRIP_GRADES),
    noiseClasses: sortGrades(noiseClasses, TIRE_NOISE_CLASS_GRADES),
  }
}

const hasActiveEuGradeFilter = (
  filters: TireFilters | undefined,
  key: EuGradeFilterKey
): boolean => {
  if (!filters) {
    return false
  }
  return isEuGradeFilterActive(filters[key], getGradesForEuFilter(key))
}

const hasActiveBooleanFilter = (
  filters: TireFilters | undefined,
  key: TireBooleanFilterKey
): boolean => filters?.[key] === true

export const hasActiveVariantTireFilters = (filters?: TireFilters): boolean =>
  Boolean(
    filters?.width ||
      filters?.height ||
      filters?.inch ||
      filters?.season ||
      filters?.vehicle ||
      filters?.speed_rating ||
      filters?.load_index ||
      hasActiveEuGradeFilter(filters, "fuel_efficiency") ||
      hasActiveEuGradeFilter(filters, "wet_grip") ||
      hasActiveEuGradeFilter(filters, "noise_class") ||
      hasActiveBooleanFilter(filters, "dot") ||
      hasActiveBooleanFilter(filters, "m_s") ||
      hasActiveBooleanFilter(filters, "ice_grip") ||
      hasActiveBooleanFilter(filters, "snow_condition")
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

export const isMetadataTruthy = (value: unknown): boolean => {
  if (value === true || value === 1) {
    return true
  }
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim()
    return normalized === "true" || normalized === "1" || normalized === "yes"
  }
  return false
}

const getVariantMetadataTruthy = (
  variant: HttpTypes.StoreProductVariant,
  key: TireBooleanFilterKey
): boolean => isMetadataTruthy(variant.metadata?.[key])

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
  if (filters.vehicle) {
    const value = getVariantAttrValue(variant, "vehicle")
    if (value !== normalizeFilterValue(filters.vehicle)) {
      return false
    }
  }
  if (filters.speed_rating) {
    const value = getVariantAttrValue(variant, "speed_rating")
    if (value !== normalizeFilterValue(filters.speed_rating)) {
      return false
    }
  }
  if (filters.load_index) {
    const value = getVariantAttrValue(variant, "load_index")
    if (value !== normalizeFilterValue(filters.load_index)) {
      return false
    }
  }
  if (
    hasActiveEuGradeFilter(filters, "fuel_efficiency") &&
    filters.fuel_efficiency
  ) {
    const value = getVariantAttrValue(variant, "fuel_efficiency")
    if (
      !value ||
      !gradeMatchesCumulativeFilter(
        value,
        filters.fuel_efficiency,
        TIRE_FUEL_EFFICIENCY_GRADES
      )
    ) {
      return false
    }
  }
  if (hasActiveEuGradeFilter(filters, "wet_grip") && filters.wet_grip) {
    const value = getVariantAttrValue(variant, "wet_grip")
    if (
      !value ||
      !gradeMatchesCumulativeFilter(value, filters.wet_grip, TIRE_WET_GRIP_GRADES)
    ) {
      return false
    }
  }
  if (hasActiveEuGradeFilter(filters, "noise_class") && filters.noise_class) {
    const value = getVariantAttrValue(variant, "noise_class")
    if (
      !value ||
      !gradeMatchesCumulativeFilter(
        value,
        filters.noise_class,
        TIRE_NOISE_CLASS_GRADES
      )
    ) {
      return false
    }
  }
  if (hasActiveBooleanFilter(filters, "dot") && !getVariantMetadataTruthy(variant, "dot")) {
    return false
  }
  if (hasActiveBooleanFilter(filters, "m_s") && !getVariantMetadataTruthy(variant, "m_s")) {
    return false
  }
  if (
    hasActiveBooleanFilter(filters, "ice_grip") &&
    !getVariantMetadataTruthy(variant, "ice_grip")
  ) {
    return false
  }
  if (
    hasActiveBooleanFilter(filters, "snow_condition") &&
    !getVariantMetadataTruthy(variant, "snow_condition")
  ) {
    return false
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
  const read = (key: TireSelectFilterParamKey): string | undefined => {
    const raw = searchParams[key]
    const value = Array.isArray(raw) ? raw[0] : raw
    if (!value || value.trim() === "") {
      return undefined
    }
    return value.trim()
  }

  const readBoolean = (key: TireBooleanFilterKey): boolean | undefined => {
    const raw = searchParams[key]
    const value = Array.isArray(raw) ? raw[0] : raw
    if (!value || value.trim() === "") {
      return undefined
    }
    if (isMetadataTruthy(value)) {
      return true
    }
    return undefined
  }

  return {
    brand: read("brand"),
    model: read("model"),
    width: read("width"),
    height: read("height"),
    inch: read("inch"),
    season: read("season"),
    vehicle: read("vehicle"),
    speed_rating: read("speed_rating"),
    load_index: read("load_index"),
    fuel_efficiency: read("fuel_efficiency"),
    wet_grip: read("wet_grip"),
    noise_class: read("noise_class"),
    dot: readBoolean("dot"),
    m_s: readBoolean("m_s"),
    ice_grip: readBoolean("ice_grip"),
    snow_condition: readBoolean("snow_condition"),
  }
}
