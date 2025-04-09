// src/services/RunesApiService.ts
import 'dotenv/config'; // Load .env variables for server-side use/testing
import { AdvancedCacheService } from '../lib/AdvancedCacheService';
import {
    transformOrdiscanToken,
    transformMagicEdenToken,
    transformGeniiDataToken, // Added GeniiData Token transformer
    transformGeniiDataPopular,
    transformMagicEdenHistory,
} from './transformers';

// --- Interfaces (assuming they are defined as before) ---
interface RuneToken { /* ... */ sourceApi?: string; }
interface RuneHistoryPoint { /* ... */ }

// --- Real API Endpoints ---
const ORDISCAN_API_BASE = 'https://ordiscan.com/api';
const MAGIGEDEN_API_BASE = 'https://api-mainnet.magiceden.dev/v2/ord';
const GENIIDATA_API_BASE = 'https://api.geniidata.io/v1/ord'; // Base verified

const API_ENDPOINTS = {
  ordiscan_rune: (idOrName: string) => `${ORDISCAN_API_BASE}/rune/${encodeURIComponent(idOrName)}`,
  magiceden_rune: (idOrName: string) => `${MAGIGEDEN_API_BASE}/runes/${encodeURIComponent(idOrName)}`,
  magiceden_rune_chart: (idOrName: string) => `${MAGIGEDEN_API_BASE}/runes/${encodeURIComponent(idOrName)}/chart`, // Verified endpoint for chart
  geniidata_rune: (runeId: string) => `${GENIIDATA_API_BASE}/runes/${encodeURIComponent(runeId)}`,
  // Verified popular/list endpoint with sorting: market_cap_usd, volume_usd_1d etc.
  geniidata_list_popular: (limit: number, page: number = 1, sort: string = 'market_cap_usd') =>
    `${GENIIDATA_API_BASE}/runes/list?page_size=${limit}&page_num=${page}&sort=${sort}`,
};

// --- API Keys (Loaded from environment - assumes server-side context or proxy) ---
const API_KEYS = {
  // DO NOT prefix with NEXT_PUBLIC_ if these are sensitive and used server-side
  geniidata: process.env.GENIIDATA_API_KEY || '',
  magiceden: process.env.MAGIGEDEN_API_KEY || '', // Needed for some ME endpoints
};
// --- End API Configuration ---

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const cacheService = new AdvancedCacheService('runesApiCache');

// Refined fetchWithTimeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    console.log(`[API Request] Fetching: ${url} ${options.method || 'GET'}`, headers ? `with headers: ${Object.keys(headers).join(', ')}` : '');

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) {
            let errorBody = '';
            try {
                errorBody = await response.text();
            } catch (e) { }
            const errorMsg = `API Error ${response.status}: ${response.statusText} for ${url}. Body: ${errorBody.substring(0, 300)}`;
            console.error(errorMsg);
            // Throw specific error types if needed
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        // console.log(`[API Response OK] from ${url}:`, JSON.stringify(responseData).substring(0, 300) + '...'); // Log snippet of successful response
        return responseData;

    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            console.error(`Fetch aborted due to timeout (${timeout}ms) for ${url}`);
            throw new Error('Request timed out');
        }
        // Log the original error message if available
        console.error(`Fetch failed for ${url}:`, error.message || error);
        throw error; // Re-throw
    }
}

export const RunesApiService = {
    /**
     * Fetches details for a specific Rune token by ID or Name.
     * Tries Magic Eden -> Ordiscan -> GeniiData (if ID is numeric).
     * @param idOrName Rune ID (numeric string) or Name (e.g., UNCOMMON•GOODS).
     */
    async getTokenById(idOrName: string): Promise<RuneToken | null> {
        const cacheKey = `rune_details_${idOrName}`;
        const cachedData = await cacheService.get<RuneToken>(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] Returning cached data for ${idOrName} from ${cachedData.sourceApi}`);
            return cachedData;
        }

        console.log(`[API Fetch] Fetching details for ${idOrName}`);
        let data: RuneToken | null = null;
        const isNumericId = /^\d+$/.test(idOrName); // Check if it looks like a GeniiData numeric ID

        // --- 1. Attempt Magic Eden ---
        if (API_KEYS.magiceden) { // Assuming ME needs key for rune details
             try {
                const meUrl = API_ENDPOINTS.magiceden_rune(idOrName);
                const meOptions = { headers: { 'Authorization': `Bearer ${API_KEYS.magiceden}` } };
                const meData = await fetchWithTimeout(meUrl, meOptions);
                data = transformMagicEdenToken(meData);
                if (data) {
                    console.log(`[API Success] Fetched from Magic Eden for ${idOrName}`);
                    await cacheService.set(cacheKey, data, CACHE_TTL);
                    return data;
                }
             } catch (meError) {
                console.warn(`Magic Eden fetch failed for ${idOrName}:`, (meError as Error).message);
             }
        } else {
            console.warn("Magic Eden API key not configured, skipping.");
        }

        // --- 2. Fallback to Ordiscan ---
        try {
            const osUrl = API_ENDPOINTS.ordiscan_rune(idOrName);
            const osData = await fetchWithTimeout(osUrl);
            data = transformOrdiscanToken(osData); // Use the transformer
            if (data) {
                 console.log(`[API Success] Fetched from Ordiscan (Fallback) for ${idOrName}`);
                 await cacheService.set(cacheKey, data, CACHE_TTL);
                 return data;
            }
        } catch (osError) {
            console.warn(`Ordiscan fetch failed for ${idOrName}:`, (osError as Error).message);
        }

         // --- 3. Fallback to GeniiData (only if it's a numeric ID and others failed) ---
         if (!data && isNumericId && API_KEYS.geniidata) {
             try {
                 const gdUrl = API_ENDPOINTS.geniidata_rune(idOrName);
                 const gdOptions = { headers: { 'X-Api-Key': API_KEYS.geniidata } };
                 const gdData = await fetchWithTimeout(gdUrl, gdOptions);
                 // GeniiData detail endpoint might have a different structure, needs specific transformer
                 data = transformGeniiDataToken(gdData); // Assumes a new transformer exists
                 if (data) {
                     console.log(`[API Success] Fetched from GeniiData (Fallback) for ID ${idOrName}`);
                     await cacheService.set(cacheKey, data, CACHE_TTL);
                     return data;
                 }
             } catch (gdError) {
                 console.error(`GeniiData fetch failed for ID ${idOrName}:`, (gdError as Error).message);
             }
         } else if (!data && isNumericId) {
            console.warn("GeniiData API key not configured or ID is not numeric, skipping GeniiData fallback.");
         }

        // --- Final Result ---
        if (!data) {
          console.error(`All API fetches failed for details of ${idOrName}`);
          await cacheService.set(cacheKey, null, 60 * 1000); // Cache failure for 1 min
        }
        return data;
      },

    /**
     * Fetches a list of popular Runes tokens (sorted by market cap by default).
     * Currently uses GeniiData.
     */
    async getPopularTokens(limit: number = 20, page: number = 1, sort: string = 'market_cap_usd'): Promise<RuneToken[]> {
        const cacheKey = `popular_runes_${limit}_${page}_${sort}`;
        const cachedData = await cacheService.get<RuneToken[]>(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] Returning cached popular tokens (Page ${page}, Sort ${sort})`);
            return cachedData;
        }

        console.log(`[API Fetch] Fetching popular tokens (Limit: ${limit}, Page: ${page}, Sort: ${sort})`);
        let data: RuneToken[] = [];

        if (API_KEYS.geniidata) {
            try {
                const gdUrl = API_ENDPOINTS.geniidata_list_popular(limit, page, sort);
                const gdOptions = { headers: { 'X-Api-Key': API_KEYS.geniidata } };
                const gdData = await fetchWithTimeout(gdUrl, gdOptions);
                data = transformGeniiDataPopular(gdData); // Use transformer
                if (data.length > 0) console.log(`[API Success] Fetched ${data.length} popular tokens from GeniiData`);
            } catch (gdError) {
                console.error(`GeniiData fetch failed for popular tokens:`, (gdError as Error).message);
            }
        } else {
            console.warn("GeniiData API key not configured. Cannot fetch popular tokens.");
        }

        if (data.length > 0) {
            await cacheService.set(cacheKey, data, CACHE_TTL);
        } else {
            await cacheService.set(cacheKey, [], 60 * 1000); // Cache empty for 1 min
        }
        return data;
    },

    /**
     * Fetches historical chart data for a specific Rune token.
     * Currently uses Magic Eden.
     */
    async getTokenHistory(idOrName: string): Promise<RuneHistoryPoint[]> {
        const cacheKey = `rune_history_${idOrName}`;
        const cachedData = await cacheService.get<RuneHistoryPoint[]>(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] Returning cached history for ${idOrName}`);
            return cachedData;
        }

        console.log(`[API Fetch] Fetching history for ${idOrName}`);
        let history: RuneHistoryPoint[] = [];

        // Magic Eden's chart endpoint might not require auth, but check docs
        if (API_BASE_URLS.magiceden_rune_chart) {
            try {
                const meHistoryUrl = API_ENDPOINTS.magiceden_rune_chart(idOrName);
                // Add Auth header if ME requires it for chart endpoint
                const meOptions = API_KEYS.magiceden ? { headers: { 'Authorization': `Bearer ${API_KEYS.magiceden}` } } : {};
                const meHistoryData = await fetchWithTimeout(meHistoryUrl, meOptions);
                history = transformMagicEdenHistory(meHistoryData);
                if (history.length > 0) console.log(`[API Success] Fetched ${history.length} history points from Magic Eden for ${idOrName}`);
            } catch (meError) {
                console.error(`Magic Eden history fetch failed for ${idOrName}:`, (meError as Error).message);
            }
        } else {
             console.warn("Magic Eden Chart endpoint not configured.");
        }

        if (history.length > 0) {
            await cacheService.set(cacheKey, history, CACHE_TTL);
        } else {
            await cacheService.set(cacheKey, [], 60 * 1000); // Cache empty for 1 min
        }
        return history;
    },
};