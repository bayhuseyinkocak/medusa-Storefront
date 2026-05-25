import { Text, clx } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

type TireCardPriceProps = {
  price: VariantPrice
  align?: "left" | "right"
  size?: "default" | "large"
}

export default function TireCardPrice({
  price,
  align = "right",
  size = "large",
}: TireCardPriceProps) {
  if (!price) {
    return null
  }

  const isSale = price.price_type === "sale"
  const hasDiscount =
    isSale &&
    price.percentage_diff &&
    price.percentage_diff !== "0" &&
    price.percentage_diff !== "0%"

  return (
    <div
      className={clx(
        "flex flex-col gap-0.5",
        align === "right" && "items-end text-right",
        align === "left" && "items-start text-left"
      )}
    >
      {hasDiscount && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-rose-700 px-1.5 py-0.5 text-xs font-bold text-white">
            -{price.percentage_diff}
          </span>
          <Text className="text-sm line-through text-ui-fg-muted">
            {price.original_price}
          </Text>
        </div>
      )}
      <Text
        className={clx(
          "font-bold text-ui-fg-base",
          size === "large" ? "text-2xl" : "text-lg",
          isSale && "text-rose-700 dark:text-rose-400"
        )}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </div>
  )
}
