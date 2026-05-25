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
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region country code (e.g. `en`) |
| `NEXT_PUBLIC_BASE_URL` | Storefront URL (default `http://localhost:8000`) |

Get the publishable key from Admin → Settings → API Key Management.

### Backend CORS

Ensure your Medusa backend allows the storefront origin:

```bash
STORE_CORS=http://localhost:8000
```

## Agent configuration

Canonical config lives in `ai/`. After edits run:

```bash
ide-agent sync
```

See [AGENTS.md](./AGENTS.md) for commands and skills index.
