# Brand, region & i18n

## Current setup

| Setting | Value |
|---------|--------|
| Default market (URL) | `de` — `NEXT_PUBLIC_DEFAULT_REGION=de` |
| UI language | English (static copy in components) |
| Price format | `de-DE` by default (`src/lib/util/money.ts`) |
| Theme | Slate + rose, light/dark via `next-themes` |

## Germany-first

- Visitors without a country in the URL are redirected to `/de/...` when `de` exists in Medusa regions.
- Ensure Medusa Admin has a region that includes **Germany** (`iso_2: de`) with EUR pricing and your publishable API key’s sales channel.

## Future EU markets

Add countries in **Medusa Admin → Regions** (e.g. France, Italy, Spain). The storefront `CountrySelect` and middleware will pick them up automatically; URLs become `/fr/...`, `/it/...`, etc.

## Future multi-language UI

Planned approach (not implemented yet):

1. Add `next-intl` (or similar) for UI strings.
2. Keep Medusa `x-medusa-locale` for product/catalog translations.
3. Map country code to UI locale when needed (e.g. `de` → `en` UI + `de-DE` prices).

## Brand customization

Edit [`apps/storefront/src/lib/brand.ts`](../apps/storefront/src/lib/brand.ts) for site name, hero, footer, and SEO text.

Theme tokens: [`apps/storefront/src/styles/globals.css`](../apps/storefront/src/styles/globals.css).
