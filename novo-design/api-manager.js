/**
 * API Manager para RUNES Analytics Pro
 * Gerencia todas as requisições de dados, caching e processamento
 */

class ApiManager {
    constructor() {
        this.config = {
            refreshInterval: 60000, // 1 minuto
            apiEndpoint: 'https://api.runesanalytics.pro/v1/',
            cacheTimeout: {
                runes: 15 * 60 * 1000, // 15 minutos para dados de runes
                transactions: 3 * 60 * 1000, // 3 minutos para transações
                whales: 5 * 60 * 1000, // 5 minutos para atividades de baleias
                marketStats: 10 * 60 * 1000 // 10 minutos para estatísticas de mercado
            },
            isDevelopment: true, // Substituir por false em produção
            useMockData: true // Substituir por false em produção
        };

        // Inicializar cache
        this.cache = {
            runes: {
                data: null,
                timestamp: 0,
                details: {}
            },
            transactions: {
                data: null,
                timestamp: 0
            },
            whales: {
                data: null,
                timestamp: 0
            },
            marketStats: {
                data: null,
                timestamp: 0
            },
            whaleActivity: []
        };
        
        // Expandir a biblioteca de tokens Runes
        this.runesLibrary = [
            {
                id: '845700:1',
                name: 'UNCOMMON',
                symbol: 'U',
                divisibility: 18,
                supply: 21000000,
                description: 'Um dos primeiros e mais populares Runes do Bitcoin',
                mintedAt: '2023-12-15',
                etcher: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                isOpenMint: false
            },
            {
                id: '845702:15',
                name: 'RARE',
                symbol: 'R',
                divisibility: 8,
                supply: 100000,
                description: 'Rune de fornecimento limitado inspirado na raridade',
                mintedAt: '2023-12-15',
                etcher: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
                isOpenMint: false
            },
            {
                id: '847501:24',
                name: 'MEME',
                symbol: 'M',
                divisibility: 0,
                supply: 69420000,
                description: 'Rune divertido focado na cultura de memes',
                mintedAt: '2023-12-16',
                etcher: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
                isOpenMint: true
            },
            {
                id: '848010:3',
                name: 'PEPE',
                symbol: 'P',
                divisibility: 18,
                supply: 420690000000,
                description: 'Rune inspirado no meme do sapo Pepe',
                mintedAt: '2023-12-17',
                etcher: 'bc1qxke8wgkle3f4wqnzc4gmpepqryd0ta5sqf3nlk',
                isOpenMint: true
            },
            {
                id: '848120:12',
                name: 'BITCOIN',
                symbol: 'B',
                divisibility: 8,
                supply: 21000000,
                description: 'Rune representando o espírito do Bitcoin original',
                mintedAt: '2023-12-18',
                etcher: '3FkenCiXpSLqD8L79intRNXUgjRoH9sjXa',
                isOpenMint: false
            },
            {
                id: '849045:7',
                name: 'DEGEN',
                symbol: 'D',
                divisibility: 6,
                supply: 1000000000,
                description: 'Rune para entusiastas de investimentos de alto risco',
                mintedAt: '2023-12-19',
                etcher: 'bc1qkevfmz0f3wzhpagm4qm7razlsfalvq29wu27zq',
                isOpenMint: true
            },
            {
                id: '849301:52',
                name: 'MOON',
                symbol: '🌙',
                divisibility: 12,
                supply: 1969000000,
                description: 'Rune inspirado na jornada à lua do Bitcoin',
                mintedAt: '2023-12-20',
                etcher: 'bc1qt32l0as5s6xj4t0y798ph5z28l8xm5vr9m2gck',
                isOpenMint: false
            },
            {
                id: '850287:18',
                name: 'SATOSHI',
                symbol: 'S',
                divisibility: 0,
                supply: 21000000000000,
                description: 'Rune homenageando o criador do Bitcoin',
                mintedAt: '2023-12-22',
                etcher: 'bc1qdmuzs3sdkmewt7kve70qvltd73u0f52n5fc7np',
                isOpenMint: false
            },
            {
                id: '851432:9',
                name: 'HODL',
                symbol: 'H',
                divisibility: 4,
                supply: 2140000,
                description: 'Rune representando a filosofia de longo prazo do Bitcoin',
                mintedAt: '2023-12-25',
                etcher: 'bc1q5n008pfjlc6q5m8vzm73n8xrt5a5t4m5jlqav5',
                isOpenMint: false
            },
            {
                id: '852011:33',
                name: 'MAGIC',
                symbol: '✨',
                divisibility: 8,
                supply: 777777,
                description: 'Rune místico inspirado em elementos mágicos',
                mintedAt: '2023-12-27',
                etcher: 'bc1qg9knrfzz0kj534tl5kjt3z2xmyqgc7eygca9vw',
                isOpenMint: true
            },
            {
                id: '853020:8',
                name: 'BASED',
                symbol: 'BAS',
                divisibility: 9,
                supply: 420000000,
                description: 'Rune para a comunidade baseada de Bitcoin',
                mintedAt: '2023-12-30',
                etcher: 'bc1qrmk5lww37yppd8jh4c8d2r9wxghxhtprpkr6rs',
                isOpenMint: true
            },
            {
                id: '855213:22',
                name: 'ORDINALS',
                symbol: 'ORD',
                divisibility: 6,
                supply: 1337000,
                description: 'Rune homenageando o protocolo Ordinals',
                mintedAt: '2024-01-05',
                etcher: 'bc1pcey7c382mza5xnzptsszmmlr5h24rlj2308r5h6k96h0yzmyuhqszhf737',
                isOpenMint: false
            },
            {
                id: '856428:41',
                name: 'GEM',
                symbol: '💎',
                divisibility: 10,
                supply: 50000000,
                description: 'Rune para mãos de diamante da comunidade Bitcoin',
                mintedAt: '2024-01-10',
                etcher: 'bc1q7fshrgj3l02jmd3snxhtyxeqvlp30c7wfefkd4',
                isOpenMint: false
            },
            {
                id: '857321:5',
                name: 'ALPHA',
                symbol: 'α',
                divisibility: 18,
                supply: 1000000,
                description: 'Rune para conhecedores de informações privilegiadas',
                mintedAt: '2024-01-15',
                etcher: 'bc1qkl5668sfj94kydcmyldaaj89yd0fhnsj6ptufa',
                isOpenMint: false
            },
            {
                id: '858741:29',
                name: 'BULLISH',
                symbol: '🐂',
                divisibility: 8,
                supply: 318000000,
                description: 'Rune representando o otimismo do mercado Bitcoin',
                mintedAt: '2024-01-22',
                etcher: 'bc1q9h05tnxdvk8744sj4cc9q488ntrfz2z7x0xvta',
                isOpenMint: true
            }
        ];
        
        // Gerar dados de mock para desenvolvimento
        if (this.config.isDevelopment) {
            this.generateMockData();
        }
    }

    /**
     * Gera dados de mock para desenvolvimento
     */
    generateMockData() {
        // Gerar uma lista de runes para o ranking
        const runesRanking = this.runesLibrary.map((rune, index) => {
            const price = Math.random() * (index === 0 ? 0.1 : 0.01);
            const change24h = (Math.random() * 30) - 15; // -15% a +15%
            const volume = Math.random() * 10000000 + 500000; // 500K a 10.5M
            const marketCap = price * rune.supply;
            
            return {
                ...rune,
                price,
                change24h,
                volume,
                marketCap,
                rank: index + 1,
                holders: Math.floor(Math.random() * 50000) + 10000,
                transactions24h: Math.floor(Math.random() * 5000) + 500
            };
        });
        
        // Ordernar por capitalização de mercado
        runesRanking.sort((a, b) => b.marketCap - a.marketCap);
        runesRanking.forEach((rune, index) => {
            rune.rank = index + 1;
        });
        
        // Armazenar no cache
        this.cache.runes.data = runesRanking;
        this.cache.runes.timestamp = Date.now();
        
        // Gerar transações recentes
        const recentTransactions = [];
        for (let i = 0; i < 50; i++) {
            const rune = this.runesLibrary[Math.floor(Math.random() * this.runesLibrary.length)];
            const amount = Math.floor(Math.random() * 1000000) + 1000;
            const addresses = [
                'bc1q7fshrgj3l02jmd3snxhtyxeqvlp30c7wfefkd4',
                'bc1qg9knrfzz0kj534tl5kjt3z2xmyqgc7eygca9vw',
                '3FkenCiXpSLqD8L79intRNXUgjRoH9sjXa',
                'bc1qkl5668sfj94kydcmyldaaj89yd0fhnsj6ptufa',
                'bc1q9h05tnxdvk8744sj4cc9q488ntrfz2z7x0xvta',
                '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                'bc1qt32l0as5s6xj4t0y798ph5z28l8xm5vr9m2gck'
            ];
            
            const fromAddress = addresses[Math.floor(Math.random() * addresses.length)];
            let toAddress;
            do {
                toAddress = addresses[Math.floor(Math.random() * addresses.length)];
            } while (toAddress === fromAddress);
            
            const types = ['compra', 'venda', 'transferência'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const transaction = {
                id: `tx_${Math.random().toString(36).substring(2, 15)}`,
                type,
                rune: rune.name,
                runeId: rune.id,
                amount,
                valueUSD: amount * (Math.random() * 0.01),
                fromAddress,
                toAddress,
                timestamp: Date.now() - (Math.random() * 86400000), // Últimas 24 horas
                blockHeight: 850000 + Math.floor(Math.random() * 10000)
            };
            
            recentTransactions.push(transaction);
        }
        
        // Ordenar por timestamp (mais recentes primeiro)
        recentTransactions.sort((a, b) => b.timestamp - a.timestamp);
        
        // Armazenar no cache
        this.cache.transactions.data = recentTransactions;
        this.cache.transactions.timestamp = Date.now();
        
        // Gerar atividades de baleias
        const whaleActivities = [];
        for (let i = 0; i < 20; i++) {
            const rune = this.runesLibrary[Math.floor(Math.random() * this.runesLibrary.length)];
            const amount = Math.floor(Math.random() * 10000000) + 1000000; // Transações grandes
            const addresses = [
                'bc1q7fshrgj3l02jmd3snxhtyxeqvlp30c7wfefkd4', // Whales
                'bc1qg9knrfzz0kj534tl5kjt3z2xmyqgc7eygca9vw',
                '3FkenCiXpSLqD8L79intRNXUgjRoH9sjXa',
                'bc1qkl5668sfj94kydcmyldaaj89yd0fhnsj6ptufa',
                'bc1q9h05tnxdvk8744sj4cc9q488ntrfz2z7x0xvta'
            ];
            
            const fromAddress = addresses[Math.floor(Math.random() * addresses.length)];
            let toAddress;
            do {
                toAddress = addresses[Math.floor(Math.random() * addresses.length)];
            } while (toAddress === fromAddress);
            
            const types = ['compra', 'venda', 'transferência'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const impactLevels = ['baixo', 'médio', 'alto'];
            const impactLevel = impactLevels[Math.floor(Math.random() * impactLevels.length)];
            
            const activity = {
                id: `whale_${Math.random().toString(36).substring(2, 15)}`,
                type,
                rune: rune.name,
                runeId: rune.id,
                amount,
                valueUSD: amount * (Math.random() * 0.01),
                fromAddress,
                toAddress,
                timestamp: Date.now() - (Math.random() * 86400000), // Últimas 24 horas
                blockHeight: 850000 + Math.floor(Math.random() * 10000),
                impactLevel,
                priceImpact: (Math.random() * 5) * (impactLevel === 'alto' ? 1 : impactLevel === 'médio' ? 0.5 : 0.2)
            };
            
            whaleActivities.push(activity);
        }
        
        // Ordenar por timestamp (mais recentes primeiro)
        whaleActivities.sort((a, b) => b.timestamp - a.timestamp);
        
        // Armazenar no cache
        this.cache.whales.data = whaleActivities;
        this.cache.whales.timestamp = Date.now();
        
        // Gerar estatísticas de mercado
        const marketStats = {
            totalMarketCap: runesRanking.reduce((acc, rune) => acc + rune.marketCap, 0),
            totalVolume24h: runesRanking.reduce((acc, rune) => acc + rune.volume, 0),
            totalTransactions24h: runesRanking.reduce((acc, rune) => acc + rune.transactions24h, 0),
            totalRunes: runesRanking.length,
            topGainers: runesRanking
                .filter(rune => rune.change24h > 0)
                .sort((a, b) => b.change24h - a.change24h)
                .slice(0, 5),
            topLosers: runesRanking
                .filter(rune => rune.change24h < 0)
                .sort((a, b) => a.change24h - b.change24h)
                .slice(0, 5),
            topVolume: runesRanking
                .sort((a, b) => b.volume - a.volume)
                .slice(0, 5),
            dominanceIndex: runesRanking[0].marketCap / runesRanking.reduce((acc, rune) => acc + rune.marketCap, 0) * 100,
            bitcoinPrice: 59847.23 + (Math.random() * 2000 - 1000),
            bitcoinChange24h: 2.4 + (Math.random() * 2 - 1)
        };
        
        // Armazenar no cache
        this.cache.marketStats.data = marketStats;
        this.cache.marketStats.timestamp = Date.now();
        
        // Gerar detalhes para alguns runes
        this.runesLibrary.forEach(rune => {
            // Gerar histórico de preços para 30 dias
            const priceHistory = [];
            let currentPrice = rune.price || (Math.random() * 0.01);
            
            for (let i = 30; i >= 0; i--) {
                // Variação diária de até +/-10%
                const dailyChange = 1 + ((Math.random() * 0.2) - 0.1);
                currentPrice *= dailyChange;
                
                priceHistory.push({
                    timestamp: Date.now() - (i * 86400000),
                    price: currentPrice,
                    volume: Math.random() * 5000000 + 100000
                });
            }
            
            // Dados sociais
            const socialData = {
                sentiment: Math.random() * 100,
                mentions24h: Math.floor(Math.random() * 10000),
                mentionsChange: (Math.random() * 50) - 20, // -20% a +30%
                twitterFollowers: Math.floor(Math.random() * 50000) + 1000,
                discordMembers: Math.floor(Math.random() * 20000) + 500,
                telegramMembers: Math.floor(Math.random() * 15000) + 500,
                redditMembers: Math.floor(Math.random() * 5000) + 200
            };
            
            // Estatísticas on-chain
            const onChainStats = {
                uniqueHolders: Math.floor(Math.random() * 50000) + 10000,
                holdersChange24h: (Math.random() * 20) - 5, // -5% a +15%
                activeAddresses24h: Math.floor(Math.random() * 5000) + 500,
                transactionsAvg7d: Math.floor(Math.random() * 2000) + 200,
                transferVolume24h: Math.random() * 5000000 + 100000,
                largestHolders: [
                    { address: 'bc1q7fshrgj3l02jmd3snxhtyxeqvlp30c7wfefkd4', percentage: 5 + Math.random() * 10 },
                    { address: 'bc1qg9knrfzz0kj534tl5kjt3z2xmyqgc7eygca9vw', percentage: 3 + Math.random() * 7 },
                    { address: '3FkenCiXpSLqD8L79intRNXUgjRoH9sjXa', percentage: 2 + Math.random() * 5 },
                    { address: 'bc1qkl5668sfj94kydcmyldaaj89yd0fhnsj6ptufa', percentage: 1 + Math.random() * 4 },
                    { address: 'bc1q9h05tnxdvk8744sj4cc9q488ntrfz2z7x0xvta', percentage: 1 + Math.random() * 3 }
                ]
            };
            
            // Métricas de minting (se aplicável)
            const mintingMetrics = rune.isOpenMint ? {
                totalMinted: Math.floor(Math.random() * rune.supply),
                remainingToMint: Math.floor(Math.random() * rune.supply),
                mintingRate24h: Math.floor(Math.random() * 100000),
                averageMintSize: Math.floor(Math.random() * 10000) + 1000,
                mintingAddresses24h: Math.floor(Math.random() * 1000) + 100
            } : null;
            
            // Armazenar detalhes no cache
            this.cache.runes.details[rune.id] = {
                ...rune,
                priceHistory,
                socialData,
                onChainStats,
                mintingMetrics,
                lastUpdated: Date.now()
            };
        });
    }
    
    /**
     * Gera um timestamp aleatório no passado
     * @param {Number} maxAgeMs - Idade máxima em milissegundos
     * @returns {Date} Data/hora aleatória no passado
     */
    getRandomPastTime(maxAgeMs) {
        const now = Date.now();
        const ageMs = Math.floor(Math.random() * maxAgeMs);
        return new Date(now - ageMs);
    }
    
    /**
     * Verifica se um cache está válido
     * @param {Object} cacheEntry - Entrada de cache
     * @returns {Boolean} Verdadeiro se o cache é válido
     */
    isCacheValid(cacheEntry) {
        if (!cacheEntry || !cacheEntry.timestamp) return false;
        
        return (Date.now() - cacheEntry.timestamp) < this.config.cacheTimeout;
    }
    
    /**
     * Obtém o ranking de tokens Runes
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de tokens ordenada
     */
    async getRunesRanking(options = {}) {
        const { limit = 10, sortBy = 'volume', sortOrder = 'desc', timeframe = '24h' } = options;
        
        if (this.config.isDevelopment) {
            // Em modo de desenvolvimento, retornar dados simulados
            console.log('Usando dados simulados para getRunesRanking', options);
            
            // Clonar os dados para não modificar o original
            let tokens = [...this.cache.runes.data];
            
            // Ordenar
            const sortField = this.getSortField(sortBy);
            tokens.sort((a, b) => {
                return sortOrder === 'desc' 
                    ? b[sortField] - a[sortField]
                    : a[sortField] - b[sortField];
            });
            
            // Limitar quantidade
            return tokens.slice(0, limit);
        }
        
        // Verificar cache
        if (this.isCacheValid(this.cache.runes)) {
            return this.cache.runes.data.slice(0, limit);
        }
        
        try {
            // Em produção, faria a requisição real aqui
            const response = await fetch(this.config.apiEndpoint + 'runes/ranking');
            const data = await response.json();
            
            // Armazenar no cache
            this.cache.runes.data = data;
            this.cache.runes.timestamp = Date.now();
            
            return data.slice(0, limit);
        } catch (error) {
            console.error('Erro ao buscar ranking de tokens Runes:', error);
            return [];
        }
    }
    
    /**
     * Obtém o campo de ordenação baseado no parâmetro
     * @param {String} sortBy - Parâmetro de ordenação
     * @returns {String} Campo de ordenação correspondente
     */
    getSortField(sortBy) {
        const map = {
            'volume': 'volume',
            'price': 'price',
            'change': 'change24h',
            'marketcap': 'marketCap'
        };
        
        return map[sortBy] || 'volume';
    }
    
    /**
     * Obtém dados detalhados de um token Rune
     * @param {String} runeId - ID do token
     * @returns {Promise<Object>} Detalhes do token
     */
    async getRuneDetails(runeId) {
        if (this.config.isDevelopment) {
            // Em modo de desenvolvimento, retornar dados simulados
            console.log('Usando dados simulados para getRuneDetails', runeId);
            
            const token = this.cache.runes.data.find(t => t.id === runeId);
            if (!token) return null;
            
            return {
                ...token,
                description: 'Descrição simulada para token ' + runeId,
                website: 'https://' + runeId.toLowerCase() + '.network',
                explorer: 'https://runesscan.io/token/' + runeId,
                social: {
                    twitter: 'https://twitter.com/' + runeId.toLowerCase(),
                    telegram: 'https://t.me/' + runeId.toLowerCase(),
                    discord: 'https://discord.gg/' + runeId.toLowerCase()
                },
                history: this.generatePriceHistory()
            };
        }
        
        // Verificar cache
        if (this.cache.runes.details[runeId] && 
            this.isCacheValid(this.cache.runes.details[runeId])) {
            return this.cache.runes.details[runeId];
        }
        
        try {
            // Em produção, faria a requisição real aqui
            const response = await fetch(this.config.apiEndpoint + 'runes/' + runeId);
            const data = await response.json();
            
            // Armazenar no cache
            this.cache.runes.details[runeId] = data;
            this.cache.runes.details[runeId].lastUpdated = Date.now();
            
            return data;
        } catch (error) {
            console.error(`Erro ao buscar detalhes do token ${runeId}:`, error);
            return null;
        }
    }
    
    /**
     * Gera histórico de preços simulado
     * @returns {Array} Dados de preço históricos
     */
    generatePriceHistory() {
        const history = [];
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        
        // Gerar dados dos últimos 30 dias
        for (let i = 30; i >= 0; i--) {
            const timestamp = now - (i * day);
            history.push({
                timestamp: new Date(timestamp),
                price: 50 + Math.random() * 20,
                volume: 10000000 + Math.random() * 20000000
            });
        }
        
        return history;
    }
    
    /**
     * Obtém atividades recentes de baleias
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de atividades de baleias
     */
    async getWhaleActivities(options = {}) {
        const { limit = 5, timeframe = '24h' } = options;
        
        if (this.config.isDevelopment) {
            // Em modo de desenvolvimento, retornar dados simulados
            console.log('Usando dados simulados para getWhaleActivities', options);
            
            // Clonar os dados para não modificar o original
            let transactions = [...this.cache.transactions.data];
            
            // Filtrar pelo timeframe se necessário
            if (timeframe) {
                const now = Date.now();
                const timeframeMs = this.timeframeToMs(timeframe);
                
                transactions = transactions.filter(tx => {
                    const txTime = new Date(tx.timestamp).getTime();
                    return (now - txTime) <= timeframeMs;
                });
            }
            
            // Ordenar por timestamp, mais recentes primeiro
            transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Limitar quantidade
            return transactions.slice(0, limit);
        }
        
        // Verificar cache
        if (this.isCacheValid(this.cache.whales)) {
            return this.cache.whales.data.slice(0, limit);
        }
        
        try {
            // Em produção, faria a requisição real aqui
            const response = await fetch(this.config.apiEndpoint + 'whales/activities');
            const data = await response.json();
            
            // Armazenar no cache
            this.cache.whales.data = data;
            this.cache.whales.timestamp = Date.now();
            
            return data.slice(0, limit);
        } catch (error) {
            console.error('Erro ao buscar atividades de baleias:', error);
            return [];
        }
    }
    
    /**
     * Obtém transações recentes
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de transações
     */
    async getRecentTransactions(options = {}) {
        const { 
            since = new Date(Date.now() - 3600000), // 1 hora atrás por padrão
            minValue = 0,
            includeTransfers = true,
            includeMints = true,
            limit = 100
        } = options;
        
        if (this.config.isDevelopment) {
            // Em modo de desenvolvimento, retornar dados simulados
            console.log('Usando dados simulados para getRecentTransactions', options);
            
            // Clonar os dados para não modificar o original
            let transactions = [...this.cache.transactions.data];
            
            // Filtrar pelo valor mínimo
            transactions = transactions.filter(tx => tx.valueUSD >= minValue);
            
            // Filtrar por tipo
            if (!includeTransfers) {
                transactions = transactions.filter(tx => tx.type !== 'transfer');
            }
            
            // Filtrar por timestamp
            const sinceTime = new Date(since).getTime();
            transactions = transactions.filter(tx => new Date(tx.timestamp).getTime() >= sinceTime);
            
            // Ordenar por timestamp, mais recentes primeiro
            transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Limitar quantidade
            return transactions.slice(0, limit);
        }
        
        // Verificar cache
        if (this.isCacheValid(this.cache.transactions)) {
            return this.filterTransactions(this.cache.transactions.data, options);
        }
        
        try {
            // Em produção, faria a requisição real aqui
            const response = await fetch(this.config.apiEndpoint + 'transactions');
            const data = await response.json();
            
            // Armazenar no cache
            this.cache.transactions.data = data;
            this.cache.transactions.timestamp = Date.now();
            
            return this.filterTransactions(data, options);
        } catch (error) {
            console.error('Erro ao buscar transações recentes:', error);
            return [];
        }
    }
    
    /**
     * Filtra transações baseado nas opções
     * @param {Array} transactions - Transações para filtrar
     * @param {Object} options - Opções de filtro
     * @returns {Array} Transações filtradas
     */
    filterTransactions(transactions, options) {
        const { 
            since = new Date(Date.now() - 3600000),
            minValue = 0,
            includeTransfers = true,
            includeMints = true,
            limit = 100
        } = options;
        
        let result = [...transactions];
        
        // Filtrar pelo valor mínimo
        result = result.filter(tx => tx.valueUSD >= minValue);
        
        // Filtrar por tipo
        if (!includeTransfers) {
            result = result.filter(tx => tx.type !== 'transfer');
        }
        
        if (!includeMints) {
            result = result.filter(tx => tx.type !== 'mint');
        }
        
        // Filtrar por timestamp
        const sinceTime = new Date(since).getTime();
        result = result.filter(tx => new Date(tx.timestamp).getTime() >= sinceTime);
        
        // Ordenar por timestamp, mais recentes primeiro
        result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Limitar quantidade
        return result.slice(0, limit);
    }
    
    /**
     * Obtém transações de baleias para histórico
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de transações de baleias
     */
    async getWhaleTransactions(options = {}) {
        // Esta função é similar a getRecentTransactions, mas específica para baleias
        // Em uma implementação real, teria um endpoint específico
        
        // Para simplificar, estamos reutilizando a mesma lógica mas com um valor mínimo alto
        return this.getRecentTransactions({
            ...options,
            minValue: 100000 // $100k como mínimo para considerar uma transação de baleia
        });
    }
    
    /**
     * Converte string de timeframe para milissegundos
     * @param {String} timeframe - Timeframe (1h, 24h, 7d, 30d, etc)
     * @returns {Number} Timeframe em milissegundos
     */
    timeframeToMs(timeframe) {
        const hour = 3600000;
        const day = 24 * hour;
        
        switch (timeframe) {
            case '1h': return hour;
            case '6h': return 6 * hour;
            case '12h': return 12 * hour;
            case '24h': return day;
            case '7d': return 7 * day;
            case '30d': return 30 * day;
            default: return day; // 24h como padrão
        }
    }
    
    /**
     * Obtém estatísticas de mercado
     * @returns {Promise<Object>} Estatísticas de mercado
     */
    async getMarketStats() {
        if (this.config.isDevelopment) {
            // Em modo de desenvolvimento, retornar dados simulados
            console.log('Usando dados simulados para getMarketStats');
            return this.cache.marketStats.data;
        }
        
        // Verificar cache
        if (this.isCacheValid(this.cache.marketStats)) {
            return this.cache.marketStats.data;
        }
        
        try {
            // Em produção, faria a requisição real aqui
            const response = await fetch(this.config.apiEndpoint + 'market/stats');
            const data = await response.json();
            
            // Armazenar no cache
            this.cache.marketStats.data = data;
            this.cache.marketStats.timestamp = Date.now();
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas de mercado:', error);
            return null;
        }
    }
    
    /**
     * Limpa todo o cache de dados
     */
    clearCache() {
        this.cache = {
            runes: {
                data: null,
                timestamp: 0,
                details: {}
            },
            transactions: {
                data: null,
                timestamp: 0
            },
            whales: {
                data: null,
                timestamp: 0
            },
            marketStats: {
                data: null,
                timestamp: 0
            },
            whaleActivity: []
        };
        
        console.log('Cache limpo com sucesso');
    }
    
    /**
     * Limpa uma entrada específica do cache
     * @param {String} cacheKey - Chave do cache para limpar
     */
    clearCacheEntry(cacheKey) {
        if (cacheKey === 'runes') {
            this.cache.runes.data = null;
            this.cache.runes.timestamp = 0;
            this.cache.runes.details = {};
        } else if (this.cache[cacheKey]) {
            this.cache[cacheKey] = {
                data: null,
                timestamp: 0
            };
        }
        
        console.log(`Cache de ${cacheKey} limpo com sucesso`);
    }

    /**
     * Verifica se um token específico tem atividade recente de baleias
     * @param {string} tokenId - ID do token para verificar
     * @returns {Promise<boolean>} - True se houver atividade de baleias
     */
    async hasWhaleActivity(tokenId) {
        if (!tokenId) return false;
        
        try {
            // Em produção, consultaria a API real
            if (!this.config.useMockData) {
                const response = await fetch(`${this.config.apiBaseUrl}/whales/activity/${tokenId}`);
                const data = await response.json();
                return data.hasActivity || false;
            }
            
            // No desenvolvimento, usar dados mockados
            // Verificar cache
            if (this.isCacheValid('whaleActivity')) {
                const cachedData = this.cache.whaleActivity;
                const activity = cachedData.find(a => a.tokenId === tokenId);
                return activity ? activity.hasActivity : this.mockRandomWhaleActivity(tokenId);
            }
            
            // Gerar dados mockados aleatórios
            return this.mockRandomWhaleActivity(tokenId);
        } catch (error) {
            console.error('Erro ao verificar atividade de baleias:', error);
            return false;
        }
    }
    
    /**
     * Gera uma resposta aleatória para atividade de baleias
     * @param {string} tokenId - ID do token 
     * @returns {boolean} - Resposta aleatória
     */
    mockRandomWhaleActivity(tokenId) {
        // Tokens no top 10 têm maior probabilidade de atividade de baleias
        const token = this.mockData.tokens.find(t => t.id === tokenId);
        
        if (!token) return Math.random() < 0.1; // 10% de chance para tokens desconhecidos
        
        if (token.rank <= 10) {
            return Math.random() < 0.6; // 60% de chance para tokens top 10
        } else if (token.rank <= 30) {
            return Math.random() < 0.3; // 30% de chance para tokens top 30
        } else {
            return Math.random() < 0.05; // 5% de chance para outros tokens
        }
    }

    /**
     * Obtém dados do mercado de tokens Runes
     * @returns {Promise<Object>} Dados de mercado
     */
    getMarketData() {
        console.log('ApiManager.getMarketData foi chamado!');
        const cacheKey = 'market_stats';
        
        return new Promise((resolve, reject) => {
            try {
                // Tenta obter dados do cache primeiro
                if (this.cache.marketStats.data && 
                    Date.now() - this.cache.marketStats.timestamp < this.config.cacheTimeout.marketStats) {
                    console.log('Usando dados de mercado em cache');
                    return resolve(this.cache.marketStats.data);
                }

                // Se não há cache ou expirou, gera dados (aqui seriam dados de API em produção)
                console.log('Gerando novos dados de mercado');
                
                // Em ambiente de desenvolvimento, usamos dados mockados
                const marketData = {
                    totalMarketCap: 8500000000, // 8.5B
                    volume24h: 245000000, // 245M
                    totalTokens: 458,
                    activeTokens: 312,
                    transactions24h: 152489,
                    tokensByMarketCap: this.cache.runes.data || this.runesLibrary.slice(0, 5),
                    priceChanges: {
                        'UNCOMMON': 5.4,
                        'RARE': -2.1,
                        'MEME': 12.4,
                        'PEPE': 8.7,
                        'BITCOIN': -3.2
                    },
                    sentiment: 75 // 0-100
                };

                // Armazenar no cache
                this.cache.marketStats.data = marketData;
                this.cache.marketStats.timestamp = Date.now();
                
                resolve(marketData);
            } catch (error) {
                console.error('Erro ao obter dados de mercado:', error);
                reject(error);
            }
        });
    }
}

// Inicializar API Manager quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando API Manager...');
    window.apiManager = new ApiManager();
}); 