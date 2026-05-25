import { clx } from "@modules/common/components/ui"

const CATEGORY_STYLES: Record<string, string> = {
  recommendation:
    "bg-amber-400 text-slate-900 border-amber-500",
  premium: "bg-violet-700 text-white border-violet-800",
  budget: "bg-slate-600 text-white border-slate-700",
  bestseller: "bg-orange-500 text-white border-orange-600",
  default: "bg-slate-700 text-white border-slate-800",
}

const normalizeKey = (category: string) =>
  category.toLowerCase().replace(/\s+/g, "")

type PriceCategoryBadgeProps = {
  category: string
  className?: string
}

export default function PriceCategoryBadge({
  category,
  className,
}: PriceCategoryBadgeProps) {
  if (!category) {
    return null
  }

  const key = normalizeKey(category)
  const matchedKey =
    Object.keys(CATEGORY_STYLES).find(
      (k) => k !== "default" && key.includes(k)
    ) ?? "default"
  const style = CATEGORY_STYLES[key] ?? CATEGORY_STYLES[matchedKey]

  return (
    <span
      className={clx(
        "inline-block rounded-l-md border-l-4 px-1 py-1 text-[10px] font-semibold uppercase shadow-sm",
        style,
        className
      )}
    >
      {category}
    </span>
  )
}
