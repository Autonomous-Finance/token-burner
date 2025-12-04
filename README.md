# Token Burner

A token burning service built on [AO](https://ao.arweave.dev/).

## Structure

- `ao/backend/` — Lua process deployed to AO
- `apps/frontend/` — React + Vite web app

## Backend

Lua process that permanently burns tokens by transferring them to a null address. Tracks:
- Per-user burned balances
- Total burned amounts per token
- Burn history (including LP token burns)

## Frontend

React/TypeScript app for interacting with the burner process. Uses Vite for bundling.

## Quick Start

```bash
bun install

# Development
bun run frontend:dev

# Deploy
bun run backend:deploy
bun run frontend:deploy
```

Requires `WALLET_JSON` env var set for deployments.
