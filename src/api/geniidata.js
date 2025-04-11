import { Secrets } from '../config/secrets.js';
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Assuming middleware handles fetch

// This assumes you have the @api/geniidata library installed or available
// If not, you'll need to implement fetch calls to their REST API directly.
// Example using a hypothetical direct fetch:

const BASE_URL = 'https://api.geniidata.com'; // Or similar

// Helper function to construct URL
function apiUrl(path) {
  // Ensure leading slash if path doesn't have one, and handle potential base URL trailing slash
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

async function fetchGeniiData(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${query ? '?' + query : ''}`;
    console.log(`[GeniiData API] Fetching: ${url}`);
    try {
        // Using ApiMiddleware for centralized handling
        const response = await ApiMiddleware.request(url, {
            method: 'GET',
            headers: {
                 // GeniiData uses an API Key, often in a header like 'X-API-KEY' or 'Authorization'
                 ...(Secrets.geniiDataApiKey && { 'X-API-KEY': Secrets.geniiDataApiKey }), // Adjust header name as needed
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`GeniiData API error! Status: ${response.status} for ${endpoint}. Body: ${errorBody}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`[GeniiData API] Failed to fetch ${endpoint}:`, error);
        throw error; // Re-throw for the service layer
    }
}

// Based on https://www.geniidata.com/api-docs/runes
export const GeniiDataAPI = {
    /**
     * Fetches a list of runes from GeniiData.
     * Assumed Endpoint: /api/v1/runes/list (VERIFY)
     * @param {object} params - Optional parameters (e.g., { page: 1, limit: 50 })
     */
    async fetchRuneList(params = {}) {
        console.log(`[GeniiData API] Fetching rune list...`, params);
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/api/v1/runes/list${queryParams ? '?' + queryParams : ''}`; // VERIFY PATH
        try {
            // ApiMiddleware handles fetch, headers (inc. X-API-Key), retries, errors
            const data = await ApiMiddleware.request(apiUrl(endpoint));
            // Check if data is nested, e.g., data.result?.list
            return data; 
        } catch (error) {
            console.error('[GeniiData API] Error fetching rune list:', error);
            throw error; // Re-throw for the service layer
        }
    },

    /**
     * Fetches detailed information for a specific rune by its name or ID.
     * Assumed Endpoint: /api/v1/runes/info/{idOrName} (VERIFY)
     * @param {string} idOrName - The rune's ID or name.
     */
    async fetchRuneInfo(idOrName) {
        if (!idOrName) {
            throw new Error('[GeniiData API] Rune ID or Name is required for fetchRuneInfo');
        }
        console.log(`[GeniiData API] Fetching info for rune: ${idOrName}`);
        const endpoint = `/api/v1/runes/info/${encodeURIComponent(idOrName)}`; // VERIFY PATH
        try {
            const data = await ApiMiddleware.request(apiUrl(endpoint));
            // Check if data is nested, e.g., data.result
            return data;
        } catch (error) {
            console.error(`[GeniiData API] Error fetching info for rune ${idOrName}:`, error);
            throw error; // Re-throw
        }
    },

    /**
     * Fetches holder information for a specific rune.
     * Assumed Endpoint: /api/v1/runes/holders/{idOrName} (VERIFY)
     * @param {string} idOrName - The rune's ID or name.
     * @param {object} params - Optional parameters (e.g., { page: 1, limit: 100 })
     */
    async fetchRuneHolders(idOrName, params = {}) {
        if (!idOrName) {
            throw new Error('[GeniiData API] Rune ID or Name is required for fetchRuneHolders');
        }
        console.log(`[GeniiData API] Fetching holders for rune: ${idOrName}`, params);
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/api/v1/runes/holders/${encodeURIComponent(idOrName)}${queryParams ? '?' + queryParams : ''}`; // VERIFY PATH
        try {
            const data = await ApiMiddleware.request(apiUrl(endpoint));
            // Check if data is nested, e.g., data.result?.holders
            return data;
        } catch (error) {
            console.error(`[GeniiData API] Error fetching holders for rune ${idOrName}:`, error);
            throw error; // Re-throw
        }
    },
    
    // Add other GeniiData endpoints as needed
};

export default GeniiDataAPI; 