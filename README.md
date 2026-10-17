# MicroMove

**Small savings. Smarter moves.**

MicroMove is a lightweight personal-finance prototype built with Node.js, Express, vanilla JavaScript, and the [Nessie simulated banking API](https://www.nessieisreal.com/). It reviews sandbox account activity, reserves money for near-term bills and a basic spending buffer, suggests a small optional savings increment, and explains where that increment could go next.

> **Important:** MicroMove is an educational prototype, not financial advice. Nessie provides simulated banking data. The app only recommends and previews savings; it does not transfer money.

## Features

- **Cash-flow-aware microsavings:** estimates a conservative amount after upcoming bills and a seven-day spending buffer.
- **Goal-based recommendations:** choose an emergency fund, a personal goal, or debt payoff.
- **Upcoming bills:** summarizes unpaid bills due in the next 14 days when the API provides usable dates and statuses.
- **Visual dashboard:** shows key figures, a simple chart, and illustrative weekly/monthly/yearly savings arithmetic.
- **Demo mode:** explore the dashboard with fictional data without an API key.
- **Server-side API key:** keeps Nessie credentials out of browser code.
- **Automated checks:** includes calculation tests and a GitHub Actions CI workflow.

## Preview

Start the app and select **Try demo** to view the dashboard with fictional account activity.

## Requirements

- Node.js **18.17+** (includes the built-in `fetch` API and `node:test`)
- A Nessie sandbox API key to load your own simulated account data; demo mode does not require one

## Run locally

1. Clone the repository and enter its directory:

   ```bash
   git clone https://github.com/YOUR-USERNAME/micromove.git
   cd micromove
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   Add your sandbox key to `NESSIE_API_KEY` in `.env`. You can request a key through the [Nessie getting-started guide](https://www.nessieisreal.com/getting-started). Never commit `.env` or share your key.

4. Start the app:

   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000), then choose **Try demo** or enter a Nessie account ID and select **Load account**.

For automatic server restarts during development, run `npm run dev`.

## Configuration

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NESSIE_API_KEY` | For live sandbox data | — | Server-side Nessie API key |
| `NESSIE_BASE_URL` | No | `https://api.nessieisreal.com` | Nessie API base URL |
| `PORT` | No | `3000` | Local server port |
| `NESSIE_TIMEOUT_MS` | No | `8000` | Timeout for each Nessie request |

## API endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Returns server health and whether a Nessie key is configured (never returns the key) |
| `GET /api/customers` | Lists customers from the configured Nessie sandbox |
| `GET /api/accounts/:accountId/plan?goal=emergency` | Builds a plan for an account; `goal` can be `emergency`, `goal`, or `debt` |
| `GET /api/demo-plan` | Returns a plan built from fictional demo records |

The account plan endpoint reads the account, purchases, deposits, withdrawals, and bills. Refer to the [Nessie API documentation](https://prod.nessieisreal.com/docs) if your sandbox's response shape differs.

## How the estimate works

1. Add purchases and withdrawals from the last 30 days to estimate recent spending.
2. Add deposits from the last 30 days to estimate recent income.
3. Identify unpaid bills due in the next 14 days.
4. Reserve those bills plus a spending buffer equal to the greater of **$50** or seven days of estimated spending.
5. If money remains, suggest a small contribution capped at **$10**. The dashboard previews the effect; it does not move money.
6. Recommend keeping the money in checking if the estimated bills and buffer are not covered. Otherwise, use the selected savings priority.

This is deliberately a simple heuristic, not a predictive financial model. Missing or incorrectly classified transactions can make the estimate inaccurate. Always verify records and assumptions before making financial decisions.

## Tests and checks

```bash
npm run check
npm test
```

The tests cover savings calculations, bill date/status filtering, goal priorities, invalid amounts, and invalid account data. GitHub Actions runs syntax checks and tests on Node.js 18, 20, and 22 for pushes and pull requests.

## Security and privacy

- Keep `NESSIE_API_KEY` in `.env` locally and in a secret manager for deployment.
- Never put secrets in frontend JavaScript, commits, screenshots, or issue reports.
- Use only Nessie's simulated data with this prototype. Do not use real account credentials or sensitive financial records.
- The app does not make transfers or guarantee that a suggested amount is safe.
- See [SECURITY.md](SECURITY.md) for reporting concerns.

## Contributing

Contributions and issue reports are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), run the checks, and include tests for changes to savings calculations or API behavior.

## License

Released under the [MIT License](LICENSE).
