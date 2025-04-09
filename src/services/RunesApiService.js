// src/services/RunesApiService.js
import OrdiscanAPI from '../api/ordiscan.js';
import MagicEdenAPI from '../api/magiceden.js';
// Import other APIs (OKX, GeniiData) here when they are implemented
// import OkxAPI from '../api/okx.js';
// import GeniiDataAPI from '../api/geniidata.js';
import Transformers from '../utils/transformers.js';
import { AdvancedCacheService } from '../cache/AdvancedCacheService.js';
import { Secrets } from '../config/secrets.js'; // Potentially used if API calls are made directly here, but better in middleware
import { ApiMiddleware } from '../utils/ApiMiddleware.js'; // Likely used by the API modules themselves
import { MockData } from '../mocks/mock-data.js';

const CACHE_TTL = 60 * 5 * 1000; // Cache for 5 minutes (in milliseconds)

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

    async getRuneInfo(idOrName, preferredSource = 'ordiscan') { 
         if (!idOrName) {
             console.error("[RunesService] Rune ID or Name is required to fetch info.");
             return null;
         }

        const identifier = String(idOrName).toLowerCase();
        // Try preferred source cache first
        let cacheKey = `rune:info:${preferredSource}:${identifier}`;
        let data = AdvancedCacheService.get(cacheKey);
        if (data) {
            console.log(`[RunesService] Returning cached info for ${idOrName} from ${preferredSource}`);
            return data;
        }

        // Define API fetch functions with source name
        const fetchFunctions = [
            { source: 'ordiscan', fetch: () => OrdiscanAPI.fetchRuneInfo(idOrName) },
            { source: 'magiceden', fetch: () => MagicEdenAPI.fetchRuneInfo(idOrName) },
            // Add other sources here in desired fallback order (e.g., OKX, GeniiData)
        ];

        // Sort fetch functions to prioritize preferredSource
        fetchFunctions.sort((a, b) => {
            if (a.source === preferredSource) return -1;
            if (b.source === preferredSource) return 1;
            return 0; // Maintain original order otherwise (Ordiscan -> ME)
        });

        // Attempt fetching from sources in order
        for (const { source, fetch } of fetchFunctions) {
             // Check cache for this specific source before fetching
             cacheKey = `rune:info:${source}:${identifier}`;
             data = AdvancedCacheService.get(cacheKey);
             if (data) {
                 console.log(`[RunesService] Returning cached info for ${idOrName} from ${source} (fallback cache)`);
                 return data;
             }

            console.log(`[RunesService] Attempting to fetch rune info for ${idOrName} from ${source}...`);
            try {
                const rawData = await fetch();
                if (rawData) {
                    data = Transformers.normalizeRuneInfo(rawData, source);
                    if (data && data.id) { // Basic validation of normalized data
                        console.log(`[RunesService] Successfully fetched and normalized info for ${idOrName} from ${source}`);
                        AdvancedCacheService.set(cacheKey, data, CACHE_TTL);
                        return data;
                    } else {
                        console.warn(`[RunesService] Normalization failed for ${idOrName} from ${source}. Raw:`, rawData, 'Normalized:', data);
                        // Continue to next source if normalization fails
                    }
                } else {
                     console.warn(`[RunesService] Received empty data for ${idOrName} from ${source}.`);
                     // Continue to next source if data is empty/null
                }
            } catch (error) {
                console.warn(`[RunesService] Failed to fetch from ${source} for ${idOrName}:`, error.message);
                // Continue to the next source on error
            }
        }

        // If all API sources fail, try mock data
        console.error(`[RunesService] All API sources failed for ${idOrName}. Falling back to mock data.`);
        const mockKey = String(idOrName).toUpperCase();
        const mockRune = MockData.runeDetails && MockData.runeDetails[mockKey];
        if (mockRune) {
            console.log(`[RunesService] Returning mock data for ${idOrName}.`);
            return Transformers.normalizeRuneInfo(mockRune, 'mock');
        } else {
            console.error(`[RunesService] No mock data found for ${idOrName}. Returning null.`);
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