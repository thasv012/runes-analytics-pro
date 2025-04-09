// src/api/okx.js
import { Secrets } from '../config/secrets.js';
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Assuming middleware handles fetch

// Base URL needs confirmation - these might be different endpoints
const BASE_URL_V5 = 'https://www.okx.com/api/v5';
// const BASE_URL_WEB3 = 'https://web3.okx.com/api/...'; // Adjust if using web3 endpoints

async function fetchOkx(endpoint, params = {}, version = 'v5') {
    const baseUrl = version === 'v5' ? BASE_URL_V5 : BASE_URL_WEB3;
    const query = new URLSearchParams(params).toString();
    const url = `${baseUrl}${endpoint}${query ? '?' + query : ''}`;
    console.log(`[OKX API ${version}] Fetching: ${url}`);
    try {
        // Using ApiMiddleware for centralized handling
        const response = await ApiMiddleware.request(url, {
            method: 'GET',
            headers: {
                // OKX might require specific headers like OK-ACCESS-KEY, OK-ACCESS-SIGN, OK-ACCESS-TIMESTAMP, OK-ACCESS-PASSPHRASE
                // These should be generated based on their API docs and added here or in middleware
                ...(Secrets.okxApiKey && { 'X-API-KEY-HEADER-NAME': Secrets.okxApiKey }), // Replace with actual header name
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            const errorBody = await response.json(); // OKX often returns JSON errors
            throw new Error(`OKX API error! Status: ${response.status} for ${endpoint}. Code: ${errorBody?.code} Msg: ${errorBody?.msg}`);
        }
        const data = await response.json();
        // OKX responses often have a `data` field and a `code` (0 for success)
        if (data.code && data.code !== '0') {
            throw new Error(`OKX API returned error code ${data.code}: ${data.msg}`);
        }
        return data.data; // Return the actual data part
    } catch (error) {
        console.error(`[OKX API ${version}] Failed to fetch ${endpoint}:`, error);
        throw error; // Re-throw for the service layer
    }
}

// Based on URLs provided
export const OKXAPI = {
    fetchRuneMarketInfo: async (runeIdentifier, params = {}) => {
        // Endpoint: /mktplace/nft/runes/detail
        // Need to map runeIdentifier (name/id) to required OKX params (e.g., runeName)
        return fetchOkx(`/mktplace/nft/runes/detail`, { runeName: runeIdentifier, ...params }, 'v5');
    },
    fetchTokenOrders: async (runeIdentifier, params = {}) => {
        // Endpoint: /mktplace/nft/runes/get-runes-order-list
        // Map identifier and add params like state, limit
        return fetchOkx(`/mktplace/nft/runes/get-runes-order-list`, { runeName: runeIdentifier, ...params }, 'v5');
    },
    fetchWalletBalance: async (address, params = {}) => {
        // Endpoint: /mktplace/nft/runes/get-owned-asserts
        // Need to map address to required OKX params (e.g., walletAddress)
        // This endpoint might require authentication (API Key, Signature)
        return fetchOkx(`/mktplace/nft/runes/get-owned-asserts`, { walletAddress: address, ...params }, 'v5');
    },
    fetchTradeHistory: async (runeIdentifier, params = {}) => {
        // Endpoint needs confirmation from docs: https://web3.okx.com/pt-pt/build/docs/waas/marketplace-runes-trade-history
        // Assuming a web3 endpoint might be needed
        // return fetchOkx(`/some-web3-endpoint/trade-history`, { runeName: runeIdentifier, ...params }, 'web3');
        console.warn('[OKX API] fetchTradeHistory endpoint not fully implemented.');
        return null;
    }
    // Add makeOrder, etc., potentially requiring POST and different handling
};

export default OKXAPI; 