import { Secrets } from '../config/secrets.js';
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Assuming middleware handles fetch

// This assumes you have the @api/geniidata library installed or available
// If not, you'll need to implement fetch calls to their REST API directly.
// Example using a hypothetical direct fetch:

const BASE_URL = 'https://api.geniidata.com/api/v1/runes'; // Hypothetical base URL

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
    // The API doc focuses on a single list endpoint, may need specific filters for holders
    fetchRunesInfoList: async (params = { limit: 20, offset: 0 }) => {
        // Endpoint: /info_list (Based on doc URL)
        // Params include: offset, limit, sort_by, sort_order, keyword
        // To get holders, you might need to fetch this list and extract holder counts, or check if a specific endpoint exists
        return fetchGeniiData(`/info_list`, params);
    },
    // Placeholder if a specific holder endpoint exists or is needed
    fetchRuneHolders: async (runeIdentifier, params = {}) => {
        console.warn(`[GeniiData API] fetchRuneHolders specific endpoint not confirmed, using info_list with keyword filter.`);
        // Attempt to filter the main list by name/id
        const listParams = { keyword: runeIdentifier, limit: 1, ...params };
        const result = await fetchGeniiData(`/info_list`, listParams);
        // Extract relevant holder info from the result if found
        return result?.data?.[0] || null; // Example: return first match
    }
};

export default GeniiDataAPI; 