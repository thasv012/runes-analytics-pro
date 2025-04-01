class RunesMarketDataService {
    constructor() {
        this.apiEndpoints = {
            unisat: 'https://api.unisat.io/v1/indexer/brc20',
            okx: 'https://www.okx.com/api/v5/market/brc20',
            mempool: 'https://mempool.space/api/v1',
            magicEden: 'https://api.magiceden.dev/v2/runes',
            bestInSlot: 'https://api.bestinslot.xyz/v1/runes'
        };
        this.apiKeys = {
            unisat: process.env.UNISAT_API_KEY || '',
            okx: process.env.OKX_API_KEY || '',
            magicEden: process.env.MAGIC_EDEN_API_KEY || ''
        };
        this.topTokens = [];
        this.activeSubscriptions = new Set();
        this.updateInterval = 30000; // 30 segundos
        this.websockets = {};
        
        this.initializeService();
    }

    async initializeService() {
        try {
            // Buscar tokens de maior volume
            this.topTokens = await this.fetchTopTokensByVolume();
            
            // Iniciar websockets para dados em tempo real
            this.setupWebSockets();
            
            // Iniciar polling para dados que não têm websocket
            this.startPolling();
            
            console.log(`Serviço de dados RUNES inicializado com ${this.topTokens.length} tokens`);
        } catch (error) {
            console.error('Erro ao inicializar serviço de dados RUNES:', error);
        }
    }

    async fetchTopTokensByVolume(limit = 20) {
        try {
            // Tentar primeiro a API do UniSat
            const response = await fetch(`${this.apiEndpoints.unisat}/tokens?sort=volume&limit=${limit}`, {
                headers: this.apiKeys.unisat ? { 'Authorization': `Bearer ${this.apiKeys.unisat}` } : {}
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.tokens.map(token => ({
                    ticker: token.ticker,
                    name: token.name || token.ticker,
                    supply: token.supply,
                    holders: token.holders,
                    volume24h: token.volume24h,
                    price: token.price,
                    change24h: token.priceChange24h
                }));
            }
            
            // Fallback para OKX
            return this.fetchTopTokensFromOKX(limit);
        } catch (error) {
            console.error('Erro ao buscar tokens por volume:', error);
            return [];
        }
    }

    async fetchTopTokensFromOKX(limit) {
        try {
            const response = await fetch(`${this.apiEndpoints.okx}/tickers`);
            if (response.ok) {
                const data = await response.json();
                return data.data
                    .sort((a, b) => parseFloat(b.volCcy24h) - parseFloat(a.volCcy24h))
                    .slice(0, limit)
                    .map(token => ({
                        ticker: token.instId.split('-')[0],
                        name: token.instId.split('-')[0],
                        supply: 'N/A',
                        holders: 'N/A',
                        volume24h: parseFloat(token.volCcy24h),
                        price: parseFloat(token.last),
                        change24h: parseFloat(token.chg24h) * 100
                    }));
            }
            
            // Se tudo falhar, retornar lista vazia
            return [];
        } catch (error) {
            console.error('Erro ao buscar tokens da OKX:', error);
            return [];
        }
    }

    setupWebSockets() {
        // Configurar WebSocket para OKX (exemplo)
        this.websockets.okx = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
        
        this.websockets.okx.onopen = () => {
            console.log('WebSocket OKX conectado');
            
            // Inscrever para dados de tickers dos tokens principais
            const subscriptions = this.topTokens.map(token => ({
                channel: 'tickers',
                instId: `${token.ticker}-BTC`
            }));
            
            this.websockets.okx.send(JSON.stringify({
                op: 'subscribe',
                args: subscriptions
            }));
        };
        
        this.websockets.okx.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.data) {
                this.processOKXTickerData(data.data);
            }
        };
        
        this.websockets.okx.onerror = (error) => {
            console.error('Erro no WebSocket OKX:', error);
        };
        
        this.websockets.okx.onclose = () => {
            console.log('WebSocket OKX fechado, reconectando...');
            setTimeout(() => this.setupWebSockets(), 5000);
        };
    }

    processOKXTickerData(data) {
        data.forEach(ticker => {
            const symbol = ticker.instId.split('-')[0];
            const tokenData = {
                ticker: symbol,
                price: parseFloat(ticker.last),
                high24h: parseFloat(ticker.high24h),
                low24h: parseFloat(ticker.low24h),
                volume24h: parseFloat(ticker.volCcy24h),
                change24h: parseFloat(ticker.chg24h) * 100,
                timestamp: new Date().getTime()
            };
            
            // Emitir evento com dados atualizados
            this.emitTokenUpdate(symbol, tokenData);
        });
    }

    startPolling() {
        // Polling para dados que não têm websocket
        setInterval(async () => {
            for (const token of this.topTokens) {
                if (this.activeSubscriptions.has(token.ticker)) {
                    try {
                        const tokenData = await this.fetchTokenDetails(token.ticker);
                        this.emitTokenUpdate(token.ticker, tokenData);
                    } catch (error) {
                        console.error(`Erro ao atualizar dados de ${token.ticker}:`, error);
                    }
                }
            }
        }, this.updateInterval);
    }

    async fetchTokenDetails(ticker) {
        try {
            // Tentar BestInSlot primeiro para dados mais completos
            const response = await fetch(`${this.apiEndpoints.bestInSlot}/token/${ticker}`);
            
            if (response.ok) {
                const data = await response.json();
                return {
                    ticker: data.ticker,
                    name: data.name || data.ticker,
                    price: data.price,
                    marketCap: data.marketCap,
                    volume24h: data.volume24h,
                    change24h: data.priceChange24h,
                    holders: data.holders,
                    supply: data.supply,
                    maxSupply: data.maxSupply,
                    transactions24h: data.transactions24h,
                    deployDate: data.deployDate,
                    description: data.description,
                    links: data.links,
                    timestamp: new Date().getTime()
                };
            }
            
            // Fallback para dados básicos
            return this.fetchBasicTokenData(ticker);
        } catch (error) {
            console.error(`Erro ao buscar detalhes de ${ticker}:`, error);
            return null;
        }
    }

    async fetchBasicTokenData(ticker) {
        // Implementação de fallback
    }

    subscribeToToken(ticker) {
        this.activeSubscriptions.add(ticker);
        return this.fetchTokenDetails(ticker);
    }

    unsubscribeFromToken(ticker) {
        this.activeSubscriptions.delete(ticker);
    }

    emitTokenUpdate(ticker, data) {
        const event = new CustomEvent('rune_update', {
            detail: { ticker, data }
        });
        window.dispatchEvent(event);
    }
}

export default new RunesMarketDataService();
