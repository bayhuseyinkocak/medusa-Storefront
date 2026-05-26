export const PRODUCT_LISTING_FIELDS =
  "id,handle,title,thumbnail,*variants.calculated_price,+variants.metadata,+metadata,+tags"

/** Lighter payload for full-category tire catalog fetch (filters + cards). */
export const TIRE_CATALOG_FIELDS =
  "id,handle,title,thumbnail,+metadata,*variants.calculated_price,+variants.metadata"
