// src/services/transformers.ts

// Interfaces defined as before...
interface RuneToken {
    id: string; // Can be numeric string (GeniiData) or Name (ME/Ordiscan) or RuneId (ME/Ordiscan)
    name: string; // Usually the human-readable name like UNCOMMON•GOODS
    runeId?: string; // The specific Rune ID (e.g., 840000:1) - Ordiscan/ME might provide this
    symbol?: string; // The ticker symbol (often same as name for Runes)
    divisibility: number;
    etch_timestamp: number; // Unix timestamp
    supply: string;
    holders?: number;
    transactions?: number;
    sourceApi: 'ordiscan' | 'magiceden' | 'geniidata' | 'unknown';
    // Add potential market data fields
    floorPriceBtc?: number;
    marketCapUsd?: number;
    volume24hUsd?: number;
}

interface RuneHistoryPoint {
    timestamp: number; // Unix timestamp (seconds)
    price: number; // Assume BTC price unless specified otherwise by API
    volume: number; // Assume BTC volume unless specified
}

// --- Ordiscan Transformer ---
export function transformOrdiscanToken(osData: any): RuneToken | null {
    const rune = osData;
    if (!rune || !(rune.rune_id || rune.id) || !rune.rune_name) {
        console.warn("[Transformer] Invalid or incomplete Ordiscan data:", osData);
        return null;
    }
    return {
        id: rune.rune_name || rune.id,
        name: rune.rune_name,
        runeId: rune.rune_id || undefined,
        symbol: rune.rune_symbol || rune.rune_name || undefined,
        divisibility: rune.divisibility ?? 0,
        etch_timestamp: rune.timestamp ?? Math.floor(Date.now() / 1000),
        supply: rune.supply?.toString() || '0',
        holders: rune.holders ?? undefined,
        transactions: rune.tx_count ?? undefined,
        sourceApi: 'ordiscan',
    };
}

// --- Magic Eden Token Transformer ---
export function transformMagicEdenToken(meData: any): RuneToken | null {
    if (!meData || !(meData.id || meData.name) ) {
        console.warn("[Transformer] Invalid or incomplete Magic Eden data:", meData);
        return null;
    }
    return {
        id: meData.name || meData.id,
        name: meData.name,
        runeId: meData.runeId || undefined,
        symbol: meData.symbol || meData.name || undefined,
        divisibility: meData.divisibility ?? 0,
        etch_timestamp: meData.creationTimestamp ?? Math.floor(Date.now() / 1000), // Check field: creationTimestamp or similar
        supply: meData.totalSupply?.toString() || '0', // Check field: totalSupply or supply
        holders: meData.holdersCount ?? undefined, // Check field: holdersCount or holders
        transactions: meData.txCount ?? undefined, // Check field: txCount or transactions
        floorPriceBtc: meData.floorPrice?.valueBtc ? parseFloat(meData.floorPrice.valueBtc) : undefined,
        marketCapUsd: meData.marketCap?.valueUsd ? parseFloat(meData.marketCap.valueUsd) : undefined,
        volume24hUsd: meData.volume?.volume1dValueUsd ? parseFloat(meData.volume.volume1dValueUsd) : undefined,
        sourceApi: 'magiceden',
    };
}

// --- GeniiData Token Detail Transformer ---
export function transformGeniiDataToken(gdData: any): RuneToken | null {
    const data = gdData?.data;
    if (!data || !data.rune_id || !data.rune_name) {
        console.warn("[Transformer] Invalid or incomplete GeniiData detail data:", gdData);
        return null;
    }
    return {
        id: data.rune_id.toString(),
        name: data.rune_name,
        runeId: data.rune_id.toString(),
        symbol: data.rune || data.rune_symbol || data.rune_name || undefined,
        divisibility: data.divibility ?? data.divisibility ?? 0,
        etch_timestamp: data.mint_start_time ?? data.create_time ?? Math.floor(Date.now() / 1000),
        supply: data.total_supply?.toString() || '0',
        holders: data.holders_count ?? undefined,
        transactions: data.transactions ?? undefined, // Check field name, might be tx_count
        floorPriceBtc: data.floor_price_btc ? parseFloat(data.floor_price_btc) : undefined,
        marketCapUsd: data.market_cap_usd ? parseFloat(data.market_cap_usd) : undefined,
        volume24hUsd: data.volume_usd_1d ? parseFloat(data.volume_usd_1d) : undefined,
        sourceApi: 'geniidata',
    };
}

// --- GeniiData Popular/List Transformer ---
export function transformGeniiDataPopular(gdData: any): RuneToken[] {
    if (!Array.isArray(gdData?.data?.list)) {
        console.warn("[Transformer] Invalid or unexpected GeniiData popular format:", gdData);
        return [];
    }
    return gdData.data.list.map((item: any): RuneToken | null => {
         if (!item || !item.rune_id || !item.rune_name) return null;
         return {
             id: item.rune_id.toString(),
             name: item.rune_name,
             runeId: item.rune_id.toString(),
             symbol: item.rune || item.rune_symbol || item.rune_name || undefined,
             divisibility: item.divibility ?? item.divisibility ?? 0,
             etch_timestamp: item.mint_start_time ?? item.create_time ?? Math.floor(Date.now() / 1000),
             supply: item.total_supply?.toString() || '0',
             holders: item.holders_count ?? undefined,
             transactions: item.transactions ?? undefined, // Check field name
             floorPriceBtc: item.floor_price_btc ? parseFloat(item.floor_price_btc) : undefined,
             marketCapUsd: item.market_cap_usd ? parseFloat(item.market_cap_usd) : undefined,
             volume24hUsd: item.volume_usd_1d ? parseFloat(item.volume_usd_1d) : undefined,
             sourceApi: 'geniidata',
         };
    }).filter((token): token is RuneToken => token !== null);
}

// --- Magic Eden History Transformer ---
export function transformMagicEdenHistory(meHistoryData: any): RuneHistoryPoint[] {
    if (!Array.isArray(meHistoryData?.candles)) {
        console.warn("[Transformer] Invalid or unexpected Magic Eden history format (expected 'candles' array):", meHistoryData);
        return [];
    }
    return meHistoryData.candles.map((candle: any[]): RuneHistoryPoint | null => {
        if (!Array.isArray(candle) || candle.length < 6) return null;
        const [timestamp_ms, _open, _high, _low, close, volume] = candle;
        const timestamp_s = Math.floor(timestamp_ms / 1000);
        const priceNum = parseFloat(close);
        const volumeNum = parseFloat(volume);

        if (isNaN(timestamp_s) || isNaN(priceNum) || isNaN(volumeNum)) return null;

        return {
            timestamp: timestamp_s,
            price: priceNum,
            volume: volumeNum,
        };
    }).filter((point): point is RuneHistoryPoint => point !== null);
}