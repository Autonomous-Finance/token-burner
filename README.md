# Token Burner

> **⚠️ ARCHIVED PROJECT**  
> This repository is **no longer maintained** and has been archived. It is provided as-is for historical reference and educational purposes.

A token burning service built on [AO](https://ao.arweave.dev/), originally developed by **AF (Autonomous Finance)**.

## Overview

Token Burner is a service that allows users to permanently burn tokens by transferring them to a null address. The system tracks per-user burned balances, total burned amounts per token, and burn history (including LP token burns).

## Project Structure

- `ao/backend/` — Lua process deployed to AO
- `apps/frontend/` — React + Vite web app

## Backend

Lua process that permanently burns tokens by transferring them to a null address. Tracks:
- Per-user burned balances
- Total burned amounts per token
- Burn history (including LP token burns)

## Frontend

React/TypeScript app for interacting with the burner process. Uses Vite for bundling.

## Development

```bash
# Install dependencies
bun install

# Run frontend development server
bun run frontend:dev

# Deploy backend
bun run backend:deploy

# Deploy frontend
bun run frontend:deploy
```

**Note:** Deployments require `WALLET_JSON` environment variable to be set.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Disclaimer

This project is archived and no longer actively maintained. Use at your own risk.
