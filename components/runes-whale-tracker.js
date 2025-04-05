/**
 * RUNES Analytics Pro - Componente de Rastreamento de Baleias
 * Responsável por monitorar e visualizar movimentos de grandes investidores (baleias) no mercado de RUNES
 * Oferece visualizações avançadas e alertas para movimentos significativos
 */

class RunesWhaleTracker {
    constructor() {
        this.container = null;
        this.dataLoaded = false;
        this.isLoading = true;
        this.updateInterval = 30000; // 30 segundos
        this.autoRefresh = true;
        this.filterToken = 'all';
        this.filterType = 'all';
        this.filterImpact = 0;
        this.currentPage = 1;
        this.pageSize = 10;
        this.transactions = [];
        this.stats = {};
        this.refreshTimer = null;
        this.initialized = false;
    }
    
    init() {
        console.log('🐳 Inicializando componente de Rastreador de Baleias...');
        
        // Verificar se o serviço está disponível
        if (!window.whaleTrackerService) {
            console.error('❌ ServiçoWhaleTrackerService não encontrado');
            return false;
        }
        
        // Garantir que o container existe
        this.ensureContainersExist();
        
        // Renderizar estrutura base
        this.renderStructure();
        
        // Carregar dados iniciais
        this.loadData();
        
        // Adicionar event listeners
        this.addEventListeners();
        
        // Registrar para receber novas transações de baleias
        window.whaleTrackerService.onNewTransaction(transaction => {
            console.log('🐳 Nova transação de baleia recebida:', transaction);
            
            // Adicionar à lista de transações
            this.transactions.unshift(transaction);
            
            // Limitar a lista a 100 transações
            if (this.transactions.length > 100) {
                this.transactions.pop();
            }
            
            // Atualizar a interface
            this.updateUI();
            
            // Mostrar alerta se for uma transação de alto impacto
            if (transaction.impact > 7) {
                this.showWhaleAlert(transaction);
            }
        });
        
        this.initialized = true;
        return true;
    }
    
    /**
     * Renderiza a estrutura base do componente
     */
    renderBaseStructure() {
        this.container.innerHTML = `
            <div class="whale-tracker-dashboard">
                <div class="tracker-controls">
                    <div class="rune-filter">
                        <label>Filtrar por RUNE:</label>
                        <select id="whale-rune-filter" class="styled-select">
                            <option value="ALL">Todos os RUNES</option>
                            <option value="DOG">DOG•GO•TO•THE•MOON 🐕</option>
                            <option value="MAGIC">MAGIC•INTERNET•MONEY 💰</option>
                            <option value="NIKOLA">NIKOLA•TESLA•GOD ⚡</option>
                            <option value="BILLION">BILLION•DOLLAR•CAT 🐱</option>
                            <option value="CYPHER">CYPHER•GENESIS 🔐</option>
                        </select>
                    </div>
                    
                    <div class="time-range-filter">
                        <label>Período:</label>
                        <div class="time-buttons">
                            <button data-time="1h">1h</button>
                            <button data-time="24h" class="active">24h</button>
                            <button data-time="7d">7d</button>
                            <button data-time="30d">30d</button>
                        </div>
                    </div>
                    
                    <div class="threshold-slider">
                        <label>Limite mínimo para baleias: $<span id="threshold-value">100,000</span></label>
                        <input type="range" id="whale-threshold" min="10000" max="1000000" step="10000" value="100000">
                    </div>
                </div>
                
                <div class="whale-dashboard-main">
                    <div class="whale-metrics-panel">
                        <div class="metric-card total-volume">
                            <h3>Volume Total de Baleias</h3>
                            <div class="metric-value" id="total-whale-volume">$0</div>
                            <div class="metric-change positive" id="volume-change">+0%</div>
                        </div>
                        
                        <div class="metric-card transaction-count">
                            <h3>Transações de Baleias</h3>
                            <div class="metric-value" id="whale-transaction-count">0</div>
                            <div class="metric-change" id="transaction-count-change">0%</div>
                        </div>
                        
                        <div class="metric-card avg-transaction">
                            <h3>Valor Médio de Transação</h3>
                            <div class="metric-value" id="avg-transaction-value">$0</div>
                        </div>
                    </div>
                    
                    <div class="whale-activity-chart-container">
                        <h3>Atividade de Baleias nas Últimas 24h</h3>
                        <div id="whale-activity-chart" class="chart-container"></div>
                    </div>
                </div>
                
                <div class="whale-transactions-container">
                    <h3>Movimentos Recentes de Baleias</h3>
                    <div class="transactions-toolbar">
                        <div class="search-box">
                            <input type="text" id="transaction-search" placeholder="Buscar por endereço ou RUNE...">
                            <button id="search-btn">🔍</button>
                        </div>
                        <div class="sort-options">
                            <label>Ordenar por:</label>
                            <select id="sort-transactions" class="styled-select-sm">
                                <option value="time-desc">Mais recentes</option>
                                <option value="value-desc">Maior valor</option>
                                <option value="value-asc">Menor valor</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="transactions-table-container">
                        <table class="transactions-table" id="whale-transactions-table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>RUNE</th>
                                    <th>Tipo</th>
                                    <th>Valor (USD)</th>
                                    <th>De</th>
                                    <th>Para</th>
                                    <th>Impacto</th>
                                </tr>
                            </thead>
                            <tbody id="whale-transactions-body">
                                <!-- Preenchido dinamicamente -->
                                <tr>
                                    <td colspan="7" class="loading-data">Carregando dados de transações...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="whale-insights-grid">
                    <div class="whale-movements-map">
                        <h3>Mapa de Movimentações</h3>
                        <div id="globe-container" class="globe-visualization">
                            <!-- Placeholder para o globo interativo -->
                            <div class="placeholder-text">Mapa de calor global das transações de baleias</div>
                        </div>
                    </div>
                    
                    <div class="whale-addresses-panel">
                        <h3>Top Endereços de Baleias</h3>
                        <div id="top-whale-addresses" class="addresses-list">
                            <!-- Preenchido dinamicamente -->
                        </div>
                    </div>
                </div>
                
                <div class="price-impact-analysis">
                    <h3>Análise de Impacto no Preço</h3>
                    <div id="price-impact-chart" class="impact-chart-container">
                        <!-- Gráfico mostrando correlação entre movimentos de baleias e preço -->
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Carrega dados de movimentações de baleias (mock para demonstração)
     */
    async loadWhaleData() {
        console.log('Carregando dados de movimentações de baleias...');
        
        // Simular chamada de API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Dados mockados para demonstração
                this.whaleTransactions = [
                    {
                        id: 'tx12345',
                        time: new Date(Date.now() - 25 * 60000), // 25 minutos atrás
                        rune: 'DOG',
                        type: 'compra',
                        value: 1250000,
                        valueFormatted: '$1,250,000',
                        from: '0x7c2b...f8e3',
                        to: '0x9d4a...c21b',
                        impact: 'alto',
                        location: 'USA'
                    },
                    {
                        id: 'tx12346',
                        time: new Date(Date.now() - 52 * 60000), // 52 minutos atrás
                        rune: 'MAGIC',
                        type: 'venda',
                        value: 580000,
                        valueFormatted: '$580,000',
                        from: '0x3a7d...e92c',
                        to: '0x5b1f...a78d',
                        impact: 'médio',
                        location: 'Singapore'
                    },
                    {
                        id: 'tx12347',
                        time: new Date(Date.now() - 115 * 60000), // 1h55min atrás
                        rune: 'DOG',
                        type: 'transferência',
                        value: 820000,
                        valueFormatted: '$820,000',
                        from: '0x2c9b...d74a',
                        to: '0x6e8f...b39c',
                        impact: 'médio',
                        location: 'Japan'
                    },
                    {
                        id: 'tx12348',
                        time: new Date(Date.now() - 180 * 60000), // 3h atrás
                        rune: 'CYPHER',
                        type: 'compra',
                        value: 2100000,
                        valueFormatted: '$2,100,000',
                        from: '0x1f4d...c83e',
                        to: '0x8c7b...a45d',
                        impact: 'muito alto',
                        location: 'Germany'
                    },
                    {
                        id: 'tx12349',
                        time: new Date(Date.now() - 240 * 60000), // 4h atrás
                        rune: 'BILLION',
                        type: 'compra',
                        value: 430000,
                        valueFormatted: '$430,000',
                        from: '0x5a3c...b92d',
                        to: '0x7d8e...f46c',
                        impact: 'baixo',
                        location: 'South Korea'
                    },
                    {
                        id: 'tx12350',
                        time: new Date(Date.now() - 360 * 60000), // 6h atrás
                        rune: 'NIKOLA',
                        type: 'venda',
                        value: 1680000,
                        valueFormatted: '$1,680,000',
                        from: '0x9b2c...e57a',
                        to: '0x4f8d...c36b',
                        impact: 'alto',
                        location: 'UK'
                    }
                ];
                
                // Configurar dados de análise de baleias
                this.whaleAnalytics = {
                    totalVolume: 6860000,
                    volumeChange: 12.5,
                    transactionCount: 6,
                    transactionCountChange: 8.2,
                    avgTransactionValue: 1143333,
                    topWhales: [
                        { address: '0x7c2b...f8e3', holdings: '$12.5M', activity: 'Alto', lastActive: '25min atrás', runeBalance: { 'DOG': '680,000', 'MAGIC': '230,000' } },
                        { address: '0x9b2c...e57a', holdings: '$8.2M', activity: 'Médio', lastActive: '6h atrás', runeBalance: { 'NIKOLA': '1,200,000', 'CYPHER': '125,000' } },
                        { address: '0x1f4d...c83e', holdings: '$5.7M', activity: 'Alto', lastActive: '3h atrás', runeBalance: { 'CYPHER': '890,000', 'DOG': '120,000' } }
                    ]
                };
                
                // Atualizar a interface
                this.updateWhaleInterface();
                this.lastUpdate = new Date();
                
                resolve();
            }, 1200); // Simular delay de rede
        });
    }
    
    /**
     * Atualiza a interface com os dados carregados
     */
    updateWhaleInterface() {
        // Atualizar métricas principais
        document.getElementById('total-whale-volume').textContent = this.formatCurrency(this.whaleAnalytics.totalVolume);
        document.getElementById('volume-change').textContent = (this.whaleAnalytics.volumeChange > 0 ? '+' : '') + this.whaleAnalytics.volumeChange + '%';
        document.getElementById('volume-change').className = 'metric-change ' + (this.whaleAnalytics.volumeChange >= 0 ? 'positive' : 'negative');
        
        document.getElementById('whale-transaction-count').textContent = this.whaleAnalytics.transactionCount;
        document.getElementById('transaction-count-change').textContent = (this.whaleAnalytics.transactionCountChange > 0 ? '+' : '') + this.whaleAnalytics.transactionCountChange + '%';
        document.getElementById('transaction-count-change').className = 'metric-change ' + (this.whaleAnalytics.transactionCountChange >= 0 ? 'positive' : 'negative');
        
        document.getElementById('avg-transaction-value').textContent = this.formatCurrency(this.whaleAnalytics.avgTransactionValue);
        
        // Atualizar tabela de transações
        this.updateTransactionsTable();
        
        // Atualizar lista de endereços de baleias
        this.updateTopWhalesList();
        
        // Simular gráficos (em produção usaríamos bibliotecas como Chart.js, D3.js, etc.)
        this.simulateCharts();
        
        // Atualizar horário da última atualização
        if (this.lastUpdate) {
            const updateTimeElement = document.createElement('div');
            updateTimeElement.className = 'last-update-time';
            updateTimeElement.textContent = `Última atualização: ${this.formatTime(this.lastUpdate)}`;
            this.container.appendChild(updateTimeElement);
        }
    }
    
    /**
     * Atualiza a tabela de transações com os dados filtrados
     */
    updateTransactionsTable() {
        const tableBody = document.getElementById('whale-transactions-body');
        if (!tableBody) return;
        
        let transactions = this.filterTransactions();
        
        if (transactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">Nenhuma transação encontrada com os filtros atuais</td>
                </tr>
            `;
            return;
        }
        
        let tableHtml = '';
        transactions.forEach(tx => {
            const formattedTime = this.formatTime(tx.time);
            const impactClass = this.getImpactClass(tx.impact);
            const typeClass = this.getTransactionTypeClass(tx.type);
            
            tableHtml += `
                <tr data-tx-id="${tx.id}">
                    <td>${formattedTime}</td>
                    <td class="rune-cell">${tx.rune}</td>
                    <td class="tx-type ${typeClass}">${tx.type}</td>
                    <td class="value-cell">${tx.valueFormatted}</td>
                    <td class="address-cell">${tx.from}</td>
                    <td class="address-cell">${tx.to}</td>
                    <td class="impact-cell ${impactClass}">${tx.impact}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHtml;
        
        // Adicionar eventos aos elementos da tabela
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                this.showTransactionDetails(row.dataset.txId);
            });
        });
    }
    
    /**
     * Atualiza a lista de principais endereços de baleias
     */
    updateTopWhalesList() {
        const whalesContainer = document.getElementById('top-whale-addresses');
        if (!whalesContainer || !this.whaleAnalytics.topWhales) return;
        
        let whalesHtml = '';
        this.whaleAnalytics.topWhales.forEach((whale, index) => {
            whalesHtml += `
                <div class="whale-address-card">
                    <div class="whale-rank">#${index + 1}</div>
                    <div class="whale-address">${whale.address}</div>
                    <div class="whale-holdings">${whale.holdings}</div>
                    <div class="whale-activity-level">Atividade: <span class="${whale.activity.toLowerCase()}">${whale.activity}</span></div>
                    <div class="whale-last-active">Última atividade: ${whale.lastActive}</div>
                    <div class="whale-balance-breakdown">
                        ${this.formatRuneBalances(whale.runeBalance)}
                    </div>
                </div>
            `;
        });
        
        whalesContainer.innerHTML = whalesHtml;
    }
    
    /**
     * Filtra transações com base nos filtros atuais
     */
    filterTransactions() {
        let filteredTx = [...this.whaleTransactions];
        
        // Filtrar por RUNE específico se não for "ALL"
        if (this.selectedRune !== 'ALL') {
            filteredTx = filteredTx.filter(tx => tx.rune === this.selectedRune);
        }
        
        // Filtrar por valor mínimo (threshold)
        filteredTx = filteredTx.filter(tx => tx.value >= this.minWhaleThreshold);
        
        // Filtrar por intervalo de tempo
        const timeRangeMs = this.getTimeRangeInMs(this.timeRange);
        if (timeRangeMs > 0) {
            const cutoffTime = new Date(Date.now() - timeRangeMs);
            filteredTx = filteredTx.filter(tx => tx.time >= cutoffTime);
        }
        
        return filteredTx;
    }
    
    /**
     * Configura os event listeners para interatividade
     */
    setupEventListeners() {
        // Seletor de RUNE
        const runeFilter = document.getElementById('whale-rune-filter');
        if (runeFilter) {
            runeFilter.addEventListener('change', (e) => {
                this.selectedRune = e.target.value;
                this.updateTransactionsTable();
                this.simulateCharts();
            });
        }
        
        // Botões de intervalo de tempo
        const timeButtons = document.querySelectorAll('.time-buttons button');
        timeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remover classe ativa de todos os botões
                timeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                e.target.classList.add('active');
                
                // Atualizar timeframe e recarregar dados
                this.timeRange = e.target.dataset.time;
                this.updateTransactionsTable();
                this.simulateCharts();
            });
        });
        
        // Slider de threshold
        const thresholdSlider = document.getElementById('whale-threshold');
        if (thresholdSlider) {
            thresholdSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.minWhaleThreshold = value;
                
                // Atualizar o valor exibido
                const thresholdValueElement = document.getElementById('threshold-value');
                if (thresholdValueElement) {
                    thresholdValueElement.textContent = this.formatNumberWithCommas(value);
                }
                
                this.updateTransactionsTable();
            });
        }
        
        // Caixa de busca
        const searchBox = document.getElementById('transaction-search');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBox && searchBtn) {
            const performSearch = () => {
                const query = searchBox.value.trim().toLowerCase();
                
                if (query.length > 0) {
                    // Filtrar as linhas da tabela
                    const rows = document.querySelectorAll('#whale-transactions-body tr');
                    
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        if (text.includes(query)) {
                            row.style.display = '';
                            row.classList.add('search-highlight');
                        } else {
                            row.style.display = 'none';
                        }
                    });
                } else {
                    // Se a consulta estiver vazia, mostrar todas as linhas e remover destaque
                    const rows = document.querySelectorAll('#whale-transactions-body tr');
                    rows.forEach(row => {
                        row.style.display = '';
                        row.classList.remove('search-highlight');
                    });
                }
            };
            
            searchBtn.addEventListener('click', performSearch);
            searchBox.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
                // Remover destaque ao limpar a busca
                if (e.target.value.trim() === '') {
                    const rows = document.querySelectorAll('#whale-transactions-body tr');
                    rows.forEach(row => {
                        row.style.display = '';
                        row.classList.remove('search-highlight');
                    });
                }
            });
        }
        
        // Seletor de ordenação
        const sortSelect = document.getElementById('sort-transactions');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.updateTransactionsTable();
            });
        }
    }
    
    /**
     * Exibe detalhes de uma transação específica
     */
    showTransactionDetails(txId) {
        const transaction = this.whaleTransactions.find(tx => tx.id === txId);
        if (!transaction) return;
        
        // Criar um modal para mostrar detalhes da transação
        const modal = document.createElement('div');
        modal.className = 'whale-transaction-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes da Transação</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="transaction-details">
                    <div class="detail-row">
                        <div class="detail-label">ID da Transação:</div>
                        <div class="detail-value">${txId}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Hora:</div>
                        <div class="detail-value">${this.formatTime(transaction.time)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">RUNE:</div>
                        <div class="detail-value">${transaction.rune}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Tipo:</div>
                        <div class="detail-value ${this.getTransactionTypeClass(transaction.type)}">${transaction.type}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Valor:</div>
                        <div class="detail-value">${transaction.valueFormatted}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">De:</div>
                        <div class="detail-value address">${transaction.from}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Para:</div>
                        <div class="detail-value address">${transaction.to}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Impacto:</div>
                        <div class="detail-value ${this.getImpactClass(transaction.impact)}">${transaction.impact}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Localização:</div>
                        <div class="detail-value">${transaction.location}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary setup-alert-btn">Configurar Alerta</button>
                    <button class="btn-secondary close-btn">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar event listeners para o modal
        const closeButton = modal.querySelector('.close-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const alertBtn = modal.querySelector('.setup-alert-btn');
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeButton.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        
        alertBtn.addEventListener('click', () => {
            // Lógica para configurar um alerta
            alert(`Alerta configurado para atividades semelhantes a ${txId}`);
            closeModal();
        });
    }
    
    /**
     * Inicia um temporizador para atualizar os dados periodicamente
     */
    startDataRefreshTimer() {
        // Atualizar a cada 2 minutos
        setInterval(() => {
            this.loadWhaleData();
        }, 120000);
    }
    
    /**
     * Simula a renderização de gráficos para demonstração
     */
    simulateCharts() {
        // Simular gráfico de atividade de baleias
        const activityChart = document.getElementById('whale-activity-chart');
        if (activityChart) {
            activityChart.innerHTML = `
                <div class="chart-placeholder">
                    <p>Gráfico de Atividade de Baleias (${this.timeRange})</p>
                    <p class="chart-note">${this.selectedRune === 'ALL' ? 'Todos os RUNES' : this.selectedRune}</p>
                </div>
            `;
        }
        
        // Simular mapa global
        const globeContainer = document.getElementById('globe-container');
        if (globeContainer) {
            globeContainer.innerHTML = `
                <div class="globe-placeholder">
                    <p>Mapa Global de Transações</p>
                    <div class="globe-mock">🌎</div>
                </div>
            `;
        }
        
        // Simular gráfico de impacto no preço
        const priceImpactChart = document.getElementById('price-impact-chart');
        if (priceImpactChart) {
            priceImpactChart.innerHTML = `
                <div class="chart-placeholder">
                    <p>Correlação entre Movimentos de Baleias e Preço</p>
                    <p class="chart-note">${this.selectedRune === 'ALL' ? 'Filtro por RUNE específico para ver este gráfico' : `Mostrando impacto para ${this.selectedRune}`}</p>
                </div>
            `;
            
            // Mostrar dados reais apenas se um RUNE específico estiver selecionado
            if (this.selectedRune !== 'ALL') {
                const priceImpactData = this.generatePriceImpactData();
                
                let dataHtml = '<div class="impact-data-points">';
                priceImpactData.forEach(point => {
                    dataHtml += `
                        <div class="impact-point ${point.type}">
                            <div class="impact-time">${point.time}</div>
                            <div class="impact-value">${point.value}</div>
                            <div class="impact-result ${point.result > 0 ? 'positive' : 'negative'}">${point.result > 0 ? '+' : ''}${point.result}%</div>
                        </div>
                    `;
                });
                dataHtml += '</div>';
                
                priceImpactChart.innerHTML += dataHtml;
            }
        }
    }
    
    /**
     * Gera dados de impacto no preço para o RUNE selecionado
     */
    generatePriceImpactData() {
        // Dados mockados para demonstração
        return [
            { time: '08:15', type: 'compra', value: '$1.2M', result: 2.8 },
            { time: '10:42', type: 'venda', value: '$850K', result: -1.5 },
            { time: '13:20', type: 'compra', value: '$2.1M', result: 4.2 },
            { time: '15:55', type: 'transferência', value: '$740K', result: 0.3 },
            { time: '18:10', type: 'venda', value: '$1.5M', result: -2.1 }
        ];
    }
    
    // Métodos auxiliares
    
    formatTime(date) {
        if (!date) return 'Desconhecido';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            return `${diffMins}min atrás`;
        } else if (diffMins < 1440) {
            const hours = Math.floor(diffMins / 60);
            return `${hours}h atrás`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    }
    
    formatCurrency(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(1) + 'K';
        } else {
            return '$' + value;
        }
    }
    
    formatNumberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    getTimeRangeInMs(range) {
        const rangeMap = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        
        return rangeMap[range] || 0;
    }
    
    getImpactClass(impact) {
        const classMap = {
            'muito alto': 'impact-very-high',
            'alto': 'impact-high',
            'médio': 'impact-medium',
            'baixo': 'impact-low'
        };
        
        return classMap[impact] || '';
    }
    
    getTransactionTypeClass(type) {
        const classMap = {
            'compra': 'type-buy',
            'venda': 'type-sell',
            'transferência': 'type-transfer'
        };
        
        return classMap[type] || '';
    }
    
    formatRuneBalances(balances) {
        if (!balances) return '';
        
        let html = '<div class="rune-balances">';
        for (const [rune, amount] of Object.entries(balances)) {
            html += `<div class="rune-balance-item"><span class="rune-name">${rune}:</span> <span class="rune-amount">${amount}</span></div>`;
        }
        html += '</div>';
        
        return html;
    }

    /**
     * Simula a recepção de uma nova transação de baleia e atualiza a interface
     */
    simulateNewWhaleTransaction() {
        console.log('Simulando nova transação de baleia...');
        
        // Gerar um tipo aleatório
        const types = ['buy', 'sell', 'transfer'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Gerar um rune aleatório
        const runes = Object.keys(this.mockDataByRune);
        const randomRune = runes[Math.floor(Math.random() * runes.length)];
        
        // Criar nova transação
        const newTx = {
            time: new Date().toLocaleTimeString(),
            rune: randomRune,
            type: randomType,
            value: 100000 + Math.random() * 900000, // Entre $100K e $1M
            from: '0x' + Math.random().toString(16).slice(2, 12),
            to: '0x' + Math.random().toString(16).slice(2, 12),
            impact: Math.floor(Math.random() * 5) + 1 // Impacto de 1 a 5
        };
        
        // Adicionar à lista de transações
        this.whaleTransactions.unshift(newTx);
        
        // Manter apenas as últimas 20 transações
        if (this.whaleTransactions.length > 20) {
            this.whaleTransactions.pop();
        }
        
        // Atualizar a tabela
        this.updateTransactionsTable();
        
        // Atualizar métricas
        this.updateMetrics();
        
        // Mostrar notificação
        this.showWhaleAlert(newTx);
        
        // Reproduzir som de alerta de baleia
        if (window.runesSoundManager) {
            window.runesSoundManager.play('whaleAlert');
        }
    }

    /**
     * Mostra um alerta de nova transação de baleia
     */
    showWhaleAlert(transaction) {
        const container = document.createElement('div');
        container.className = 'whale-alert';
        
        // Determinar classe baseada no tipo
        const typeClass = transaction.type === 'buy' ? 'positive' : 
                         transaction.type === 'sell' ? 'negative' : 'neutral';
        
        // Formatar valor
        const formattedValue = new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(transaction.value);
        
        // Criar conteúdo
        container.innerHTML = `
            <div class="alert-icon">🐋</div>
            <div class="alert-content">
                <div class="alert-title">Movimento de Baleia Detectado!</div>
                <div class="alert-details">
                    <span class="rune-tag">${transaction.rune}</span>
                    <span class="transaction-type ${typeClass}">${this.getTransactionTypeText(transaction.type)}</span>
                    <span class="transaction-value">${formattedValue}</span>
                </div>
            </div>
            <button class="alert-close">×</button>
        `;
        
        // Adicionar à página
        document.body.appendChild(container);
        
        // Adicionar evento para fechar
        const closeButton = container.querySelector('.alert-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                container.classList.add('closing');
                setTimeout(() => {
                    document.body.removeChild(container);
                }, 300);
            });
        }
        
        // Auto-fechar após 10 segundos
        setTimeout(() => {
            // Verificar se o elemento ainda existe
            if (document.body.contains(container)) {
                container.classList.add('closing');
                setTimeout(() => {
                    if (document.body.contains(container)) {
                        document.body.removeChild(container);
                    }
                }, 300);
            }
        }, 10000);
        
        // Mostrar com animação
        setTimeout(() => {
            container.classList.add('visible');
        }, 10);
    }
}

// Exportar a classe para uso global
window.RunesWhaleTracker = RunesWhaleTracker; 