/**
 * Central brand configuration — update siteName when the final brand is decided.
 */
export const brand = {
  siteName: "AutoParts EU",
  tagline: "Wheels, tires & car accessories for Europe",
  description:
    "Premium wheels, tires and automotive accessories. Shipping across Germany and the EU.",

  hero: {
    title: "Wheels, tires & car accessories",
    subtitle:
      "Quality parts for your vehicle — curated selection, fast delivery across Germany.",
    ctaLabel: "Shop now",
    ctaHref: "/store",
  },

  footer: {
    tagline: "Your trusted source for wheels, tires and automotive accessories.",
    copyrightName: "AutoParts EU",
    links: [
      { label: "About", href: "/store" },
      { label: "Shipping", href: "/store" },
      { label: "Contact", href: "/account" },
    ] as const,
  },

  nav: {
    shopLabel: "Shop",
  },
} as const

export type Brand = typeof brand
