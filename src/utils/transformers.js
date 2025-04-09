/**
 * Represents the unified data structure for Rune information.
 * @typedef {Object} UnifiedRuneInfo
 * @property {string} id - Unique identifier (e.g., Rune ID or Name)
 * @property {string} name - Human-readable name (Ticker)
 * @property {number|null} number - Rune number
 * @property {number|string|null} supply - Total supply (can be large)
 * @property {number|string|null} burned - Amount burned (if available)
 * @property {number|null} holders - Number of holders
 * @property {number|null} transactions - Total transactions (if available)
 * @property {number|null} marketCap - Market capitalization in USD
 * @property {number|null} priceUSD - Current price in USD
 * @property {number|null} volume24hUSD - 24h volume in USD
 * @property {number|null} change24hPercent - 24h price change percentage
 * @property {string|null} sourceAPI - The API source the data came from (e.g., 'Ordiscan', 'MagicEden')
 */

/**
 * Represents the unified data structure for Rune market info.
 * @typedef {Object} UnifiedMarketInfo
 * @property {string} id - Unique identifier (e.g., Rune ID or Name)
 * @property {number|null} priceUSD
 * @property {number|null} volume24hUSD
 * @property {number|null} marketCap
 * @property {number|null} change24hPercent
 * @property {string|null} sourceAPI
 */

/**
 * Represents a single activity item (e.g., transfer, listing).
 * @typedef {Object} UnifiedActivityItem
 * @property {string} txid - Transaction ID
 * @property {string} type - Type of activity (e.g., 'transfer', 'list', 'buy')
 * @property {string} runeId - Identifier of the Rune involved
 * @property {string|null} fromAddress - Sender address
 * @property {string|null} toAddress - Receiver address
 * @property {number|string|null} amount - Amount transferred/listed
 * @property {number|null} priceBTC - Price in BTC (if applicable)
 * @property {number|null} priceUSD - Price in USD (if applicable)
 * @property {number} timestamp - Unix timestamp of the activity
 * @property {string|null} sourceAPI
 */

/**
 * Represents a wallet balance for a specific Rune.
 * @typedef {Object} UnifiedWalletBalance
 * @property {string} runeId
 * @property {string} runeName
 * @property {number|string} amount - Total balance
 * @property {string|null} sourceAPI
 */

/**
 * Represents market orders (bids/asks).
 * @typedef {Object} UnifiedOrder
 * @property {string} orderId
 * @property {string} type - 'bid' or 'ask'
 * @property {string} runeId
 * @property {number|string} amount - Amount of Rune
 * @property {number} pricePerUnitBTC - Price per unit in BTC
 * @property {number} priceTotalBTC - Total price in BTC
 * @property {number|null} pricePerUnitUSD
 * @property {number|null} priceTotalUSD
 * @property {string} ownerAddress
 * @property {number|null} expiry
 * @property {string|null} sourceAPI
 */

/**
 * Normalizes data from different Rune list sources.
 * @param {any} data - The raw data from the API.
 * @param {string} source - The source API name (e.g., 'Ordiscan').
 * @returns {UnifiedRuneInfo[]} - An array of normalized Rune info objects.
 */
function normalizeRuneList(data, source) {
    console.log(`[Transformer] Normalizing Rune List from ${source}`);
    if (!data) return [];
    let normalizedList = [];

    try {
        switch (source.toLowerCase()) {
            case 'ordiscan':
                // Assuming Ordiscan returns an array of objects directly
                // Adjust keys based on actual Ordiscan /api/runes response
                if (Array.isArray(data?.data)) { // Ordiscan might wrap in `data`
                    normalizedList = data.data.map(item => ({
                        id: item.rune_id || item.name, // Prefer ID if available
                        name: item.name || item.rune_name, // Check fields like name, rune_name, ticker
                        number: item.rune_number ?? null,
                        supply: item.supply ?? null,
                        holders: item.holders ?? null,
                        transactions: item.transactions ?? null,
                        marketCap: item.market_cap_usd ?? null,
                        priceUSD: item.price_usd ?? null,
                        volume24hUSD: item.volume_24h_usd ?? null,
                        change24hPercent: item.change_24h_percent ?? null,
                        sourceAPI: 'Ordiscan'
                    }));
                } else {
                    console.warn(`[Transformer] Ordiscan rune list data format unexpected.`, data);
                }
                break;
            case 'geniidata':
                 // Based on GeniiData /info_list structure
                if (Array.isArray(data?.data)) {
                     normalizedList = data.data.map(item => ({
                        id: item.rune_id || item.rune_name,
                        name: item.rune_name,
                        number: item.rune_number ?? null,
                        supply: item.supply_supply ?? null, // Adjust field names based on actual API response
                        burned: item.burned_supply ?? null,
                        holders: item.holders_count ?? null,
                        transactions: item.tx_count ?? null,
                        marketCap: item.market_cap ?? null,
                        priceUSD: null, // Price might not be in this list endpoint
                        volume24hUSD: item.volume_24h_usd ?? null,
                        change24hPercent: item.price_change_24h ?? null,
                        sourceAPI: 'GeniiData'
                     }));
                 } else {
                     console.warn(`[Transformer] GeniiData rune list data format unexpected.`, data);
                 }
                 break;
            // Add cases for other sources if they provide rune lists
            default:
                console.warn(`[Transformer] Unknown source for Rune List: ${source}`);
                // Attempt a generic mapping if possible, or return empty
                if (Array.isArray(data)) {
                     normalizedList = data.map(item => ({ id: item.id || item.runeId || item.name, name: item.name || item.runeName, sourceAPI: source, ...item }));
                }
        }
    } catch (error) {
        console.error(`[Transformer] Error normalizing Rune List from ${source}:`, error);
    }
    return normalizedList;
}

/**
 * Normalizes data from different Rune info sources.
 * @param {any} data - The raw data from the API.
 * @param {string} source - The source API name.
 * @returns {UnifiedRuneInfo | null} - A normalized Rune info object or null.
 */
function normalizeRuneInfo(data, source) {
    console.log(`[Transformer] Normalizing Rune Info from ${source}`);
    if (!data) return null;
    let normalized = null;
    try {
         // Handle APIs that wrap results in a 'data' field
         const actualData = data.data || data;
         if (!actualData || typeof actualData !== 'object') {
              console.warn(`[Transformer] No valid data object found for ${source}`);
              return null;
         }

        switch (source.toLowerCase()) {
            case 'ordiscan':
                 // Adjust keys based on actual Ordiscan /runes/{id} response
                 normalized = {
                     id: actualData.id, // Assuming API returns 'id'
                     name: actualData.ticker, // Assuming API returns 'ticker'
                     supply: actualData.supply ? Number(actualData.supply) : null,
                     holders: actualData.holders ? Number(actualData.holders) : null,
                     price: actualData.market?.price_usd ? Number(actualData.market.price_usd) : 0,
                     volume: actualData.market?.volume_24h ? Number(actualData.market.volume_24h) : 0,
                     sourceAPI: 'Ordiscan' // Keep track of source
                 };
                 break;
             case 'magiceden':
                  // Adjust keys based on actual Magic Eden /market/rune_info response
                  normalized = {
                      id: actualData.rune_id, // Assuming API returns 'rune_id'
                      name: actualData.name, // Assuming API returns 'name'
                      supply: actualData.total_supply, // Assuming API returns 'total_supply'
                      holders: actualData.holder_count, // Assuming API returns 'holder_count'
                      price: actualData.last_price, // Assuming API returns 'last_price'
                      volume: actualData.volume_usd, // Assuming API returns 'volume_usd'
                      sourceAPI: 'MagicEden' // Keep track of source
                  };
                  break;
             case 'geniidata': // If using info_list for single item
                 normalized = {
                    id: actualData.rune_id || actualData.rune_name,
                    name: actualData.rune_name,
                    number: actualData.rune_number ?? null,
                    supply: actualData.supply_supply ?? null,
                    burned: actualData.burned_supply ?? null,
                    holders: actualData.holders_count ?? null,
                    transactions: actualData.tx_count ?? null,
                    marketCap: actualData.market_cap ?? null,
                    priceUSD: null, // Price might not be in this list endpoint
                    volume24hUSD: actualData.volume_24h_usd ?? null,
                    change24hPercent: actualData.price_change_24h ?? null,
                    sourceAPI: 'GeniiData'
                 };
                 break;
             // Add OKX case if its /detail endpoint provides general info
             case 'okx':
                 // Adjust keys based on OKX /detail response
                  normalized = {
                     id: actualData.runeId || actualData.runeName,
                     name: actualData.runeName,
                     number: actualData.runeNumber ?? null,
                     supply: actualData.totalSupply ?? null,
                     burned: null, // Check if available
                     holders: actualData.owners ?? null,
                     transactions: actualData.totalTx ?? null,
                     marketCap: actualData.marketCapValue ?? null, // Check field name (USD? BTC?)
                     priceUSD: actualData.floorPrice?.amount ?? null, // Check currency
                     volume24hUSD: actualData.volume24H?.amount ?? null, // Check currency
                     change24hPercent: null, // Check if available
                     sourceAPI: 'OKX'
                 };
                 break;
            default:
                console.warn(`[Transformer] Unknown source for Rune Info: ${source}`);
                // Return raw data or a basic structure
                normalized = { id: actualData.id || actualData.runeId || actualData.name, name: actualData.name || actualData.runeName, sourceAPI: source, ...actualData };
        }
    } catch (error) {
        console.error(`[Transformer] Error normalizing Rune Info from ${source}:`, error);
    }
    return normalized;
}

/**
 * Normalizes data from different Market info sources.
 * @param {any} data - The raw data from the API.
 * @param {string} source - The source API name.
 * @returns {UnifiedMarketInfo | null} - A normalized market info object or null.
 */
function normalizeMarketInfo(data, source) {
    console.log(`[Transformer] Normalizing Market Info from ${source}`);
    if (!data) return null;
    let normalized = null;
    try {
         const actualData = data.data || data;
          if (!actualData || typeof actualData !== 'object') return null;

        switch (source.toLowerCase()) {
            case 'ordiscan': // /runes/market/{id}
                normalized = {
                    id: actualData.rune_id || actualData.name,
                    priceUSD: actualData.price_usd ?? null,
                    volume24hUSD: actualData.volume_24h_usd ?? null,
                    marketCap: actualData.market_cap_usd ?? null,
                    change24hPercent: actualData.change_24h_percent ?? null,
                    sourceAPI: 'Ordiscan'
                };
                break;
            case 'okx': // /detail endpoint likely has market info
                 normalized = {
                     id: actualData.runeId || actualData.runeName,
                     priceUSD: actualData.floorPrice?.amount ?? null, // Check currency
                     volume24hUSD: actualData.volume24H?.amount ?? null, // Check currency
                     marketCap: actualData.marketCapValue ?? null, // Check field name (USD? BTC?)
                     change24hPercent: null, // Check if available
                     sourceAPI: 'OKX'
                 };
                 break;
            // Add Magic Eden if /market/rune_info has overlapping fields
            case 'magiceden':
                 normalized = {
                     id: actualData.runeId || actualData.runeName,
                     priceUSD: actualData.floorPrice?.usd ?? actualData.lastPrice?.usd ?? null,
                     volume24hUSD: actualData.volume24hUSD ?? null,
                     marketCap: actualData.marketCapUSD ?? null,
                     change24hPercent: actualData.priceChange24hPercent ?? null,
                     sourceAPI: 'MagicEden'
                 };
                 break;
            default:
                console.warn(`[Transformer] Unknown source for Market Info: ${source}`);
                normalized = { id: actualData.id || actualData.runeId || actualData.name, sourceAPI: source, ...actualData };
        }
    } catch (error) {
        console.error(`[Transformer] Error normalizing Market Info from ${source}:`, error);
    }
    return normalized;
}

/**
 * Normalizes activity data.
 * @param {any} data - Raw API data (likely an array of activities).
 * @param {string} source - Source API name.
 * @returns {UnifiedActivityItem[]} - Array of normalized activity items.
 */
function normalizeActivity(data, source) {
     console.log(`[Transformer] Normalizing Activity from ${source}`);
     if (!data) return [];
     let normalizedList = [];
     try {
          // APIs might wrap results in `data` or specific keys like `activities`
          const activityList = data.data || data.activities || (Array.isArray(data) ? data : []);
          if (!Array.isArray(activityList)) {
               console.warn(`[Transformer] Activity data from ${source} is not an array.`, data);
               return [];
          }

         switch (source.toLowerCase()) {
             case 'ordiscan': // /runes/activity/{id} or others
                 normalizedList = activityList.map(item => ({
                     txid: item.txid,
                     type: item.type || item.event_type, // Adjust based on actual fields
                     runeId: item.rune_id || item.rune_name,
                     fromAddress: item.from_address || item.sender,
                     toAddress: item.to_address || item.receiver,
                     amount: item.amount,
                     priceBTC: null, // Check if available
                     priceUSD: null,
                     timestamp: item.timestamp ? Math.floor(new Date(item.timestamp).getTime() / 1000) : null, // Convert to Unix timestamp
                     sourceAPI: 'Ordiscan'
                 }));
                 break;
             case 'magiceden': // /activities/rune or /wallet/activities/address
                  normalizedList = activityList.map(item => ({
                     txid: item.txid || item.transactionId,
                     type: item.kind, // e.g., 'rune_transfer', 'rune_list', 'rune_unlist'
                     runeId: item.runeIdentifier || item.runeId || item.runeName,
                     fromAddress: item.seller || item.fromAddress,
                     toAddress: item.buyer || item.toAddress,
                     amount: item.amount,
                     priceBTC: item.price?.btc ?? null,
                     priceUSD: item.price?.usd ?? null,
                     timestamp: item.timestamp ? Math.floor(new Date(item.timestamp).getTime() / 1000) : null,
                     sourceAPI: 'MagicEden'
                 }));
                 break;
             // Add OKX case if trade history is implemented
             default:
                 console.warn(`[Transformer] Unknown source for Activity: ${source}`);
                 normalizedList = activityList.map(item => ({ txid: item.txid || item.id, type: item.type || item.kind, sourceAPI: source, ...item }));
         }
     } catch (error) {
         console.error(`[Transformer] Error normalizing Activity from ${source}:`, error);
     }
     return normalizedList;
}

/**
 * Normalizes wallet balance data.
 * @param {any} data - Raw API data.
 * @param {string} source - Source API name.
 * @returns {UnifiedWalletBalance[]} - Array of normalized balances.
 */
function normalizeWalletBalance(data, source) {
    console.log(`[Transformer] Normalizing Wallet Balance from ${source}`);
    if (!data) return [];
    let normalizedList = [];
    try {
         const balanceList = data.data || data.balances || (Array.isArray(data) ? data : []);
          if (!Array.isArray(balanceList)) {
               console.warn(`[Transformer] Wallet balance data from ${source} is not an array.`, data);
               return [];
          }

        switch (source.toLowerCase()) {
            case 'ordiscan': // /address/{addr}/runes
                 normalizedList = balanceList.map(item => ({
                    runeId: item.rune_id || item.name,
                    runeName: item.name,
                    amount: item.amount,
                    sourceAPI: 'Ordiscan'
                 }));
                 break;
             case 'okx': // /get-owned-asserts
                  normalizedList = balanceList.map(item => ({
                     runeId: item.runeId || item.runeName,
                     runeName: item.runeName,
                     amount: item.amount,
                     sourceAPI: 'OKX'
                  }));
                  break;
            // Add Magic Eden case if /wallet/balances is used
            case 'magiceden':
                 normalizedList = balanceList.map(item => ({
                     runeId: item.runeIdentifier || item.runeId || item.runeName,
                     runeName: item.runeName,
                     amount: item.balance, // Check field name
                     sourceAPI: 'MagicEden'
                 }));
                 break;
            default:
                console.warn(`[Transformer] Unknown source for Wallet Balance: ${source}`);
                normalizedList = balanceList.map(item => ({ runeId: item.runeId || item.id || item.name, runeName: item.name || item.runeName, amount: item.amount || item.balance, sourceAPI: source, ...item }));
        }
    } catch (error) {
        console.error(`[Transformer] Error normalizing Wallet Balance from ${source}:`, error);
    }
    return normalizedList;
}

/**
 * Normalizes token order data.
 * @param {any} data - Raw API data.
 * @param {string} source - Source API name.
 * @returns {{bids: UnifiedOrder[], asks: UnifiedOrder[]}} - Object containing normalized bids and asks.
 */
function normalizeOrders(data, source) {
     console.log(`[Transformer] Normalizing Orders from ${source}`);
     if (!data) return { bids: [], asks: [] };
     let normalizedBids = [];
     let normalizedAsks = [];
     try {
         // Data structure varies greatly here
         // ME might return a list, OKX might have bids/asks keys
         const orderList = data.data || data.orders || (Array.isArray(data) ? data : []);

         switch (source.toLowerCase()) {
             case 'magiceden': // /orders/rune
                 orderList.forEach(item => {
                     const order = {
                         orderId: item.orderId || item.id,
                         type: item.orderKind === 'buy' ? 'bid' : 'ask', // Map kind
                         runeId: item.runeIdentifier || item.runeId || item.runeName,
                         amount: item.amount,
                         pricePerUnitBTC: item.price?.btc ? (item.price.btc / item.amount) : null,
                         priceTotalBTC: item.price?.btc ?? null,
                         pricePerUnitUSD: item.price?.usd ? (item.price.usd / item.amount) : null,
                         priceTotalUSD: item.price?.usd ?? null,
                         ownerAddress: item.seller || item.buyer, // Depends on type
                         expiry: item.expiry ? Math.floor(new Date(item.expiry).getTime() / 1000) : null,
                         sourceAPI: 'MagicEden'
                     };
                     if (order.type === 'bid') normalizedBids.push(order);
                     else normalizedAsks.push(order);
                 });
                 break;
             case 'okx': // /get-runes-order-list
                  // OKX might separate bids/asks in the response, adjust accordingly
                 const bids = data?.bidOrders || []; // Example structure
                 const asks = data?.askOrders || []; // Example structure

                 normalizedBids = bids.map(item => ({
                     orderId: item.orderId,
                     type: 'bid',
                     runeId: item.runeName, // Assuming name is identifier
                     amount: item.amount,
                     pricePerUnitBTC: item.unitPrice?.amount, // Check currency (BTC? SATS?)
                     priceTotalBTC: null, // Calculate if needed
                     pricePerUnitUSD: null, // Check if available
                     priceTotalUSD: null,
                     ownerAddress: item.buyerAddr,
                     expiry: null, // Check if available
                     sourceAPI: 'OKX'
                 }));
                  normalizedAsks = asks.map(item => ({
                     orderId: item.orderId,
                     type: 'ask',
                     runeId: item.runeName,
                     amount: item.amount,
                     pricePerUnitBTC: item.unitPrice?.amount,
                     priceTotalBTC: null,
                     pricePerUnitUSD: null,
                     priceTotalUSD: null,
                     ownerAddress: item.sellerAddr,
                     expiry: null,
                     sourceAPI: 'OKX'
                 }));
                 break;
             default:
                 console.warn(`[Transformer] Unknown source for Orders: ${source}`);
                 // Cannot reliably normalize without knowing structure
         }
     } catch (error) {
         console.error(`[Transformer] Error normalizing Orders from ${source}:`, error);
     }
     return { bids: normalizedBids, asks: normalizedAsks };
}


export const Transformers = {
    normalizeRuneList,
    normalizeRuneInfo,
    normalizeMarketInfo,
    normalizeActivity,
    normalizeWalletBalance,
    normalizeOrders
};

export default Transformers; 