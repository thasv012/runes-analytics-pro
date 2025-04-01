class WhaleMonitor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentToken = null;
        this.whaleData = [];
        this.alertHistory = [];
        this.charts = {};
        this.setupMonitor();
    }
    
    setupMonitor() {
        this.container.innerHTML = `
            <div class="whale-monitor">
                <div class="monitor-header">
                    <h2>Monitor de Baleias</h2>
                    <div class="monitor-controls">
                        <select id="whale-token-selector">
                            <option value="">Selecione um Token</option>
                        </select>
                        <div class="alert-filter">
                            <label><input type="checkbox" value="accumulation" checked> Acumulação</label>
                            <label><input type="checkbox" value="distribution" checked> Distribuição</label>
                        </div>
                    </div>
                </div>
                
                <div class="monitor-grid">
                    <!-- Painel de Alertas -->
                    <div class="alerts-panel">
                        <div class="panel-header">
                            <h3>Alertas em Tempo Real</h3>
                            <span class="live-indicator">AO VIVO</span>
                        </div>
                        <div class="alerts-container" id="whale-alerts">
                            <!-- Alertas preenchidos via JavaScript -->
                        </div>
                    </div>
                    
                    <!-- Painel de Concentração -->
                    <div class="concentration-panel">
                        <div class="panel-header">
                            <h3>Concentração de Baleias</h3>
                        </div>
                        <div class="concentration-chart" id="concentration-chart"></div>
                        <div class="concentration-stats">
                            <div class="stat-item">
                                <span class="stat-label">Top 10 Baleias:</span>
                                <span class="stat-value" id="top10-percentage">--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Índice Gini:</span>
                                <span class="stat-value" id="gini-index">--</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lista de Baleias -->
                    <div class="whales-list-panel">
                        <div class="panel-header">
                            <h3>Principais Baleias</h3>
                            <div class="sort-control">
                                <select id="whale-sort">
                                    <option value="balance">Por Saldo</option>
                                    <option value="change">Por Mudança</option>
                                </select>
                            </div>
                        </div>
                        <div class="whales-list" id="whales-list">
                            <!-- Lista preenchida via JavaScript -->
                        </div>
                    </div>
                    
                    <!-- Análise de Movimento -->
                    <div class="movement-panel">
                        <div class="panel-header">
                            <h3>Análise de Movimento</h3>
                        </div>
                        <div class="movement-chart" id="movement-chart"></div>
                        <div class="movement-prediction">
                            <h4>Previsão de Movimento</h4>
                            <div class="prediction-content" id="movement-prediction">
                                <!-- Previsão preenchida via JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Histórico de Alertas -->
                <div class="alerts-history">
                    <div class="history-header">
                        <h3>Histórico de Alertas</h3>
                        <div class="history-filter">
                            <select id="history-filter">
                                <option value="all">Todos</option>
                                <option value="accumulation">Acumulação</option>
                                <option value="distribution">Distribuição</option>
                                <option value="transfer">Transferências</option>
                            </select>
                        </div>
                    </div>
                    <div class="history-table-container">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Tipo</th>
                                    <th>Token</th>
                                    <th>Detalhes</th>
                                    <th>Severidade</th>
                                </tr>
                            </thead>
                            <tbody id="alerts-history-table">
                                <!-- Histórico preenchido via JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        this.setupCharts();
        this.setupEventListeners();
        this.loadTokens();
    }
    
    setupCharts() {
        // Inicializar gráfico de concentração
        const concentrationCtx = document.getElementById('concentration-chart');
        if (concentrationCtx) {
            this.charts.concentration = new Chart(concentrationCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Top 10 Baleias', 'Outros Holders'],
                    datasets: [{
                        data: [0, 100],
                        backgroundColor: ['#3498db', '#2c3e50']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#ffffff'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Inicializar gráfico de movimento
        const movementCtx = document.getElementById('movement-chart');
        if (movementCtx) {
            this.charts.movement = new Chart(movementCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Acumulação/Distribuição',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#ffffff'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#ffffff'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    setupEventListeners() {
        // Listener para seleção de token
        const tokenSelector = document.getElementById('whale-token-selector');
        if (tokenSelector) {
            tokenSelector.addEventListener('change', (e) => {
                this.loadWhaleData(e.target.value);
            });
        }
        
        // Listener para filtros de alerta
        document.querySelectorAll('.alert-filter input').forEach(input => {
            input.addEventListener('change', () => {
                this.updateAlertFilters();
            });
        });
        
        // Listener para ordenação de baleias
        const whaleSort = document.getElementById('whale-sort');
        if (whaleSort) {
            whaleSort.addEventListener('change', (e) => {
                this.sortWhalesList(e.target.value);
            });
        }
        
        // Listener para filtro de histórico
        const historyFilter = document.getElementById('history-filter');
        if (historyFilter) {
            historyFilter.addEventListener('change', () => {
                this.updateAlertHistory();
            });
        }
        
        // Listener para alertas de baleias
        window.addEventListener('whale_alert', (event) => {
            this.processNewAlert(event.detail);
        });
    }
    
    async loadTokens() {
        try {
            const runesService = await import('../services/runesMarketDataService.js');
            const tokens = await runesService.default.fetchTopTokensByVolume();
            
            const selector = document.getElementById('whale-token-selector');
            if (selector && tokens && tokens.length > 0) {
                tokens.forEach(token => {
                    const option = document.createElement('option');
                    option.value = token.ticker;
                    option.textContent = `${token.ticker} - Vol: ${this.formatNumber(token.volume24h)} BTC`;
                    selector.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar tokens:', error);
        }
    }
    
    async loadWhaleData(ticker) {
        if (!ticker) return;
        
        try {
            this.currentToken = ticker;
            
            // Carregar dados de baleias
            const whaleService = await import('../services/whaleAlertService.js');
            const whales = await whaleService.default.getWhalesForToken(ticker);
            this.whaleData = whales || [];
            
            // Carregar histórico de alertas
            this.alertHistory = whaleService.default.getAlertHistory(ticker) || [];
            
            // Atualizar UI
            this.updateWhalesList();
            this.updateConcentrationChart();
            this.updateMovementChart();
            this.updateAlertHistory();
            
            console.log(`Dados de baleias carregados para ${ticker}`);
        } catch (error) {
            console.error(`Erro ao carregar dados de baleias para ${ticker}:`, error);
        }
    }
    
    updateWhalesList() {
        const listContainer = document.getElementById('whales-list');
        if (!listContainer || !this.whaleData || this.whaleData.length === 0) {
            if (listContainer) {
                listContainer.innerHTML = '<div class="no-data">Nenhum dado disponível</div>';
            }
            return;
        }
        
        listContainer.innerHTML = this.whaleData.map(whale => {
            const changePercentage = whale.previousBalance 
                ? ((whale.balance - whale.previousBalance) / whale.previousBalance) * 100 
                : 0;
                
            const changeClass = changePercentage > 0 
                ? 'positive' 
                : (changePercentage < 0 ? 'negative' : 'neutral');
                
            const changeText = changePercentage !== 0 
                ? `${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(2)}%` 
                : 'Sem mudança';
                
            return `
                <div class="whale-item">
                    <div class="whale-address">
                        <span class="address-text">${this.shortenAddress(whale.address)}</span>
                        <a href="https://mempool.space/address/${whale.address}" target="_blank" class="address-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                    <div class="whale-balance">
                        <span class="balance-value">${this.formatNumber(whale.balance)}</span>
                        <span class="balance-percentage">${whale.percentage.toFixed(2)}%</span>
                    </div>
                    <div class="whale-change ${changeClass}">
                        ${changeText}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateConcentrationChart() {
        if (!this.whaleData || this.whaleData.length === 0 || !this.charts.concentration) return;
        
        // Calcular concentração
        const top10 = [...this.whaleData]
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 10);
            
        const top10Total = top10.reduce((sum, whale) => sum + whale.balance, 0);
        const totalSupply = this.whaleData.reduce((sum, whale) => sum + whale.balance, 0);
        const top10Percentage = (top10Total / totalSupply) * 100;
        const othersPercentage = 100 - top10Percentage;
        
        // Atualizar estatísticas
        const top10Element = document.getElementById('top10-percentage');
        if (top10Element) {
            top10Element.textContent = `${top10Percentage.toFixed(2)}%`;
        }
        
        // Calcular índice Gini
        const giniIndex = this.calculateGiniIndex(this.whaleData.map(w => w.balance));
        const giniElement = document.getElementById('gini-index');
        if (giniElement) {
            giniElement.textContent = giniIndex.toFixed(3);
        }
        
        // Atualizar gráfico
        this.charts.concentration.data.datasets[0].data = [top10Percentage, othersPercentage];
        this.charts.concentration.update();
    }
    
    updateMovementChart() {
        if (!this.whaleData || this.whaleData.length === 0 || !this.charts.movement) return;
        
        // Preparar dados para o gráfico
        const movementData = this.calculateMovementTrend();
        
        // Atualizar gráfico
        this.charts.movement.data.labels = movementData.labels;
        this.charts.movement.data.datasets[0].data = movementData.values;
        this.charts.movement.update();
        
        // Gerar previsão
        const prediction = this.generateMovementPrediction(movementData);
        const predictionElement = document.getElementById('movement-prediction');
        if (predictionElement) {
            predictionElement.innerHTML = `
                <div class="prediction-item">
                    <span class="prediction-label">Tendência:</span>
                    <span class="prediction-value ${prediction.trend === 'accumulation' ? 'positive' : 'negative'}">
                        ${prediction.trend === 'accumulation' ? 'Acumulação' : 'Distribuição'}
                    </span>
                </div>
                <div class="prediction-item">
                    <span class="prediction-label">Força:</span>
                    <span class="prediction-value">${prediction.strength}/10</span>
                </div>
                <div class="prediction-item">
                    <span class="prediction-label">Impacto Provável:</span>
                    <span class="prediction-value">${prediction.impact}</span>
                </div>
                <div class="prediction-alert ${prediction.trend === 'accumulation' ? 'positive' : 'negative'}">
                    ${prediction.trend === 'accumulation' 
                        ? 'Possível movimento de alta em breve' 
                        : 'Possível realização de lucros em breve'}
                </div>
            `;
        }
    }
    
    updateAlertHistory() {
        const historyTable = document.getElementById('alerts-history-table');
        if (!historyTable) return;
        
        if (!this.alertHistory || this.alertHistory.length === 0) {
            historyTable.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">Nenhum alerta registrado</td>
                </tr>
            `;
            return;
        }
        
        const filter = document.getElementById('history-filter')?.value || 'all';
        const filteredHistory = filter === 'all' 
            ? this.alertHistory 
            : this.alertHistory.filter(alert => alert.type === filter);
        
        historyTable.innerHTML = filteredHistory.map(alert => `
            <tr class="alert-row alert-${alert.severity}">
                <td>${alert.timestamp.toLocaleTimeString()}</td>
                <td>${this.getAlertTypeLabel(alert.type)}</td>
                <td>${alert.ticker}</td>
                <td>${this.formatAlertDetails(alert)}</td>
                <td>
                    <span class="severity-indicator severity-${alert.severity}">
                        ${this.getSeverityLabel(alert.severity)}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    processNewAlert(alert) {
        // Adicionar ao histórico se for do token atual
        if (alert.ticker === this.currentToken) {
            this.alertHistory.unshift(alert);
            this.updateAlertHistory();
            
            // Atualizar dados de baleias se necessário
            if (alert.type === 'accumulation' || alert.type === 'distribution') {
                this.loadWhaleData(this.currentToken);
            }
        }
    }
    
    updateAlertFilters() {
        const enabledTypes = Array.from(document.querySelectorAll('.alert-filter input:checked'))
            .map(input => input.value);
        
        const alerts = document.querySelectorAll('#whale-alerts .alert');
        alerts.forEach(alert => {
            const type = Array.from(alert.classList)
                .find(cls => cls.startsWith('alert-') && !cls.startsWith('alert-severity'))
                ?.replace('alert-', '');
            
            if (type && enabledTypes.includes(type)) {
                alert.style.display = '';
            } else {
                alert.style.display = 'none';
            }
        });
    }
    
    sortWhalesList(sortBy) {
        if (!this.whaleData || this.whaleData.length === 0) return;
        
        if (sortBy === 'balance') {
            this.whaleData.sort((a, b) => b.balance - a.balance);
        } else if (sortBy === 'change') {
            this.whaleData.sort((a, b) => {
                const changeA = a.previousBalance ? ((a.balance - a.previousBalance) / a.previousBalance) * 100 : 0;
                const changeB = b.previousBalance ? ((b.balance - b.previousBalance) / b.previousBalance) * 100 : 0;
                return changeB - changeA;
            });
        }
        
        this.updateWhalesList();
    }
    
    // Métodos auxiliares
    calculateGiniIndex(balances) {
        if (!balances || balances.length <= 1) return 0;
        
        const n = balances.length;
        const mean = balances.reduce((sum, val) => sum + val, 0) / n;
        
        let sumAbsoluteDifferences = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sumAbsoluteDifferences += Math.abs(balances[i] - balances[j]);
            }
        }
        
        return sumAbsoluteDifferences / (2 * n * n * mean);
    }
    
    calculateMovementTrend() {
        // Simular dados de movimento para demonstração
        const days = 14;
        const now = new Date();
        
        const labels = Array.from({length: days}, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (days - i - 1));
            return date.toLocaleDateString('pt-BR');
        });
        
        // Simular tendência de acumulação/distribuição
        // Valores positivos = acumulação, negativos = distribuição
        const values = Array.from({length: days}, () => {
            return (Math.random() * 2 - 1) * 10; // Valores entre -10 e 10
        });
        
        return { labels, values };
    }
    
    generateMovementPrediction(movementData) {
        if (!movementData) return { trend: 'unknown', strength: 0, impact: 'Desconhecido' };
        
        // Calcular tendência recente (últimos 5 dias)
        const recentValues = movementData.values.slice(-5);
        const recentSum = recentValues.reduce((sum, val) => sum + val, 0);
        
        const trend = recentSum > 0 ? 'accumulation' : 'distribution';
        const strength = Math.min(10, Math.abs(recentSum) / 5);
        
        let impact = 'Neutro';
        if (strength > 7) impact = trend === 'accumulation' ? 'Alta Significativa' : 'Queda Significativa';
        else if (strength > 4) impact = trend === 'accumulation' ? 'Alta Moderada' : 'Queda Moderada';
        else impact = trend === 'accumulation' ? 'Leve Alta' : 'Leve Queda';
        
        return { trend, strength: Math.round(strength), impact };
    }
    
    shortenAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
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
    
    getAlertTypeLabel(type) {
        const types = {
            'accumulation': 'Acumulação',
            'distribution': 'Distribuição',
            'transfer': 'Transferência',
            'unknown': 'Desconhecido'
        };
        
        return types[type] || 'Desconhecido';
    }
    
    getSeverityLabel(severity) {
        const labels = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta',
            'critical': 'Crítica'
        };
        
        return labels[severity] || 'Desconhecida';
    }
    
    formatAlertDetails(alert) {
        if (alert.type === 'accumulation') {
            return `+${alert.change?.percentage.toFixed(2)}% por ${this.shortenAddress(alert.whale?.address)}`;
        } else if (alert.type === 'distribution') {
            return `-${alert.change?.percentage.toFixed(2)}% por ${this.shortenAddress(alert.whale?.address)}`;
        } else if (alert.type === 'transfer') {
            return `${this.formatNumber(alert.transaction?.amount)} ${alert.ticker} transferidos`;
        }
        
        return 'Detalhes não disponíveis';
    }
}

export default WhaleMonitor;
