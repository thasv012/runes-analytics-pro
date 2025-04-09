// RunesMarketOverview.js - Componente para exibição da visão geral do mercado de Runes
// Exibe estatísticas resumidas como cap. de mercado total, volume, tokens ativos, etc.

class RunesMarketOverview {
    constructor(options = {}) {
        // Opções do componente
        this.options = {
            container: options.container || 'market-overview-widget',
            darkMode: options.darkMode || false,
            animate: options.animate !== false,
            showCharts: options.showCharts !== false
        };
        
        // Dados do mercado
        this.marketData = null;
        
        // Referência ao container
        this.container = null;
        
        // Mini gráficos para visualização rápida
        this.miniCharts = {
            marketCapChart: null,
            volumeChart: null,
            transactionsChart: null
        };
        
        console.log('RunesMarketOverview inicializado com opções:', this.options);
    }
    
    // Inicializar o componente
    async init() {
        console.log('Inicializando componente Market Overview...');
        
        // Obter o container
        this.container = document.getElementById(this.options.container);
        if (!this.container) {
            console.error(`Container '${this.options.container}' não encontrado!`);
            return false;
        }
        
        // Renderizar estrutura inicial
        this.renderStructure();
        
        // Carregar dados iniciais
        await this.loadInitialData();
        
        // Inicializar mini gráficos se habilitados
        if (this.options.showCharts) {
            this.initMiniCharts();
        }
        
        console.log('Componente Market Overview inicializado com sucesso');
        return true;
    }
    
    // Renderizar a estrutura base do componente
    renderStructure() {
        // Adicionar classes ao container
        this.container.classList.add('market-overview-widget');
        if (this.options.darkMode) {
            this.container.classList.add('dark-mode');
        }
        
        // Estrutura HTML
        this.container.innerHTML = `
            <div class="widget-header">
                <h3>Visão Geral do Mercado</h3>
                <div class="last-updated">
                    <span class="update-label">Atualizado:</span>
                    <span class="update-time">--:--:--</span>
                </div>
            </div>
            <div class="market-overview-content">
                <div class="market-stat-cards">
                    <div class="stat-card total-market-cap">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <div class="stat-label">Cap. de Mercado Total</div>
                            <div class="stat-value" id="total-market-cap">$0</div>
                            <div class="stat-change" id="market-cap-change">0%</div>
                        </div>
                        <div class="mini-chart" id="market-cap-chart"></div>
                    </div>
                    
                    <div class="stat-card total-volume">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-label">Volume 24h</div>
                            <div class="stat-value" id="total-volume">$0</div>
                            <div class="stat-change" id="volume-change">0%</div>
                        </div>
                        <div class="mini-chart" id="volume-chart"></div>
                    </div>
                    
                    <div class="stat-card active-tokens">
                        <div class="stat-icon">🪙</div>
                        <div class="stat-info">
                            <div class="stat-label">Tokens Ativos</div>
                            <div class="stat-value" id="active-tokens">0</div>
                            <div class="stat-change" id="tokens-change">0%</div>
                        </div>
                    </div>
                    
                    <div class="stat-card total-holders">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <div class="stat-label">Total de Holders</div>
                            <div class="stat-value" id="total-holders">0</div>
                            <div class="stat-change" id="holders-change">0%</div>
                        </div>
                    </div>
                </div>
                
                <div class="market-trend">
                    <div class="trend-header">
                        <h4>Tendência do Mercado (24h)</h4>
                    </div>
                    <div class="trend-data">
                        <div class="trend-up">
                            <div class="trend-icon">📈</div>
                            <div class="trend-value" id="tokens-up">0</div>
                            <div class="trend-label">Em Alta</div>
                        </div>
                        <div class="trend-down">
                            <div class="trend-icon">📉</div>
                            <div class="trend-value" id="tokens-down">0</div>
                            <div class="trend-label">Em Baixa</div>
                        </div>
                        <div class="trend-stable">
                            <div class="trend-icon">📊</div>
                            <div class="trend-value" id="tokens-stable">0</div>
                            <div class="trend-label">Estáveis</div>
                        </div>
                    </div>
                </div>
                
                <div class="market-highlights">
                    <div class="highlight-card best-performer">
                        <div class="highlight-label">Melhor Performance (24h)</div>
                        <div class="highlight-token" id="best-token">--</div>
                        <div class="highlight-value" id="best-value">0%</div>
                    </div>
                    
                    <div class="highlight-card worst-performer">
                        <div class="highlight-label">Pior Performance (24h)</div>
                        <div class="highlight-token" id="worst-token">--</div>
                        <div class="highlight-value" id="worst-value">0%</div>
                    </div>
                    
                    <div class="highlight-card most-active">
                        <div class="highlight-label">Mais Ativo (Volume)</div>
                        <div class="highlight-token" id="most-active-token">--</div>
                        <div class="highlight-value" id="most-active-value">$0</div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Estrutura Market Overview renderizada');
    }
    
    // Carregar dados iniciais
    async loadInitialData() {
        console.log('Carregando dados iniciais para Market Overview...');
        
        try {
            // Verificar se o serviço de dados está disponível
            if (window.runesDataService) {
                const stats = await window.runesDataService.getRunesStats();
                this.updateData(stats);
            } else {
                console.warn('RunesDataService não disponível. Usando dados mockup...');
                this.updateData(this.getMockData());
            }
        } catch (error) {
            console.error('Erro ao carregar dados iniciais do Market Overview:', error);
            // Usar dados mockup em caso de erro
            this.updateData(this.getMockData());
        }
    }
    
    // Atualizar os dados exibidos
    updateData(marketData) {
        console.log('Atualizando dados do Market Overview:', marketData);
        
        if (!marketData) {
            console.warn('Dados de mercado inválidos');
            return;
        }
        
        // Armazenar dados
        this.marketData = marketData;
        
        // Atualizar timestamp
        this.updateTimestamp();
        
        // Atualizar valores na UI
        this.updateMarketStats();
        this.updateTrendStats();
        this.updateHighlights();
        
        // Atualizar mini gráficos se disponíveis
        if (this.options.showCharts && marketData.historicalData) {
            this.updateMiniCharts(marketData.historicalData);
        }
        
        console.log('Dados do Market Overview atualizados com sucesso');
    }
    
    // Atualizar estatísticas gerais do mercado
    updateMarketStats() {
        if (!this.marketData) return;
        
        // Formatar e exibir valores
        const totalMarketCap = document.getElementById('total-market-cap');
        if (totalMarketCap) {
            totalMarketCap.textContent = this.formatCurrency(this.marketData.totalMarketCap);
            
            // Adicionar classe de animação se habilitado
            if (this.options.animate) {
                this.animateValue(totalMarketCap);
            }
        }
        
        const marketCapChange = document.getElementById('market-cap-change');
        if (marketCapChange) {
            const changeValue = this.marketData.marketCapChange24h || 0;
            marketCapChange.textContent = this.formatPercentage(changeValue);
            this.setChangeClass(marketCapChange, changeValue);
        }
        
        const totalVolume = document.getElementById('total-volume');
        if (totalVolume) {
            totalVolume.textContent = this.formatCurrency(this.marketData.totalVolume24h);
            if (this.options.animate) {
                this.animateValue(totalVolume);
            }
        }
        
        const volumeChange = document.getElementById('volume-change');
        if (volumeChange) {
            const changeValue = this.marketData.volumeChange24h || 0;
            volumeChange.textContent = this.formatPercentage(changeValue);
            this.setChangeClass(volumeChange, changeValue);
        }
        
        const activeTokens = document.getElementById('active-tokens');
        if (activeTokens) {
            activeTokens.textContent = this.formatNumber(this.marketData.activeTokens);
            if (this.options.animate) {
                this.animateValue(activeTokens);
            }
        }
        
        const tokensChange = document.getElementById('tokens-change');
        if (tokensChange) {
            const changeValue = this.marketData.activeTokensChange24h || 0;
            tokensChange.textContent = this.formatPercentage(changeValue);
            this.setChangeClass(tokensChange, changeValue);
        }
        
        const totalHolders = document.getElementById('total-holders');
        if (totalHolders) {
            totalHolders.textContent = this.formatNumber(this.marketData.totalHolders);
            if (this.options.animate) {
                this.animateValue(totalHolders);
            }
        }
        
        const holdersChange = document.getElementById('holders-change');
        if (holdersChange) {
            const changeValue = this.marketData.holdersChange24h || 0;
            holdersChange.textContent = this.formatPercentage(changeValue);
            this.setChangeClass(holdersChange, changeValue);
        }
    }
    
    // Atualizar estatísticas de tendência
    updateTrendStats() {
        if (!this.marketData || !this.marketData.trends) return;
        
        const tokensUp = document.getElementById('tokens-up');
        if (tokensUp) {
            tokensUp.textContent = this.formatNumber(this.marketData.trends.up);
        }
        
        const tokensDown = document.getElementById('tokens-down');
        if (tokensDown) {
            tokensDown.textContent = this.formatNumber(this.marketData.trends.down);
        }
        
        const tokensStable = document.getElementById('tokens-stable');
        if (tokensStable) {
            tokensStable.textContent = this.formatNumber(this.marketData.trends.stable);
        }
    }
    
    // Atualizar destaques do mercado
    updateHighlights() {
        if (!this.marketData || !this.marketData.highlights) return;
        
        // Melhor performance
        const bestToken = document.getElementById('best-token');
        if (bestToken) {
            bestToken.textContent = this.marketData.highlights.bestPerformer?.ticker || '--';
        }
        
        const bestValue = document.getElementById('best-value');
        if (bestValue) {
            const value = this.marketData.highlights.bestPerformer?.priceChange24h || 0;
            bestValue.textContent = this.formatPercentage(value);
            this.setChangeClass(bestValue, value);
        }
        
        // Pior performance
        const worstToken = document.getElementById('worst-token');
        if (worstToken) {
            worstToken.textContent = this.marketData.highlights.worstPerformer?.ticker || '--';
        }
        
        const worstValue = document.getElementById('worst-value');
        if (worstValue) {
            const value = this.marketData.highlights.worstPerformer?.priceChange24h || 0;
            worstValue.textContent = this.formatPercentage(value);
            this.setChangeClass(worstValue, value);
        }
        
        // Mais ativo
        const mostActiveToken = document.getElementById('most-active-token');
        if (mostActiveToken) {
            mostActiveToken.textContent = this.marketData.highlights.mostActive?.ticker || '--';
        }
        
        const mostActiveValue = document.getElementById('most-active-value');
        if (mostActiveValue) {
            const value = this.marketData.highlights.mostActive?.volume24h || 0;
            mostActiveValue.textContent = this.formatCurrency(value);
        }
    }
    
    // Inicializar mini gráficos
    initMiniCharts() {
        if (!this.marketData || !this.marketData.historicalData) return;
        
        try {
            // Verificar se a biblioteca de gráficos está disponível
            if (typeof Chart === 'undefined') {
                console.warn('Biblioteca Chart.js não encontrada. Os mini gráficos não serão exibidos.');
                return;
            }
            
            // Mini gráfico para Market Cap
            const marketCapCtx = document.getElementById('market-cap-chart');
            if (marketCapCtx) {
                this.miniCharts.marketCapChart = new Chart(marketCapCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: this.getMiniChartOptions()
                });
            }
            
            // Mini gráfico para Volume
            const volumeCtx = document.getElementById('volume-chart');
            if (volumeCtx) {
                this.miniCharts.volumeChart = new Chart(volumeCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            borderColor: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: this.getMiniChartOptions()
                });
            }
            
            // Atualizar dados dos gráficos
            this.updateMiniCharts(this.marketData.historicalData);
            
            console.log('Mini gráficos inicializados com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar mini gráficos:', error);
        }
    }
    
    // Atualizar mini gráficos com novos dados
    updateMiniCharts(historicalData) {
        if (!historicalData || !this.miniCharts) return;
        
        try {
            // Dados para o gráfico de Market Cap
            if (this.miniCharts.marketCapChart && historicalData.marketCap) {
                const labels = historicalData.marketCap.map(item => item.date);
                const data = historicalData.marketCap.map(item => item.value);
                
                this.miniCharts.marketCapChart.data.labels = labels;
                this.miniCharts.marketCapChart.data.datasets[0].data = data;
                this.miniCharts.marketCapChart.update();
            }
            
            // Dados para o gráfico de Volume
            if (this.miniCharts.volumeChart && historicalData.volume) {
                const labels = historicalData.volume.map(item => item.date);
                const data = historicalData.volume.map(item => item.value);
                
                this.miniCharts.volumeChart.data.labels = labels;
                this.miniCharts.volumeChart.data.datasets[0].data = data;
                this.miniCharts.volumeChart.update();
            }
        } catch (error) {
            console.error('Erro ao atualizar mini gráficos:', error);
        }
    }
    
    // Obter configurações para mini gráficos
    getMiniChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                line: {
                    tension: 0.4
                }
            },
            animation: false
        };
    }
    
    // Atualizar o timestamp da última atualização
    updateTimestamp() {
        const updateTimeElement = this.container.querySelector('.update-time');
        if (updateTimeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            updateTimeElement.textContent = timeString;
        }
    }
    
    // Formatar valor monetário
    formatCurrency(value) {
        if (value === undefined || value === null) return '$0';
        
        const num = Number(value);
        if (isNaN(num)) return '$0';
        
        if (num >= 1000000000) {
            return `$${(num / 1000000000).toFixed(2)}B`;
        } else if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`;
        } else {
            return `$${num.toFixed(2)}`;
        }
    }
    
    // Formatar valor numérico
    formatNumber(value) {
        if (value === undefined || value === null) return '0';
        
        const num = Number(value);
        if (isNaN(num)) return '0';
        
        if (num >= 1000000000) {
            return `${(num / 1000000000).toFixed(1)}B`;
        } else if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        } else {
            return num.toString();
        }
    }
    
    // Formatar valor percentual
    formatPercentage(value) {
        if (value === undefined || value === null) return '0%';
        
        const num = Number(value);
        if (isNaN(num)) return '0%';
        
        const sign = num > 0 ? '+' : '';
        return `${sign}${num.toFixed(2)}%`;
    }
    
    // Definir classe CSS baseada na mudança de valor
    setChangeClass(element, value) {
        if (!element) return;
        
        element.classList.remove('positive', 'negative', 'neutral');
        
        if (value > 0) {
            element.classList.add('positive');
        } else if (value < 0) {
            element.classList.add('negative');
        } else {
            element.classList.add('neutral');
        }
    }
    
    // Animação de atualização de valor
    animateValue(element) {
        if (!element) return;
        
        element.classList.remove('value-updated');
        
        // Trigger reflow
        void element.offsetWidth;
        
        element.classList.add('value-updated');
    }
    
    // Dados mockup para desenvolvimento
    getMockData() {
        return {
            totalMarketCap: 4580000000,
            marketCapChange24h: 3.25,
            totalVolume24h: 350000000,
            volumeChange24h: 5.8,
            activeTokens: 568,
            activeTokensChange24h: 2.4,
            totalHolders: 125000,
            holdersChange24h: 1.7,
            trends: {
                up: 312,
                down: 187,
                stable: 69
            },
            highlights: {
                bestPerformer: {
                    ticker: 'PEPE',
                    priceChange24h: 15.75
                },
                worstPerformer: {
                    ticker: 'DOGE',
                    priceChange24h: -8.32
                },
                mostActive: {
                    ticker: 'ORDI',
                    volume24h: 42000000
                }
            },
            historicalData: {
                marketCap: [
                    { date: '2023-04-01', value: 4200000000 },
                    { date: '2023-04-02', value: 4250000000 },
                    { date: '2023-04-03', value: 4300000000 },
                    { date: '2023-04-04', value: 4280000000 },
                    { date: '2023-04-05', value: 4320000000 },
                    { date: '2023-04-06', value: 4420000000 },
                    { date: '2023-04-07', value: 4580000000 }
                ],
                volume: [
                    { date: '2023-04-01', value: 310000000 },
                    { date: '2023-04-02', value: 320000000 },
                    { date: '2023-04-03', value: 340000000 },
                    { date: '2023-04-04', value: 330000000 },
                    { date: '2023-04-05', value: 320000000 },
                    { date: '2023-04-06', value: 330000000 },
                    { date: '2023-04-07', value: 350000000 }
                ]
            }
        };
    }
    
    // Destruir o componente e liberar recursos
    destroy() {
        console.log('Destruindo componente Market Overview...');
        
        // Destruir gráficos se existirem
        if (this.miniCharts.marketCapChart) {
            this.miniCharts.marketCapChart.destroy();
            this.miniCharts.marketCapChart = null;
        }
        
        if (this.miniCharts.volumeChart) {
            this.miniCharts.volumeChart.destroy();
            this.miniCharts.volumeChart = null;
        }
        
        // Limpar container
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('market-overview-widget', 'dark-mode');
        }
        
        console.log('Componente Market Overview destruído com sucesso');
    }
}

// Exportar a classe para uso global
window.RunesMarketOverview = RunesMarketOverview; 