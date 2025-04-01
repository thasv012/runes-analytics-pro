class TokenSearchService {
    constructor() {
        this.baseUrl = 'https://api.example.com/runes'; // Substituir pela API real
        this.searchCache = new Map();
    }

    async searchTokens(query) {
        if (query.length < 2) return [];
        
        // Verificar cache
        if (this.searchCache.has(query)) {
            return this.searchCache.get(query);
        }

        try {
            const response = await fetch(`${this.baseUrl}/search?q=${query}`);
            const data = await response.json();
            
            // Processar resultados
            const results = data.map(token => ({
                symbol: token.symbol,
                name: token.name,
                price: token.price,
                change24h: token.change24h,
                volume24h: token.volume24h,
                marketCap: token.marketCap
            }));

            // Atualizar cache
            this.searchCache.set(query, results);
            
            return results;
        } catch (error) {
            console.error('Erro na busca de tokens:', error);
            return [];
        }
    }

    async getTokenDetails(symbol) {
        try {
            const response = await fetch(`${this.baseUrl}/token/${symbol}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar detalhes do token:', error);
            return null;
        }
    }
}

export default new TokenSearchService();
