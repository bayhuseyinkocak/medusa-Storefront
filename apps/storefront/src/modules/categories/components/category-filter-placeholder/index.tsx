import { Text } from "@modules/common/components/ui"

const CategoryFilterPlaceholder = () => {
  return (
    <aside
      className="rounded-large border border-ui-border-base bg-ui-bg-subtle p-4 small:sticky small:top-20"
      data-testid="category-filters-placeholder"
    >
      <Text className="txt-compact-medium-plus text-ui-fg-base mb-2">
        Filters
      </Text>
      <Text className="text-small-regular text-ui-fg-subtle">
        Category-specific filters (brand, season, size, and more) will be
        available in a future update.
      </Text>
    </aside>
  )
}

export default CategoryFilterPlaceholder
