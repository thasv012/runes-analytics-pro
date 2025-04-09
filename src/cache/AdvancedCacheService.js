/**
 * Simple in-memory cache with Time-To-Live (TTL) support.
 * Replace with a more persistent solution (localStorage, IndexedDB) for production use
 * if cache needs to survive page reloads.
 */

export const AdvancedCacheService = {
  /**
   * Retrieves an item from the cache.
   * Returns null if the item doesn't exist or has expired.
   * @param {string} key - The cache key.
   * @returns {any | null} The cached value or null.
   */
  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (!item) return null;
      const { value, expiry } = item;
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      // console.log(`[CACHE HIT] ${key}`); // Optional: for debugging
      return value;
    } catch (e) {
      console.warn('[CACHE GET ERROR]', key, e);
      // Attempt to remove potentially corrupted item
      try { localStorage.removeItem(key); } catch (removeError) { /* ignore */ }
      return null;
    }
  },

  /**
   * Adds or updates an item in the cache with a TTL.
   * @param {string} key - The cache key.
   * @param {any} value - The value to cache.
   * @param {number} ttlSeconds - Time-to-live in seconds. Defaults to 300 (5 minutes).
   */
  set(key, value, ttl = 60000) { // Default TTL is 1 minute (60000 ms)
    try {
      const expiry = Date.now() + ttl;
      localStorage.setItem(key, JSON.stringify({ value, expiry }));
      // console.log(`[CACHE SET] ${key} (TTL: ${ttl / 1000}s)`); // Optional: for debugging
    } catch (e) {
      console.warn('[CACHE SET ERROR]', key, e);
      // Handle potential storage full errors (e.g., QuotaExceededError)
      // Maybe implement a cache cleanup strategy here (e.g., remove oldest items)
    }
  },

  /**
   * Deletes an item from the cache.
   * @param {string} key - The cache key.
   */
  delete(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clears the entire cache.
   */
  clear(prefix = 'rune:') { // Default prefix to avoid clearing unrelated localStorage items
    console.log(`[CACHE CLEAR] Clearing items with prefix: ${prefix}`);
    let clearedCount = 0;
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      console.log(`[CACHE CLEAR] Removed ${clearedCount} items.`);
    } catch (e) {
       console.warn('[CACHE CLEAR ERROR]', e);
    }
  },

  // Optional: function to clear all localStorage (use with caution!)
  clearAll() {
      console.warn('[CACHE CLEAR ALL] Clearing ALL localStorage items!');
      try {
          localStorage.clear();
          console.log('[CACHE CLEAR ALL] localStorage cleared.');
      } catch (e) {
          console.error('[CACHE CLEAR ALL ERROR]', e);
      }
  },

  /**
   * Checks if a key exists and is not expired.
   * @param {string} key - The cache key.
   * @returns {boolean} True if the key exists and is valid, false otherwise.
   */
  has(key) {
    const item = localStorage.getItem(key);
    if (!item) return false;
    const { expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return false;
    }
    return true;
  }
};

export default AdvancedCacheService; 