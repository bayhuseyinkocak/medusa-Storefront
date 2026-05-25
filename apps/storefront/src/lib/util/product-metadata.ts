import { HttpTypes } from "@medusajs/types"

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount?: number
  }
}

const isScalar = (value: unknown): value is string | number | boolean =>
  value != null && typeof value !== "object"

export const getVariantMetadataValue = (
  variant: HttpTypes.StoreProductVariant | undefined,
  key: string
): string => {
  const variantVal = variant?.metadata?.[key]
  if (isScalar(variantVal)) {
    return String(variantVal).trim()
  }
  return ""
}

export const getCheapestVariant = (
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProductVariant | undefined => {
  if (!product.variants?.length) {
    return undefined
  }

  const withPrice = (product.variants as VariantWithPrice[]).filter(
    (v) => v.calculated_price?.calculated_amount != null
  )

  if (withPrice.length > 0) {
    return withPrice.sort(
      (a, b) =>
        (a.calculated_price?.calculated_amount ?? 0) -
        (b.calculated_price?.calculated_amount ?? 0)
    )[0]
  }

  return product.variants[0]
}

export const getProductMetadataValue = (
  product: HttpTypes.StoreProduct,
  key: string,
  variant?: HttpTypes.StoreProductVariant
): string => {
  const parentVal = product.metadata?.[key]
  if (isScalar(parentVal)) {
    return String(parentVal).trim()
  }

  const targetVariant = variant ?? getCheapestVariant(product)
  return getVariantMetadataValue(targetVariant, key)
}

/**
 * Returns all product options as an array, preserving their id, title, and possible values.
 */
export const getProductVariantOptions = (
  product: HttpTypes.StoreProduct
): Array<{ id: string; title: string; values: string[] }> => {
  return (
    product.options?.map((option) => ({
      id: option.id,
      title: option.title,
      values: option.values?.map((v) => v.value) ?? [],
    })) ?? []
  )
}

/**
 * Returns the string value of the nth option (optionIndex) for the given variant (or the cheapest).
 * If the variant or its options is not found, returns an empty string.
 */
export const getProductVariantOptionValue = (
  product: HttpTypes.StoreProduct,
  optionIndex: number,
  variant?: HttpTypes.StoreProductVariant
): string => {
  const targetVariant = variant ?? getCheapestVariant(product)
  if (!targetVariant?.options || typeof optionIndex !== "number") {
    return ""
  }
  // Return the value of the nth option on the target variant
  return targetVariant.options[optionIndex]?.value ?? ""
}

/**
 * Returns the value of the specified option key (e.g., "color") for the given variant (or the cheapest).
 * If not found, returns an empty string.
 */
export const getProductVariantOptionKey = (
  product: HttpTypes.StoreProduct,
  key: string,
  variant?: HttpTypes.StoreProductVariant
): string => {
  const targetVariant = variant ?? getCheapestVariant(product)
  if (!targetVariant?.options?.length || !product.options?.length) {
    return ""
  }
  // Find the product option by title, case-insensitive match
  const productOption = product.options.find(
    (option) => option.title?.toLowerCase() === key.toLowerCase()
  )
  if (!productOption) {
    return ""
  }
  // Find the matching variant option and return its value
  const vOpt = targetVariant.options.find(
    (option) => option.option_id === productOption.id
  )
  return vOpt?.value ?? ""
}



export const getPriceCategory = (
  product: HttpTypes.StoreProduct
): string => {
  return getProductMetadataValue(product, "price_category")
}

export const isEvTire = (product: HttpTypes.StoreProduct): boolean => {
  const variant = getCheapestVariant(product)
  const extra = getVariantMetadataValue(variant, "extra")
  return extra.toLowerCase().includes("ev")
}

export type EuTireLabelData = {
  fuel: string
  wetGrip: string
  noiseLevel: string
  noiseClass: string
}

export const getEuTireLabel = (
  product: HttpTypes.StoreProduct
): EuTireLabelData | null => {
  const variant = getCheapestVariant(product)
  const fuel = getVariantMetadataValue(variant, "fuel_efficiency")
  const wetGrip = getVariantMetadataValue(variant, "wet_grip")
  const noiseLevel = getVariantMetadataValue(variant, "noise_level")
  const noiseClass = getVariantMetadataValue(variant, "noise_class")

  if (!fuel && !wetGrip && !noiseLevel && !noiseClass) {
    return null
  }

  return { fuel, wetGrip, noiseLevel, noiseClass }
}

export const formatTireSize = (
  product: HttpTypes.StoreProduct,
  variant?: HttpTypes.StoreProductVariant
): string => {
  const targetVariant = variant ?? getCheapestVariant(product)
  const variantTitle = targetVariant?.title
  if (variantTitle) {
    return variantTitle
  }

  const width = getVariantMetadataValue(targetVariant, "width")
  const height = getVariantMetadataValue(targetVariant, "height")
  const inch = getVariantMetadataValue(targetVariant, "inch")

  if (width && height && inch) {
    return `${width}/${height} R${inch}`
  }

  return getProductMetadataValue(product, "size", targetVariant)
}

export const formatSeasonLabel = (season: string): string => {
  const normalized = season.toLowerCase()
  if (normalized === "allseason" || normalized === "all season") {
    return "All season"
  }
  if (normalized === "summer") {
    return "Summer"
  }
  if (normalized === "winter") {
    return "Winter"
  }
  return season
}

export const getEuGradeColorClass = (grade: string): string => {
  const letter = grade.trim().charAt(0).toUpperCase()
  switch (letter) {
    case "A":
      return "bg-emerald-600 text-white"
    case "B":
      return "bg-sky-600 text-white"
    case "C":
      return "bg-amber-400 text-slate-900"
    case "D":
      return "bg-orange-500 text-white"
    case "E":
    case "F":
    case "G":
      return "bg-slate-500 text-white"
    default:
      return "bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100"
  }
}
