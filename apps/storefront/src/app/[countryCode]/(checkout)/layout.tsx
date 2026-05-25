import { brand } from "@lib/brand"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ThemeToggle from "@modules/layout/components/theme-toggle"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full min-h-screen bg-ui-bg-base small:min-h-screen">
      <div className="h-16 border-b border-ui-border-base bg-ui-bg-base/80 backdrop-blur-md">
        <nav className="content-container flex h-full items-center justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex flex-1 basis-0 items-center gap-x-2 uppercase"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="txt-compact-plus mt-px hidden text-ui-fg-subtle hover:text-ui-fg-interactive small:block">
              Back to shopping cart
            </span>
            <span className="txt-compact-plus mt-px block text-ui-fg-subtle hover:text-ui-fg-interactive small:hidden">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus uppercase text-ui-fg-base hover:text-ui-fg-interactive transition-colors"
            data-testid="store-link"
          >
            {brand.siteName}
          </LocalizedClientLink>
          <div className="flex flex-1 basis-0 items-center justify-end gap-x-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
