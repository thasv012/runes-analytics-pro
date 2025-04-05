/**
 * Serviço de Rastreamento de Baleias
 * Responsável por monitorar grandes transações e movimentos significativos de RUNES
 */

class WhaleTrackerService {
    constructor() {
        this.apiEndpoint = 'https://api.example.com/v1/whale-tracking';
        this.websocketUrl = 'wss://ws.example.com/whales';
        this.connected = false;
        this.socket = null;
        this.callbacks = {
            transaction: [],
            alert: []
        };
        
        // Últimas transações registradas
        this.recentTransactions = [];
        
        // Estatísticas do rastreador
        this.stats = {
            largestTransaction24h: { value: 0, tx: null },
            totalVolume24h: 0,
            whaleCount: 0,
            activeWhales: []
        };
        
        // Iniciar simulação em tempo real
        this.startSimulation();
    }
    
    /**
     * Conecta ao servidor WebSocket para atualizações em tempo real
     * Na versão simulada, isso inicia a geração de dados simulados
     */
    connect() {
        console.log('🐳 Iniciando serviço de rastreamento de baleias...');
        
        // Em um ambiente real, conectaríamos ao websocket
        // this.socket = new WebSocket(this.websocketUrl);
        
        // Simular conexão bem-sucedida
        setTimeout(() => {
            this.connected = true;
            console.log('✅ Serviço de rastreamento de baleias conectado');
            
            // Disparar um evento de nova transação após alguns segundos
            this.simulateNewTransaction();
        }, 1500);
        
        return this;
    }
    
    /**
     * Registra um callback para quando uma nova transação de baleia for detectada
     */
    onNewTransaction(callback) {
        if (typeof callback === 'function') {
            this.callbacks.transaction.push(callback);
        }
        return this;
    }
    
    /**
     * Registra um callback para alertas de movimentos significativos
     */
    onAlert(callback) {
        if (typeof callback === 'function') {
            this.callbacks.alert.push(callback);
        }
        return this;
    }
    
    /**
     * Busca as transações recentes de baleias
     */
    async getRecentTransactions(limit = 20) {
        // Em um ambiente real, faríamos uma requisição para o endpoint
        // return fetch(`${this.apiEndpoint}/transactions?limit=${limit}`).then(r => r.json());
        
        // Simular delay de rede
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.recentTransactions.slice(0, limit));
            }, 600);
        });
    }
    
    /**
     * Busca estatísticas de baleias
     */
    async getWhaleStats() {
        // Em um ambiente real, faríamos uma requisição para o endpoint
        // return fetch(`${this.apiEndpoint}/stats`).then(r => r.json());
        
        // Simular delay de rede
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.stats);
            }, 400);
        });
    }
    
    /**
     * Inicia a simulação de dados em tempo real
     */
    startSimulation() {
        // Gerar dados iniciais
        this.generateInitialData();
        
        // Configurar intervalo para novas transações
        setInterval(() => {
            this.simulateNewTransaction();
        }, 30000 + Math.random() * 60000); // Entre 30s e 90s
    }
    
    /**
     * Gera dados iniciais para a simulação
     */
    generateInitialData() {
        // Resetar dados
        this.recentTransactions = [];
        
        // Gerar algumas transações iniciais
        const tokens = ['DOG', 'MAGIC', 'NIKOLA', 'BILLION', 'ORDI', 'CYPHER', 'SATS'];
        const types = ['buy', 'sell', 'transfer'];
        
        // Gerar 25 transações aleatórias para o histórico inicial
        for (let i = 0; i < 25; i++) {
            const token = tokens[Math.floor(Math.random() * tokens.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const value = Math.round(10000 + Math.random() * 990000) * 10; // Entre $100k e $10M
            
            // Calcular timestamp - transações mais recentes primeiro
            const timestamp = new Date(Date.now() - (i * (1000 * 60 * 5) + Math.random() * 1000 * 60 * 10));
            
            const transaction = {
                id: this.generateTxId(),
                type,
                token,
                value,
                valueUSD: value,
                amount: Math.round(value / this.getTokenPrice(token) * 100) / 100,
                timestamp,
                fromAddress: this.generateAddress(),
                toAddress: this.generateAddress(),
                impact: this.calculateImpact(value),
                network: 'BTC',
                fee: Math.round(value * 0.0001 * 100) / 100
            };
            
            // Adicionar tags para algumas transações
            if (Math.random() > 0.7) {
                transaction.tags = {
                    from: Math.random() > 0.5 ? 'Exchange' : 'Whale Wallet',
                    to: Math.random() > 0.6 ? 'Exchange' : 'Whale Wallet'
        };
    }

            this.recentTransactions.push(transaction);
            
            // Atualizar estatísticas
            this.updateStats(transaction);
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        this.recentTransactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Simula uma nova transação de baleia
     */
    simulateNewTransaction() {
        if (!this.connected) return;
        
        const tokens = ['DOG', 'MAGIC', 'NIKOLA', 'BILLION', 'ORDI', 'CYPHER', 'SATS'];
        const types = ['buy', 'sell', 'transfer'];
        
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Transações grandes para baleias
        const value = Math.round(200000 + Math.random() * 9800000) * 10; // Entre $2M e $100M
        
        const transaction = {
            id: this.generateTxId(),
            type,
            token,
            value,
            valueUSD: value,
            amount: Math.round(value / this.getTokenPrice(token) * 100) / 100,
            timestamp: new Date(),
            fromAddress: this.generateAddress(),
            toAddress: this.generateAddress(),
            impact: this.calculateImpact(value),
            network: 'BTC',
            fee: Math.round(value * 0.0001 * 100) / 100
        };
        
        // Adicionar tags para algumas transações
        if (Math.random() > 0.5) {
            transaction.tags = {
                from: Math.random() > 0.5 ? 'Exchange' : 'Whale Wallet',
                to: Math.random() > 0.6 ? 'Exchange' : 'Whale Wallet'
            };
        }
        
        // Adicionar à lista de transações recentes
        this.recentTransactions.unshift(transaction);
        
        // Limitar a lista a 100 transações
        if (this.recentTransactions.length > 100) {
            this.recentTransactions.pop();
        }
        
        // Atualizar estatísticas
        this.updateStats(transaction);
        
        // Notificar os callbacks registrados
        this.notifyTransactionCallbacks(transaction);
        
        // Se for uma transação de alto impacto, gerar um alerta
        if (transaction.impact > 7) {
            this.notifyAlertCallbacks(transaction);
        }
        
        console.log(`🐳 Nova transação de baleia detectada: ${transaction.type} ${transaction.amount} ${transaction.token} ($${this.formatNumber(transaction.value)})`);
    }
    
    /**
     * Atualiza as estatísticas com base em uma nova transação
     */
    updateStats(transaction) {
        // Atualizar volume total nas últimas 24h
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        // Remover transações antigas das estatísticas
        this.stats.totalVolume24h = this.recentTransactions
            .filter(tx => tx.timestamp.getTime() > oneDayAgo)
            .reduce((sum, tx) => sum + tx.value, 0);
        
        // Atualizar maior transação nas últimas 24h
        const largestTx = this.recentTransactions
            .filter(tx => tx.timestamp.getTime() > oneDayAgo)
            .sort((a, b) => b.value - a.value)[0];
            
        if (largestTx && (!this.stats.largestTransaction24h.tx || largestTx.value > this.stats.largestTransaction24h.value)) {
            this.stats.largestTransaction24h = {
                value: largestTx.value,
                tx: largestTx
            };
        }
        
        // Atualizar contagem de baleias ativas
        const whaleAddresses = new Set();
        
        this.recentTransactions
            .filter(tx => tx.timestamp.getTime() > oneDayAgo && tx.value > 1000000)
            .forEach(tx => {
                whaleAddresses.add(tx.fromAddress);
                whaleAddresses.add(tx.toAddress);
            });
            
        this.stats.whaleCount = whaleAddresses.size;
        
        // Atualizar lista de baleias ativas
        this.stats.activeWhales = Array.from(whaleAddresses).slice(0, 10).map(address => {
            const totalValue = this.recentTransactions
                .filter(tx => (tx.fromAddress === address || tx.toAddress === address) && 
                              tx.timestamp.getTime() > oneDayAgo)
                .reduce((sum, tx) => sum + tx.value, 0);
                
        return {
                address,
                totalValue,
                transactionCount: this.recentTransactions.filter(tx => 
                    (tx.fromAddress === address || tx.toAddress === address) && 
                    tx.timestamp.getTime() > oneDayAgo
                ).length
            };
        }).sort((a, b) => b.totalValue - a.totalValue);
    }

    /**
     * Notifica os callbacks registrados sobre uma nova transação
     */
    notifyTransactionCallbacks(transaction) {
        this.callbacks.transaction.forEach(callback => {
            try {
                callback(transaction);
            } catch (error) {
                console.error('Erro ao notificar callback de transação:', error);
            }
        });
    }
    
    /**
     * Notifica os callbacks de alerta sobre uma transação significativa
     */
    notifyAlertCallbacks(transaction) {
        this.callbacks.alert.forEach(callback => {
            try {
                callback(transaction);
            } catch (error) {
                console.error('Erro ao notificar callback de alerta:', error);
            }
        });
    }
    
    /**
     * Gera um ID de transação único
     */
    generateTxId() {
        return Array.from({length: 64}, () => 
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');
    }
    
    /**
     * Gera um endereço de carteira aleatório
     */
    generateAddress() {
        return 'bc1' + Array.from({length: 38}, () => 
            '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]
        ).join('');
    }
    
    /**
     * Calcula o impacto de uma transação com base no valor
     * Retorna um valor entre 1 e 10
     */
    calculateImpact(value) {
        // Escala logarítmica para impacto
        // $100k = ~3, $1M = ~5, $10M = ~7, $100M = ~9
        return Math.min(10, Math.max(1, Math.log10(value / 10000)));
    }
    
    /**
     * Obtém o preço simulado de um token
     */
    getTokenPrice(token) {
        const prices = {
            'DOG': 0.05,
            'MAGIC': 1.2,
            'NIKOLA': 0.008,
            'BILLION': 0.003,
            'ORDI': 9.5,
            'CYPHER': 0.09,
            'SATS': 0.0006
        };
        
        return prices[token] || 0.1;
    }
    
    /**
     * Formata um número para exibição
     */
    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
}

// Inicializar e exportar o serviço
window.whaleTrackerService = new WhaleTrackerService().connect();
