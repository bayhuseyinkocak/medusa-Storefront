import { getProductPrice } from "@lib/util/get-product-price"
import {
  formatSeasonLabel,
  formatTireSize,
  getEuTireLabel,
  getPriceCategory,
  getProductMetadataValue,
  getProductVariantOptions,
  isEvTire,
} from "@lib/util/product-metadata"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import BrandLogo from "./brand-logo"
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
  const options = getProductVariantOptions(product)
  const option1 = options[0]?.values[0]
  console.log('options', options)
  console.log('option1', option1)
  console.log('options_x', product.options)
console.log('variant options_x', product.variants?.[0]?.options)
console.log('product', product)

  const imageBlock = (
    <div className="relative w-full">
      <div className="absolute right-0 top-1 z-10">
        {priceCategory && <PriceCategoryBadge category={priceCategory} />}
      </div>
      {showEvBadge && (
        <div className="absolute right-3 top-3 z-10">
          <EvTireBadge className="h-7 w-7 [&_svg]:h-4 [&_svg]:w-4" />
        </div>
      )}
      <LocalizedClientLink href={productHref} className="block">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="square"
          isFeatured={false}
          className="mx-auto aspect-square h-[200px] max-h-[200px] w-full max-w-[200px] border-0 bg-transparent p-1 shadow-none"
          data-testid="product-image" 
        />
      </LocalizedClientLink>
      {brand && <BrandLogo brand={brand} className="absolute left-2 bottom-4 bg-white/80" />}
    </div>
  )

  const infoBlock = (
    <div className="flex flex-col gap-2 mt-2">
      <LocalizedClientLink href={productHref} className="group/title space-y-1">
        
        <Text
          className="text-sm font-bold text-slate-800 transition-colors group-hover/title:text-rose-600 dark:group-hover/title:text-rose-400 line-clamp-2"
          data-testid="product-title"
        >
          {brand && <span className="">{brand}</span>} {model || product.title}
        </Text>
        {size && (
          <Text className="text-sm font-semibold text-slate-700">{option1 || size}</Text>
        )}
      </LocalizedClientLink>

      {season && (
        <div className="flex items-center gap-1.5">
          <SeasonDot season={season} />
          <Text className="txt-compact-small text-ui-fg-muted">
            {formatSeasonLabel(season)} tire
          </Text>
        </div>
      )}

      {euLabel && <EuTireLabel label={euLabel} compact />}

      <div className="flex items-center justify-between gap-2 border-t border-ui-border-base pt-2.5">
        {cheapestPrice ? (
          <TireCardPrice
            price={cheapestPrice}
            align="left"
            size="default"
          />
        ) : (
          <span />
        )}
        <LocalizedClientLink
          href={productHref}
          className={clx(
            "inline-flex shrink-0 items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors",
            "hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600",
            "dark:bg-rose-600 dark:hover:bg-rose-500"
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
        id={`tire-product-card-list-${product.id}`}
        data-testid="product-wrapper-list"
        className={clx(
          "flex w-full flex-col gap-3 rounded-md border border-ui-border-base bg-ui-bg-base p-3 transition-all duration-200",
          "hover:border-slate-200/60 hover:shadow-elevation-card-hover dark:hover:border-slate-800/40",
          "small:flex-row small:items-stretch"
        )}
      >
        <div className="relative w-full shrink-0 small:max-w-[9rem]">
          {priceCategory && (
            <div className="absolute left-0 top-0 z-10">
              <PriceCategoryBadge category={priceCategory} />
            </div>
          )}
          {showEvBadge && (
            <div className="absolute right-1 top-1 z-10">
              <EvTireBadge className="h-7 w-7 [&_svg]:h-4 [&_svg]:w-4" />
            </div>
          )}
          <LocalizedClientLink href={productHref} className="block">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="square"
              isFeatured={false}
              className="mx-auto h-28 w-28 border-0 p-1 shadow-none"
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
      id={`tire-product-card-grid-${product.id}`}
      data-testid="product-wrapper"
      className={clx(
        "flex h-full flex-col overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-base transition-all duration-200",
        "hover:border-slate-200/60 hover:shadow-elevation-card-hover dark:hover:border-slate-800/40"
      )}
    >
      {imageBlock}
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">{infoBlock}</div>
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
      className={clx("inline-block h-2 w-2 shrink-0 rounded-full", color)}
      aria-hidden
    />
  )
}
