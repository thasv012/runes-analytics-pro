/**
 * Detector de Movimentações de Baleias para RUNES Analytics Pro
 * Monitora transações de grandes quantidades de tokens Runes
 */

class WhaleDetector {
    constructor(config = {}) {
        // Configurações padrão
        this.config = {
            // Limites para detecção de movimentos de baleias (em USD)
            thresholds: {
                minor: 10000,    // $10k - Movimento pequeno
                medium: 50000,   // $50k - Movimento médio
                major: 250000,   // $250k - Movimento grande
                massive: 1000000 // $1M - Movimento massivo
            },
            
            // Taxa de atualização (em milissegundos)
            refreshRate: 30000,
            
            // Tokens para monitorar (vazio = todos)
            tokensToMonitor: [],
            
            // Limite de notificações
            maxNotificationsPerHour: 10,
            
            // Filtros
            filters: {
                ignoreExchangeWallets: true,
                minTransactionValue: 5000, // Valor mínimo ($) para considerar uma transação
                includeTransfers: true,
                includeMints: true
            },
            
            // Sobrescrever com as configurações do usuário
            ...config
        };
        
        // Estado interno
        this.state = {
            activeMonitoring: false,
            monitoringInterval: null,
            recentTransactions: [],
            knownWhales: new Map(), // Mapa de endereços conhecidos como baleias
            notificationCount: 0,
            notificationResetTime: Date.now() + 3600000, // 1 hora
            lastFetchTime: null
        };
        
        // Referência ao API Manager (será inicializado no setup)
        this.apiManager = null;
        
        // Eventos customizados
        this.events = {
            whaleMovementDetected: 'whaleMovementDetected',
            monitoringStarted: 'whale-monitoring-started',
            monitoringStopped: 'whale-monitoring-stopped',
            whaleAdded: 'whale-address-added',
            whaleRemoved: 'whale-address-removed'
        };
        
        // Inicializar
        this.setupEventListeners();
    }
    
    /**
     * Inicializa o detector com a referência ao API Manager
     * @param {Object} apiManager - Instância do API Manager
     */
    initialize(apiManager) {
        this.apiManager = apiManager;
        console.log('Detector de Baleias inicializado');
        
        // Carregar baleias conhecidas
        this.loadKnownWhales();
        
        return this;
    }
    
    /**
     * Configura event listeners necessários
     */
    setupEventListeners() {
        // Nada a fazer aqui por enquanto
        // Futuros listeners podem ser adicionados
    }
    
    /**
     * Inicia o monitoramento de movimentos de baleias
     */
    startMonitoring() {
        if (this.state.activeMonitoring) {
            console.log('Monitoramento de baleias já está ativo');
            return;
        }
        
        if (!this.apiManager) {
            console.error('API Manager não inicializado. Não é possível iniciar monitoramento.');
            return;
        }
        
        console.log('Iniciando monitoramento de movimentos de baleias...');
        
        this.state.activeMonitoring = true;
        
        // Disparar evento de início de monitoramento
        this.dispatchEvent(this.events.monitoringStarted, {
            timestamp: new Date(),
            config: this.config
        });
        
        // Fazer a primeira verificação imediatamente
        this.checkForWhaleMovements();
        
        // Configurar verificação periódica
        this.state.monitoringInterval = setInterval(() => {
            this.checkForWhaleMovements();
        }, this.config.refreshRate);
    }
    
    /**
     * Para o monitoramento de movimentos de baleias
     */
    stopMonitoring() {
        if (!this.state.activeMonitoring) {
            console.log('Monitoramento de baleias já está inativo');
            return;
        }
        
        console.log('Parando monitoramento de movimentos de baleias...');
        
        clearInterval(this.state.monitoringInterval);
        this.state.monitoringInterval = null;
        this.state.activeMonitoring = false;
        
        // Disparar evento de parada de monitoramento
        this.dispatchEvent(this.events.monitoringStopped, {
            timestamp: new Date()
        });
    }
    
    /**
     * Verifica transações recentes para movimentos de baleias
     */
    async checkForWhaleMovements() {
        try {
            // Verifica se podemos enviar notificações
            this.checkNotificationLimit();
            
            // Obter timestamp da última verificação
            const lastCheckTime = this.state.lastFetchTime || Date.now() - (10 * 60 * 1000); // 10 minutos atrás se primeira vez
            
            // Atualizar timestamp de última verificação
            this.state.lastFetchTime = Date.now();
            
            // Buscar transações recentes
            const recentTransactions = await this.apiManager.getRecentTransactions({
                since: new Date(lastCheckTime),
                minValue: this.config.filters.minTransactionValue,
                includeTransfers: this.config.filters.includeTransfers,
                includeMints: this.config.filters.includeMints
            });
            
            // Processar transações para identificar movimentos de baleias
            for (const transaction of recentTransactions) {
                await this.processTransaction(transaction);
            }
            
            // Atualizar lista de transações recentes
            this.state.recentTransactions = [
                ...recentTransactions,
                ...this.state.recentTransactions
            ].slice(0, 100); // Manter apenas as 100 mais recentes
            
        } catch (error) {
            console.error('Erro ao verificar movimentos de baleias:', error);
        }
    }
    
    /**
     * Processa uma transação para identificar se é um movimento de baleia
     * @param {Object} transaction - Objeto de transação
     */
    async processTransaction(transaction) {
        // Filtrar por tokens monitorados
        if (this.config.tokensToMonitor.length > 0 && 
            !this.config.tokensToMonitor.includes(transaction.tokenId)) {
            return;
        }
        
        // Filtrar exchanges se configurado
        if (this.config.filters.ignoreExchangeWallets && 
            (this.isExchangeWallet(transaction.sender) || 
             this.isExchangeWallet(transaction.recipient))) {
            return;
        }
        
        // Verificar se o valor da transação atinge algum dos limiares
        const alert = this.analyzeTransaction(transaction);
        
        // Se atingir algum limiar, disparar alerta
        if (alert) {
            this.triggerWhaleAlert(alert);
            
            // Adicionar endereços às baleias conhecidas
            this.addKnownWhale(transaction.sender);
            this.addKnownWhale(transaction.recipient);
        }
    }
    
    /**
     * Analisa uma transação para determinar seu nível de alerta
     * @param {Object} transaction - Transação a ser analisada
     * @returns {Object|null} Objeto de alerta ou null se não for movimento de baleia
     */
    analyzeTransaction(transaction) {
        const { value } = transaction;
        let severity = 0;
        let category = '';
        
        // Determinar categoria baseada no valor
        if (value >= this.config.thresholds.massive) {
            severity = 5;
            category = 'massive';
        } else if (value >= this.config.thresholds.major) {
            severity = 4;
            category = 'major';
        } else if (value >= this.config.thresholds.medium) {
            severity = 3;
            category = 'medium';
        } else if (value >= this.config.thresholds.minor) {
            severity = 2;
            category = 'minor';
        } else {
            return null; // Não atinge nenhum limiar
        }
        
        // Aumentar severidade se envolver uma baleia conhecida
        if (this.isKnownWhale(transaction.sender) || this.isKnownWhale(transaction.recipient)) {
            severity = Math.min(severity + 1, 5);
        }
        
        // Calcular impacto estimado
        const impactScore = this.calculateImpactScore(transaction);
        
        return {
            transaction,
            severity,
            category,
            impactScore,
            timestamp: new Date()
        };
    }
    
    /**
     * Calcula a pontuação de impacto de uma transação
     * @param {Object} transaction - Transação a calcular impacto
     * @returns {Number} Pontuação de impacto (0-100)
     */
    calculateImpactScore(transaction) {
        // Implementação básica
        // Em uma implementação real, consideraria:
        // - Volume relativo ao volume diário do token
        // - Liquidez do token
        // - Histórico de preços
        // - Volatilidade recente
        
        // Cálculo simplificado baseado nos limiares
        const { value } = transaction;
        const { minor, medium, major, massive } = this.config.thresholds;
        
        if (value >= massive) {
            return 80 + Math.min((value - massive) / (massive * 0.5) * 20, 20);
        } else if (value >= major) {
            return 60 + (value - major) / (massive - major) * 20;
        } else if (value >= medium) {
            return 40 + (value - medium) / (major - medium) * 20;
        } else if (value >= minor) {
            return 20 + (value - minor) / (medium - minor) * 20;
        }
        
        return 0;
    }
    
    /**
     * Dispara um alerta de movimento de baleia
     * @param {Object} alert - Objeto de alerta
     */
    triggerWhaleAlert(alert) {
        // Incrementar contador de notificações
        this.state.notificationCount++;
        
        // Disparar evento de movimento de baleia detectado
        this.dispatchEvent(this.events.whaleMovementDetected, alert);
        
        console.log(`[ALERTA DE BALEIA] ${alert.category.toUpperCase()} - ${alert.transaction.type} de ${alert.transaction.tokenId} - $${alert.transaction.value.toLocaleString('pt-BR')}`);
    }
    
    /**
     * Verifica se um endereço pertence a uma exchange conhecida
     * @param {String} address - Endereço a verificar
     * @returns {Boolean} Verdadeiro se for uma exchange
     */
    isExchangeWallet(address) {
        // Implementação simplificada
        // Em uma implementação real, consultaria uma lista de endereços de exchanges
        const knownExchanges = [
            'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
            '12Tbp725mDnKgEUNHBmKBSNZFXWCpCFbQ6'
            // Na implementação real, esta lista seria muito maior e atualizada dinamicamente
        ];
        
        return knownExchanges.includes(address);
    }
    
    /**
     * Verifica se um endereço é uma baleia conhecida
     * @param {String} address - Endereço a verificar
     * @returns {Boolean} Verdadeiro se for uma baleia conhecida
     */
    isKnownWhale(address) {
        return this.state.knownWhales.has(address);
    }
    
    /**
     * Adiciona um endereço à lista de baleias conhecidas
     * @param {String} address - Endereço a adicionar
     */
    addKnownWhale(address) {
        if (!this.isKnownWhale(address) && !this.isExchangeWallet(address)) {
            this.state.knownWhales.set(address, {
                firstSeen: new Date(),
                transactionCount: 1,
                lastTransaction: new Date()
            });
            
            this.dispatchEvent(this.events.whaleAdded, { address });
            this.saveKnownWhales();
        } else if (this.isKnownWhale(address)) {
            // Atualizar dados da baleia conhecida
            const whale = this.state.knownWhales.get(address);
            whale.transactionCount++;
            whale.lastTransaction = new Date();
            this.state.knownWhales.set(address, whale);
        }
    }
    
    /**
     * Remove um endereço da lista de baleias conhecidas
     * @param {String} address - Endereço a remover
     */
    removeKnownWhale(address) {
        if (this.isKnownWhale(address)) {
            this.state.knownWhales.delete(address);
            this.dispatchEvent(this.events.whaleRemoved, { address });
            this.saveKnownWhales();
        }
    }
    
    /**
     * Salva a lista de baleias conhecidas no armazenamento local
     */
    saveKnownWhales() {
        try {
            const whales = Array.from(this.state.knownWhales.entries());
            localStorage.setItem('runes_known_whales', JSON.stringify(whales));
        } catch (error) {
            console.error('Erro ao salvar baleias conhecidas:', error);
        }
    }
    
    /**
     * Carrega a lista de baleias conhecidas do armazenamento local
     */
    loadKnownWhales() {
        try {
            const whales = localStorage.getItem('runes_known_whales');
            if (whales) {
                this.state.knownWhales = new Map(JSON.parse(whales));
            }
        } catch (error) {
            console.error('Erro ao carregar baleias conhecidas:', error);
        }
    }
    
    /**
     * Verifica e reseta o limite de notificações se necessário
     */
    checkNotificationLimit() {
        const now = Date.now();
        
        // Reset contador se passou 1 hora
        if (now > this.state.notificationResetTime) {
            this.state.notificationCount = 0;
            this.state.notificationResetTime = now + 3600000; // + 1 hora
        }
    }
    
    /**
     * Obtém estatísticas de atividade de baleias
     * @returns {Object} Estatísticas de baleias
     */
    getWhaleStats() {
        return {
            knownWhales: this.state.knownWhales.size,
            recentTransactions: this.state.recentTransactions.length,
            monitoring: this.state.activeMonitoring,
            lastCheck: this.state.lastFetchTime ? new Date(this.state.lastFetchTime) : null
        };
    }
    
    /**
     * Busca histórico de movimentos de baleias
     * @param {Object} options - Opções de busca
     * @returns {Array} Movimentos de baleias
     */
    async getWhaleMovementHistory(options = {}) {
        try {
            return await this.apiManager.getWhaleTransactions(options);
        } catch (error) {
            console.error('Erro ao buscar histórico de movimentos de baleias:', error);
            return [];
        }
    }
    
    /**
     * Dispara um evento customizado no documento
     * @param {String} eventName - Nome do evento
     * @param {Object} detail - Detalhes do evento
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Atualiza as configurações
     * @param {Object} newConfig - Novas configurações
     */
    updateConfig(newConfig) {
        const wasMonitoring = this.state.activeMonitoring;
        
        // Parar monitoramento durante atualização
        if (wasMonitoring) {
            this.stopMonitoring();
        }
        
        // Atualizar configurações
        this.config = {
            ...this.config,
            ...newConfig
        };
        
        // Reiniciar monitoramento se estava ativo
        if (wasMonitoring) {
            this.startMonitoring();
        }
        
        return this.config;
    }
}

// Inicializar detector de baleias quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Detector de Baleias...');
    window.whaleDetector = new WhaleDetector();
});