import { Metadata } from "next"

import { brand } from "@lib/brand"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ViewMode } from "@modules/store/components/view-mode-toggle"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: `Shop | ${brand.siteName}`,
  description: brand.description,
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    view?: ViewMode
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, view } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      view={view}
      countryCode={params.countryCode}
    />
  )
}
