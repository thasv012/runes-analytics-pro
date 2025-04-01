class TokenDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentToken = null;
        this.charts = {};
        this.indicators = {};
        this.setupDashboard();
    }

    setupDashboard() {
        this.container.innerHTML = `
            <div class="token-dashboard">
                <div class="dashboard-header">
                    <div class="token-selector">
                        <select id="token-selector">
                            <option value="">Selecione um Token</option>
                        </select>
                    </div>
                    <div class="refresh-control">
                        <button id="refresh-data">Atualizar Dados</button>
                        <div class="auto-refresh">
                            <input type="checkbox" id="auto-refresh" checked>
                            <label for="auto-refresh">Auto-atualizar</label>
                        </div>
                    </div>
                </div>

                <div class="token-overview">
                    <div class="token-identity">
                        <h2 id="token-name">--</h2>
                        <div class="token-ticker" id="token-ticker">--</div>
                    </div>
                    <div class="token-price-container">
                        <div class="current-price" id="current-price">0.00000000</div>
                        <div class="price-change" id="price-change">0.00%</div>
                    </div>
                    <div class="token-metrics">
                        <div class="metric">
                            <label>Volume 24h</label>
                            <span id="volume-24h">--</span>
                        </div>
                        <div class="metric">
                            <label>Market Cap</label>
                            <span id="market-cap">--</span>
                        </div>
                        <div class="metric">
                            <label>Holders</label>
                            <span id="holders-count">--</span>
                        </div>
                        <div class="metric">
                            <label>Supply</label>
                            <span id="token-supply">--</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Gráfico Principal -->
                    <div class="chart-container main-chart">
                        <div class="chart-header">
                            <h3>Análise de Preço</h3>
                            <div class="timeframe-selector">
                                <button data-tf="5m">5m</button>
                                <button data-tf="15m">15m</button>
                                <button data-tf="1h">1h</button>
                                <button data-tf="4h" class="active">4h</button>
                                <button data-tf="1d">1d</button>
                            </div>
                        </div>
                        <div id="price-chart"></div>
                    </div>

                    <!-- Análise de Volume -->
                    <div class="chart-container volume-analysis">
                        <div class="chart-header">
                            <h3>Análise de Volume</h3>
                        </div>
                        <div id="volume-chart"></div>
                    </div>

                    <!-- Análise Fibonacci -->
                    <div class="chart-container fib-analysis">
                        <div class="chart-header">
                            <h3>Níveis Fibonacci</h3>
                        </div>
                        <div id="fib-levels"></div>
                    </div>

                    <!-- Rastreador de Whales -->
                    <div class="chart-container whale-tracker">
                        <div class="chart-header">
                            <h3>Atividade de Whales</h3>
                        </div>
                        <div id="whale-activity"></div>
                    </div>
                </div>

                <div class="analysis-panel">
                    <div class="panel-tabs">
                        <button class="tab-btn active" data-tab="technical">Técnica</button>
                        <button class="tab-btn" data-tab="onchain">On-Chain</button>
                        <button class="tab-btn" data-tab="prediction">Previsão</button>
                    </div>
                    <div class="panel-content">
                        <div class="tab-content active" id="technical-tab">
                            <!-- Conteúdo da análise técnica -->
                        </div>
                        <div class="tab-content" id="onchain-tab">
                            <!-- Conteúdo da análise on-chain -->
                        </div>
                        <div class="tab-content" id="prediction-tab">
                            <!-- Conteúdo da previsão -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeCharts();
        this.setupEventListeners();
        this.loadTopTokens();
    }

    async loadTopTokens() {
        try {
            const runesService = await import('../services/runesMarketDataService.js');
            const tokens = await runesService.default.fetchTopTokensByVolume();
            
            const selector = document.getElementById('token-selector');
            tokens.forEach(token => {
                const option = document.createElement('option');
                option.value = token.ticker;
                option.textContent = `${token.ticker} - Vol: ${this.formatNumber(token.volume24h)} BTC`;
                selector.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar tokens:', error);
        }
    }

    async loadTokenData(ticker) {
        try {
            const runesService = await import('../services/runesMarketDataService.js');
            const tokenData = await runesService.default.subscribeToToken(ticker);
            
            if (tokenData) {
                this.currentToken = ticker;
                this.updateDashboard(tokenData);
                this.updateCharts(tokenData);
                this.performAnalysis(tokenData);
            }
        } catch (error) {
            console.error(`Erro ao carregar dados de ${ticker}:`, error);
        }
    }

    updateDashboard(data) {
        // Atualizar informações básicas
        document.getElementById('token-name').textContent = data.name || data.ticker;
        document.getElementById('token-ticker').textContent = data.ticker;
        document.getElementById('current-price').textContent = this.formatPrice(data.price);
        
        const changeElement = document.getElementById('price-change');
        changeElement.textContent = `${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%`;
        changeElement.className = `price-change ${data.change24h >= 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('volume-24h').textContent = `${this.formatNumber(data.volume24h)} BTC`;
        document.getElementById('market-cap').textContent = `${this.formatNumber(data.marketCap)} BTC`;
        document.getElementById('holders-count').textContent = this.formatNumber(data.holders);
        document.getElementById('token-supply').textContent = this.formatNumber(data.supply);
    }

    async performAnalysis(data) {
        try {
            // Análise técnica
            const technicalAnalysis = await this.performTechnicalAnalysis(data);
            this.updateTechnicalTab(technicalAnalysis);
            
            // Análise on-chain
            const onChainAnalysis = await this.performOnChainAnalysis(data);
            this.updateOnChainTab(onChainAnalysis);
            
            // Análise preditiva
            const predictiveAnalysis = await this.performPredictiveAnalysis(data);
            this.updatePredictionTab(predictiveAnalysis);
        } catch (error) {
            console.error('Erro ao realizar análise:', error);
        }
    }

    async performTechnicalAnalysis(data) {
        // Implementação da análise técnica
    }

    async performOnChainAnalysis(data) {
        // Implementação da análise on-chain
    }

    async performPredictiveAnalysis(data) {
        // Implementação da análise preditiva
    }

    formatPrice(price) {
        return price.toFixed(8);
    }

    formatNumber(num) {
        if (num === undefined || num === null) return '--';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        
        return num.toString();
    }
}

export default TokenDashboard;
