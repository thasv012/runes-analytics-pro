class RunesWhaleTracker {
    constructor() {
        this.whaleData = [];
        this.timeframe = '24h';
        this.selectedToken = 'RUNES';
        this.minAmount = 100000; // Em USD
        this.transactionTypes = ['all', 'buy', 'sell', 'transfer'];
        this.selectedType = 'all';
        this.isLoading = false;
        this.refreshInterval = null;
        this.lastUpdateTime = null;
    }

    init() {
        this.ensureContainersExist();
        this.renderStructure();
        this.loadData();
        this.addEventListeners();
        this.startRealTimeUpdates();
        
        // Atualizar última vez a cada minuto
        setInterval(() => {
            this.updateLastUpdateTime();
        }, 60000);
    }

    ensureContainersExist() {
        const whaleTrackerSection = document.getElementById('whale-tracker-section');
        
        if (!whaleTrackerSection) {
            const mainContent = document.querySelector('.main-content');
            
            if (mainContent) {
                const newSection = document.createElement('section');
                newSection.id = 'whale-tracker-section';
                newSection.className = 'content-section hidden';
                mainContent.appendChild(newSection);
            }
        }
    }

    renderStructure() {
        const whaleTrackerSection = document.getElementById('whale-tracker-section');
        
        if (whaleTrackerSection) {
            whaleTrackerSection.innerHTML = `
                <h2 class="section-title">Rastreador de Baleias <span class="badge premium-badge">PRO</span></h2>
                <div class="whale-dashboard">
                    <div class="whale-controls">
                        <div class="filters-row">
                            <div class="selector-container">
                                <label for="whale-token-select">Token:</label>
                                <select id="whale-token-select" class="styled-select">
                                    <option value="RUNES">RUNES</option>
                                    <option value="BTC">Bitcoin</option>
                                    <option value="ETH">Ethereum</option>
                                    <option value="SOL">Solana</option>
                                </select>
                            </div>
                            <div class="selector-container">
                                <label for="whale-timeframe-select">Período:</label>
                                <div class="timeframe-selector">
                                    <button data-timeframe="1h" class="timeframe-btn">1H</button>
                                    <button data-timeframe="24h" class="timeframe-btn active">24H</button>
                                    <button data-timeframe="7d" class="timeframe-btn">7D</button>
                                    <button data-timeframe="30d" class="timeframe-btn">30D</button>
                                </div>
                            </div>
                            <div class="selector-container">
                                <label for="whale-type-select">Tipo:</label>
                                <select id="whale-type-select" class="styled-select">
                                    <option value="all">Todos</option>
                                    <option value="buy">Compras</option>
                                    <option value="sell">Vendas</option>
                                    <option value="transfer">Transferências</option>
                                </select>
                            </div>
                            <div class="selector-container">
                                <label for="whale-min-amount">Valor Mín. (USD):</label>
                                <input type="number" id="whale-min-amount" class="styled-input" value="100000" min="10000" step="10000">
                            </div>
                        </div>
                        <div class="realtime-controls">
                            <div class="last-update">
                                <span class="update-label">Última atualização:</span>
                                <span id="last-update-time">Agora</span>
                            </div>
                            <div class="auto-refresh">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="auto-refresh-toggle" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Atualização em tempo real</span>
                            </div>
                            <button id="refresh-whale-data" class="action-button">
                                <i class="fas fa-sync-alt"></i> Atualizar
                            </button>
                        </div>
                    </div>
                    
                    <div class="whale-metrics-overview">
                        <div class="metric-card">
                            <div class="metric-value" id="total-volume">$0</div>
                            <div class="metric-label">Volume Total</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="largest-transaction">$0</div>
                            <div class="metric-label">Maior Transação</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="whale-count">0</div>
                            <div class="metric-label">Baleias Ativas</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="buy-sell-ratio">0:0</div>
                            <div class="metric-label">Proporção Compra:Venda</div>
                        </div>
                    </div>
                    
                    <div class="whale-visualizations">
                        <div class="heatmap-container">
                            <h3 class="viz-title">Mapa de Calor de Transações</h3>
                            <div class="heatmap-legend">
                                <span class="legend-label">Menor</span>
                                <div class="legend-gradient"></div>
                                <span class="legend-label">Maior</span>
                            </div>
                            <div class="heatmap" id="transaction-heatmap"></div>
                        </div>
                        
                        <div class="timeline-container">
                            <h3 class="viz-title">Linha do Tempo de Atividades</h3>
                            <div class="timeline" id="whale-activity-timeline"></div>
                        </div>
                    </div>
                    
                    <div class="transactions-table-container">
                        <h3 class="table-title">Transações de Baleias Recentes</h3>
                        <div class="table-toolbar">
                            <div class="search-box">
                                <input type="text" placeholder="Buscar por endereço..." id="whale-search">
                                <i class="fas fa-search"></i>
                            </div>
                            <div class="table-actions">
                                <button id="export-whale-data" class="action-button">
                                    <i class="fas fa-download"></i> Exportar
                                </button>
                                <button id="add-whale-alert" class="action-button">
                                    <i class="fas fa-bell"></i> Configurar Alerta
                                </button>
                            </div>
                        </div>
                        <div class="transactions-table-wrapper">
                            <table class="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Horário</th>
                                        <th>Tipo</th>
                                        <th>Valor (USD)</th>
                                        <th>Tokens</th>
                                        <th>De</th>
                                        <th>Para</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="whale-transactions-body">
                                    <tr class="loading-row">
                                        <td colspan="7">
                                            <div class="loading-indicator">Carregando dados de baleias...</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="pagination">
                            <button id="prev-page" disabled><i class="fas fa-chevron-left"></i></button>
                            <span id="page-info">Página 1 de 1</span>
                            <button id="next-page" disabled><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    loadData() {
        this.isLoading = true;
        this.updateLoadingState();
        
        // Simular carregamento de dados da API
        setTimeout(() => {
            this.whaleData = this.getMockWhaleData();
            this.isLoading = false;
            this.updateUI();
            this.lastUpdateTime = new Date();
            this.updateLastUpdateTime();
        }, 1500);
    }

    getMockWhaleData() {
        // Dados mockados para simular transações de baleias
        const tokens = {
            'RUNES': { symbol: 'RUNES', price: 0.75, decimals: 9 },
            'BTC': { symbol: 'BTC', price: 63500, decimals: 8 },
            'ETH': { symbol: 'ETH', price: 3240, decimals: 18 },
            'SOL': { symbol: 'SOL', price: 143, decimals: 9 }
        };
        
        const now = new Date();
        const transactions = [];
        
        // Número de transações baseado no timeframe selecionado
        const transactionsCount = {
            '1h': 8,
            '24h': 25,
            '7d': 80,
            '30d': 150
        }[this.timeframe];
        
        for (let i = 0; i < transactionsCount; i++) {
            const token = this.selectedToken;
            const tokenInfo = tokens[token];
            
            // Determinar tipo de transação - pender para o tipo selecionado
            let type;
            if (this.selectedType !== 'all') {
                // 80% de chance de ser do tipo selecionado
                type = Math.random() < 0.8 ? this.selectedType : this.transactionTypes[Math.floor(Math.random() * this.transactionTypes.length)];
            } else {
                type = this.transactionTypes[Math.floor(Math.random() * this.transactionTypes.length)];
                if (type === 'all') type = this.transactionTypes[1 + Math.floor(Math.random() * (this.transactionTypes.length - 1))];
            }
            
            // Valor em USD deve ser acima do mínimo selecionado
            const valueUSD = this.minAmount * (1 + Math.random() * 10);
            const tokenAmount = valueUSD / tokenInfo.price;
            
            // Tempo baseado no timeframe
            let timeOffset;
            switch (this.timeframe) {
                case '1h': timeOffset = Math.random() * 60 * 60 * 1000; break;
                case '24h': timeOffset = Math.random() * 24 * 60 * 60 * 1000; break;
                case '7d': timeOffset = Math.random() * 7 * 24 * 60 * 60 * 1000; break;
                case '30d': timeOffset = Math.random() * 30 * 24 * 60 * 60 * 1000; break;
                default: timeOffset = Math.random() * 24 * 60 * 60 * 1000;
            }
            
            const timestamp = new Date(now.getTime() - timeOffset);
            
            // Gerar endereços aleatórios no formato apropriado para o token
            let fromAddress, toAddress;
            if (token === 'RUNES') {
                fromAddress = `bc1p${this.generateRandomHex(32)}`;
                toAddress = `bc1p${this.generateRandomHex(32)}`;
            } else if (token === 'BTC') {
                fromAddress = `bc1${this.generateRandomHex(20)}`;
                toAddress = `bc1${this.generateRandomHex(20)}`;
            } else if (token === 'ETH') {
                fromAddress = `0x${this.generateRandomHex(40)}`;
                toAddress = `0x${this.generateRandomHex(40)}`;
            } else {
                fromAddress = `${this.generateRandomHex(32)}`;
                toAddress = `${this.generateRandomHex(32)}`;
            }
            
            // Tags especiais para endereços conhecidos (exchanges, fundos, etc.)
            const exchangeTags = ['Binance', 'Coinbase', 'Kraken', 'FTX', 'Huobi', 'Whale Fund', 'Cold Wallet'];
            if (Math.random() < 0.3) {
                fromAddress = {
                    address: fromAddress,
                    tag: exchangeTags[Math.floor(Math.random() * exchangeTags.length)]
                };
            }
            
            if (Math.random() < 0.3) {
                toAddress = {
                    address: toAddress,
                    tag: exchangeTags[Math.floor(Math.random() * exchangeTags.length)]
                };
            }
            
            // Adicionar a transação
            transactions.push({
                id: `tx-${this.generateRandomHex(8)}`,
                timestamp,
                type,
                valueUSD,
                token,
                tokenAmount,
                from: fromAddress,
                to: toAddress,
                txHash: `${this.generateRandomHex(64)}`,
                blockNumber: Math.floor(800000 + Math.random() * 100000)
            });
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    generateRandomHex(length) {
        const characters = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    updateUI() {
        this.updateLoadingState();
        this.updateTransactionsTable();
        this.updateMetrics();
        this.updateHeatmap();
        this.updateTimeline();
    }

    updateLoadingState() {
        const loadingRow = document.querySelector('.loading-row');
        if (loadingRow) {
            loadingRow.style.display = this.isLoading ? 'table-row' : 'none';
        }
        
        const tableBody = document.getElementById('whale-transactions-body');
        if (tableBody && !this.isLoading) {
            // Remover a linha de carregamento quando não estiver carregando
            const loadingRow = tableBody.querySelector('.loading-row');
            if (loadingRow) {
                tableBody.removeChild(loadingRow);
            }
        }
    }

    updateTransactionsTable() {
        if (this.isLoading) return;
        
        const tableBody = document.getElementById('whale-transactions-body');
        
        if (tableBody) {
            // Limpar tabela existente
            tableBody.innerHTML = '';
            
            // Se não houver dados, mostrar mensagem
            if (this.whaleData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-data">
                            Não foram encontradas transações de baleias com os critérios selecionados.
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Adicionar dados
            this.whaleData.forEach(transaction => {
                const row = document.createElement('tr');
                row.className = `transaction-row ${transaction.type}-type`;
                
                // Ícone baseado no tipo de transação
                let typeIcon, typeLabel;
                switch (transaction.type) {
                    case 'buy':
                        typeIcon = 'fa-arrow-up';
                        typeLabel = 'Compra';
                        break;
                    case 'sell':
                        typeIcon = 'fa-arrow-down';
                        typeLabel = 'Venda';
                        break;
                    case 'transfer':
                        typeIcon = 'fa-exchange-alt';
                        typeLabel = 'Transferência';
                        break;
                    default:
                        typeIcon = 'fa-circle';
                        typeLabel = 'Desconhecido';
                }
                
                // Formatar endereços
                const formatAddress = (addr) => {
                    if (typeof addr === 'object') {
                        return `<span class="address-with-tag">
                            <span class="address" title="${addr.address}">${addr.address.substr(0, 6)}...${addr.address.substr(-4)}</span>
                            <span class="address-tag">${addr.tag}</span>
                        </span>`;
                    } else {
                        return `<span class="address" title="${addr}">${addr.substr(0, 6)}...${addr.substr(-4)}</span>`;
                    }
                };
                
                // Formatar o timestamp para horário local
                const formatTime = (timestamp) => {
                    const date = new Date(timestamp);
                    return date.toLocaleString();
                };
                
                // Formatar o valor
                const formatValue = (value) => {
                    return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                };
                
                // Formatar a quantidade de tokens
                const formatTokenAmount = (amount, token) => {
                    let displayAmount;
                    if (amount > 1000000) {
                        displayAmount = (amount / 1000000).toFixed(2) + 'M';
                    } else if (amount > 1000) {
                        displayAmount = (amount / 1000).toFixed(2) + 'K';
                    } else {
                        displayAmount = amount.toFixed(2);
                    }
                    return `${displayAmount} ${token}`;
                };
                
                row.innerHTML = `
                    <td>${formatTime(transaction.timestamp)}</td>
                    <td class="transaction-type">
                        <span class="type-icon"><i class="fas ${typeIcon}"></i></span>
                        ${typeLabel}
                    </td>
                    <td class="transaction-value">${formatValue(transaction.valueUSD)}</td>
                    <td>${formatTokenAmount(transaction.tokenAmount, transaction.token)}</td>
                    <td>${formatAddress(transaction.from)}</td>
                    <td>${formatAddress(transaction.to)}</td>
                    <td class="transaction-actions">
                        <button class="icon-button" title="Adicionar aos favoritos">
                            <i class="far fa-star"></i>
                        </button>
                        <button class="icon-button" title="Criar alerta para este endereço">
                            <i class="far fa-bell"></i>
                        </button>
                        <button class="icon-button" title="Ver no explorador">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
    }

    updateMetrics() {
        if (this.isLoading || !this.whaleData.length) return;
        
        // Calcular métricas
        const totalVolume = this.whaleData.reduce((sum, tx) => sum + tx.valueUSD, 0);
        const largestTransaction = Math.max(...this.whaleData.map(tx => tx.valueUSD));
        
        // Contar endereços únicos de baleias
        const uniqueAddresses = new Set();
        this.whaleData.forEach(tx => {
            const fromAddr = typeof tx.from === 'object' ? tx.from.address : tx.from;
            const toAddr = typeof tx.to === 'object' ? tx.to.address : tx.to;
            uniqueAddresses.add(fromAddr);
            uniqueAddresses.add(toAddr);
        });
        
        // Contar compras e vendas
        const buys = this.whaleData.filter(tx => tx.type === 'buy').length;
        const sells = this.whaleData.filter(tx => tx.type === 'sell').length;
        
        // Atualizar elementos da UI
        document.getElementById('total-volume').textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(totalVolume);
        
        document.getElementById('largest-transaction').textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(largestTransaction);
        
        document.getElementById('whale-count').textContent = uniqueAddresses.size;
        document.getElementById('buy-sell-ratio').textContent = `${buys}:${sells}`;
    }

    updateHeatmap() {
        if (this.isLoading || !this.whaleData.length) return;
        
        const heatmapContainer = document.getElementById('transaction-heatmap');
        if (!heatmapContainer) return;
        
        // Limpar heatmap existente
        heatmapContainer.innerHTML = '';
        
        // Criar dados para o heatmap
        // Agrupar por hora do dia (0-23) e valor
        const hoursInDay = 24;
        const heatmapData = Array(hoursInDay).fill().map(() => 0);
        
        this.whaleData.forEach(tx => {
            const hour = new Date(tx.timestamp).getHours();
            heatmapData[hour] += tx.valueUSD;
        });
        
        // Encontrar o valor máximo para normalização
        const maxValue = Math.max(...heatmapData);
        
        // Renderizar células do heatmap
        for (let hour = 0; hour < hoursInDay; hour++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            const normalizedValue = heatmapData[hour] / maxValue;
            const intensity = Math.round(normalizedValue * 100);
            
            cell.style.backgroundColor = `hsla(215, 100%, 50%, ${normalizedValue.toFixed(2)})`;
            
            // Adicionar tooltip
            cell.title = `${hour}:00 - ${hour + 1}:00: ${new Intl.NumberFormat('pt-BR', {
                style: 'currency', 
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(heatmapData[hour])}`;
            
            heatmapContainer.appendChild(cell);
        }
    }

    updateTimeline() {
        if (this.isLoading || !this.whaleData.length) return;
        
        const timelineContainer = document.getElementById('whale-activity-timeline');
        if (!timelineContainer) return;
        
        // Limpar timeline existente
        timelineContainer.innerHTML = '';
        
        // Ordenar transações por timestamp (mais antiga primeiro)
        const sortedData = [...this.whaleData].sort((a, b) => a.timestamp - b.timestamp);
        
        // Pegar períodos de tempo baseado no timeframe selecionado
        let timeSegments, timeFormat;
        const firstTimestamp = sortedData[0].timestamp;
        const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
        const timeRange = lastTimestamp - firstTimestamp;
        
        switch(this.timeframe) {
            case '1h':
                timeSegments = 12; // 5 minutos cada
                timeFormat = (date) => `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                break;
            case '24h':
                timeSegments = 24; // 1 hora cada
                timeFormat = (date) => `${date.getHours()}:00`;
                break;
            case '7d':
                timeSegments = 7; // 1 dia cada
                timeFormat = (date) => date.toLocaleDateString('pt-BR', {weekday: 'short'});
                break;
            case '30d':
                timeSegments = 30; // 1 dia cada
                timeFormat = (date) => date.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'});
                break;
            default:
                timeSegments = 24;
                timeFormat = (date) => `${date.getHours()}:00`;
        }
        
        // Criar linhas do tempo
        const timeline = document.createElement('div');
        timeline.className = 'timeline-chart';
        
        // Agrupar transações por segmento de tempo
        const segmentData = Array(timeSegments).fill().map(() => ({
            buy: 0,
            sell: 0,
            transfer: 0,
            total: 0,
            timestamp: 0
        }));
        
        sortedData.forEach(tx => {
            const timeDiff = tx.timestamp - firstTimestamp;
            const segmentIndex = Math.min(Math.floor((timeDiff / timeRange) * timeSegments), timeSegments - 1);
            
            segmentData[segmentIndex][tx.type] += tx.valueUSD;
            segmentData[segmentIndex].total += tx.valueUSD;
            
            // Salvar o timestamp médio para o segmento
            if (segmentData[segmentIndex].timestamp === 0) {
                segmentData[segmentIndex].timestamp = tx.timestamp;
            } else {
                segmentData[segmentIndex].timestamp = (segmentData[segmentIndex].timestamp + tx.timestamp) / 2;
            }
        });
        
        // Encontrar o valor máximo para normalização
        const maxSegmentValue = Math.max(...segmentData.map(s => s.total));
        
        // Criar marcadores de tempo
        const timeMarkers = document.createElement('div');
        timeMarkers.className = 'time-markers';
        
        segmentData.forEach((segment, i) => {
            if (segment.timestamp === 0) {
                // Calcular o timestamp baseado na posição relativa
                const segmentTime = new Date(firstTimestamp + (timeRange * (i / timeSegments)));
                segment.timestamp = segmentTime.getTime();
            }
            
            // Só mostra alguns marcadores para não sobrecarregar
            if (i % Math.max(1, Math.floor(timeSegments / 6)) === 0 || i === timeSegments - 1) {
                const marker = document.createElement('div');
                marker.className = 'time-marker';
                marker.style.left = `${(i / (timeSegments - 1)) * 100}%`;
                marker.textContent = timeFormat(new Date(segment.timestamp));
                timeMarkers.appendChild(marker);
            }
        });
        
        timeline.appendChild(timeMarkers);
        
        // Criar transações na linha do tempo
        const transactionsLine = document.createElement('div');
        transactionsLine.className = 'transactions-line';
        
        segmentData.forEach((segment, i) => {
            if (segment.total > 0) {
                const segmentHeight = (segment.total / maxSegmentValue) * 100;
                
                const segmentMarker = document.createElement('div');
                segmentMarker.className = 'timeline-marker';
                segmentMarker.style.left = `${(i / (timeSegments - 1)) * 100}%`;
                
                // Criar barras empilhadas para cada tipo
                const types = ['buy', 'sell', 'transfer'];
                let currentHeight = 0;
                
                types.forEach(type => {
                    if (segment[type] > 0) {
                        const typeHeight = (segment[type] / segment.total) * segmentHeight;
                        
                        const bar = document.createElement('div');
                        bar.className = `type-bar ${type}-bar`;
                        bar.style.height = `${typeHeight}%`;
                        bar.style.bottom = `${currentHeight}%`;
                        
                        // Tooltip
                        bar.title = `${timeFormat(new Date(segment.timestamp))}: ${new Intl.NumberFormat('pt-BR', {
                            style: 'currency', 
                            currency: 'USD',
                            maximumFractionDigits: 0
                        }).format(segment[type])}`;
                        
                        segmentMarker.appendChild(bar);
                        currentHeight += typeHeight;
                    }
                });
                
                transactionsLine.appendChild(segmentMarker);
            }
        });
        
        timeline.appendChild(transactionsLine);
        timelineContainer.appendChild(timeline);
    }
    
    updateLastUpdateTime() {
        if (!this.lastUpdateTime) return;
        
        const lastUpdateElement = document.getElementById('last-update-time');
        if (!lastUpdateElement) return;
        
        const now = new Date();
        const diff = Math.floor((now - this.lastUpdateTime) / 1000); // diferença em segundos
        
        let timeText;
        if (diff < 10) {
            timeText = 'Agora mesmo';
        } else if (diff < 60) {
            timeText = `${diff} segundos atrás`;
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            timeText = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
        } else {
            const hours = Math.floor(diff / 3600);
            timeText = `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
        }
        
        lastUpdateElement.textContent = timeText;
    }

    startRealTimeUpdates() {
        // Verificar se já existe um intervalo de atualização
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Configurar atualização automática a cada 30 segundos
        this.refreshInterval = setInterval(() => {
            const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
            if (autoRefreshToggle && autoRefreshToggle.checked) {
                this.loadData();
            }
        }, 30000);
    }

    addEventListeners() {
        // Seletor de token
        const tokenSelect = document.getElementById('whale-token-select');
        if (tokenSelect) {
            tokenSelect.addEventListener('change', () => {
                this.selectedToken = tokenSelect.value;
                this.loadData();
            });
        }
        
        // Botões de timeframe
        const timeframeButtons = document.querySelectorAll('.timeframe-btn');
        timeframeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover classe active de todos os botões
                timeframeButtons.forEach(btn => btn.classList.remove('active'));
                // Adicionar classe active ao botão clicado
                button.classList.add('active');
                // Atualizar timeframe selecionado
                this.timeframe = button.dataset.timeframe;
                this.loadData();
            });
        });
        
        // Seletor de tipo de transação
        const typeSelect = document.getElementById('whale-type-select');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.selectedType = typeSelect.value;
                this.loadData();
            });
        }
        
        // Input de valor mínimo
        const minAmountInput = document.getElementById('whale-min-amount');
        if (minAmountInput) {
            minAmountInput.addEventListener('change', () => {
                this.minAmount = parseFloat(minAmountInput.value);
                this.loadData();
            });
        }
        
        // Botão de atualização manual
        const refreshButton = document.getElementById('refresh-whale-data');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadData();
                
                // Adicionar classe para animação de rotação
                refreshButton.querySelector('i').classList.add('rotating');
                setTimeout(() => {
                    refreshButton.querySelector('i').classList.remove('rotating');
                }, 1000);
            });
        }
        
        // Toggle de atualização automática
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', () => {
                if (autoRefreshToggle.checked) {
                    this.startRealTimeUpdates();
                } else if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                    this.refreshInterval = null;
                }
            });
        }
        
        // Botão de exportar
        const exportButton = document.getElementById('export-whale-data');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Botão de configurar alerta
        const alertButton = document.getElementById('add-whale-alert');
        if (alertButton) {
            alertButton.addEventListener('click', () => {
                this.showAlertModal();
            });
        }
    }
    
    exportData() {
        if (!this.whaleData.length) return;
        
        // Converter dados para CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Data,Tipo,Valor (USD),Tokens,Quantidade,De,Para,Hash\n";
        
        this.whaleData.forEach(tx => {
            const formattedTime = new Date(tx.timestamp).toLocaleString();
            const fromAddr = typeof tx.from === 'object' ? `${tx.from.address} (${tx.from.tag})` : tx.from;
            const toAddr = typeof tx.to === 'object' ? `${tx.to.address} (${tx.to.tag})` : tx.to;
            
            csvContent += `"${formattedTime}","${tx.type}","${tx.valueUSD}","${tx.token}","${tx.tokenAmount}","${fromAddr}","${toAddr}","${tx.txHash}"\n`;
        });
        
        // Criar link para download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `whale_transactions_${this.selectedToken}_${this.timeframe}_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        
        // Simular clique no link
        link.click();
        
        // Remover o link
        document.body.removeChild(link);
    }
    
    showAlertModal() {
        // Implementar na próxima atualização
        alert("Funcionalidade de alertas estará disponível na próxima atualização!");
    }
}

// Exportar a classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RunesWhaleTracker;
} 