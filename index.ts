// Imports and setup
import { config, blockchainData } from '@imtbl/sdk';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface Metadata {
    token_id: string;
    name: string;
    image: string;
    description: string;
    external_url: string;
    animation_url: null;
    youtube_url: string;
    attributes: any[];
}

// Helper functions
function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${name}' not set`);
}

const API_KEY = getEnv('API_KEY');
const PUBLISHABLE_KEY = getEnv('PUBLISHABLE_KEY');
const CHAIN = getEnv('CHAIN');
const COLLECTION_ADDRESS = getEnv('COLLECTION_ADDRESS');
const MIN_TOKEN_ID = parseInt(getEnv('MIN_TOKEN_ID'), 10);
const MAX_TOKEN_ID = parseInt(getEnv('MAX_TOKEN_ID'), 10);
const METADATA_BASE_URL = getEnv('METADATA_BASE_URL');
const DELAY_MS = parseInt(getEnv('DELAY_MS', '300'));  // Default to 1000ms if not specified

const client = new blockchainData.BlockchainData({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    apiKey: API_KEY,
    publishableKey: PUBLISHABLE_KEY,
  },
});

// Function to fetch metadata
async function fetchMetadata(tokenId: number): Promise<Metadata | null> {
  const url = `${METADATA_BASE_URL}${tokenId}`;
  try {
    const response = await axios.get(url);
    return {
      token_id: tokenId.toString(),
      name: response.data.name,
      image: response.data.image,
      description: response.data.description,
      external_url: response.data.external_link,
      animation_url: null,
      youtube_url: response.data.youtube_url,
      attributes: [],
    };
  } catch (error) {
    console.error(`Failed to fetch metadata for token ID ${tokenId}:`, error);
    return null;
  }
}

// Function to process batches
async function refreshBatch(start: number, end: number): Promise<void> {
  const metadataPromises: Promise<Metadata | null>[] = [];
  for (let tokenId = start; tokenId <= end; tokenId++) {
    metadataPromises.push(fetchMetadata(tokenId));
    await new Promise(resolve => setTimeout(resolve, DELAY_MS)); // Delay between requests
  }
  const metadataResults = await Promise.all(metadataPromises);
  const filteredMetadata = metadataResults.filter((item): item is Metadata => item !== null);

  if (filteredMetadata.length > 0) {
    try {
      const response = await client.refreshNFTMetadata({
        chainName: CHAIN,
        contractAddress: COLLECTION_ADDRESS,
        refreshNFTMetadataByTokenIDRequest: { nft_metadata: filteredMetadata },
      });
      console.log(`Batch ${start}-${end} refreshed successfully`, response);
    } catch (error) {
      console.error(`Failed to refresh metadata for batch ${start}-${end}:`, error);
      throw error;  // Rethrow the error to be handled by the caller
    }
  }
}


// Main processing loop
(async function processAllBatches() {
  for (let i = MIN_TOKEN_ID; i <= MAX_TOKEN_ID; i += 10) {
    const end = Math.min(i + 9, MAX_TOKEN_ID);
    await refreshBatch(i, end);
  }
  console.log('Done processing all batches.');
})();
