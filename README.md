# Trestly

[![CI](https://github.com/Trestly-team/trestly-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Trestly-team/trestly-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Network: Stellar Testnet](https://img.shields.io/badge/network-Stellar%20Testnet-7B4DFF)](https://stellar.expert/explorer/testnet)

**A refund-aware escrow layer for x402 payments on Stellar.**

Trestly protects buyers when an x402-powered API or service does not deliver. Instead of settling a payment immediately and irrevocably, it holds funds in a Soroban escrow contract for a short dispute window. Undisputed funds can then be released to the seller; disputed funds are resolved by a named arbiter.

**[Open the live app](https://trestly.vercel.app)** · **[Read the docs](docs/README.md)** · **[View the testnet contract](https://stellar.expert/explorer/testnet/contract/CBL4JVIPQBSTGUUVQRZXHDCGCVDPN3N4MHJKKY4MZSM2ZBILIIUJR6WD)**

> **Testnet project.** Trestly is ready for testnet demonstrations and review, not for mainnet value. See [current limitations](#current-limitations).

## How it works

```text
Buyer ── create payment ──> Trestly Soroban escrow <── release ── Seller
                                      │
                              dispute during window
                                      │
                                   Arbiter resolves
                                ┌─────┴─────┐
                             refund buyer  pay seller
```

1. The buyer creates an escrow payment for a seller, token, amount, dispute window, and arbiter.
2. Before the window closes, the buyer can raise a dispute.
3. After an undisputed window closes, **any account can submit** the public `release` transaction to pay the seller. The contract does not execute by itself.
4. If disputed, only the configured arbiter can resolve it by refunding the buyer or paying the seller.

## This repository

This is Trestly's wallet-connected Next.js frontend. It lets a user connect Freighter, create payments, inspect their on-chain state, raise disputes, and submit release or arbiter-resolution transactions when authorized.

| Repository | Purpose |
| --- | --- |
| [trestly-contract](https://github.com/Trestly-team/trestly-contract) | Soroban escrow contract and Rust test suite |
| [trestly-sdk](https://github.com/Trestly-team/trestly-sdk) | TypeScript transaction-building SDK |
| **trestly-app** | This web application and GitBook documentation source |

**Deployed testnet contract:** [`CBL4JVIPQBSTGUUVQRZXHDCGCVDPN3N4MHJKKY4MZSM2ZBILIIUJR6WD`](https://stellar.expert/explorer/testnet/contract/CBL4JVIPQBSTGUUVQRZXHDCGCVDPN3N4MHJKKY4MZSM2ZBILIIUJR6WD)

## Quick start

### Prerequisites

- Node.js 22 or newer
- A [Freighter](https://www.freighter.app/) wallet set to **Stellar Testnet**
- Testnet XLM from [Friendbot](https://friendbot.stellar.org)

### Run locally

```bash
git clone https://github.com/Trestly-team/trestly-app.git
cd trestly-app
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), unlock Freighter, and connect your testnet wallet.

### Environment variables

Set these in `.env.local` locally and in Vercel for every environment where you expect users to submit transactions:

```dotenv
NEXT_PUBLIC_CONTRACT_ID=CBL4JVIPQBSTGUUVQRZXHDCGCVDPN3N4MHJKKY4MZSM2ZBILIIUJR6WD
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

`NEXT_PUBLIC_USDC_CONTRACT_ID` is optional. The app accepts a token contract address per payment, so it does not require a fixed USDC address. Never put a secret key or private credential in a `NEXT_PUBLIC_*` variable.

For a full walkthrough, see [Local setup](docs/developer/local-setup.md) and [environment variables](docs/developer/environment-variables.md).

## Development and verification

```bash
npm run dev      # start the local development server
npm run lint     # run ESLint
npm run build    # produce an optimized production build
```

Pull requests and pushes to `main` run lint and production-build checks in GitHub Actions. The companion contract has 12 Rust tests, and the SDK has TypeScript tests covering its transaction and parsing helpers. See [Testing](docs/developer/testing.md) for the complete verification flow.

## Documentation

The [`docs/`](docs/README.md) directory is the GitBook-ready project documentation. Start with:

- [What is Trestly?](docs/introduction/what-is-trestly.md)
- [Architecture](docs/introduction/architecture.md)
- [Escrowed payments](docs/concepts/escrowed-payments.md)
- [Connect a wallet](docs/using/connecting-your-wallet.md)
- [Create a payment](docs/using/creating-a-payment.md)
- [Contract reference](docs/developer/contract-reference.md)
- [SDK reference](docs/developer/sdk-reference.md)
- [x402 integration](docs/developer/x402-integration.md)
- [Deployment guide](docs/developer/deployment.md)

## Current limitations

- **Testnet only:** do not use for mainnet funds.
- **No independent security audit:** review and audit the contract before any mainnet deployment.
- **Single arbiter:** a payment trusts its configured arbiter to decide a dispute fairly.
- **No automatic release agent:** someone must submit the public release transaction after the dispute window.
- **No payment indexer:** this frontend fetches a payment by its on-chain ID; it does not provide account-wide history.
- **SDK package pending:** the SDK is versioned source and build output, not yet published to npm.

## Contributing

Issues, documentation improvements, tests, and integrations are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Licensed under the [MIT License](LICENSE).

## Security

Review the [security policy](SECURITY.md) before reporting a vulnerability or
using this testnet reference app with a wallet.
