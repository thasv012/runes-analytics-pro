// Componente para rastreamento de whales (baleias) de RUNES
class RunesWhalesTracker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container com ID "${containerId}" não encontrado.`);
            return;
        }
        
        this.timeframeFilter = '24h';
        this.runeFilter = 'all';
        this.transactionTypeFilter = 'all';
        this.transactions = [];
        
        this.initializeUI();
    }
    
    initializeUI() {
        console.log('Inicializando UI de Rastreador de Whales');
        
        // Criar estrutura base do componente
        this.container.innerHTML = `
            <div class="section-intro">
                <h3>Rastreador de Whales</h3>
                <p>Monitore grandes transações de RUNES e acompanhe o movimento de "smart money" em tempo real.</p>
            </div>
            
            <div class="whales-header">
                <div class="whales-filters">
                    <div class="filter-group">
                        <label for="timeframe-filter">Período:</label>
                        <select id="timeframe-filter" class="select-styled">
                            <option value="1h">Última hora</option>
                            <option value="6h">Últimas 6 horas</option>
                            <option value="24h" selected>Últimas 24 horas</option>
                            <option value="7d">Últimos 7 dias</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="rune-filter">RUNE:</label>
                        <select id="rune-filter" class="select-styled">
                            <option value="all">Todas as RUNES</option>
                            <option value="DOG•GO•TO•THE•MOON">DOG•GO•TO•THE•MOON</option>
                            <option value="MAGIC•INTERNET•MONEY">MAGIC•INTERNET•MONEY</option>
                            <option value="NIKOLA•TESLA•GOD">NIKOLA•TESLA•GOD</option>
                            <option value="CYPHER•GENESIS">CYPHER•GENESIS</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="transaction-type-filter">Tipo:</label>
                        <select id="transaction-type-filter" class="select-styled">
                            <option value="all">Todos os tipos</option>
                            <option value="exchange_deposit">Depósito em Exchange</option>
                            <option value="exchange_withdrawal">Saque de Exchange</option>
                            <option value="wallet_transfer">Transferência entre Wallets</option>
                        </select>
                    </div>
                </div>
                
                <button id="refresh-whales" class="btn-primary">
                    <i class="fas fa-sync-alt"></i> Atualizar Dados
                </button>
            </div>
            
            <div id="transaction-list" class="transaction-list">
                <!-- Transações serão inseridas aqui -->
                <div class="loading">Carregando transações...</div>
            </div>
            
            <div class="whales-stats">
                <div class="stat-card">
                    <div class="stat-value" id="total-volume">$0</div>
                    <div class="stat-label">Volume Total</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value" id="transaction-count">0</div>
                    <div class="stat-label">Transações de Whale</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value" id="exchange-flow">$0</div>
                    <div class="stat-label">Fluxo de Exchange</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value" id="unique-whales">0</div>
                    <div class="stat-label">Whales Únicos</div>
                </div>
            </div>
            
            <div class="insight-container">
                <div class="insight-header">
                    <div class="insight-icon"><i class="fas fa-brain"></i></div>
                    <h3>Insights de Smart Money</h3>
                </div>
                
                <div id="smart-money-insights">
                    <!-- Insights serão inseridos aqui -->
                </div>
            </div>
        `;
        
        try {
            // Adicionar event listeners
            this.setupEventListeners();
            
            // Carregar dados mockup
            this.loadMockData();
        } catch (error) {
            console.error('Erro ao inicializar Rastreador de Whales:', error);
            this.showError('Não foi possível inicializar o rastreador de whales.');
        }
    }
    
    setupEventListeners() {
        // Filtro de período
        const timeframeFilter = document.getElementById('timeframe-filter');
        if (timeframeFilter) {
            timeframeFilter.addEventListener('change', (e) => {
                this.timeframeFilter = e.target.value;
                this.filterTransactions();
            });
        }
        
        // Filtro de RUNE
        const runeFilter = document.getElementById('rune-filter');
        if (runeFilter) {
            runeFilter.addEventListener('change', (e) => {
                this.runeFilter = e.target.value;
                this.filterTransactions();
            });
        }
        
        // Filtro de tipo de transação
        const transactionTypeFilter = document.getElementById('transaction-type-filter');
        if (transactionTypeFilter) {
            transactionTypeFilter.addEventListener('change', (e) => {
                this.transactionTypeFilter = e.target.value;
                this.filterTransactions();
            });
        }
        
        // Botão de atualizar
        const refreshButton = document.getElementById('refresh-whales');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadMockData(true);
            });
        }
    }
    
    loadMockData(showLoading = false) {
        if (showLoading) {
            const listContainer = document.getElementById('transaction-list');
            if (listContainer) {
                listContainer.innerHTML = '<div class="loading">Atualizando transações...</div>';
            }
            
            // Simular delay de carregamento
            setTimeout(() => {
                this.generateMockTransactions();
            }, 1000);
        } else {
            this.generateMockTransactions();
        }
    }
    
    generateMockTransactions() {
        // Lista de símbolos de RUNES
        const runeSymbols = [
            { ticker: 'DOG•GO•TO•THE•MOON', symbol: '🐕' },
            { ticker: 'MAGIC•INTERNET•MONEY', symbol: '💰' },
            { ticker: 'NIKOLA•TESLA•GOD', symbol: '⚡' },
            { ticker: 'CYPHER•GENESIS', symbol: '🔐' },
            { ticker: 'BILLION•DOLLAR•CAT', symbol: '🐱' }
        ];
        
        // Tipos de transações
        const transactionTypes = [
            { type: 'exchange_deposit', label: 'Depósito em Exchange', icon: 'fas fa-arrow-right' },
            { type: 'exchange_withdrawal', label: 'Saque de Exchange', icon: 'fas fa-arrow-left' },
            { type: 'wallet_transfer', label: 'Transferência entre Wallets', icon: 'fas fa-exchange-alt' }
        ];
        
        // Gerar transações aleatórias
        const mockTransactions = [];
        const now = new Date();
        
        // Gerar entre 15 e 25 transações
        const count = Math.floor(Math.random() * 10) + 15;
        
        for (let i = 0; i < count; i++) {
            // Selecionar RUNE aleatória
            const runeIndex = Math.floor(Math.random() * runeSymbols.length);
            const rune = runeSymbols[runeIndex];
            
            // Selecionar tipo de transação aleatório
            const typeIndex = Math.floor(Math.random() * transactionTypes.length);
            const transactionType = transactionTypes[typeIndex];
            
            // Gerar timestamp aleatório nas últimas 7 dias
            const timestamp = new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
            
            // Gerar valor aleatório entre $50K e $10M
            const amount = Math.floor(Math.random() * 9950000) + 50000;
            
            // Gerar endereços aleatórios
            const fromAddress = this.generateRandomAddress();
            const toAddress = this.generateRandomAddress();
            
            // Gerar txid aleatório
            const txid = this.generateRandomTxid();
            
            mockTransactions.push({
                id: `tx-${i}-${Date.now()}`,
                rune: rune.ticker,
                runeSymbol: rune.symbol,
                type: transactionType.type,
                typeLabel: transactionType.label,
                typeIcon: transactionType.icon,
                amount: amount,
                timestamp: timestamp,
                fromAddress: fromAddress,
                toAddress: toAddress,
                txid: txid,
                isWhale: amount > 1000000, // Acima de $1M é considerado whale
                isSmartMoney: Math.random() < 0.3 // 30% de chance de ser smart money
            });
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        mockTransactions.sort((a, b) => b.timestamp - a.timestamp);
        
        this.transactions = mockTransactions;
        this.filterTransactions();
    }
    
    filterTransactions() {
        let filteredTransactions = [...this.transactions];
        
        // Filtrar por período
        const now = new Date();
        let timeLimit;
        
        switch (this.timeframeFilter) {
            case '1h':
                timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case '6h':
                timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            case '24h':
                timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        filteredTransactions = filteredTransactions.filter(tx => tx.timestamp >= timeLimit);
        
        // Filtrar por RUNE
        if (this.runeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(tx => tx.rune === this.runeFilter);
        }
        
        // Filtrar por tipo de transação
        if (this.transactionTypeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(tx => tx.type === this.transactionTypeFilter);
        }
        
        this.renderTransactions(filteredTransactions);
        this.updateStats(filteredTransactions);
        this.generateInsights(filteredTransactions);
    }
    
    renderTransactions(transactions) {
        const listContainer = document.getElementById('transaction-list');
        if (!listContainer) return;
        
        // Limpar container
        listContainer.innerHTML = '';
        
        if (transactions.length === 0) {
            listContainer.innerHTML = '<div class="no-data">Nenhuma transação encontrada para os filtros selecionados.</div>';
            return;
        }
        
        // Renderizar cada transação
        transactions.forEach(tx => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            transactionEl.dataset.id = tx.id;
            
            // Determinar classe de ícone com base no tipo
            let iconClass = 'transaction-icon';
            if (tx.type === 'exchange_deposit') {
                iconClass += ' deposit';
            } else if (tx.type === 'exchange_withdrawal') {
                iconClass += ' withdrawal';
            }
            
            // Formatar timestamp
            const formattedTime = this.formatTimestamp(tx.timestamp);
            
            transactionEl.innerHTML = `
                <div class="${iconClass}">
                    <i class="${tx.typeIcon}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">
                        ${tx.runeSymbol} ${tx.rune} - ${tx.typeLabel}
                        ${tx.isSmartMoney ? '<span class="smart-money-tag">Smart Money</span>' : ''}
                    </div>
                    <div class="transaction-desc">
                        De <span class="wallet-address">${tx.fromAddress}</span> 
                        para <span class="wallet-address">${tx.toAddress}</span>
                    </div>
                    <div class="transaction-meta">
                        <span class="transaction-time">${formattedTime}</span>
                        <span class="transaction-tx">TX: ${tx.txid.substring(0, 8)}...</span>
                    </div>
                </div>
                <div class="transaction-amount ${tx.isWhale ? 'whale-amount' : ''}">
                    $${this.formatNumber(tx.amount)}
                </div>
            `;
            
            listContainer.appendChild(transactionEl);
        });
    }
    
    updateStats(transactions) {
        // Calcular estatísticas
        const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const transactionCount = transactions.length;
        
        const exchangeDeposits = transactions
            .filter(tx => tx.type === 'exchange_deposit')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const exchangeWithdrawals = transactions
            .filter(tx => tx.type === 'exchange_withdrawal')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const exchangeFlow = exchangeWithdrawals - exchangeDeposits;
        
        // Contar whales únicos (baseado nos endereços)
        const uniqueAddresses = new Set();
        transactions.forEach(tx => {
            if (tx.isWhale) {
                uniqueAddresses.add(tx.fromAddress);
                uniqueAddresses.add(tx.toAddress);
            }
        });
        const uniqueWhales = uniqueAddresses.size;
        
        // Atualizar elementos
        document.getElementById('total-volume').textContent = `$${this.formatNumber(totalVolume)}`;
        document.getElementById('transaction-count').textContent = transactionCount;
        document.getElementById('exchange-flow').textContent = `${exchangeFlow >= 0 ? '+' : ''}$${this.formatNumber(Math.abs(exchangeFlow))}`;
        document.getElementById('unique-whales').textContent = uniqueWhales;
        
        // Adicionar classe para colorir o fluxo de exchange
        const exchangeFlowEl = document.getElementById('exchange-flow');
        if (exchangeFlowEl) {
            exchangeFlowEl.className = exchangeFlow >= 0 ? 'stat-value positive' : 'stat-value negative';
        }
    }
    
    generateInsights(transactions) {
        const insightsContainer = document.getElementById('smart-money-insights');
        if (!insightsContainer) return;
        
        // Analisar transações
        const smartMoneyTxs = transactions.filter(tx => tx.isSmartMoney);
        const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const smartMoneyVolume = smartMoneyTxs.reduce((sum, tx) => sum + tx.amount, 0);
        
        const exchangeDeposits = transactions
            .filter(tx => tx.type === 'exchange_deposit')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const exchangeWithdrawals = transactions
            .filter(tx => tx.type === 'exchange_withdrawal')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        // Agrupar transações por RUNE
        const runeVolumes = {};
        transactions.forEach(tx => {
            if (!runeVolumes[tx.rune]) {
                runeVolumes[tx.rune] = 0;
            }
            runeVolumes[tx.rune] += tx.amount;
        });
        
        // Encontrar RUNE com maior volume
        let topRune = '';
        let topVolume = 0;
        
        Object.entries(runeVolumes).forEach(([rune, volume]) => {
            if (volume > topVolume) {
                topRune = rune;
                topVolume = volume;
            }
        });
        
        // Determinar o sentimento de mercado baseado nas transações
        const exchangeNetFlow = exchangeWithdrawals - exchangeDeposits;
        let sentiment = 'neutral';
        let confidence = 50;
        
        if (exchangeNetFlow > 0) {
            // Mais saques do que depósitos indica otimismo
            sentiment = 'bullish';
            confidence = Math.min(75 + (exchangeNetFlow / totalVolume) * 25, 95);
        } else if (exchangeNetFlow < 0) {
            // Mais depósitos que saques indica pessimismo
            sentiment = 'bearish';
            confidence = Math.min(75 + (Math.abs(exchangeNetFlow) / totalVolume) * 25, 95);
        }
        
        // Criar HTML de insights
        let insightsHTML = '';
        
        if (smartMoneyTxs.length > 0) {
            insightsHTML += `
                <div class="insight-section">
                    <h4>Atividades de Smart Money</h4>
                    <div class="smart-money-list">
            `;
            
            // Mostrar até 5 atividades de smart money
            const topSmartMoney = smartMoneyTxs
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
                
            topSmartMoney.forEach(tx => {
                const actionType = tx.type === 'exchange_deposit' ? 'depositou em exchange' : 
                                 tx.type === 'exchange_withdrawal' ? 'retirou de exchange' : 
                                 'transferiu';
                
                insightsHTML += `
                    <div class="smart-money-item">
                        <div>
                            <span class="rune-symbol">${tx.runeSymbol}</span>
                            Smart Money ${actionType} ${tx.rune}
                        </div>
                        <div class="amount">$${this.formatNumber(tx.amount)}</div>
                    </div>
                `;
            });
            
            insightsHTML += `
                    </div>
                </div>
            `;
        }
        
        // Adicionar predição baseada nos dados
        insightsHTML += `
            <div class="prediction-box">
                <div class="prediction-header">
                    <div class="prediction-icon">
                        <i class="fas fa-${sentiment === 'bullish' ? 'arrow-up' : sentiment === 'bearish' ? 'arrow-down' : 'minus'}"></i>
                    </div>
                    <div class="prediction-title">Previsão baseada em movimentos de whales</div>
                </div>
                <div class="prediction-confidence">
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                    <div class="confidence-value">${Math.round(confidence)}% confiança</div>
                </div>
                <div class="prediction-text">
                    ${this.generatePredictionText(sentiment, topRune, exchangeNetFlow, smartMoneyVolume)}
                </div>
            </div>
        `;
        
        insightsContainer.innerHTML = insightsHTML;
    }
    
    generatePredictionText(sentiment, topRune, exchangeNetFlow, smartMoneyVolume) {
        if (sentiment === 'bullish') {
            return `
                Whales estão retirando ${topRune} das exchanges ($${this.formatNumber(Math.abs(exchangeNetFlow))}), 
                indicando possível acumulação e expectativa de alta. Smart Money movimentou 
                $${this.formatNumber(smartMoneyVolume)} nas últimas transações analisadas.
            `;
        } else if (sentiment === 'bearish') {
            return `
                Whales estão depositando ${topRune} nas exchanges ($${this.formatNumber(Math.abs(exchangeNetFlow))}), 
                o que pode indicar pressão de venda no curto prazo. Smart Money movimentou 
                $${this.formatNumber(smartMoneyVolume)} nas últimas transações analisadas.
            `;
        } else {
            return `
                Os movimentos de Whales para ${topRune} estão equilibrados entre saques e depósitos em exchanges,
                indicando um possível período de consolidação. Smart Money movimentou 
                $${this.formatNumber(smartMoneyVolume)} nas últimas transações analisadas.
            `;
        }
    }
    
    // Métodos auxiliares
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }
    
    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        // Menos de uma hora
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} min atrás`;
        }
        
        // Menos de um dia
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours}h atrás`;
        }
        
        // Menos de uma semana
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days}d atrás`;
        }
        
        // Formatar data
        return timestamp.toLocaleDateString();
    }
    
    generateRandomAddress() {
        // Gerar endereço aleatório (simulado)
        const addressTypes = [
            { prefix: 'bc1q', length: 40 }, // Bech32
            { prefix: '3', length: 34 },    // P2SH
            { prefix: '1', length: 34 }     // P2PKH
        ];
        
        const type = addressTypes[Math.floor(Math.random() * addressTypes.length)];
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let address = type.prefix;
        
        for (let i = 0; i < type.length - type.prefix.length; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return address;
    }
    
    generateRandomTxid() {
        // Gerar txid (hash de transação) aleatório
        const chars = '0123456789abcdef';
        let txid = '';
        
        for (let i = 0; i < 64; i++) {
            txid += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return txid;
    }
    
    showError(message) {
        const container = this.container;
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Erro ao carregar rastreador de whales</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Inicializar o componente quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const whalesContainer = document.getElementById('whales-container');
    
    if (whalesContainer) {
        const whalesTracker = new RunesWhalesTracker('whales-container');
        console.log('Componente de rastreamento de whales inicializado com sucesso');
    }
});