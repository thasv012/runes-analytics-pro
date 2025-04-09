import { Secrets } from '../config/secrets.js';

// Placeholder for API Middleware
// Implement more sophisticated logic here like:
// - Automatic retries on specific errors (e.g., 429 Too Many Requests, 5xx server errors)
// - Centralized logging of requests/responses
// - Adding common headers (e.g., User-Agent, Content-Type)
// - Handling specific API authentication flows if needed beyond simple keys (e.g., OKX signatures)

// Rate Limiting: 2 Queries Per Second (QPS)
const MIN_INTERVAL_MS = 1000 / 2; // 500ms minimum interval between starts of requests
let requestTimestamps = []; // Stores timestamps of recent requests

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Basic retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500; // Initial delay, increases with each attempt

export const ApiMiddleware = {
    /**
     * Makes a fetch request, potentially adding middleware logic.
     * @param {string} url - The URL to fetch.
     * @param {RequestInit} options - Fetch options (method, headers, body, etc.).
     * @returns {Promise<Response>} - The fetch Response object.
     */
    request: async (url, options = {}) => {
        // --- Rate Limiting Logic --- 
        const now = Date.now();
        // Remove timestamps older than 1 second + buffer to avoid minor clock skew issues
        requestTimestamps = requestTimestamps.filter(ts => now - ts < 1100); 

        if (requestTimestamps.length >= 2) {
            // Find the timestamp of the request that determines the wait time 
            // (the earliest one within the last second if length is >= 2)
            const relevantTimestamp = requestTimestamps[requestTimestamps.length - 2]; 
            const timeSinceRelevantRequest = now - relevantTimestamp;
            
            if (timeSinceRelevantRequest < 1000) {
                const waitTime = 1000 - timeSinceRelevantRequest;
                console.warn(`[ApiMiddleware] Rate limit (2 QPS) hit. Waiting ${waitTime}ms before request to ${url}`);
                await delay(waitTime);
            }
        }
        // Record the timestamp *before* the request starts
        requestTimestamps.push(Date.now()); 
        // Optional: Keep the array size manageable if needed, though filtering helps
        // if (requestTimestamps.length > 10) requestTimestamps.shift(); 
        // --- End Rate Limiting Logic ---

        console.log(`[ApiMiddleware] Requesting: ${options.method || 'GET'} ${url}`);

        // Inject API keys or other common headers based on the URL or a config
        const dynamicHeaders = {};
        if (url.includes('api.magiceden.io') && Secrets.MAGICEDEN_KEY) {
            // Example: Adding Magic Eden specific header
            // Check their documentation for the correct header name (e.g., 'Authorization: Bearer ...' or 'x-api-key')
            dynamicHeaders['Authorization'] = `Bearer ${Secrets.MAGICEDEN_KEY}`;
            // dynamicHeaders['x-api-key'] = Secrets.MAGICEDEN_KEY; 
        }
        if (url.includes('okx.com') && Secrets.OKX_KEY) {
            // Example: OKX might need 'OK-ACCESS-KEY' and potentially others like timestamp, sign
            // dynamicHeaders['OK-ACCESS-KEY'] = Secrets.OKX_KEY;
            // Note: OKX often requires signed requests which is more complex than just adding a key header.
            // This middleware might need significant enhancement for APIs like OKX.
            console.warn('[ApiMiddleware] OKX API integration might require signed requests, not just a key header.');
        }
        if (url.includes('geniidata.com') && Secrets.GENIIDATA_KEY) {
            // Example: GeniiData might use 'X-API-Key' or similar
            dynamicHeaders['X-API-Key'] = Secrets.GENIIDATA_KEY; 
        }
        // Add similar logic for Ordiscan if it requires an API key

        const config = {
            method: 'GET',
            ...options,
            headers: {
                'Content-Type': 'application/json', // Default content type
                'Accept': 'application/json',       // Generally good practice
                ...dynamicHeaders,                  // Add dynamic headers (API keys etc.)
                ...options.headers,                 // Allow overriding headers
            },
        };

        let attempts = 0;
        while (attempts < MAX_RETRIES) {
            try {
                // Log the actual attempt time after potential rate limit delay
                console.log(`[ApiMiddleware] Attempt ${attempts + 1}: ${config.method} ${url}`);
                const res = await fetch(url, config);

                if (!res.ok) {
                    let errorBody = null;
                    try { // Try to parse error body for more details
                        errorBody = await res.text(); // Use text() first in case it's not JSON
                        errorBody = JSON.parse(errorBody);
                    } catch (parseError) { /* Ignore if error body is not JSON */ }

                    const error = new Error(`[${res.status}] ${res.statusText} on ${url}`);
                    error.status = res.status;
                    error.response = res; // Attach the raw response
                    error.body = errorBody; // Attach parsed/text error body
                    throw error;
                }
                
                // Handle potential empty responses (e.g., 204 No Content)
                if (res.status === 204) {
                    return null; 
                }

                return await res.json(); // Assumes API always returns JSON

            } catch (err) {
                attempts++;
                console.warn(`[ApiMiddleware] Attempt ${attempts} failed for ${url}:`, err.message, (err.body ? `| Body: ${JSON.stringify(err.body)}` : ''));

                // Don't retry on client errors (4xx) unless it's a rate limit (429)
                if (err.status && err.status >= 400 && err.status !== 429 && err.status < 500) {
                    console.error(`[ApiMiddleware] Client error (${err.status}), not retrying: ${url}`);
                    throw err; // Re-throw client errors immediately
                }

                if (attempts >= MAX_RETRIES) {
                    console.error(`[ApiMiddleware] FAILED after ${attempts} attempts: ${url}`);
                    // Enhance error reporting (e.g., send to logging service)
                    throw new Error(`API request failed after ${MAX_RETRIES} attempts: ${url}. Last error: ${err.message}`);
                }
                
                // Exponential backoff (ish)
                const delay = RETRY_DELAY_MS * Math.pow(2, attempts - 1);
                console.log(`[ApiMiddleware] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // Should not be reachable due to throws in the loop, but satisfies linters/compilers
        throw new Error(`API request failed unexpectedly: ${url}`); 
    }
};

export default ApiMiddleware; 