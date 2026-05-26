"use client"

import {
  getGradesForEuFilter,
  isMetadataTruthy,
  TIRE_BOOLEAN_FILTER_KEYS,
  TIRE_EU_GRADE_FILTER_KEYS,
  TIRE_FILTER_PARAM_KEYS,
  TIRE_SELECT_FILTER_PARAM_KEYS,
  TireBooleanFilterKey,
  TireSelectFilterParamKey,
  TireSpecOptions,
} from "@lib/util/tire-filters"
import { Text, clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type TireFiltersSidebarProps = {
  specOptions: TireSpecOptions
}

const SELECT_FILTER_LABELS: Record<TireSelectFilterParamKey, string> = {
  brand: "Brand",
  model: "Model",
  width: "Width",
  height: "Aspect ratio",
  inch: "Rim (inch)",
  season: "Season",
  vehicle: "Vehicle type",
  speed_rating: "Speed rating",
  load_index: "Load index",
  fuel_efficiency: "Fuel efficiency",
  wet_grip: "Wet grip",
  noise_class: "Noise class",
}

const BOOLEAN_FILTER_LABELS: Record<TireBooleanFilterKey, string> = {
  dot: "DOT marked",
  m_s: "M+S",
  ice_grip: "Ice grip",
  snow_condition: "Snow condition",
}

const isEuGradeFilterKey = (
  key: TireSelectFilterParamKey
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
    (key: TireSelectFilterParamKey, value: string) => {
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

  const setBooleanFilter = useCallback(
    (key: TireBooleanFilterKey, enabled: boolean) => {
      const params = new URLSearchParams(searchParams.toString())
      if (enabled) {
        params.set(key, "1")
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

  const hasActiveFilters = TIRE_FILTER_PARAM_KEYS.some((key) => {
    const value = searchParams.get(key)
    if (!value) {
      return false
    }
    if ((TIRE_BOOLEAN_FILTER_KEYS as readonly string[]).includes(key)) {
      return isMetadataTruthy(value)
    }
    return true
  })

  const optionsForKey = (key: TireSelectFilterParamKey): string[] => {
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
      case "vehicle":
        return specOptions.vehicles
      case "speed_rating":
        return specOptions.speedRatings
      case "load_index":
        return specOptions.loadIndices
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

  const isBooleanFilterChecked = (key: TireBooleanFilterKey): boolean =>
    isMetadataTruthy(searchParams.get(key))

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
        {TIRE_SELECT_FILTER_PARAM_KEYS.map((key) => {
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
                {SELECT_FILTER_LABELS[key]}
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

        <div className="border-t border-ui-border-base pt-4">
          <Text className="mb-3 text-xs font-medium text-ui-fg-subtle">
            Features
          </Text>
          <div className="flex flex-col gap-2.5">
            {TIRE_BOOLEAN_FILTER_KEYS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm text-ui-fg-base"
              >
                <input
                  type="checkbox"
                  checked={isBooleanFilterChecked(key)}
                  onChange={(e) => setBooleanFilter(key, e.target.checked)}
                  className="h-4 w-4 rounded border-ui-border-base accent-rose-600"
                  data-testid={`tire-filter-${key}`}
                />
                <span>{BOOLEAN_FILTER_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <Text className="mt-4 text-small-regular text-ui-fg-subtle">
        Checkboxes show only tires where the feature is true. Unchecked means no
        filter on that feature.
      </Text>
    </aside>
  )
}
