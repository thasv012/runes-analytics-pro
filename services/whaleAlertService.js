class WhaleAlertService {
    constructor() {
        this.thresholds = {
            // Definir uma baleia como alguém que possui pelo menos 1% do supply
            whaleMinPercentage: 1.0,
            
            // Acumulação: aumento de pelo menos 10% na posição em 24h
            accumulationThreshold: 10,
            
            // Distribuição: redução de pelo menos 5% na posição em 24h
            distributionThreshold: 5,
            
            // Alerta de volume: transação única maior que 0.5% do supply
            largeTransactionThreshold: 0.5
        };
        
        this.alertHistory = new Map();
        this.activeAlerts = new Set();
        this.whaleWallets = new Map(); // ticker -> [wallets]
        
        this.setupListeners();
        this.startMonitoring();
    }
    
    setupListeners() {
        // Escutar por atualizações de tokens
        window.addEventListener('rune_update', (event) => {
            const { ticker, data } = event.detail;
            this.checkForWhaleActivity(ticker, data);
        });
    }
    
    async startMonitoring() {
        console.log('Iniciando monitoramento de baleias...');
        
        // Atualizar lista de baleias a cada hora
        setInterval(() => this.updateWhalesList(), 60 * 60 * 1000);
        
        // Primeira execução
        await this.updateWhalesList();
    }
    
    async updateWhalesList() {
        try {
            const runesService = await import('./runesMarketDataService.js');
            const tokens = await runesService.default.fetchTopTokensByVolume(50);
            
            for (const token of tokens) {
                await this.updateWhalesForToken(token.ticker);
            }
            
            console.log(`Lista de baleias atualizada: ${this.whaleWallets.size} tokens monitorados`);
        } catch (error) {
            console.error('Erro ao atualizar lista de baleias:', error);
        }
    }
    
    async updateWhalesForToken(ticker) {
        try {
            const holders = await this.fetchTokenHolders(ticker);
            if (!holders || holders.length === 0) return;
            
            const totalSupply = holders.reduce((sum, h) => sum + h.balance, 0);
            
            // Identificar baleias (holders com mais de X% do supply)
            const whales = holders.filter(holder => 
                (holder.balance / totalSupply) * 100 >= this.thresholds.whaleMinPercentage
            );
            
            // Armazenar dados históricos para comparação
            const previousWhales = this.whaleWallets.get(ticker) || [];
            
            // Atualizar lista de baleias
            this.whaleWallets.set(ticker, whales.map(whale => ({
                address: whale.address,
                balance: whale.balance,
                percentage: (whale.balance / totalSupply) * 100,
                previousBalance: this.findPreviousBalance(previousWhales, whale.address),
                lastUpdated: new Date()
            })));
            
            // Verificar mudanças significativas
            this.checkForSignificantChanges(ticker);
            
        } catch (error) {
            console.error(`Erro ao atualizar baleias para ${ticker}:`, error);
        }
    }
    
    findPreviousBalance(previousWhales, address) {
        const whale = previousWhales.find(w => w.address === address);
        return whale ? whale.balance : 0;
    }
    
    async fetchTokenHolders(ticker) {
        try {
            // Tentar API do UniSat
            const response = await fetch(`https://api.unisat.io/v1/indexer/brc20/${ticker}/holders?limit=100`);
            
            if (response.ok) {
                const data = await response.json();
                return data.holders.map(holder => ({
                    address: holder.address,
                    balance: parseFloat(holder.balance),
                    firstSeen: new Date(holder.firstSeen)
                }));
            }
            
            // Fallback para BestInSlot
            return this.fetchHoldersFromBestInSlot(ticker);
        } catch (error) {
            console.error(`Erro ao buscar holders de ${ticker}:`, error);
            return [];
        }
    }
    
    async fetchHoldersFromBestInSlot(ticker) {
        // Implementação de fallback
        return [];
    }
    
    checkForSignificantChanges(ticker) {
        const whales = this.whaleWallets.get(ticker);
        if (!whales) return;
        
        for (const whale of whales) {
            // Pular se não temos dados históricos
            if (!whale.previousBalance) continue;
            
            const changePercentage = ((whale.balance - whale.previousBalance) / whale.previousBalance) * 100;
            
            // Verificar acumulação
            if (changePercentage >= this.thresholds.accumulationThreshold) {
                this.createAccumulationAlert(ticker, whale, changePercentage);
            }
            
            // Verificar distribuição (realização de lucro)
            else if (changePercentage <= -this.thresholds.distributionThreshold) {
                this.createDistributionAlert(ticker, whale, changePercentage);
            }
        }
    }
    
    async checkForWhaleActivity(ticker, data) {
        try {
            // Buscar transações recentes
            const transactions = await this.fetchRecentTransactions(ticker);
            if (!transactions || transactions.length === 0) return;
            
            // Verificar se alguma transação é de uma baleia
            const whales = this.whaleWallets.get(ticker) || [];
            const whaleAddresses = new Set(whales.map(w => w.address));
            
            for (const tx of transactions) {
                // Verificar se é uma transação de/para uma baleia
                if (whaleAddresses.has(tx.from) || whaleAddresses.has(tx.to)) {
                    // Verificar se é uma transação grande
                    if (this.isLargeTransaction(tx, data.supply)) {
                        this.createTransactionAlert(ticker, tx, whales);
                    }
                }
            }
        } catch (error) {
            console.error(`Erro ao verificar atividade de baleias para ${ticker}:`, error);
        }
    }
    
    isLargeTransaction(tx, totalSupply) {
        return (tx.amount / totalSupply) * 100 >= this.thresholds.largeTransactionThreshold;
    }
    
    async fetchRecentTransactions(ticker) {
        try {
            // Implementar busca de transações recentes
            return [];
        } catch (error) {
            console.error(`Erro ao buscar transações de ${ticker}:`, error);
            return [];
        }
    }
    
    createAccumulationAlert(ticker, whale, changePercentage) {
        const alertId = `${ticker}-${whale.address}-accumulation-${Date.now()}`;
        
        // Evitar alertas duplicados em curto período
        if (this.activeAlerts.has(alertId.split('-').slice(0, 3).join('-'))) return;
        
        const alert = {
            id: alertId,
            type: 'accumulation',
            severity: this.calculateSeverity(changePercentage, this.thresholds.accumulationThreshold),
            ticker,
            whale: {
                address: whale.address,
                balance: whale.balance,
                percentage: whale.percentage
            },
            change: {
                absolute: whale.balance - whale.previousBalance,
                percentage: changePercentage
            },
            timestamp: new Date(),
            message: `Acumulação detectada: Baleia aumentou posição em ${changePercentage.toFixed(2)}% em ${ticker}`
        };
        
        this.emitAlert(alert);
        this.storeAlert(alert);
    }
    
    createDistributionAlert(ticker, whale, changePercentage) {
        const alertId = `${ticker}-${whale.address}-distribution-${Date.now()}`;
        
        // Evitar alertas duplicados em curto período
        if (this.activeAlerts.has(alertId.split('-').slice(0, 3).join('-'))) return;
        
        const alert = {
            id: alertId,
            type: 'distribution',
            severity: this.calculateSeverity(Math.abs(changePercentage), this.thresholds.distributionThreshold),
            ticker,
            whale: {
                address: whale.address,
                balance: whale.balance,
                percentage: whale.percentage
            },
            change: {
                absolute: whale.previousBalance - whale.balance,
                percentage: Math.abs(changePercentage)
            },
            timestamp: new Date(),
            message: `Realização de lucro detectada: Baleia reduziu posição em ${Math.abs(changePercentage).toFixed(2)}% em ${ticker}`
        };
        
        this.emitAlert(alert);
        this.storeAlert(alert);
    }
    
    createTransactionAlert(ticker, transaction, whales) {
        const isWhaleFrom = whales.some(w => w.address === transaction.from);
        const isWhaleTo = whales.some(w => w.address === transaction.to);
        
        let type = 'unknown';
        if (isWhaleFrom && !isWhaleTo) type = 'distribution';
        else if (!isWhaleFrom && isWhaleTo) type = 'accumulation';
        else if (isWhaleFrom && isWhaleTo) type = 'transfer';
        
        const alertId = `${ticker}-${transaction.txid}-${Date.now()}`;
        
        const alert = {
            id: alertId,
            type,
            severity: 'high',
            ticker,
            transaction: {
                txid: transaction.txid,
                from: transaction.from,
                to: transaction.to,
                amount: transaction.amount,
                timestamp: transaction.timestamp
            },
            timestamp: new Date(),
            message: `Grande transação detectada: ${transaction.amount.toLocaleString()} ${ticker} ${type === 'distribution' ? 'vendidos' : 'comprados'} por baleia`
        };
        
        this.emitAlert(alert);
        this.storeAlert(alert);
    }
    
    calculateSeverity(changePercentage, baseThreshold) {
        if (changePercentage >= baseThreshold * 5) return 'critical';
        if (changePercentage >= baseThreshold * 3) return 'high';
        if (changePercentage >= baseThreshold * 2) return 'medium';
        return 'low';
    }
    
    emitAlert(alert) {
        // Adicionar à lista de alertas ativos
        this.activeAlerts.add(alert.id.split('-').slice(0, 3).join('-'));
        
        // Remover após 1 hora para permitir novos alertas
        setTimeout(() => {
            this.activeAlerts.delete(alert.id.split('-').slice(0, 3).join('-'));
        }, 60 * 60 * 1000);
        
        // Emitir evento
        const event = new CustomEvent('whale_alert', { detail: alert });
        window.dispatchEvent(event);
        
        // Atualizar UI
        this.updateAlertUI(alert);
    }
    
    storeAlert(alert) {
        // Armazenar no histórico
        if (!this.alertHistory.has(alert.ticker)) {
            this.alertHistory.set(alert.ticker, []);
        }
        
        const history = this.alertHistory.get(alert.ticker);
        history.unshift(alert);
        
        // Limitar tamanho do histórico
        if (history.length > 100) {
            history.pop();
        }
    }
    
    updateAlertUI(alert) {
        // Buscar container de alertas
        const alertsContainer = document.getElementById('whale-alerts');
        if (!alertsContainer) return;
        
        // Criar elemento de alerta
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alert.severity} alert-${alert.type}`;
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-ticker">${alert.ticker}</span>
                <span class="alert-time">${alert.timestamp.toLocaleTimeString()}</span>
            </div>
            <div class="alert-content">
                <p>${alert.message}</p>
                ${this.renderAlertDetails(alert)}
            </div>
        `;
        
        // Adicionar ao container
        alertsContainer.prepend(alertElement);
        
        // Limitar número de alertas visíveis
        while (alertsContainer.children.length > 10) {
            alertsContainer.lastChild.remove();
        }
        
        // Adicionar classe para animação
        setTimeout(() => {
            alertElement.classList.add('alert-visible');
        }, 10);
        
        // Remover após 30 segundos
        setTimeout(() => {
            alertElement.classList.add('alert-fading');
            setTimeout(() => {
                alertElement.remove();
            }, 500);
        }, 30000);
    }
    
    renderAlertDetails(alert) {
        if (alert.type === 'accumulation' || alert.type === 'distribution') {
            return `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">Endereço:</span>
                        <span class="detail-value">${this.shortenAddress(alert.whale.address)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mudança:</span>
                        <span class="detail-value ${alert.type === 'accumulation' ? 'positive' : 'negative'}">
                            ${alert.type === 'accumulation' ? '+' : '-'}${alert.change.percentage.toFixed(2)}%
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Posição:</span>
                        <span class="detail-value">${alert.whale.percentage.toFixed(2)}% do supply</span>
                    </div>
                </div>
            `;
        } else if (alert.type === 'transfer') {
            return `
                <div class="alert-details">
                    <div class="detail-item">
                        <span class="detail-label">De:</span>
                        <span class="detail-value">${this.shortenAddress(alert.transaction.from)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Para:</span>
                        <span class="detail-value">${this.shortenAddress(alert.transaction.to)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Quantidade:</span>
                        <span class="detail-value">${alert.transaction.amount.toLocaleString()} ${alert.ticker}</span>
                    </div>
                </div>
            `;
        }
        
        return '';
    }
    
    shortenAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
    }
    
    getAlertHistory(ticker) {
        return this.alertHistory.get(ticker) || [];
    }
}

export default new WhaleAlertService();
