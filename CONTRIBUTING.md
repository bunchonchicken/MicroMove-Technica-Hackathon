# Contributing to MicroMove

Thanks for helping improve MicroMove!

## Before you start

- Use Node.js 18.17 or newer.
- Create a local `.env` from `.env.example`; never commit API keys or real personal financial data.
- Keep the app in Nessie's simulated environment. This project must not make real transfers.

## Development

```bash
npm install
npm run dev
```

## Validate your changes

```bash
npm run check
npm test
```

Please add or update tests for changes to savings calculations, bill handling, API validation, or error behavior. Keep recommendations explainable and conservative, and document assumptions that affect a user's cash-flow estimate.

## Pull requests

- Describe the problem and the change.
- Include steps to reproduce or verify it.
- Note any assumptions or limitations.
- Do not include `.env`, API keys, credentials, account IDs, or sensitive transaction data.
