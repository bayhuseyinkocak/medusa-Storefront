---
id: core
description: Core Medusa project conventions
alwaysApply: true
---

# Core Medusa conventions

- Consult Medusa docs for API and module patterns
- Prefer extending existing modules over duplicating logic
- Use TypeScript strict mode
- Run `ide-agent sync` after changing `ai/` files

## Security

- Never commit API keys or `.env` files
- Validate user input at API boundaries
