import { Secrets } from '../config/secrets.js';
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Assuming middleware handles fetch

const BASE_URL = 'https://api-mainnet.magiceden.io/v2/ord/btc/runes'; // Base URL for Runes endpoints

async function fetchMagicEden(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${query ? '?' + query : ''}`;
    console.log(`[MagicEden API] Fetching: ${url}`);
    try {
        // Using ApiMiddleware for potential retries, centralized error handling, etc.
        const response = await ApiMiddleware.request(url, {
            method: 'GET',
            headers: {
                // Magic Eden typically uses an Authorization Bearer token
                ...(Secrets.magicEdenApiKey && { 'Authorization': `Bearer ${Secrets.magicEdenApiKey}` }),
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            const errorBody = await response.text(); // Try to get error details
            throw new Error(`Magic Eden API error! Status: ${response.status} for ${endpoint}. Body: ${errorBody}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`[MagicEden API] Failed to fetch ${endpoint}:`, error);
        throw error; // Re-throw for the service layer
    }
}

// Based on https://docs.magiceden.io/reference/ordinals-runes-api
export const MagicEdenAPI = {
    fetchRuneInfo: async (runeIdentifier) => {
        // Endpoint: /market/rune_info
        // Requires runeName or runeId, adjust based on what idOrName represents
        // Example assumes runeIdentifier could be name or id, might need separate params
        return fetchMagicEden(`/market/rune_info`, { runeIdentifier });
    },
    fetchRuneActivity: async (runeIdentifier, params = {}) => {
         // Endpoint: /activities/rune
         // Params like: kind[], runeIdentifier, limit, offset
         return fetchMagicEden(`/activities/rune`, { runeIdentifier, ...params });
    },
    fetchWalletActivity: async (address, params = {}) => {
         // Endpoint: /wallet/activities/address
         // Params like: kind[], address, limit, offset
         return fetchMagicEden(`/wallet/activities/${encodeURIComponent(address)}`, params);
    },
    fetchTokenOrders: async (runeIdentifier, params = {}) => {
         // Endpoint: /orders/rune
         // Params like: runeIdentifier, orderKind (buy/sell), status, limit, offset
         return fetchMagicEden(`/orders/rune`, { runeIdentifier, ...params });
    },
    fetchCollectionStats: async (params = {}) => {
        // Endpoint: /collection_stats/search
        // Params like: collectionSymbol, name, runeId, limit, offset
        return fetchMagicEden(`/collection_stats/search`, params);
    },
    fetchWalletBalances: async (address, runeIdentifier = null) => {
         // Endpoint: /wallet/balances/address/rune
         let endpoint = `/wallet/balances/${encodeURIComponent(address)}`;
         if (runeIdentifier) {
             endpoint += `/${encodeURIComponent(runeIdentifier)}`;
         }
         return fetchMagicEden(endpoint);
    },
     fetchUtxos: async (address) => {
         // Endpoint: /utxos/wallet_address
         return fetchMagicEden(`/utxos/${encodeURIComponent(address)}`);
    },
    /**
     * Fetches a list of runes from Magic Eden.
     * Note: Endpoint path /v2/ord/runes is assumed, verify with ME docs.
     * Params like limit, offset might be needed.
     */
    async fetchRuneList(params = {}) { // Add params if needed (e.g., {limit: 20, offset: 0})
        console.log(`[MagicEden API] Fetching rune list...`);
        // const queryString = new URLSearchParams(params).toString();
        // const endpoint = `/v2/ord/runes?${queryString}`;
        const endpoint = '/v2/ord/runes'; // Simple endpoint, adjust if params needed
        try {
            // ApiMiddleware handles fetch, headers, retries, errors
            const data = await ApiMiddleware.request(apiUrl(endpoint)); 
            // Maybe ME wraps result, e.g. { runes: [...] }
            return data; 
        } catch (error) {
            console.error('[MagicEden API] Error fetching rune list:', error);
            throw error; // Re-throw for the service layer to handle
        }
    },
    /**
     * Fetches detailed information for a specific rune by its name or ID.
     * Note: Endpoint path /v2/ord/runes/{idOrName} is assumed, verify with ME docs.
     * @param {string} idOrName - The rune's ID or name.
     */
    async fetchRuneInfo(idOrName) {
        if (!idOrName) {
            throw new Error('[MagicEden API] Rune ID or Name is required for fetchRuneInfo');
        }
        console.log(`[MagicEden API] Fetching info for rune: ${idOrName}`);
        const endpoint = `/v2/ord/runes/${encodeURIComponent(idOrName)}`;
        try {
            const data = await ApiMiddleware.request(apiUrl(endpoint));
            return data;
        } catch (error) {
            console.error(`[MagicEden API] Error fetching info for rune ${idOrName}:`, error);
            throw error; // Re-throw
        }
    }
};

export default MagicEdenAPI; 