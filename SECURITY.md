# Security policy

## Supported versions

Security fixes are intended for the latest version on the default branch.

## Reporting a vulnerability

Please do not publish API keys, account details, transaction data, or exploit details in a public issue. Contact the repository owner privately through the security contact configured in the GitHub repository. If no private contact is configured, ask the owner to enable GitHub private vulnerability reporting.

## Project safeguards

- Keep `NESSIE_API_KEY` in the server-side `.env` file or deployment secret store.
- Never commit `.env` or paste secrets into issues, pull requests, screenshots, or logs.
- MicroMove uses simulated Nessie data and does not initiate transfers.
