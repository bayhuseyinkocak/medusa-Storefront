# storefront-2

Medusa v2 Next.js storefront with project agent/skill configuration.

## Prerequisites

- Node.js 20+
- pnpm
- Medusa backend running at `http://localhost:9000`

## Storefront setup

```bash
cd apps/storefront
cp .env.template .env.local   # first time only
pnpm install
pnpm dev
```

Open [http://localhost:8000](http://localhost:8000).

### Environment variables

Configure `apps/storefront/.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Medusa API URL (default `http://localhost:9000`) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from Medusa Admin |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default market country code (e.g. `de` for Germany) |
| `NEXT_PUBLIC_BASE_URL` | Storefront URL (default `http://localhost:8000`) |

Get the publishable key from Admin → Settings → API Key Management.

### Backend CORS

Ensure your Medusa backend allows the storefront origin:

```bash
STORE_CORS=http://localhost:8000
```

## Category listing

- Layout, toolbar (sort / grid-list), and tires/wheels product cards: [`docs/category-listing.md`](docs/category-listing.md)
- Example: http://localhost:8000/de/categories/tires

## Brand & theme

- Brand copy: [`apps/storefront/src/lib/brand.ts`](apps/storefront/src/lib/brand.ts)
- Colors: slate + rose tokens in [`apps/storefront/src/styles/globals.css`](apps/storefront/src/styles/globals.css)
- Dark/light mode: header theme toggle (`next-themes`)
- Region & i18n notes: [`docs/brand-i18n.md`](docs/brand-i18n.md)

## Agent configuration

Canonical config lives in `ai/`. After edits run:

```bash
ide-agent sync
```

See [AGENTS.md](./AGENTS.md) for commands and skills index.
