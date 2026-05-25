# Category listing pages

## Implemented

- Two-column layout: filter sidebar placeholder (left) + product listing (right)
- Toolbar: result count, sort dropdown, grid/list toggle ([Medusa Icons](https://docs.medusajs.com/ui/icons/overview) `GridLayout`, `GridList`)
- URL params: `sortBy`, `page`, `view` (`grid` | `list`, default `grid`)
- Real API pagination (`limit=12`, `offset`) — no more bulk fetch of 100 products
- Category-specific product cards:
  - `tires` → `TireProductCard` — 3-column grid (`medium`), compact tire image, brand logo from `cdn.alfatires.eu/logos/brands/{brand}.webp`, `price_category` badge, EV icon, EU tire label row, price + rose **Choose tire** CTA
  - `wheels` / `felgen` → `WheelProductCard`
  - other → default `ProductPreview`
- Lighter category/collection API fields (no `*products` expansion)

## Test URLs

- Tires: http://localhost:8000/de/categories/tires
- Wheels: http://localhost:8000/de/categories/wheels
- Shop all: http://localhost:8000/de/store

## Deferred (next phase)

- Working filters in the left sidebar (brand, season, width, etc.)
- Server-side metadata filtering or custom store API
- German UI copy (currently English)
- Accurate price sort across full catalog (current MVP sorts price within the current page only)

## Key files

| Area | Path |
|------|------|
| Pagination | `apps/storefront/src/lib/data/products.ts` |
| Listing | `apps/storefront/src/modules/store/templates/paginated-products.tsx` |
| Toolbar | `apps/storefront/src/modules/store/components/product-listing-toolbar/` |
| Category layout | `apps/storefront/src/modules/categories/templates/` |
| Product cards | `apps/storefront/src/modules/products/components/tire-product-card/` |
| Tire metadata helpers | `apps/storefront/src/lib/util/product-metadata.ts` |
