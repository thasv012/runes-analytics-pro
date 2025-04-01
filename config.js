const config = {
    apis: {
        ordinals: {
            base: 'https://api-mainnet.magiceden.dev/v2',
            inscriptions: '/v1/inscriptions',
            marketplace: '/v1/marketplace',
            stats: '/ordinals/stat',
            collections: '/ordinals/collections',
            activities: '/ordinals/activities',
            tokens: '/ordinals/tokens',
            recentTxs: '/ordinals/v1/inscriptions/recent'
        },
        runes: {
            base: 'https://mempool.space/api',
            transactions: '/v1/transactions',
            blocks: '/v1/blocks'
        }
    },
    refreshInterval: 30000
};

export default config;
