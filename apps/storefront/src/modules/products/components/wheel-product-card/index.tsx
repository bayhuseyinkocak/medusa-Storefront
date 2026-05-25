import { getProductPrice } from "@lib/util/get-product-price"
import { getProductMetadataValue } from "@lib/util/product-metadata"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"

type WheelProductCardProps = {
  product: HttpTypes.StoreProduct
  view?: "grid" | "list"
}

export default function WheelProductCard({
  product,
  view = "grid",
}: WheelProductCardProps) {
  const { cheapestPrice } = getProductPrice({ product })
  const brand = getProductMetadataValue(product, "brand")
  const size = product.variants?.[0]?.title || getProductMetadataValue(product, "size")
  const isList = view === "list"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={clx("group block", isList && "w-full")}
    >
      <div
        data-testid="product-wrapper"
        className={clx(
          "rounded-large border border-ui-border-base transition-all duration-200",
          "hover:border-rose-200/60 hover:shadow-elevation-card-hover dark:hover:border-rose-800/40",
          isList
            ? "flex flex-row gap-4 p-4 bg-ui-bg-base"
            : "group-hover:-translate-y-0.5"
        )}
      >
        <div className={clx(isList && "w-40 shrink-0 small:w-48")}>
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size={isList ? "square" : "full"}
            isFeatured={!isList}
          />
        </div>
        <div className={clx("flex flex-col", isList ? "flex-1 justify-center gap-2" : "mt-4 gap-1")}>
          {brand && (
            <Text className="txt-compact-small-plus uppercase text-ui-fg-muted tracking-wide">
              {brand}
            </Text>
          )}
          <Text
            className="text-ui-fg-base group-hover:text-ui-fg-interactive transition-colors line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          {size && (
            <Text className="txt-compact-medium text-ui-fg-subtle">{size}</Text>
          )}
          {cheapestPrice && (
            <div className={clx(isList && "mt-1")}>
              <PreviewPrice price={cheapestPrice} />
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
