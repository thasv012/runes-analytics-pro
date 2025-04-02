class RunesMarketDataService {
    constructor() {
        this.apiEndpoints = {
            unisat: 'https://api.unisat.io/v1/indexer/brc20',
            okx: 'https://www.okx.com/api/v5/market/brc20',
            mempool: 'https://mempool.space/api/v1',
            magicEden: 'https://api.magiceden.dev/v2/runes',
            bestInSlot: 'https://api.bestinslot.xyz/v1/runes'
        };
        this.topTokens = [];
        this.updateInterval = 30000; // 30 segundos
        
        // Iniciar com dados simulados para desenvolvimento
        this.initializeSimulatedData();
    }

    initializeSimulatedData() {
        // Dados simulados para desenvolvimento com valores mais realistas
        this.simulatedTokens = [
            { ticker: 'PEPE', name: 'Pepe Rune', price: 0.00000121, change24h: 5.2, volume24h: 12500000, marketCap: 121000000, holders: 5200, supply: 100000000000, whaleActivity: 78 },
            { ticker: 'MEME', name: 'Meme Coin', price: 0.00000345, change24h: -2.8, volume24h: 8900000, marketCap: 345000000, holders: 4800, supply: 100000000000, whaleActivity: 45 },
            { ticker: 'DOGE', name: 'Doge Rune', price: 0.00000089, change24h: 12.4, volume24h: 15600000, marketCap: 89000000, holders: 6100, supply: 100000000000, whaleActivity: 92 },
            { ticker: 'SHIB', name: 'Shiba Rune', price: 0.00000012, change24h: -4.1, volume24h: 7800000, marketCap: 12000000, holders: 3900, supply: 100000000000, whaleActivity: 31 },
            { ticker: 'WOJAK', name: 'Wojak', price: 0.00000067, change24h: 8.9, volume24h: 5400000, marketCap: 67000000, holders: 2800, supply: 100000000000, whaleActivity: 65 },
            { ticker: 'MOON', name: 'To The Moon', price: 0.00000456, change24h: 15.7, volume24h: 9200000, marketCap: 456000000, holders: 5500, supply: 100000000000, whaleActivity: 87 },
            { ticker: 'FOMO', name: 'FOMO Token', price: 0.00000234, change24h: -1.3, volume24h: 6700000, marketCap: 234000000, holders: 4100, supply: 100000000000, whaleActivity: 23 },
            { ticker: 'PUMP', name: 'Pump It', price: 0.00000178, change24h: 7.6, volume24h: 8100000, marketCap: 178000000, holders: 3600, supply: 100000000000, whaleActivity: 76 },
            { ticker: 'DUMP', name: 'Dump It', price: 0.00000045, change24h: -9.2, volume24h: 4300000, marketCap: 45000000, holders: 2200, supply: 100000000000, whaleActivity: 89 },
            { ticker: 'HODL', name: 'HODL Token', price: 0.00000321, change24h: 3.4, volume24h: 7200000, marketCap: 321000000, holders: 4700, supply: 100000000000, whaleActivity: 42 }
        ];
    }

    async getTopTokensByVolume(timeframe = '24h') {
        try {
            // Em produção, isso buscaria dados reais da API
            // Para desenvolvimento, retornamos dados simulados
            console.log(`Buscando tokens por volume (${timeframe})`);
            
            // Simular diferentes ordenações baseadas no timeframe
            let tokens = [...this.simulatedTokens];
            
            // Adicionar um pequeno atraso para simular chamada de API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return tokens.sort((a, b) => b.volume24h - a.volume24h);
        } catch (error) {
            console.error('Erro ao buscar tokens por volume:', error);
            throw error;
        }
    }

    async getTopGainers() {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [...this.simulatedTokens].sort((a, b) => b.change24h - a.change24h);
        } catch (error) {
            console.error('Erro ao buscar top gainers:', error);
            throw error;
        }
    }

    async getTopLosers() {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [...this.simulatedTokens].sort((a, b) => a.change24h - b.change24h);
        } catch (error) {
            console.error('Erro ao buscar top losers:', error);
            throw error;
        }
    }

    async searchTokens(query) {
        try {
            query = query.toLowerCase();
            await new Promise(resolve => setTimeout(resolve, 200));
            return this.simulatedTokens.filter(token => 
                token.ticker.toLowerCase().includes(query) || 
                token.name.toLowerCase().includes(query)
            );
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            throw error;
        }
    }

    async getTokenDetails(ticker) {
        try {
            const token = this.simulatedTokens.find(t => t.ticker === ticker);
            if (!token) return null;
            
            await new Promise(resolve => setTimeout(resolve, 700));
            
            // Adicionar dados extras para a visualização detalhada
            return {
                ...token,
                high24h: token.price * (1 + Math.random() * 0.1),
                low24h: token.price * (1 - Math.random() * 0.1),
                ath: token.price * (1 + Math.random() * 0.5),
                atl: token.price * (1 - Math.random() * 0.5),
                transactions24h: Math.floor(Math.random() * 5000) + 1000,
                deployDate: '2023-10-15',
                description: `${token.name} é um token RUNE no Bitcoin, criado para a comunidade.`,
                links: {
                    website: 'https://example.com',
                    twitter: 'https://twitter.com/example',
                    telegram: 'https://t.me/example'
                },
                // Dados para análise de baleias
                whales: this.generateWhaleData(ticker),
                // Dados para níveis de Fibonacci
                fibonacciLevels: this.generateFibonacciLevels(token.price)
            };
        } catch (error) {
            console.error(`Erro ao buscar detalhes do token ${ticker}:`, error);
            throw error;
        }
    }

    generateWhaleData(ticker) {
        // Gerar dados simulados de baleias para o token
        const whaleCount = Math.floor(Math.random() * 10) + 5; // 5-15 baleias
        const whales = [];
        
        for (let i = 0; i < whaleCount; i++) {
            const token = this.simulatedTokens.find(t => t.ticker === ticker);
            if (!token) continue;
            
            const holdingPercentage = Math.random() * 5 + (i === 0 ? 10 : 1); // Primeira baleia tem 10-15%, outras 1-6%
            const holdingAmount = (token.supply * holdingPercentage / 100);
            
            whales.push({
                address: `bc1q${this.generateRandomString(34)}`,
                holdingPercentage: holdingPercentage,
                holdingAmount: holdingAmount,
                lastTransaction: {
                    type: Math.random() > 0.5 ? 'buy' : 'sell',
                    amount: Math.floor(Math.random() * holdingAmount * 0.1),
                    time: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)) // Últimos 7 dias
                },
                transactionHistory: this.generateTransactionHistory()
            });
        }
        
        // Ordenar por tamanho da posição (maior primeiro)
        return whales.sort((a, b) => b.holdingPercentage - a.holdingPercentage);
    }

    generateTransactionHistory() {
        const history = [];
        const days = 30;
        
        for (let i = 0; i < days; i++) {
            // Nem todo dia tem transação
            if (Math.random() > 0.7) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                
                history.push({
                    date: date,
                    type: Math.random() > 0.5 ? 'buy' : 'sell',
                    amount: Math.floor(Math.random() * 10000000) + 1000000,
                    price: Math.random() * 0.00000500
                });
            }
        }
        
        return history.sort((a, b) => b.date - a.date);
    }

    generateFibonacciLevels(currentPrice) {
        // Simular high e low para cálculo de Fibonacci
        const high = currentPrice * (1 + Math.random() * 0.5); // 0-50% acima do preço atual
        const low = currentPrice * (1 - Math.random() * 0.3); // 0-30% abaixo do preço atual
        const range = high - low;
        
        // Níveis de retração de Fibonacci (do topo para baixo)
        const retracementLevels = {
            '0': high,
            '0.236': high - (range * 0.236),
            '0.382': high - (range * 0.382),
            '0.5': high - (range * 0.5),
            '0.618': high - (range * 0.618),
            '0.786': high - (range * 0.786),
            '1': low
        };
        
        // Níveis de extensão de Fibonacci (para cima do topo)
        const extensionLevels = {
            '1.272': high + (range * 0.272),
            '1.414': high + (range * 0.414),
            '1.618': high + (range * 0.618),
            '2': high + range,
            '2.272': high + (range * 1.272),
            '2.414': high + (range * 1.414),
            '2.618': high + (range * 1.618),
            '3': high + (range * 2),
            '3.618': high + (range * 2.618),
            '4.236': high + (range * 3.236)
        };
        
        // Identificar suportes e resistências
        const supports = [
            { level: '0.618', price: retracementLevels['0.618'], strength: 'forte' },
            { level: '0.786', price: retracementLevels['0.786'], strength: 'muito forte' }
        ];
        
        const resistances = [
            { level: '0.382', price: retracementLevels['0.382'], strength: 'moderada' },
            { level: '0.236', price: retracementLevels['0.236'], strength: 'forte' },
            { level: '0', price: retracementLevels['0'], strength: 'muito forte' }
        ];
        
        // Alvos potenciais baseados na tendência atual
        const targets = [
            { level: '1.618', price: extensionLevels['1.618'], probability: 'alta' },
            { level: '2.618', price: extensionLevels['2.618'], probability: 'média' },
            { level: '3.618', price: extensionLevels['3.618'], probability: 'baixa' }
        ];
        
        return {
            currentPrice,
            high,
            low,
            retracementLevels,
            extensionLevels,
            supports,
            resistances,
            targets
        };
    }

    getWhaleActivityLevel(ticker) {
        const token = this.simulatedTokens.find(t => t.ticker === ticker);
        return token ? token.whaleActivity : Math.floor(Math.random() * 100);
    }
    
    generateRandomString(length) {
        const chars = 'abcdef0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

export default new RunesMarketDataService();
