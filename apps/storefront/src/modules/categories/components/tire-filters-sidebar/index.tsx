"use client"

import {
  getGradesForEuFilter,
  TIRE_EU_GRADE_FILTER_KEYS,
  TIRE_FILTER_PARAM_KEYS,
  TireFilterParamKey,
  TireSpecOptions,
} from "@lib/util/tire-filters"
import { Text, clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type TireFiltersSidebarProps = {
  specOptions: TireSpecOptions
}

const FILTER_LABELS: Record<TireFilterParamKey, string> = {
  brand: "Brand",
  model: "Model",
  width: "Width",
  height: "Aspect ratio",
  inch: "Rim (inch)",
  season: "Season",
  fuel_efficiency: "Fuel efficiency",
  wet_grip: "Wet grip",
  noise_class: "Noise class",
}

const isEuGradeFilterKey = (
  key: TireFilterParamKey
): key is (typeof TIRE_EU_GRADE_FILTER_KEYS)[number] =>
  (TIRE_EU_GRADE_FILTER_KEYS as readonly string[]).includes(key)

const selectClassName = clx(
  "w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2",
  "text-sm text-ui-fg-base",
  "focus:border-ui-border-interactive focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
)

export default function TireFiltersSidebar({
  specOptions,
}: TireFiltersSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setFilterParam = useCallback(
    (key: TireFilterParamKey, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    TIRE_FILTER_PARAM_KEYS.forEach((key) => params.delete(key))
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const hasActiveFilters = TIRE_FILTER_PARAM_KEYS.some((key) =>
    Boolean(searchParams.get(key))
  )

  const optionsForKey = (key: TireFilterParamKey): string[] => {
    switch (key) {
      case "brand":
        return specOptions.brands
      case "model":
        return specOptions.models
      case "width":
        return specOptions.widths
      case "height":
        return specOptions.heights
      case "inch":
        return specOptions.inches
      case "season":
        return specOptions.seasons
      case "fuel_efficiency":
        return [...getGradesForEuFilter("fuel_efficiency")]
      case "wet_grip":
        return [...getGradesForEuFilter("wet_grip")]
      case "noise_class":
        return [...getGradesForEuFilter("noise_class")]
      default:
        return []
    }
  }

  const euGradeHint = (key: (typeof TIRE_EU_GRADE_FILTER_KEYS)[number]) => {
    const grades = getGradesForEuFilter(key)
    const worst = grades[grades.length - 1]
    return `Up to ${worst} (A = best). Selecting ${worst} shows all.`
  }

  return (
    <aside
      className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-4 small:sticky small:top-20"
      data-testid="tire-filters-sidebar"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <Text className="txt-compact-medium-plus text-ui-fg-base">
          Tire filters
        </Text>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {TIRE_FILTER_PARAM_KEYS.map((key) => {
          const options = optionsForKey(key)
          if (options.length === 0) {
            return null
          }

          return (
            <div key={key}>
              <label
                htmlFor={`tire-filter-${key}`}
                className="mb-1.5 block text-xs font-medium text-ui-fg-subtle"
              >
                {FILTER_LABELS[key]}
              </label>
              <select
                id={`tire-filter-${key}`}
                value={searchParams.get(key) ?? ""}
                onChange={(e) => setFilterParam(key, e.target.value)}
                className={selectClassName}
                data-testid={`tire-filter-${key}`}
              >
                <option value="">All</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {isEuGradeFilterKey(key) && (
                <p className="mt-1 text-[10px] leading-snug text-ui-fg-muted">
                  {euGradeHint(key)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <Text className="mt-4 text-small-regular text-ui-fg-subtle">
        Cards show the variant matching size and EU label filters. Size: width,
        height, rim, season.
      </Text>
    </aside>
  )
}
