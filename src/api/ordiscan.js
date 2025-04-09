// src/api/ordiscan.js
import { Secrets } from '../config/secrets.js';
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Assuming middleware handles fetch

const BASE = 'https://ordiscan.com/api'; // Consider making BASE URL configurable or an env variable

async function fetchOrdiscan(endpoint) {
    const url = `${BASE}${endpoint}`;
    console.log(`[Ordiscan API] Fetching: ${url}`);
    try {
        // Using ApiMiddleware to potentially add auth or handle errors centrally
        const response = await ApiMiddleware.request(url, {
            method: 'GET',
            headers: {
                 // Add API key if required by Ordiscan and available
                 ...(Secrets.ordiscanApiKey && { 'X-Api-Key': Secrets.ordiscanApiKey }),
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Ordiscan API error! Status: ${response.status} for ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`[Ordiscan API] Failed to fetch ${endpoint}:`, error);
        throw error; // Re-throw for the service layer to handle fallback
    }
}

// Based on https://ordiscan.com/docs/api
export default {
    async fetchRuneList() {
        // Using ApiMiddleware for consistency, error handling, headers etc. is recommended
        // For simplicity here, using direct fetch
        const res = await fetch(`${BASE}/runes`);
        if (!res.ok) throw new Error(`Ordiscan API Error (fetchRuneList): ${res.statusText}`);
        return res.json();
    },

    async fetchRuneInfo(id) {
        if (!id) throw new Error("Rune ID is required for fetchRuneInfo");
        const res = await fetch(`${BASE}/runes/${id}`);
        if (!res.ok) throw new Error(`Ordiscan API Error (fetchRuneInfo for ${id}): ${res.statusText}`);
        return res.json();
    },

    fetchRuneMarketInfo: async (idOrName) => {
        return fetchOrdiscan(`/runes/market/${encodeURIComponent(idOrName)}`); // Example endpoint
    },

    fetchRuneActivity: async (idOrName, params = {}) => {
         const query = new URLSearchParams(params).toString();
        // Endpoint might differ based on whether searching by rune ID or general activity
         return fetchOrdiscan(`/runes/activity/${encodeURIComponent(idOrName)}?${query}`); // Example endpoint
    },

    fetchWalletBalance: async (address) => {
        // Endpoint needs confirmation based on Ordiscan docs for rune balances
         return fetchOrdiscan(`/address/${encodeURIComponent(address)}/runes`); // Example endpoint
    },

    // Add other functions as needed (e.g., runes in tx, name unlock)
}; 