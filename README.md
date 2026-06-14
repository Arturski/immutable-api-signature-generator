# Immutable zkEVM — NFT Metadata Refresher

A small TypeScript script that bulk-refreshes NFT metadata on **Immutable zkEVM** by token ID. It walks a token-ID range, fetches each token's metadata from a base URL, and asks the Immutable [Blockchain Data API](https://docs.immutable.com/) to refresh it — printing the API's rate-limit/refresh budget as it goes.

Useful when you've updated the off-chain metadata for a collection and need Immutable's indexer to pick up the changes.

## Prerequisites

* Node 18+
* An Immutable Hub project ([hub.immutable.com](https://hub.immutable.com/)) — you'll need a **secret API key** and a **publishable key**

## Setup

```bash
npm install
cp .env.example .env   # then fill in your values
```

| Variable | Purpose |
| --- | --- |
| `API_KEY` | Immutable **secret** API key (server-side; keep private) |
| `PUBLISHABLE_KEY` | Immutable publishable key |
| `CHAIN` | Chain name, e.g. `imtbl-zkevm-testnet` |
| `COLLECTION_ADDRESS` | The collection contract address |
| `MIN_TOKEN_ID` / `MAX_TOKEN_ID` | Token-ID range to refresh (inclusive) |
| `METADATA_BASE_URL` | Base URL the metadata is read from (`<base><tokenId>`) |
| `DELAY_MS` | Delay between requests (default `300`) to stay under rate limits |

> ⚠️ `API_KEY` is a secret. It lives only in `.env` (git-ignored) — never commit it.

## Usage

```bash
node --loader ts-node/esm index.ts
```

## Expected output

```text
publishable key:  pk_imapik-test-************
api key:          ********************************
{
  imx_refresh_limit_reset: '2024-04-16 11:06:07 +0000 UTC',
  imx_refreshes_limit:     '677',
  imx_remaining_refreshes: '675',
  retry_after:             '9.61-seconds'
}
done
```

## License

[MIT](LICENSE)
