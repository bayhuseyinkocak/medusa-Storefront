const BRAND_LOGO_CDN = "https://cdn.alfatires.eu/logos/brands"

export const getBrandLogoSlug = (brand: string): string =>
  brand.trim().toLowerCase().replace(/\s+/g, "")

export const getBrandLogoUrl = (brand: string): string =>
  `${BRAND_LOGO_CDN}/${getBrandLogoSlug(brand)}.webp`
