// src/mocks/mock-data.js

// Mock data should match the structure defined by the UNIFIED types in transformers.js

export const MockData = {
    getRuneList: () => [
        { id: 'UNCOMMON•GOODS', name: 'UNCOMMON•GOODS', number: 0, supply: '100000000000000', burned: '0', holders: 15000, transactions: 50000, marketCap: 100000000, priceUSD: 0.001, volume24hUSD: 500000, change24hPercent: 5.5, sourceAPI: 'Mock' },
        { id: 'SATOSHI•NAKAMOTO', name: 'SATOSHI•NAKAMOTO', number: 1, supply: '21000000', burned: '0', holders: 5421, transactions: 12345, marketCap: 50000000, priceUSD: 2.38, volume24hUSD: 200000, change24hPercent: -1.2, sourceAPI: 'Mock' },
        { id: 'MEME•ECONOMICS', name: 'MEME•ECONOMICS', number: 2, supply: '1000000000', burned: '0', holders: 3000, transactions: 8000, marketCap: 10000000, priceUSD: 0.01, volume24hUSD: 80000, change24hPercent: 10.1, sourceAPI: 'Mock' },
    ],

    getRuneInfo: (idOrName) => ({
        id: idOrName.toUpperCase(),
        name: idOrName.toUpperCase(),
        number: Math.floor(Math.random() * 100), // Random number for mock
        supply: '100000000', // Example supply
        burned: '1000000',
        holders: Math.floor(Math.random() * 5000) + 500,
        transactions: Math.floor(Math.random() * 10000) + 1000,
        marketCap: Math.floor(Math.random() * 10000000) + 1000000,
        priceUSD: Math.random() * 10,
        volume24hUSD: Math.floor(Math.random() * 500000) + 50000,
        change24hPercent: (Math.random() * 20) - 10, // -10% to +10%
        sourceAPI: 'Mock'
    }),

    getMarketInfo: (idOrName) => ({
        id: idOrName.toUpperCase(),
        priceUSD: Math.random() * 10,
        volume24hUSD: Math.floor(Math.random() * 500000) + 50000,
        marketCap: Math.floor(Math.random() * 10000000) + 1000000,
        change24hPercent: (Math.random() * 20) - 10,
        sourceAPI: 'Mock'
    }),

    getActivity: (idOrName) => [
        {
            txid: `mock_tx_${Date.now()}`,
            type: 'transfer',
            runeId: idOrName.toUpperCase(),
            fromAddress: 'mock_address_from',
            toAddress: 'mock_address_to',
            amount: '10000',
            priceBTC: null, priceUSD: null,
            timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600), // Within last hour
            sourceAPI: 'Mock'
        },
        {
            txid: `mock_tx_${Date.now() - 10000}`,
            type: 'list',
            runeId: idOrName.toUpperCase(),
            fromAddress: 'mock_address_seller',
            toAddress: null,
            amount: '5000',
            priceBTC: 0.001,
            priceUSD: 65,
            timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 7200), // Within last 2 hours
            sourceAPI: 'Mock'
        }
    ],

    getWalletBalance: (address) => [
        { runeId: 'UNCOMMON•GOODS', runeName: 'UNCOMMON•GOODS', amount: '50000000', sourceAPI: 'Mock' },
        { runeId: 'SATOSHI•NAKAMOTO', runeName: 'SATOSHI•NAKAMOTO', amount: '10', sourceAPI: 'Mock' },
    ],

    getWalletActivity: (address) => [
         {
            txid: `mock_wallet_tx_${Date.now()}`,
            type: 'transfer',
            runeId: 'SATOSHI•NAKAMOTO',
            fromAddress: address,
            toAddress: 'mock_receiver',
            amount: '2',
            priceBTC: null, priceUSD: null,
            timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 1800), // Within last 30 mins
            sourceAPI: 'Mock'
        }
    ],

    getTokenOrders: (idOrName) => ({
        bids: [
            { orderId: `mock_bid_${Date.now()}`, type: 'bid', runeId: idOrName.toUpperCase(), amount: '1000', pricePerUnitBTC: 0.000001, priceTotalBTC: 0.001, pricePerUnitUSD: 0.065, priceTotalUSD: 65, ownerAddress: 'mock_bidder_1', expiry: null, sourceAPI: 'Mock' }
        ],
        asks: [
             { orderId: `mock_ask_${Date.now()}`, type: 'ask', runeId: idOrName.toUpperCase(), amount: '500', pricePerUnitBTC: 0.0000011, priceTotalBTC: 0.00055, pricePerUnitUSD: 0.071, priceTotalUSD: 35.5, ownerAddress: 'mock_seller_1', expiry: null, sourceAPI: 'Mock' }
        ]
    }),
};

export default MockData; 