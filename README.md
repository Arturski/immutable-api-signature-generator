<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

## Generate Signatures for Manual API usage
This script will generate signatures for manual API use. Use this if you wish to make an Immutable API call which requires either of the following:
* eth_signature : a signature of a L1 payload
* stark_signature: a signature of a L2 payload

# Prerequisites

* Node 16+

# Usage

```bash
cd ./generateAPISignature
ts-node --esm ./index.ts
```

# Expected Output

```bash
------------------------- INPUT VALUES ----------------------------

ETH Public Key (Address):       {PUBLICKEY}
ETH Private Key:                {PRIVATE_KEY}
ETH Network:                    {ETH_NETWORK}
Alchemy API Key:                {ALCHEMY_API}

------------------------- STARK WALLET ----------------------------

Stark Public Key:               {STARK_PUBLIC_KEY}
Stark Private Key:              {STARK_PRIVATE_KEY}

------------------------- TO BE SIGNED ----------------------------

Stark L2 Payload Hash:          {STARK_PAYLOAD}
ETH L1 Message:                 {ETH_PAYLOAD}

------------------------- SIGNATURES ------------------------------

STARK L2 Signature:             {STARK_SIGNATURE}
ETH L1 Signature:               {ETH_SIGNATURE}
```