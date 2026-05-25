import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import TireProductCard from "@modules/products/components/tire-product-card"
import WheelProductCard from "@modules/products/components/wheel-product-card"
import { resolveProductCardType } from "./resolve-card-type"

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  categoryHandle?: string
  view?: "grid" | "list"
  isFeatured?: boolean
}

export default function ProductCard({
  product,
  region,
  categoryHandle,
  view = "grid",
  isFeatured,
}: ProductCardProps) {
  const cardType = resolveProductCardType(categoryHandle)

  if (cardType === "tire") {
    return <TireProductCard product={product} view={view} />
  }

  if (cardType === "wheel") {
    return <WheelProductCard product={product} view={view} />
  }

  return (
    <ProductPreview product={product} region={region} isFeatured={isFeatured} />
  )
}

export { resolveProductCardType }
