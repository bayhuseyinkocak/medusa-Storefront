---
id: medusa-backend
description: Medusa backend module and API conventions
globs: "**/src/**/*.{ts,js}"
alwaysApply: false
---

# Medusa backend

- Place custom modules under the project's modules directory
- Use Medusa workflows for multi-step business logic
- Follow existing naming for services, repositories, and routes
- Run `npx medusa db:migrate` after data model changes

Reference: https://docs.medusajs.com/learn/introduction/build-with-llms-ai/ai-friendly-docs
