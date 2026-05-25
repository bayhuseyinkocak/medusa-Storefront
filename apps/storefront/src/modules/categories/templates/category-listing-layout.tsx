import { ReactNode } from "react"

type CategoryListingLayoutProps = {
  sidebar: ReactNode
  children: ReactNode
}

const CategoryListingLayout = ({
  sidebar,
  children,
}: CategoryListingLayoutProps) => {
  return (
    <div className="grid grid-cols-1 gap-8 py-6 small:grid-cols-[260px_1fr] small:items-start">
      <div className="small:min-w-[260px]">{sidebar}</div>
      <div className="w-full min-w-0">{children}</div>
    </div>
  )
}

export default CategoryListingLayout
