// Core SDK imports latest version OK
import { createStarkSigner, generateLegacyStarkPrivateKey } from '@imtbl/core-sdk'

// Wallet provider
import { Wallet } from '@ethersproject/wallet';

//Input type for wallet creation
import { BytesLike } from 'ethers';

//Get env vars
import * as dotenv from 'dotenv'

// Http client for API interactions
import axios from 'axios'


// Env variable functions
dotenv.config()
function getEnv(name: string, defaultValue = undefined) {
  const value = process.env[name];

  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${name}' not set`);
}

function requireEnvironmentVariable(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Please ensure a value exists for ${key}`);
  }
  return value;
}

//Set constants from env vars
const ETH_PRIVATE_KEY: string = requireEnvironmentVariable('ETH_PRIVATE_KEY') as string;
const ETH_ADDRESS: string = requireEnvironmentVariable('ETH_ADDRESS') as string;
const ETH_NETWORK: string = requireEnvironmentVariable('ETH_NETWORK') as string;
const ALCHEMY_API_KEY: string = requireEnvironmentVariable('ALCHEMY_API_KEY') as string;

// Create ETH signer with ETH provate key as BytesLike
const ETH_SIGNER = new Wallet(ETH_PRIVATE_KEY as BytesLike)

//Generate Stark Private Key in legacy mode. Supported in latest 1.0.0 release
const STARK_PRIVATE_KEY = await generateLegacyStarkPrivateKey(ETH_SIGNER)

//Create a Stark Signer
const STARK_SIGNER = createStarkSigner(STARK_PRIVATE_KEY)

//Get public key from stark signer
const STARK_PUBLIC_KEY = STARK_SIGNER.getAddress()

// Get payloads from API with axios http client
let payloads = await axios('https://api.sandbox.x.immutable.com/v1/signable-registration-offchain', {
  method: 'POST',
  data: {
    ether_key: ETH_ADDRESS.toLowerCase(),
    stark_key: STARK_PUBLIC_KEY
  },
  headers: {
    "Content-Type": "application/json"
  }
})

//Sign the payloads with relevant signer
const l2_signature = await STARK_SIGNER.signMessage(payloads.data['payload_hash'])
const l1_signature = await ETH_SIGNER.signMessage(payloads.data['signable_message'])

// Human Friendly Output
console.log("\n------------------------- INPUT VALUES ----------------------------\n")
console.log("ETH Public Key (Address): \t" + ETH_ADDRESS)
console.log("ETH Private Key: \t\t" + ETH_PRIVATE_KEY)
console.log("ETH Network: \t\t\t" + ETH_NETWORK)
console.log("Alchemy API Key: \t\t" + ALCHEMY_API_KEY + "\n")
console.log("------------------------- STARK WALLET ----------------------------\n")
console.log("Stark Public Key: \t\t" + STARK_PUBLIC_KEY)
console.log("Stark Private Key: \t\t" + STARK_PRIVATE_KEY + "\n")
console.log("------------------------- TO BE SIGNED ----------------------------\n")
console.log("Stark L2 Payload Hash: \t\t" + payloads.data['payload_hash'])
console.log("ETH L1 Message: \t\t" + payloads.data['signable_message'] + "\n")
console.log("------------------------- SIGNATURES ------------------------------\n")
console.log("STARK L2 Signature: \t\t" + l2_signature)
console.log("ETH L1 Signature: \t\t" + l1_signature + "\n")
