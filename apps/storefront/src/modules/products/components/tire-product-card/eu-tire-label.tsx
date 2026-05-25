import {
  EuTireLabelData,
  getEuGradeColorClass,
} from "@lib/util/product-metadata"
import { clx } from "@modules/common/components/ui"
import type { ReactNode } from "react"

type EuTireLabelProps = {
  label: EuTireLabelData
  className?: string
  compact?: boolean
}

function FuelIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M6 2h8v4h2v14H4V6h2V2zm2 2v2H6v12h10V8h-2V4H8zm10 4h2v10h-2V6zm2-2v2h-2V4h2z" />
    </svg>
  )
}

function WetGripIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2C8 6 4 9 4 14a8 8 0 0016 0c0-5-4-8-8-12zm0 18a6 6 0 01-6-6c0-3.5 2.8-6.2 6-9.8 3.2 3.6 6 6.3 6 9.8a6 6 0 01-6 6z" />
    </svg>
  )
}

function NoiseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

function GradeCell({
  grade,
  compact,
}: {
  grade: string
  compact?: boolean
}) {
  if (!grade) {
    return null
  }

  return (
    <span
      className={clx(
        "inline-flex min-w-[1.25rem] items-center justify-center rounded font-bold",
        getEuGradeColorClass(grade),
        compact ? "px-1 py-0.5 text-xs" : "px-1.5 py-0.5 text-sm"
      )}
    >
      {grade.toUpperCase()}
    </span>
  )
}

function LabelCell({
  icon,
  grade,
  suffix,
  compact,
}: {
  icon: ReactNode
  grade: string
  suffix?: string
  compact?: boolean
}) {
  if (!grade && !suffix) {
    return null
  }

  return (
    <div
      className={clx(
        "flex flex-1 items-center gap-1.5 rounded-md bg-ui-bg-subtle px-2 py-1.5",
        compact && "px-1.5 py-1"
      )}
    >
      <span className="shrink-0 text-ui-fg-muted">{icon}</span>
      <div className="flex min-w-0 items-center gap-1">
        {grade && <GradeCell grade={grade} compact={compact} />}
        {suffix && (
          <span
            className={clx(
              "truncate font-medium text-ui-fg-base",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

export default function EuTireLabel({
  label,
  className,
  compact = false,
}: EuTireLabelProps) {
  const noiseSuffix = label.noiseLevel
    ? `${label.noiseLevel.replace(/\s*dB$/i, "")}dB`
    : undefined

  const iconSize = compact ? "h-4 w-4" : "h-5 w-5"

  return (
    <div
      className={clx("flex gap-1.5", className)}
      aria-label="EU tire label"
    >
      <LabelCell
        icon={<FuelIcon className={iconSize} />}
        grade={label.fuel}
        compact={compact}
      />
      <LabelCell
        icon={<WetGripIcon className={iconSize} />}
        grade={label.wetGrip}
        compact={compact}
      />
      <LabelCell
        icon={<NoiseIcon className={iconSize} />}
        grade={label.noiseClass}
        suffix={noiseSuffix}
        compact={compact}
      />
    </div>
  )
}
