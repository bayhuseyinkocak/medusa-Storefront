import { Metadata } from "next"
import { notFound } from "next/navigation"

import { brand } from "@lib/brand"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ViewMode } from "@modules/store/components/view-mode-toggle"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    view?: ViewMode
    brand?: string
    model?: string
    width?: string
    height?: string
    inch?: string
    season?: string
    vehicle?: string
    speed_rating?: string
    load_index?: string
    fuel_efficiency?: string
    wet_grip?: string
    noise_class?: string
    dot?: string
    m_s?: string
    ice_grip?: string
    snow_condition?: string
  }>
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = `${productCategory.name} | ${brand.siteName}`
    const description =
      productCategory.description ?? `${productCategory.name} — ${brand.tagline}`

    return {
      title,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const {
    sortBy,
    page,
    view,
    brand,
    model,
    width,
    height,
    inch,
    season,
    vehicle,
    speed_rating,
    load_index,
    fuel_efficiency,
    wet_grip,
    noise_class,
    dot,
    m_s,
    ice_grip,
    snow_condition,
  } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      view={view}
      countryCode={params.countryCode}
      tireFilterSearchParams={{
        brand,
        model,
        width,
        height,
        inch,
        season,
        vehicle,
        speed_rating,
        load_index,
        fuel_efficiency,
        wet_grip,
        noise_class,
        dot,
        m_s,
        ice_grip,
        snow_condition,
      }}
    />
  )
}
