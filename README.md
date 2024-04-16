<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

## Generate Signatures for Manual API usage
This script is a basic example of refreshing NFT metadata by token ID on Immutable zkEVM.

# Prerequisites

* Node 18+

# Usage

```bash
npm i
node --loader ts-node/esm index.ts
```

# Expected Output

```bash
publishable key:  pk_imapik-test-plBJzGKaGo5ZnoTosuOo
api key:  **********************************
{
  imx_refresh_limit_reset: '2024-04-16 11:06:07.401553 +0000 UTC',
  imx_refreshes_limit: '677',
  imx_remaining_refreshes: '675',
  retry_after: '9.61-seconds'
}
done
```