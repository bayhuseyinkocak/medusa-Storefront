import { getProductPrice } from "@lib/util/get-product-price"
import {
  formatSeasonLabel,
  formatTireSize,
  getEuTireLabel,
  getPriceCategory,
  getProductMetadataValue,
  isEvTire,
} from "@lib/util/product-metadata"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import EuTireLabel from "./eu-tire-label"
import EvTireBadge from "./ev-tire-badge"
import PriceCategoryBadge from "./price-category-badge"
import TireCardPrice from "./tire-card-price"

type TireProductCardProps = {
  product: HttpTypes.StoreProduct
  view?: "grid" | "list"
}

export default function TireProductCard({
  product,
  view = "grid",
}: TireProductCardProps) {
  const { cheapestPrice } = getProductPrice({ product })
  const brand = getProductMetadataValue(product, "brand")
  const model = getProductMetadataValue(product, "model")
  const season = getProductMetadataValue(product, "season")
  const size = formatTireSize(product)
  const priceCategory = getPriceCategory(product)
  const euLabel = getEuTireLabel(product)
  const showEvBadge = isEvTire(product)
  const isList = view === "list"
  const productHref = `/products/${product.handle}`

  const imageBlock = (
    <div className="relative w-full">
      <div className="absolute left-0 top-0 z-10">
        {priceCategory && <PriceCategoryBadge category={priceCategory} />}
      </div>
      {showEvBadge && (
        <div className="absolute right-2 top-2 z-10">
          <EvTireBadge />
        </div>
      )}
      <LocalizedClientLink href={productHref} className="block">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={false}
          className="aspect-[4/3] w-full border-0 p-2 shadow-none group-hover:shadow-none"
          data-testid="product-image"
        />
      </LocalizedClientLink>
    </div>
  )

  const infoBlock = (
    <div className="flex flex-col gap-2">
      <LocalizedClientLink href={productHref} className="group/title">
        {brand && (
          <Text className="txt-compact-small-plus font-bold uppercase tracking-wide text-ui-fg-base">
            {brand}
          </Text>
        )}
        <Text
          className="font-semibold text-ui-fg-base transition-colors group-hover/title:text-rose-600 dark:group-hover/title:text-rose-400 line-clamp-2"
          data-testid="product-title"
        >
          {model || product.title}
        </Text>
        {size && (
          <Text className="txt-compact-medium text-ui-fg-subtle">{size}</Text>
        )}
      </LocalizedClientLink>

      {season && (
        <div className="flex items-center gap-1.5">
          <SeasonDot season={season} />
          <Text className="txt-compact-small text-ui-fg-muted capitalize">
            {formatSeasonLabel(season)} tire
          </Text>
        </div>
      )}

      {euLabel && <EuTireLabel label={euLabel} compact={isList} />}

      <div
        className={clx(
          "flex items-end gap-3 border-t border-ui-border-base pt-3",
          isList ? "justify-between" : "flex-col items-stretch sm:flex-row sm:items-end sm:justify-between"
        )}
      >
        {cheapestPrice && (
          <TireCardPrice
            price={cheapestPrice}
            align={isList ? "left" : "right"}
            size={isList ? "default" : "large"}
          />
        )}
        <LocalizedClientLink
          href={productHref}
          className={clx(
            "inline-flex w-full items-center justify-center rounded-md bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors",
            "hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600",
            "dark:bg-rose-600 dark:hover:bg-rose-500",
            !isList && "sm:w-auto sm:min-w-[10rem]"
          )}
          data-testid="choose-tire-cta"
        >
          Choose tire
        </LocalizedClientLink>
      </div>
    </div>
  )

  if (isList) {
    return (
      <article
        data-testid="product-wrapper"
        className={clx(
          "flex w-full flex-col gap-4 rounded-large border border-ui-border-base bg-ui-bg-base p-4 transition-all duration-200",
          "hover:border-rose-200/60 hover:shadow-elevation-card-hover dark:hover:border-rose-800/40",
          "small:flex-row small:items-stretch"
        )}
      >
        <div className="relative w-full shrink-0 small:max-w-[12rem]">
          {priceCategory && (
            <div className="absolute left-0 top-0 z-10">
              <PriceCategoryBadge category={priceCategory} />
            </div>
          )}
          {showEvBadge && (
            <div className="absolute right-2 top-2 z-10">
              <EvTireBadge />
            </div>
          )}
          <LocalizedClientLink href={productHref} className="block">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="square"
              isFeatured={false}
              className="w-full small:w-48"
              data-testid="product-image"
            />
          </LocalizedClientLink>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">{infoBlock}</div>
      </article>
    )
  }

  return (
    <article
      data-testid="product-wrapper"
      className={clx(
        "flex h-full flex-col overflow-hidden rounded-large border border-ui-border-base bg-ui-bg-base transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-rose-200/60 hover:shadow-elevation-card-hover dark:hover:border-rose-800/40"
      )}
    >
      {imageBlock}
      <div className="flex flex-1 flex-col gap-3 p-4">{infoBlock}</div>
    </article>
  )
}

function SeasonDot({ season }: { season: string }) {
  const normalized = season.toLowerCase()
  const color =
    normalized === "summer"
      ? "bg-amber-400"
      : normalized === "winter"
        ? "bg-sky-500"
        : "bg-emerald-500"

  return (
    <span
      className={clx("inline-block h-2.5 w-2.5 shrink-0 rounded-full", color)}
      aria-hidden
    />
  )
}
