// src/services/RunesApiService.js
import OrdiscanAPI from '../api/ordiscan.js';
import MagicEdenAPI from '../api/magiceden.js';
import GeniiDataAPI from '../api/geniidata.js'; // Import GeniiData API
// Import other APIs (OKX, GeniiData) here when they are implemented
// import OkxAPI from '../api/okx.js';
// import GeniiDataAPI from '../api/geniidata.js';
import Transformers from '../utils/transformers.js';
import { AdvancedCacheService } from '../cache/AdvancedCacheService.js';
import { Secrets } from '../config/secrets.js'; // Potentially used if API calls are made directly here, but better in middleware
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Likely used by the API modules themselves
import { MockData } from '../mocks/mock-data.js';

const CACHE_TTL = 60 * 5 * 1000; // Cache for 5 minutes (in milliseconds)
const HOLDER_CACHE_TTL = 15 * 60 * 1000; // Cache holder data for 15 minutes

export const RunesApiService = {

    async getRuneList(source = 'ordiscan') { // Default to Ordiscan for listing
        const cacheKey = `rune:list:${source}`;
        let data = AdvancedCacheService.get(cacheKey);

        if (data) {
            console.log(`[RunesService] Returning cached list from ${source}`);
            return data;
        }

        console.log(`[RunesService] Fetching rune list from ${source}`);
        try {
            let rawData;
            switch (source.toLowerCase()) {
                case 'ordiscan':
                    // Assuming OrdiscanAPI.fetchRuneList uses ApiMiddleware internally or handles fetch itself
                    rawData = await OrdiscanAPI.fetchRuneList(); 
                    break;
                case 'magiceden':
                     // Assuming MagicEdenAPI.fetchRuneList uses ApiMiddleware or handles fetch
                     rawData = await MagicEdenAPI.fetchRuneList(); 
                     break;
                // Add cases for other sources like OKX, GeniiData when implemented
                // case 'okx': rawData = await OkxAPI.fetchRuneList(); break;
                // case 'geniidata': rawData = await GeniiDataAPI.fetchRuneList(); break;
                default:
                    console.warn(`[RunesService] Unsupported source for rune list: ${source}. Falling back to Ordiscan.`);
                    rawData = await OrdiscanAPI.fetchRuneList();
            }

            // Basic validation: Check if rawData is received and looks like an array (or object containing an array)
            // Adjust validation based on actual API responses (e.g., rawData.data?.runes, rawData.items)
            const listArray = rawData?.runes || rawData?.data?.runes || rawData?.list || (Array.isArray(rawData) ? rawData : null);
            if (!listArray || !Array.isArray(listArray)) { 
                console.error(`[RunesService] Invalid or empty list data received from ${source}. Response:`, rawData);
                throw new Error(`Failed to fetch valid rune list array from ${source}`);
            }

            // Normalize the list data
            data = Transformers.normalizeRuneList(listArray, source); // Pass the actual array

            AdvancedCacheService.set(cacheKey, data, CACHE_TTL);
            return data;

        } catch (error) {
            console.error(`[RunesService] Error fetching rune list from ${source}:`, error);
            console.log('[RunesService] Falling back to mock data for rune list.');
            // Ensure mock data structure matches normalized structure
            // Assuming MockData.runeList is already in the correct format or needs normalization
            const mockList = MockData.runeList || []; // Fallback to empty array if mock is missing
            return Transformers.normalizeRuneList(mockList, 'mock'); // Normalize mock data too for consistency
        }
    },

    async getRuneInfo(idOrName, preferredSource = 'magiceden') { // Default preference to ME now?
         if (!idOrName) {
             console.error("[RunesService] Rune ID or Name is required to fetch info.");
             return null;
         }

        const identifier = String(idOrName).toLowerCase();
        // Try preferred source cache first
        let cacheKey = `rune:info:${preferredSource}:${identifier}`;
        let data = AdvancedCacheService.get(cacheKey);
        if (data) {
            console.log(`[RunesService][Info] Returning cached info for ${idOrName} from ${preferredSource}`);
            return data;
        }

        // Define API fetch functions with source name, in desired fallback order
        const fetchFunctions = [
            { source: 'magiceden', fetch: () => MagicEdenAPI.fetchRuneInfo(idOrName) },
            { source: 'geniidata', fetch: () => GeniiDataAPI.fetchRuneInfo(idOrName) }, // Added GeniiData
            { source: 'ordiscan', fetch: () => OrdiscanAPI.fetchRuneInfo(idOrName) },
            // Add other sources like OKX here when ready
        ];

        // Adjust sort if preferredSource is different from the first element
        fetchFunctions.sort((a, b) => {
            if (a.source === preferredSource) return -1;
            if (b.source === preferredSource) return 1;
            // Keep original defined order otherwise (ME -> Genii -> Ordi)
            const order = ['magiceden', 'geniidata', 'ordiscan']; 
            return order.indexOf(a.source) - order.indexOf(b.source);
        });

        // Attempt fetching from sources in order
        for (const { source, fetch } of fetchFunctions) {
             cacheKey = `rune:info:${source}:${identifier}`;
             data = AdvancedCacheService.get(cacheKey);
             if (data) {
                 console.log(`[RunesService][Info] Returning cached info for ${idOrName} from ${source} (fallback cache)`);
                 return data;
             }

            console.log(`[RunesService][Info] Attempting to fetch rune info for ${idOrName} from ${source}...`);
            try {
                const rawData = await fetch();
                if (rawData) {
                    // We need to ensure the transformer handles geniidata
                    data = Transformers.normalizeRuneInfo(rawData, source);
                    if (data && data.id) { 
                        console.log(`[RunesService][Info] Successfully fetched and normalized info for ${idOrName} from ${source}`);
                        AdvancedCacheService.set(cacheKey, data, CACHE_TTL);
                        return data;
                    } else {
                        console.warn(`[RunesService][Info] Normalization failed for ${idOrName} from ${source}. Raw:`, rawData, 'Normalized:', data);
                    }
                } else {
                     console.warn(`[RunesService][Info] Received empty data for ${idOrName} from ${source}.`);
                }
            } catch (error) {
                console.warn(`[RunesService][Info] Failed to fetch from ${source} for ${idOrName}:`, error.message);
            }
        }

        // Fallback to mock data
        console.error(`[RunesService][Info] All API sources failed for ${idOrName}. Falling back to mock data.`);
        const mockKey = String(idOrName).toUpperCase();
        const mockRune = MockData.runeDetails && MockData.runeDetails[mockKey];
        if (mockRune) {
            console.log(`[RunesService][Info] Returning mock data for ${idOrName}.`);
            // Ensure transformer handles 'mock' source
            return Transformers.normalizeRuneInfo(mockRune, 'mock');
        } else {
            console.error(`[RunesService][Info] No mock data found for ${idOrName}. Returning null.`);
            return null;
        }
    },

    /**
     * Fetches holder data, primarily using GeniiData.
     * @param {string} idOrName - Rune ID or Name.
     * @param {object} params - Optional parameters for the API call (e.g., page, limit).
     * @returns {Promise<Array|null>} Array of holder data or null on failure.
     */
    async getRuneHolders(idOrName, params = {}) {
         if (!idOrName) {
             console.error("[RunesService][Holders] Rune ID or Name is required.");
             return null;
         }
         const identifier = String(idOrName).toLowerCase();
         const paramString = JSON.stringify(params);
         const cacheKey = `rune:holders:${identifier}:${paramString}`;

         let data = AdvancedCacheService.get(cacheKey);
         if (data) {
             console.log(`[RunesService][Holders] Returning cached holders for ${idOrName}`);
             return data;
         }

         console.log(`[RunesService][Holders] Fetching holders for ${idOrName} from GeniiData...`);
         try {
             const rawData = await GeniiDataAPI.fetchRuneHolders(idOrName, params);
             
             // Use the transformer now
             data = Transformers.normalizeHolderList(rawData, 'geniidata');

             if (data) { // normalizeHolderList returns array or null
                 AdvancedCacheService.set(cacheKey, data, HOLDER_CACHE_TTL); 
                 console.log(`[RunesService][Holders] Successfully fetched and normalized holders for ${idOrName}. Count: ${data.length}`);
                 return data;
             } else {
                  console.warn(`[RunesService][Holders] Received empty or invalid holder data for ${idOrName}, or normalization failed.`);
                  // Potentially cache an empty result for a short time to avoid hammering API?
                  // AdvancedCacheService.set(cacheKey, [], SHORT_TTL); 
                  return null;
             }
         } catch (error) {
             console.error(`[RunesService][Holders] Error fetching holders for ${idOrName} from GeniiData:`, error);
             return null;
         }
    },

    // Add other service methods as needed (e.g., getMarketData, getActivity)
    // These would follow a similar pattern: check cache, fetch, normalize, cache, handle errors/fallbacks.

     clearCache() {
         console.log("[RunesService] Clearing rune cache.");
         AdvancedCacheService.clear('rune:'); // Use prefix to clear only rune-related cache
     }
};

export default RunesApiService; 