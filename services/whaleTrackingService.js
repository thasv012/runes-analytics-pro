class WhaleTrackingService {
    constructor() {
        this.whaleThreshold = 1000000; // 1M sats
        this.riskThresholds = {
            low: 30,
            medium: 60,
            high: 90
        };
        this.patterns = {
            accumulation: {
                timeWindow: 24 * 60 * 60 * 1000, // 24 horas
                minPurchases: 3,
                volumeIncrease: 50 // 50%
            },
            distribution: {
                timeWindow: 12 * 60 * 60 * 1000, // 12 horas
                minSales: 3,
                volumeDecrease: 30 // 30%
            }
        };
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.ws = new WebSocket('wss://api.example.com/whales');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.processWhaleMovement(data);
        };
    }

    async analyzeWallet(address) {
        const transactions = await this.getWalletTransactions(address);
        const holdings = await this.getWalletHoldings(address);
        
        return {
            riskScore: this.calculateRiskScore(transactions, holdings),
            patterns: this.detectPatterns(transactions),
            connections: await this.findWalletConnections(address),
            prediction: this.predictNextMove(transactions, holdings)
        };
    }

    detectPatterns(transactions) {
        const patterns = [];
        
        // Detectar acumulação
        if (this.isAccumulating(transactions)) {
            patterns.push({
                type: 'accumulation',
                confidence: this.calculateConfidence(transactions),
                details: this.getAccumulationDetails(transactions)
            });
        }

        // Detectar distribuição
        if (this.isDistributing(transactions)) {
            patterns.push({
                type: 'distribution',
                confidence: this.calculateConfidence(transactions),
                details: this.getDistributionDetails(transactions)
            });
        }

        return patterns;
    }

    async findWalletConnections(address) {
        const connections = await this.getConnectedWallets(address);
        const clusters = this.identifyClusters(connections);
        
        return {
            directConnections: connections.filter(c => c.type === 'direct'),
            clusters: clusters.map(cluster => ({
                addresses: cluster.addresses,
                riskLevel: this.calculateClusterRisk(cluster),
                totalValue: this.calculateClusterValue(cluster)
            }))
        };
    }

    predictNextMove(transactions, holdings) {
        const recentPattern = this.detectRecentPattern(transactions);
        const marketConditions = this.analyzeMarketConditions();
        const historicalBehavior = this.analyzeHistoricalBehavior(transactions);

        return {
            probability: this.calculateProbability(recentPattern, marketConditions, historicalBehavior),
            expectedAction: this.determineExpectedAction(recentPattern, holdings),
            timeframe: this.estimateTimeframe(recentPattern, historicalBehavior),
            confidence: this.calculatePredictionConfidence(recentPattern, marketConditions)
        };
    }

    processWhaleMovement(data) {
        const risk = this.assessMovementRisk(data);
        
        if (risk.level >= this.riskThresholds.medium) {
            this.emitAlert({
                type: 'whale_movement',
                risk: risk,
                details: {
                    address: data.address,
                    amount: data.amount,
                    direction: data.direction,
                    timestamp: data.timestamp
                },
                prediction: this.predictImpact(data)
            });
        }
    }

    // Métodos auxiliares
    calculateRiskScore(transactions, holdings) {
        let score = 0;
        
        // Análise de volume
        const volumeScore = this.analyzeVolume(transactions);
        score += volumeScore * 0.3;

        // Análise de padrão
        const patternScore = this.analyzePattern(transactions);
        score += patternScore * 0.3;

        // Análise de conexões
        const connectionScore = this.analyzeConnections(holdings);
        score += connectionScore * 0.4;

        return Math.min(100, score);
    }

    emitAlert(alert) {
        const event = new CustomEvent('whale_alert', { detail: alert });
        window.dispatchEvent(event);
        
        // Atualizar UI
        this.updateAlertUI(alert);
    }

    updateAlertUI(alert) {
        const alertsContainer = document.getElementById('whale-alerts');
        if (!alertsContainer) return;

        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alert.risk.level}`;
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-type">${alert.type}</span>
                <span class="alert-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="alert-content">
                <p>${this.formatAlertMessage(alert)}</p>
                <div class="alert-prediction">
                    <span>Impacto Previsto: ${alert.prediction.impact}</span>
                    <span>Confiança: ${alert.prediction.confidence}%</span>
                </div>
            </div>
        `;

        alertsContainer.prepend(alertElement);

        // Limitar número de alertas visíveis
        while (alertsContainer.children.length > 10) {
            alertsContainer.lastChild.remove();
        }
    }
}

export default new WhaleTrackingService();
