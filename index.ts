// Imports and setup
import { config, blockchainData } from '@imtbl/sdk'; // Import necessary components from the @imtbl/sdk package.
import axios from 'axios'; // Axios for making HTTP requests.
import * as dotenv from 'dotenv'; // Dotenv for loading environment variables from a .env file.

dotenv.config(); // Load environment variables from .env file into process.env.

// Define the Metadata interface to type-check metadata objects.
interface Metadata {
    token_id: string;
    name: string;
    image: string;
    description: string;
    external_url: string;
    animation_url: null;
    youtube_url: string;
    attributes: any[]; // This could be further typed based on expected attribute structure.
}

// Helper function to retrieve environment variables safely.
function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${name}' not set`); // Throw an error if the environment variable is not found.
}

// Read environment variables and parse numbers where necessary.
const API_KEY = getEnv('API_KEY');
const PUBLISHABLE_KEY = getEnv('PUBLISHABLE_KEY');
const CHAIN = getEnv('CHAIN');
const COLLECTION_ADDRESS = getEnv('COLLECTION_ADDRESS');
const MIN_TOKEN_ID = parseInt(getEnv('MIN_TOKEN_ID'), 10);
const MAX_TOKEN_ID = parseInt(getEnv('MAX_TOKEN_ID'), 10);
const METADATA_BASE_URL = getEnv('METADATA_BASE_URL');
const DELAY_MS = parseInt(getEnv('DELAY_MS', '300'));  // Default to 300ms if DELAY_MS is not specified.

// Initialize the blockchain data client with configuration from environment variables.
const client = new blockchainData.BlockchainData({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    apiKey: API_KEY,
    publishableKey: PUBLISHABLE_KEY,
  },
});

// Function to fetch metadata for a specific token ID.
async function fetchMetadata(tokenId: number): Promise<Metadata | null> {
  const url = `${METADATA_BASE_URL}${tokenId}`;
  try {
    const response = await axios.get(url); // Make an HTTP GET request to fetch metadata.
    return { // Return a structured object conforming to the Metadata interface.
      token_id: tokenId.toString(),
      name: response.data.name,
      image: response.data.image,
      description: response.data.description,
      external_url: response.data.external_link,
      animation_url: null, // No animation URL in response; defaults to null.
      youtube_url: response.data.youtube_url,
      attributes: [], // Empty attributes array; extend as needed.
    };
  } catch (error) {
    console.error(`Failed to fetch metadata for token ID ${tokenId}:`, error); // Log an error if the request fails.
    return null; // Return null to indicate failure.
  }
}

// Function to process batches of token IDs and refresh their metadata.
async function refreshBatch(start: number, end: number): Promise<void> {
  const metadataPromises: Promise<Metadata | null>[] = [];
  for (let tokenId = start; tokenId <= end; tokenId++) {
    metadataPromises.push(fetchMetadata(tokenId)); // Push each metadata fetch promise to an array.
    await new Promise(resolve => setTimeout(resolve, DELAY_MS)); // Introduce a delay between fetches to manage API rate limits.
  }
  const metadataResults = await Promise.all(metadataPromises); // Wait for all fetches to complete.
  const filteredMetadata = metadataResults.filter((item): item is Metadata => item !== null); // Filter out any null results.

  if (filteredMetadata.length > 0) {
    try {
      const response = await client.refreshNFTMetadata({
        chainName: CHAIN,
        contractAddress: COLLECTION_ADDRESS,
        refreshNFTMetadataByTokenIDRequest: { nft_metadata: filteredMetadata },
      });
      console.log(`Batch ${start}-${end} refreshed successfully`, response); // Log success message with response.
    } catch (error) {
      console.error(`Failed to refresh metadata for batch ${start}-${end}:`, error); // Log an error if the refresh fails.
      throw error;  // Rethrow the error to be handled by the caller.
    }
  }
}

// Main processing loop to handle all batches of token IDs.
(async function processAllBatches() {
  for (let i = MIN_TOKEN_ID; i <= MAX_TOKEN_ID; i += 10) {
    const end = Math.min(i + 9, MAX_TOKEN_ID); // Calculate the end of the current batch.
    await refreshBatch(i, end); // Process each batch.
  }
  console.log('Done processing all batches.'); // Log when all batches are processed.
})();
