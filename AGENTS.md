# AGENTS.md — Medusa project

## Project overview

storefront-2 — Medusa e-commerce backend and storefront.

**Stack:** Medusa v2, TypeScript, Node.js, React (admin/storefront as applicable)

Canonical agent config: `ai/`  

## Medusa AI docs

- Index: https://docs.medusajs.com/llms.txt
- Full docs: https://docs.medusajs.com/llms-full.txt
- Guide: https://docs.medusajs.com/learn/introduction/build-with-llms-ai/ai-friendly-docs
- Agent skills: https://docs.medusajs.com/learn/introduction/build-with-llms-ai/agentic-skills

## Commands

| Action | Command |
|--------|---------|
| Install storefront | `cd apps/storefront && pnpm install` |
| Dev storefront | `cd apps/storefront && pnpm dev` |
| Install (root) | `pnpm install` |
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Test | `pnpm test` |
| DB migrate | `npx medusa db:migrate` |
| Sync IDE adapters | `ide-agent sync` |
| Pull vendor skills | `ide-agent pull-skills` |
| Health check | `ide-agent doctor` |

## Medusa conventions

- Follow Medusa module/workflow/API patterns from official docs
- Use existing project structure for modules, services, and routes
- Run migrations after schema changes
- Do not expose admin secrets in client code

## PR guidelines

- Run tests before committing
- Document breaking API changes
- Update skill index when adding domain skills

## Skills index

| Skill | When to use |
|-------|-------------|
| `dev-toolkit` | CLI commands for this Medusa project |
| `medusa-dev` | Medusa backend, admin, storefront development (vendor) |
| `nextjs-react-expert` and  `nodejs-best-practices` | for nextjs |

Vendor skills are pulled to `ai/skills/vendor/medusa-dev/` via `ide-agent pull-skills`.

Detailed rules: `ai/rules/`  
Workflows: `ai/workflows/`

Run `ide-agent sync` after editing canonical files.
