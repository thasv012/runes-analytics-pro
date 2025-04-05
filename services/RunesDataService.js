// RunesDataService.js - Serviço para obtenção e gerenciamento de dados de RUNES
// const apiServices = require('./api');

// Criando um objeto vazio para compatibilidade com navegador
const apiServices = {};

class RunesDataService {
    constructor() {
        // Cache para armazenar dados e reduzir chamadas de API
        this.cache = {
            runesRanking: null,
            runeDetails: {},
            recentTransactions: {},
            whaleMovements: null
        };
        
        // Tempos de expiração do cache em milissegundos
        this.cacheTTL = {
            runesRanking: 5 * 60 * 1000, // 5 minutos
            runeDetails: 10 * 60 * 1000, // 10 minutos
            recentTransactions: 3 * 60 * 1000, // 3 minutos
            whaleMovements: 2 * 60 * 1000 // 2 minutos
        };
        
        // Timestamps da última atualização do cache
        this.lastUpdated = {
            runesRanking: 0,
            runeDetails: {},
            recentTransactions: {},
            whaleMovements: 0
        };
        
        // URLs das APIs
        this.apiURLs = {
            bestInSlot: 'https://api.bestinslot.xyz/v1',
            magicEden: 'https://api.magiceden.dev/v2',
            okx: 'https://www.okx.com/api/v5',
            unisat: 'https://unisat.io/api/v2',
            mempool: 'https://mempool.space/api/v1'
        };
        
        // Configuração das chaves de API
        this.apiKeys = {
            geniidata: '142cf1b0-1ca7-11ee-bb5e-9d74c2e854ac' // Chave da API Geniidata
        };
        
        // WebSockets para dados em tempo real
        this.webSockets = {
            priceUpdates: null,
            whaleAlerts: null
        };
        
        // Estado de conexão dos WebSockets
        this.wsConnected = {
            priceUpdates: false,
            whaleAlerts: false
        };
        
        // Callbacks para eventos de dados
        this.eventCallbacks = {
            onPriceUpdate: [],
            onWhaleMovement: [],
            onDataUpdate: []
        };
        
        console.log('RunesDataService inicializado');
        this.baseURL = 'https://api.runes-analytics.io'; // API fictícia
        this.apiKey = 'demo_key'; // Chave fixa para ambiente de desenvolvimento
        this.mockMode = true; // Usar dados mockup para desenvolvimento
    }
    
    // Método de inicialização completa
    init() {
        console.log('Inicializando RunesDataService...');
        
        // Inicializar API Geniidata
        this.initGeniiDataApi();
        
        // Configurar WebSockets para dados em tempo real
        this.setupPriceWebSocket();
        
        // Pré-carregar dados comuns
        this.preloadCommonData();
        
        console.log('✅ RunesDataService inicializado com sucesso!');
    }
    
    // Pré-carregar dados comuns para melhorar a experiência do usuário
    preloadCommonData() {
        console.log('Pré-carregando dados comuns...');
        
        // Carregar ranking de RUNES em segundo plano
        this.getRunesRanking()
            .then(data => {
                console.log(`Pré-carregados dados de ${data.length || 0} RUNES`);
                this.notifyDataUpdate('runesRanking', data);
            })
            .catch(error => {
                console.warn('Erro ao pré-carregar ranking de RUNES:', error);
            });
            
        // Carregar estatísticas gerais
        this.getRunesStats()
            .then(stats => {
                console.log('Pré-carregadas estatísticas gerais');
                this.notifyDataUpdate('runesStats', stats);
            })
            .catch(error => {
                console.warn('Erro ao pré-carregar estatísticas:', error);
            });
    }
    
    // Inicializar API Geniidata
    initGeniiDataApi() {
        try {
            if (apiServices && apiServices.geniidata) {
                apiServices.geniidata.auth(this.apiKeys.geniidata);
                console.log('API Geniidata inicializada com sucesso');
            } else {
                console.warn('Serviço Geniidata não encontrado');
            }
        } catch (error) {
            console.error('Erro ao inicializar API Geniidata:', error.message);
        }
    }
    
    // ===== MÉTODOS PÚBLICOS PARA ACESSO AOS DADOS =====
    
    // Obter ranking de RUNES com dados combinados de múltiplas fontes
    async getRunesRanking() {
        console.log('Buscando ranking de RUNES...');
        
        if (this.mockMode) {
            return this._getMockRunesRanking();
        }
        
        // Verificar cache
        if (this.isCacheValid('runesRanking')) {
            console.log('Usando ranking de RUNES em cache');
            return this.cache.runesRanking;
        }
        
        try {
            // Tentar usar Geniidata primeiro
            const geniiDataRanking = await this.fetchGeniiDataRanking();
            
            if (geniiDataRanking && geniiDataRanking.length > 0) {
                // Armazenar em cache e retornar
                this.cache.runesRanking = geniiDataRanking;
                this.lastUpdated.runesRanking = Date.now();
                return geniiDataRanking;
            }
            
            // Fallback para outras APIs ou fonte mockup
            const response = await fetch(`${this.baseURL}/ranking?key=${this.apiKey}`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar ranking de RUNES:', error);
            // Fallback para dados mockup em caso de erro
            return this._getMockRunesRanking();
        }
    }
    
    // Buscar dados da API Geniidata
    async fetchGeniiDataRanking() {
        console.log('Buscando dados de RUNES via Geniidata...');
        
        try {
            if (!apiServices || !apiServices.geniidata) {
                throw new Error('Serviço Geniidata não disponível');
            }
            
            const result = await apiServices.geniidata.getRunesInfoList({
                limit: '50', 
                offset: '0',
                sort: 'market_cap',
                order: 'desc'
            });
            
            if (!result || !result.data || !Array.isArray(result.data)) {
                throw new Error('Formato de resposta da Geniidata inválido');
            }
            
            // Transformar os dados para o formato esperado pelo aplicativo
            const formattedData = result.data.map(rune => ({
                id: rune.id || rune.run_id,
                ticker: rune.tick || rune.symbol,
                name: rune.name || rune.tick,
                price: rune.price_usd || 0,
                priceChange24h: rune.price_change_24h || 0,
                volume24h: rune.volume_24h || 0,
                marketCap: rune.market_cap || 0,
                totalSupply: rune.max_supply || rune.total_supply || 0,
                holders: rune.holders || 0,
                transactions: rune.tx_count || 0,
                created: rune.created_at || '',
                description: rune.description || '',
                rank: rune.rank || 0
            }));
            
            console.log(`Geniidata: Obtidos dados para ${formattedData.length} RUNES`);
            return formattedData;
            
        } catch (error) {
            console.error('Erro ao buscar dados da Geniidata:', error.message);
            return null;
        }
    }
    
    // Obter detalhes de uma RUNE específica
    async getRuneDetails(ticker) {
        console.log(`Buscando detalhes para RUNE: ${ticker}`);
        
        // Verificar se temos dados em cache válidos
        if (this.isCacheValid('runeDetails', ticker)) {
            console.log(`Usando dados em cache para ${ticker}`);
            return this.cache.runeDetails[ticker];
        }
        
        try {
            // Buscar detalhes de diferentes fontes em paralelo
            const [bestInSlotDetails, unisatDetails, geniiDataDetails] = await Promise.allSettled([
                this.fetchBestInSlotRuneDetails(ticker),
                this.fetchUnisatRuneDetails(ticker),
                this.fetchGeniiDataRuneDetails(ticker)
            ]);
            
            // Processar os resultados
            const bestInSlotData = bestInSlotDetails.status === 'fulfilled' ? bestInSlotDetails.value : null;
            const unisatData = unisatDetails.status === 'fulfilled' ? unisatDetails.value : null;
            const geniiData = geniiDataDetails.status === 'fulfilled' ? geniiDataDetails.value : null;
            
            // Se todas as fontes falharem, usar dados mockados
            if (!bestInSlotData && !unisatData && !geniiData) {
                console.warn(`Falha ao obter detalhes para ${ticker}, usando dados mockados`);
                return this.getMockRuneDetails(ticker);
            }
            
            // Mesclar e normalizar dados
            const mergedDetails = this.mergeRuneDetails(ticker, bestInSlotData, unisatData, geniiData);
            
            // Atualizar cache
            this.cache.runeDetails[ticker] = mergedDetails;
            this.lastUpdated.runeDetails[ticker] = Date.now();
            
            // Notificar callbacks
            this.notifyDataUpdate('runeDetails', { ticker, data: mergedDetails });
            
            return mergedDetails;
            
        } catch (error) {
            console.error(`Erro ao obter detalhes para RUNE ${ticker}:`, error);
            return this.getMockRuneDetails(ticker);
        }
    }
    
    // Buscar detalhes de uma RUNE específica via Geniidata
    async fetchGeniiDataRuneDetails(ticker) {
        console.log(`Buscando detalhes para RUNE ${ticker} via Geniidata...`);
        
        try {
            if (!apiServices || !apiServices.geniidata) {
                throw new Error('Serviço Geniidata não disponível');
            }
            
            const result = await apiServices.geniidata.getRuneDetails(ticker);
            
            if (!result || !result.data) {
                throw new Error(`Dados não encontrados para ${ticker}`);
            }
            
            const rune = result.data;
            
            // Retornar os dados no formato padronizado
            return {
                ticker: rune.tick || ticker,
                name: rune.name || ticker,
                price: rune.price_usd || 0,
                priceChange24h: rune.price_change_24h || 0,
                volume24h: rune.volume_24h || 0,
                marketCap: rune.market_cap || 0,
                totalSupply: rune.max_supply || rune.total_supply || 0,
                circulatingSupply: rune.circulating_supply || 0,
                holders: rune.holders || 0,
                transactions: rune.tx_count || 0,
                created: rune.created_at || '',
                description: rune.description || '',
                mintBlock: rune.mint_block || '',
                deploy: rune.deploy_tx || '',
                deployer: rune.deployer || '',
                source: 'geniidata',
                links: {
                    website: rune.website || '',
                    twitter: rune.twitter || '',
                    discord: rune.discord || '',
                    telegram: rune.telegram || ''
                }
            };
            
        } catch (error) {
            console.error(`Erro ao buscar dados da Geniidata para ${ticker}:`, error.message);
            return null;
        }
    }
    
    // ===== MÉTODOS DE WEBSOCKET PARA DADOS EM TEMPO REAL =====
    
    // Configurar WebSocket para atualizações de preço em tempo real
    setupPriceWebSocket() {
        console.log('Configurando WebSocket para atualizações de preço...');
        
        try {
            // Na versão real, esta seria uma conexão WebSocket com um servidor
            // Aqui vamos simular com um intervalo para simplificar
            this.webSockets.priceUpdates = setInterval(() => {
                // Simular atualização de preço para uma RUNE aleatória
                if (this.cache.runesRanking && this.cache.runesRanking.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.cache.runesRanking.length);
                    const rune = this.cache.runesRanking[randomIndex];
                    
                    // Gerar mudança aleatória de preço entre -3% e +3%
                    const priceChange = (Math.random() * 6 - 3) / 100;
                    const oldPrice = rune.price;
                    const newPrice = oldPrice * (1 + priceChange);
                    
                    // Atualizar preço e variação
                    rune.price = newPrice;
                    rune.priceChange24h = parseFloat((rune.priceChange24h + (priceChange * 100)).toFixed(2));
                    
                    // Simular atualização de volume em +/- 0.5%
                    const volumeChange = (Math.random() * 1 - 0.5) / 100;
                    rune.volume24h = rune.volume24h * (1 + volumeChange);
                    
                    // Registrar atualização
                    console.log(`[WebSocket] Atualização de preço para ${rune.ticker}: ${oldPrice.toFixed(6)} -> ${newPrice.toFixed(6)} (${(priceChange * 100).toFixed(2)}%)`);
                    
                    // Notificar callbacks sobre a atualização de preço
                    this.notifyPriceUpdate(rune);
                }
            }, 5000 + Math.random() * 5000); // Atualização a cada 5-10 segundos
            
            this.wsConnected.priceUpdates = true;
            
        } catch (error) {
            console.error('Erro ao configurar WebSocket para preços:', error);
            this.wsConnected.priceUpdates = false;
        }
    }
    
    // ===== MÉTODOS DE CALLBACK PARA EVENTOS =====
    
    // Registrar callback para atualizações de preço
    onPriceUpdate(callback) {
        if (typeof callback === 'function') {
            this.eventCallbacks.onPriceUpdate.push(callback);
        }
    }
    
    // Registrar callback para movimentos de whales
    onWhaleMovement(callback) {
        if (typeof callback === 'function') {
            this.eventCallbacks.onWhaleMovement.push(callback);
        }
    }
    
    // Registrar callback para atualizações gerais de dados
    onDataUpdate(callback) {
        if (typeof callback === 'function') {
            this.eventCallbacks.onDataUpdate.push(callback);
        }
    }
    
    // Notificar todos os callbacks registrados sobre atualização de preço
    notifyPriceUpdate(rune) {
        this.eventCallbacks.onPriceUpdate.forEach(callback => {
            try {
                callback(rune);
            } catch (error) {
                console.error('Erro em callback de atualização de preço:', error);
            }
        });
    }
    
    // Notificar callbacks sobre atualização de dados
    notifyDataUpdate(dataType, data) {
        this.eventCallbacks.onDataUpdate.forEach(callback => {
            try {
                callback(dataType, data);
            } catch (error) {
                console.error('Erro em callback de atualização de dados:', error);
            }
        });
    }
    
    // ===== MÉTODOS PRIVADOS AUXILIARES =====
    
    // Verificar se o cache é válido
    isCacheValid(dataType, key = null) {
        const now = Date.now();
        
        if (key) {
            // Para cache com chaves (como detalhes de RUNE específica)
            return this.cache[dataType] && 
                   this.cache[dataType][key] && 
                   (now - this.lastUpdated[dataType][key] < this.cacheTTL[dataType]);
        } else {
            // Para cache simples (como ranking)
            return this.cache[dataType] && 
                   (now - this.lastUpdated[dataType] < this.cacheTTL[dataType]);
        }
    }
    
    // Mesclar dados de RUNES de múltiplas fontes
    mergeRunesData(bestInSlotRunes, magicEdenRunes, okxRunes) {
        // Criar mapa de RUNES por ticker para facilitar a mesclagem
        const runesMap = new Map();
        
        // Adicionar dados do BestInSlot
        bestInSlotRunes.forEach(rune => {
            runesMap.set(rune.ticker, {
                ticker: rune.ticker,
                symbol: this.getRuneSymbol(rune.ticker),
                price: rune.price || 0,
                priceChange24h: rune.priceChange24h || 0,
                volume24h: rune.volume24h || 0,
                holdersCount: rune.holdersCount || 0,
                sentiment: rune.sentiment || 50,
                marketCap: rune.marketCap || 0,
                dataSource: 'bestInSlot'
            });
        });
        
        // Mesclar dados do Magic Eden
        magicEdenRunes.forEach(rune => {
            const existingRune = runesMap.get(rune.ticker);
            
            if (existingRune) {
                // Atualizar dados existentes com prioridade para valores não-nulos
                existingRune.price = rune.price || existingRune.price;
                existingRune.priceChange24h = rune.priceChange24h || existingRune.priceChange24h;
                existingRune.volume24h = rune.volume24h || existingRune.volume24h;
                existingRune.marketCap = rune.marketCap || existingRune.marketCap;
                existingRune.dataSource += ',magicEden';
            } else {
                // Adicionar nova RUNE
                runesMap.set(rune.ticker, {
                    ticker: rune.ticker,
                    symbol: this.getRuneSymbol(rune.ticker),
                    price: rune.price || 0,
                    priceChange24h: rune.priceChange24h || 0,
                    volume24h: rune.volume24h || 0,
                    holdersCount: rune.holdersCount || 0,
                    sentiment: rune.sentiment || 50,
                    marketCap: rune.marketCap || 0,
                    dataSource: 'magicEden'
                });
            }
        });
        
        // Mesclar dados da OKX
        okxRunes.forEach(rune => {
            const existingRune = runesMap.get(rune.ticker);
            
            if (existingRune) {
                // Atualizar dados existentes com prioridade para valores não-nulos
                existingRune.price = rune.price || existingRune.price;
                existingRune.priceChange24h = rune.priceChange24h || existingRune.priceChange24h;
                existingRune.volume24h = rune.volume24h || existingRune.volume24h;
                existingRune.dataSource += ',okx';
            } else {
                // Adicionar nova RUNE
                runesMap.set(rune.ticker, {
                    ticker: rune.ticker,
                    symbol: this.getRuneSymbol(rune.ticker),
                    price: rune.price || 0,
                    priceChange24h: rune.priceChange24h || 0,
                    volume24h: rune.volume24h || 0,
                    holdersCount: rune.holdersCount || 0,
                    sentiment: 50, // Valor padrão para sentiment
                    marketCap: rune.marketCap || 0,
                    dataSource: 'okx'
                });
            }
        });
        
        // Converter mapa para array
        return Array.from(runesMap.values());
    }
    
    // Obter símbolo/emoji para uma RUNE com base no ticker
    getRuneSymbol(ticker) {
        // Mapa de tickers para símbolos
        const symbolMap = {
            'ORDI': '🟠',
            'SATS': '⚡',
            'PEPE': '🐸',
            'MEME': '😂',
            'RATS': '🐀',
            'DOG': '🐕',
            'DOGE': '🐕',
            'CAT': '🐱',
            'PIZZA': '🍕',
            'BEER': '🍺',
            'BAR': '🍺',
            'MOON': '🌙',
            'DEV': '👨‍💻',
            'TIME': '⏰',
            'GAME': '🎮',
            'GCM': '🤝',
            'BTC': '₿'
        };
        
        // Verificar cada parte do ticker separada por •
        const parts = ticker.split('•');
        
        for (const part of parts) {
            for (const [key, value] of Object.entries(symbolMap)) {
                if (part.includes(key)) {
                    return value;
                }
            }
        }
        
        // Símbolo padrão se nenhum match for encontrado
        return '🪙';
    }
    
    // ===== MÉTODOS DE SIMULAÇÃO DE API =====
    
    // Simular busca de dados do BestInSlot
    async fetchBestInSlotRanking() {
        console.log('Simulando busca de dados do BestInSlot...');
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
        
        // Na versão real, este seria um fetch para uma API
        // Aqui retornamos dados simulados
        return [
            { 
                ticker: 'BAR•BITCOIN•TOKEN', 
                price: 0.0031, 
                priceChange24h: 15.82, 
                volume24h: 187500000, 
                holdersCount: 121400, 
                sentiment: 92, 
                marketCap: 313750000 
            },
            { 
                ticker: 'RUNES•DEV•DAO', 
                price: 0.0024, 
                priceChange24h: -3.41, 
                volume24h: 76300000, 
                holdersCount: 38200, 
                sentiment: 68, 
                marketCap: 47180000 
            },
            { 
                ticker: 'BITCOIN•PIZZA•DAY', 
                price: 0.0096, 
                priceChange24h: 28.12, 
                volume24h: 42600000, 
                holdersCount: 31650, 
                sentiment: 84, 
                marketCap: 168320000 
            }
        ];
    }
    
    // Simular busca de dados do Magic Eden
    async fetchMagicEdenRanking() {
        console.log('Simulando busca de dados do Magic Eden...');
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // Simular falha ocasional da API (25% de chance)
        if (Math.random() < 0.25) {
            console.warn('API do Magic Eden indisponível (simulação)');
            throw new Error('Magic Eden API temporariamente indisponível');
        }
        
        return [
            { 
                ticker: 'BAR•BITCOIN•TOKEN', 
                price: 0.00315, 
                priceChange24h: 16.1, 
                volume24h: 190000000, 
                marketCap: 320000000 
            },
            { 
                ticker: 'TIME•LORD•RUNE', 
                price: 0.00125, 
                priceChange24h: 4.76, 
                volume24h: 32450000, 
                marketCap: 28760000 
            }
        ];
    }
    
    // Simular busca de dados da OKX
    async fetchOkxRanking() {
        console.log('Simulando busca de dados da OKX...');
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
        
        return [
            { 
                ticker: 'BAR•BITCOIN•TOKEN', 
                price: 0.00307, 
                priceChange24h: 15.4, 
                volume24h: 183000000 
            },
            { 
                ticker: 'DEGEN•RUNE•BETA', 
                price: 0.00018, 
                priceChange24h: -8.2, 
                volume24h: 15600000 
            }
        ];
    }
    
    // Dados mockados para ranking de RUNES
    getMockRanking() {
        return [
            { 
                ticker: 'DOG•GO•TO•THE•MOON', 
                symbol: '🐕', 
                price: 0.0017, 
                priceChange24h: 2.01, 
                volume24h: 105100000, 
                holdersCount: 97900, 
                sentiment: 85, 
                marketCap: 173090000,
                dataSource: 'mock' 
            },
            { 
                ticker: 'MAGIC•INTERNET•MONEY', 
                symbol: '💰', 
                price: 0.0013, 
                priceChange24h: 37.51, 
                volume24h: 26000000, 
                holdersCount: 40600, 
                sentiment: 78, 
                marketCap: 31030000,
                dataSource: 'mock' 
            },
            { 
                ticker: 'BITCOIN•HOLDERS•UNITE', 
                symbol: '₿', 
                price: 0.0093, 
                priceChange24h: 12.87, 
                volume24h: 83500000, 
                holdersCount: 62800, 
                sentiment: 91, 
                marketCap: 134900000,
                dataSource: 'mock' 
            }
            // Adicione mais itens mockados conforme necessário
        ];
    }
    
    // Dados mockados para detalhes de RUNE específica
    getMockRuneDetails(ticker) {
        // Buscar nos dados mockados ou gerar novo
        const mockRanking = this.getMockRanking();
        const existingRune = mockRanking.find(rune => rune.ticker === ticker);
        
        if (existingRune) {
            return {
                ...existingRune,
                description: `${ticker} é uma RUNE única com características especiais no ecossistema Bitcoin.`,
                launchDate: '2023-04-15',
                creator: 'Satoshi Disciple',
                totalSupply: Math.floor(Math.random() * 21000000) + 1000000,
                mintRate: Math.floor(Math.random() * 5000) + 100,
                socialVolume: Math.floor(Math.random() * 10000) + 500,
                transactions24h: Math.floor(Math.random() * 5000) + 100,
                mintAddress: '1RunE' + Math.random().toString(16).substring(2, 10),
                dataSource: 'mock'
            };
        }
        
        // Rune genérica se não encontrada
        return {
            ticker: ticker,
            symbol: this.getRuneSymbol(ticker),
            price: Math.random() * 0.01,
            priceChange24h: (Math.random() * 40) - 20,
            volume24h: Math.random() * 50000000,
            holdersCount: Math.floor(Math.random() * 100000) + 1000,
            sentiment: Math.floor(Math.random() * 100),
            marketCap: Math.random() * 100000000,
            description: `${ticker} é uma RUNE no ecossistema Bitcoin.`,
            launchDate: '2023-01-01',
            creator: 'Unknown Developer',
            totalSupply: Math.floor(Math.random() * 21000000) + 1000000,
            mintRate: Math.floor(Math.random() * 5000) + 100,
            dataSource: 'mock'
        };
    }
    
    // Simular detalhes do BestInSlot
    async fetchBestInSlotRuneDetails(ticker) {
        console.log(`Simulando busca de detalhes do BestInSlot para ${ticker}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        
        // Dados simulados com 20% de chance de falha
        if (Math.random() < 0.2) {
            console.warn(`API do BestInSlot indisponível para detalhes de ${ticker} (simulação)`);
            throw new Error('BestInSlot API temporariamente indisponível');
        }
        
        // Retornar dados mockados personalizados para o ticker
        const mockDetail = this.getMockRuneDetails(ticker);
        return {
            ...mockDetail,
            dataSource: 'bestInSlot'
        };
    }
    
    // Simular detalhes do Unisat
    async fetchUnisatRuneDetails(ticker) {
        console.log(`Simulando busca de detalhes do Unisat para ${ticker}...`);
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
        
        // Dados simulados com 15% de chance de falha
        if (Math.random() < 0.15) {
            console.warn(`API do Unisat indisponível para detalhes de ${ticker} (simulação)`);
            throw new Error('Unisat API temporariamente indisponível');
        }
        
        // Retornar dados mockados adaptados do ticker
        const mockDetail = this.getMockRuneDetails(ticker);
        return {
            ...mockDetail,
            // Adicionar alguns dados específicos do Unisat
            totalMinted: mockDetail.totalSupply * 0.8, // 80% minted
            mintTransactions: Math.floor(Math.random() * 10000) + 500,
            dataSource: 'unisat'
        };
    }
    
    // Mesclar detalhes de RUNE de múltiplas fontes
    mergeRuneDetails(ticker, bestInSlotData, unisatData, geniiData) {
        console.log(`Mesclando dados de ${ticker} de múltiplas fontes...`);
        
        // Inicializar com os dados mais confiáveis ou disponíveis
        const merged = geniiData || bestInSlotData || unisatData || {
            ticker: ticker,
            name: ticker,
            price: 0,
            priceChange24h: 0,
            volume24h: 0,
            marketCap: 0,
            totalSupply: 0,
            holders: 0,
            transactions: 0
        };
        
        // Adicionar campos de outras fontes, se disponíveis
        if (bestInSlotData) {
            merged.price = bestInSlotData.price || merged.price;
            merged.priceChange24h = bestInSlotData.priceChange24h || merged.priceChange24h;
            merged.volume24h = bestInSlotData.volume24h || merged.volume24h;
            // Adicionar outras propriedades específicas
        }
        
        if (unisatData) {
            merged.holders = unisatData.holders || merged.holders;
            merged.transactions = unisatData.transactions || merged.transactions;
            // Adicionar outras propriedades específicas
        }
        
        // Selecionar a descrição mais longa como a melhor
        if (bestInSlotData && bestInSlotData.description && 
            (!merged.description || bestInSlotData.description.length > merged.description.length)) {
            merged.description = bestInSlotData.description;
        }
        
        if (geniiData && geniiData.description && 
            (!merged.description || geniiData.description.length > merged.description.length)) {
            merged.description = geniiData.description;
        }
        
        // Adicionar marcação de fonte
        merged.sources = [];
        if (bestInSlotData) merged.sources.push('bestInSlot');
        if (unisatData) merged.sources.push('unisat');
        if (geniiData) merged.sources.push('geniidata');
        
        // Adicionar timestamp
        merged.lastUpdated = Date.now();
        
        return merged;
    }
    
    // Método para limpar recursos (WebSockets, timers) quando o componente é destruído
    cleanup() {
        console.log('Limpando recursos do RunesDataService...');
        
        // Limpar WebSockets simulados
        if (this.webSockets.priceUpdates) {
            clearInterval(this.webSockets.priceUpdates);
            this.webSockets.priceUpdates = null;
        }
        
        if (this.webSockets.whaleAlerts) {
            clearInterval(this.webSockets.whaleAlerts);
            this.webSockets.whaleAlerts = null;
        }
        
        this.wsConnected.priceUpdates = false;
        this.wsConnected.whaleAlerts = false;
        
        // Limpar callbacks
        this.eventCallbacks.onPriceUpdate = [];
        this.eventCallbacks.onWhaleMovement = [];
        this.eventCallbacks.onDataUpdate = [];
    }
    
    // Método para obter dados gerais de RUNES
    async getRunesStats() {
        console.log('Buscando estatísticas de RUNES...');
        
        if (this.mockMode) {
            return this._getMockRunesStats();
        }
        
        try {
            const response = await fetch(`${this.baseURL}/stats?key=${this.apiKey}`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar estatísticas de RUNES:', error);
            // Fallback para dados mockup em caso de erro
            return this._getMockRunesStats();
        }
    }
    
    // Método para obter dados de transações recentes
    async getRecentTransactions(limit = 10) {
        console.log(`Buscando ${limit} transações recentes...`);
        
        if (this.mockMode) {
            return this._getMockTransactions(limit);
        }
        
        try {
            const response = await fetch(`${this.baseURL}/transactions/recent?limit=${limit}&key=${this.apiKey}`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar transações recentes:', error);
            // Fallback para dados mockup em caso de erro
            return this._getMockTransactions(limit);
        }
    }
    
    // Método para obter dados de análise de sentimento
    async getSentimentAnalysis() {
        console.log('Buscando análise de sentimento...');
        
        if (this.mockMode) {
            return this._getMockSentimentData();
        }
        
        try {
            const response = await fetch(`${this.baseURL}/sentiment?key=${this.apiKey}`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar análise de sentimento:', error);
            // Fallback para dados mockup em caso de erro
            return this._getMockSentimentData();
        }
    }
    
    // Métodos privados para gerar dados mockup
    _getMockRunesStats() {
        // Simular um atraso de rede
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    totalVolume24h: 287500000,
                    totalMarketCap: 1458000000,
                    activeRunesCount: 628,
                    uniqueHolders: 1240500,
                    averageSentiment: 72.5,
                    marketTrend: 'up',
                    recentTransactions: [
                        { 
                            ticker: 'DOG•GO•TO•THE•MOON', 
                            symbol: '🐕', 
                            price: 0.0017, 
                            priceChange24h: 2.01, 
                            volume24h: 105100000, 
                            holdersCount: 97900, 
                            sentiment: 85, 
                            marketCap: 173090000 
                        },
                        { 
                            ticker: 'MAGIC•INTERNET•MONEY', 
                            symbol: '💰', 
                            price: 0.0013, 
                            priceChange24h: 37.51, 
                            volume24h: 26000000, 
                            holdersCount: 40600, 
                            sentiment: 78, 
                            marketCap: 31030000 
                        },
                        { 
                            ticker: 'NIKOLA•TESLA•GOD', 
                            symbol: '⚡', 
                            price: 0.016, 
                            priceChange24h: 0.55, 
                            volume24h: 12500000, 
                            holdersCount: 56300, 
                            sentiment: 62, 
                            marketCap: 16270000 
                        }
                    ]
                });
            }, 800);
        });
    }
    
    _getMockTransactions(limit) {
        const mockTransactions = Array.from({ length: limit }).map((_, index) => {
            const isEven = index % 2 === 0;
            const amount = Math.floor(Math.random() * 1000000) + 10000;
            
            return {
                id: `tx${Date.now() - index * 1000}`,
                ticker: isEven ? 'DOG•GO•TO•THE•MOON' : 'MAGIC•INTERNET•MONEY',
                symbol: isEven ? '🐕' : '💰',
                fromAddress: `bc1q...${Math.floor(Math.random() * 10000)}`,
                toAddress: `bc1q...${Math.floor(Math.random() * 10000)}`,
                amount,
                value: amount * (isEven ? 0.0017 : 0.0013),
                timestamp: new Date(Date.now() - index * 60000).toISOString(),
                blockHeight: 823000 - Math.floor(Math.random() * 100),
                isWhale: amount > 500000
            };
        });
        
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    transactions: mockTransactions,
                    total: 152489,
                    page: 1,
                    totalPages: Math.ceil(152489 / limit)
                });
            }, 600);
        });
    }
    
    _getMockSentimentData() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    overallSentiment: 72.5,
                    sentimentChange24h: 3.2,
                    socialMentions: 28750,
                    topPositive: ['DOG•GO•TO•THE•MOON', 'BITCOIN•PIZZA•DAY', 'MAGIC•INTERNET•MONEY'],
                    topNegative: ['RSIC•GENESIS•RUNE', 'NIKOLA•TESLA•GOD'],
                    sentimentByPlatform: {
                        twitter: 78,
                        reddit: 71,
                        discord: 74,
                        telegram: 67
                    },
                    sentimentTrend: [
                        { date: '2023-04-01', value: 65 },
                        { date: '2023-04-02', value: 67 },
                        { date: '2023-04-03', value: 64 },
                        { date: '2023-04-04', value: 69 },
                        { date: '2023-04-05', value: 72 },
                        { date: '2023-04-06', value: 70 },
                        { date: '2023-04-07', value: 72.5 }
                    ]
                });
            }, 700);
        });
    }
    
    _getMockRunesRanking() {
        const mockRanking = [
            { 
                ticker: 'DOG•GO•TO•THE•MOON', 
                symbol: '🐕', 
                price: 0.0017, 
                priceChange24h: 2.01, 
                volume24h: 105100000, 
                holdersCount: 97900, 
                sentiment: 85, 
                marketCap: 173090000 
            },
            { 
                ticker: 'MAGIC•INTERNET•MONEY', 
                symbol: '💰', 
                price: 0.0013, 
                priceChange24h: 37.51, 
                volume24h: 26000000, 
                holdersCount: 40600, 
                sentiment: 78, 
                marketCap: 31030000 
            },
            { 
                ticker: 'NIKOLA•TESLA•GOD', 
                symbol: '⚡', 
                price: 0.016, 
                priceChange24h: 0.55, 
                volume24h: 12500000, 
                holdersCount: 56300, 
                sentiment: 62, 
                marketCap: 16270000 
            },
            { 
                ticker: 'CYPHER•GENESIS', 
                symbol: '🔐', 
                price: 0.0012, 
                priceChange24h: 53.46, 
                volume24h: 2700000, 
                holdersCount: 57200, 
                sentiment: 79, 
                marketCap: 1260000 
            },
            { 
                ticker: 'BILLION•DOLLAR•CAT', 
                symbol: '🐱', 
                price: 0.0082, 
                priceChange24h: 0.96, 
                volume24h: 7400000, 
                holdersCount: 15100, 
                sentiment: 71, 
                marketCap: 8950000 
            }
        ];
        
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    items: mockRanking,
                    total: 628,
                    lastUpdated: new Date().toISOString()
                });
            }, 550);
        });
    }
}

// Criar uma instância global do serviço
window.RunesDataService = new RunesDataService();