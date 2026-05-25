import { BoltSolid } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"

type EvTireBadgeProps = {
  className?: string
}

export default function EvTireBadge({ className }: EvTireBadgeProps) {
  return (
    <span
      className={clx(
        "flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md",
        className
      )}
      title="Electric vehicle tire"
      aria-label="Electric vehicle tire"
    >
      <BoltSolid className="h-5 w-5" />
    </span>
  )
}
