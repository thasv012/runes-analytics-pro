// RunesPriceChart.js - Componente para exibição de gráficos de preço dos tokens Runes
// Utiliza Chart.js para renderizar gráficos interativos de preço ao longo do tempo

class RunesPriceChart {
    constructor(options = {}) {
        // Opções do componente
        this.options = {
            container: options.container || 'price-chart-widget',
            darkMode: options.darkMode || false,
            timeframe: options.timeframe || '24h',
            chartType: options.chartType || 'line',
            showVolume: options.showVolume !== false,
            showTooltips: options.showTooltips !== false,
            showLegend: options.showLegend !== false,
            colors: options.colors || {
                line: '#4CAF50',
                gradient: ['rgba(76, 175, 80, 0.5)', 'rgba(76, 175, 80, 0.0)'],
                volume: 'rgba(76, 175, 80, 0.2)',
                grid: '#666666',
                text: '#FFFFFF'
            }
        };
        
        // Dados do token atual
        this.tokenData = null;
        
        // Referência ao container
        this.container = null;
        
        // Referência ao gráfico
        this.chart = null;
        
        // Referência ao canvas
        this.canvas = null;
        
        console.log('RunesPriceChart inicializado com opções:', this.options);
    }
    
    // Inicializar o componente
    async init() {
        console.log('Inicializando componente Price Chart...');
        
        // Obter o container
        this.container = document.getElementById(this.options.container);
        if (!this.container) {
            console.error(`Container '${this.options.container}' não encontrado!`);
            return false;
        }
        
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não encontrado. Tentando carregar...');
            await this.loadChartJs();
        }
        
        // Renderizar estrutura inicial
        this.renderStructure();
        
        // Configurar o gráfico
        this.setupChart();
        
        // Carregar dados mockup iniciais
        this.loadMockData();
        
        console.log('Componente Price Chart inicializado com sucesso');
        return true;
    }
    
    // Carregar Chart.js se não estiver disponível
    async loadChartJs() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }
            
            // Criar elemento de script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            
            // Evento de carregamento
            script.onload = () => {
                console.log('Chart.js carregado com sucesso');
                resolve();
            };
            
            // Evento de erro
            script.onerror = () => {
                console.error('Erro ao carregar Chart.js');
                reject(new Error('Falha ao carregar Chart.js'));
            };
            
            // Adicionar ao documento
            document.head.appendChild(script);
        });
    }
    
    // Renderizar a estrutura base do componente
    renderStructure() {
        // Adicionar classes ao container
        this.container.classList.add('price-chart-widget');
        if (this.options.darkMode) {
            this.container.classList.add('dark-mode');
        }
        
        // Estrutura HTML
        this.container.innerHTML = `
            <div class="widget-header">
                <div class="chart-title">
                    <h3>Gráfico de Preço</h3>
                    <div class="token-info">
                        <span class="selected-token" id="chart-token-name">Selecione um token</span>
                        <span class="token-price" id="chart-token-price">$0.00</span>
                        <span class="token-change" id="chart-token-change">0.00%</span>
                    </div>
                </div>
                <div class="chart-controls">
                    <div class="chart-type-selector">
                        <button class="chart-type-btn active" data-type="line">Linha</button>
                        <button class="chart-type-btn" data-type="candlestick">Candles</button>
                    </div>
                    <div class="chart-timeframe-selector">
                        <button class="timeframe-btn" data-timeframe="1h">1H</button>
                        <button class="timeframe-btn active" data-timeframe="24h">24H</button>
                        <button class="timeframe-btn" data-timeframe="7d">7D</button>
                        <button class="timeframe-btn" data-timeframe="30d">30D</button>
                        <button class="timeframe-btn" data-timeframe="all">MAX</button>
                    </div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="price-chart-canvas"></canvas>
                <div class="chart-loading" id="chart-loading">
                    <div class="loading-spinner"></div>
                    <div>Carregando dados...</div>
                </div>
                <div class="chart-no-data" id="chart-no-data">
                    <div>Selecione um token para visualizar o gráfico</div>
                </div>
            </div>
            <div class="chart-info">
                <div class="chart-stat">
                    <span class="stat-label">Preço Máx.</span>
                    <span class="stat-value" id="chart-high">$0.00</span>
                </div>
                <div class="chart-stat">
                    <span class="stat-label">Preço Mín.</span>
                    <span class="stat-value" id="chart-low">$0.00</span>
                </div>
                <div class="chart-stat">
                    <span class="stat-label">Volume</span>
                    <span class="stat-value" id="chart-volume">$0</span>
                </div>
                <div class="chart-stat">
                    <span class="stat-label">Variação</span>
                    <span class="stat-value" id="chart-range">0.00%</span>
                </div>
            </div>
        `;
        
        // Armazenar referência ao canvas
        this.canvas = this.container.querySelector('#price-chart-canvas');
        
        // Configurar event listeners
        this.setupEventListeners();
        
        console.log('Estrutura Price Chart renderizada');
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Event listeners para controles de tipo de gráfico
        const chartTypeButtons = this.container.querySelectorAll('.chart-type-btn');
        chartTypeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remover classe ativa de todos os botões
                chartTypeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                e.target.classList.add('active');
                
                // Atualizar tipo de gráfico
                const chartType = e.target.getAttribute('data-type');
                this.changeChartType(chartType);
            });
        });
        
        // Event listeners para controles de timeframe
        const timeframeButtons = this.container.querySelectorAll('.timeframe-btn');
        timeframeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remover classe ativa de todos os botões
                timeframeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                e.target.classList.add('active');
                
                // Atualizar timeframe
                const timeframe = e.target.getAttribute('data-timeframe');
                this.changeTimeframe(timeframe);
            });
        });
    }
    
    // Configurar o gráfico
    setupChart() {
        const ctx = this.canvas.getContext('2d');
        
        // Verificar se o Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está disponível');
            return;
        }
        
        // Destruir gráfico existente se houver
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Configuração base do gráfico
        this.chart = new Chart(ctx, {
            type: this.options.chartType,
            data: {
                labels: [],
                datasets: [{
                    label: 'Preço',
                    data: [],
                    borderColor: this.options.colors.line,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        
                        if (!chartArea) {
                            return null;
                        }
                        
                        // Criar gradiente
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, this.options.colors.gradient[1]);
                        gradient.addColorStop(1, this.options.colors.gradient[0]);
                        
                        return gradient;
                    },
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: this.options.colors.line,
                    pointHoverBorderColor: '#FFFFFF',
                    pointHoverBorderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: this.options.showLegend,
                        position: 'top',
                        labels: {
                            color: this.options.colors.text,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: this.options.showTooltips,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                return `Preço: $${value.toFixed(value < 1 ? 6 : 2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: true,
                            color: this.options.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            maxRotation: 0,
                            color: this.options.colors.text,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: true,
                            color: this.options.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: this.options.colors.text,
                            font: {
                                size: 10
                            },
                            callback: (value) => {
                                return value < 1 ? `$${value.toFixed(6)}` : `$${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
        
        console.log('Gráfico de preço configurado com sucesso');
    }
    
    // Carregar dados mockup iniciais
    loadMockData() {
        console.log('Carregando dados mockup para o gráfico de preços...');
        
        // Atualizar estado para carregando
        this.showLoading(true);
        this.showNoData(false);
        
        // Simular carregamento assíncrono
        setTimeout(() => {
            // Simular um token selecionado
            const mockToken = {
                ticker: 'ORDI',
                name: 'Ordinals',
                price: 54.32,
                priceChange24h: 2.5,
                priceData: this.generateMockPriceData(54.32, this.options.timeframe)
            };
            
            // Atualizar dados do token
            this.updateData(mockToken, this.options.timeframe);
            
            // Ocultar indicador de carregamento
            this.showLoading(false);
            
            console.log('Dados mockup de preço carregados com sucesso');
        }, 1000);
    }
    
    // Atualizar os dados exibidos
    updateData(tokenData, timeframe) {
        console.log(`Atualizando dados do gráfico para ${tokenData?.ticker || 'desconhecido'} (${timeframe})`);
        
        if (!tokenData) {
            this.showNoData(true);
            this.showLoading(false);
            return;
        }
        
        // Armazenar dados do token
        this.tokenData = tokenData;
        this.options.timeframe = timeframe || this.options.timeframe;
        
        // Atualizar informações do token
        this.updateTokenInfo(tokenData);
        
        // Verificar se existem dados de preço
        const priceData = tokenData.priceData?.[this.options.timeframe];
        if (!priceData || priceData.length === 0) {
            console.warn(`Sem dados de preço para ${tokenData.ticker} no timeframe ${this.options.timeframe}`);
            this.showNoData(true);
            return;
        }
        
        // Ocultar mensagem de "sem dados"
        this.showNoData(false);
        
        // Atualizar gráfico com novos dados
        this.updateChartData(priceData);
        
        // Atualizar estatísticas do gráfico
        this.updateChartStats(priceData);
        
        console.log('Dados do gráfico de preço atualizados com sucesso');
    }
    
    // Atualizar informações do token
    updateTokenInfo(tokenData) {
        const tokenName = this.container.querySelector('#chart-token-name');
        const tokenPrice = this.container.querySelector('#chart-token-price');
        const tokenChange = this.container.querySelector('#chart-token-change');
        
        if (tokenName) {
            tokenName.textContent = `${tokenData.ticker} - ${tokenData.name}`;
        }
        
        if (tokenPrice) {
            tokenPrice.textContent = this.formatCurrency(tokenData.price);
        }
        
        if (tokenChange) {
            const changeText = tokenData.priceChange24h > 0 
                ? `+${tokenData.priceChange24h.toFixed(2)}%` 
                : `${tokenData.priceChange24h.toFixed(2)}%`;
            
            tokenChange.textContent = changeText;
            
            // Adicionar classe para estilização
            tokenChange.classList.remove('positive', 'negative', 'neutral');
            if (tokenData.priceChange24h > 0) {
                tokenChange.classList.add('positive');
            } else if (tokenData.priceChange24h < 0) {
                tokenChange.classList.add('negative');
            } else {
                tokenChange.classList.add('neutral');
            }
        }
    }
    
    // Atualizar dados do gráfico
    updateChartData(priceData) {
        if (!this.chart) {
            console.warn('Chart não inicializado');
            return;
        }
        
        // Extrair dados para o gráfico
        const labels = priceData.map(item => {
            const date = new Date(item.timestamp);
            
            // Formatar data com base no timeframe
            if (this.options.timeframe === '1h') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (this.options.timeframe === '24h') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (this.options.timeframe === '7d') {
                return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        });
        
        const prices = priceData.map(item => item.price);
        
        // Atualizar dados do gráfico
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = prices;
        
        // Atualizar título do gráfico
        this.chart.data.datasets[0].label = `${this.tokenData.ticker} - Preço`;
        
        // Adicionar ou atualizar dataset de volume se habilitado
        if (this.options.showVolume && priceData[0].volume !== undefined) {
            // Verificar se o dataset já existe
            if (this.chart.data.datasets.length < 2) {
                // Adicionar dataset de volume
                this.chart.data.datasets.push({
                    label: 'Volume',
                    data: priceData.map(item => item.volume),
                    type: 'bar',
                    backgroundColor: this.options.colors.volume,
                    borderColor: 'transparent',
                    yAxisID: 'y-volume',
                    order: 1
                });
                
                // Adicionar escala para volume
                this.chart.options.scales['y-volume'] = {
                    position: 'right',
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: this.options.colors.text,
                        display: false
                    }
                };
            } else {
                // Atualizar dataset existente
                this.chart.data.datasets[1].data = priceData.map(item => item.volume);
            }
        }
        
        // Atualizar o gráfico
        this.chart.update();
    }
    
    // Atualizar estatísticas do gráfico
    updateChartStats(priceData) {
        const highEl = this.container.querySelector('#chart-high');
        const lowEl = this.container.querySelector('#chart-low');
        const volumeEl = this.container.querySelector('#chart-volume');
        const rangeEl = this.container.querySelector('#chart-range');
        
        if (!priceData || priceData.length === 0) return;
        
        // Calcular estatísticas
        const prices = priceData.map(item => item.price);
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const volumeTotal = priceData.reduce((sum, item) => sum + (item.volume || 0), 0);
        const priceRange = ((high - low) / low) * 100;
        
        // Atualizar elementos na UI
        if (highEl) {
            highEl.textContent = this.formatCurrency(high);
        }
        
        if (lowEl) {
            lowEl.textContent = this.formatCurrency(low);
        }
        
        if (volumeEl) {
            volumeEl.textContent = this.formatCurrency(volumeTotal);
        }
        
        if (rangeEl) {
            rangeEl.textContent = `${priceRange.toFixed(2)}%`;
        }
    }
    
    // Alternar visibilidade do indicador de carregamento
    showLoading(show) {
        const loadingEl = this.container.querySelector('#chart-loading');
        if (loadingEl) {
            loadingEl.style.display = show ? 'flex' : 'none';
        }
    }
    
    // Alternar visibilidade da mensagem de "sem dados"
    showNoData(show) {
        const noDataEl = this.container.querySelector('#chart-no-data');
        if (noDataEl) {
            noDataEl.style.display = show ? 'flex' : 'none';
        }
    }
    
    // Mudar o tipo de gráfico
    changeChartType(type) {
        console.log(`Mudando tipo de gráfico para: ${type}`);
        
        // Salvar o tipo de gráfico
        this.options.chartType = type;
        
        // Atualizar tipo do dataset principal
        if (this.chart) {
            if (type === 'line') {
                this.chart.data.datasets[0].type = 'line';
                this.chart.data.datasets[0].fill = true;
                this.chart.data.datasets[0].tension = 0.4;
            } else if (type === 'candlestick') {
                // Candlestick requer dados OHLC
                if (this.tokenData && this.tokenData.priceData) {
                    // Converter dados para formato OHLC se necessário
                    this.updateCandlestickData();
                } else {
                    console.warn('Sem dados para exibir gráfico de candlestick');
                }
            }
            
            this.chart.update();
        }
    }
    
    // Atualizar dados para gráfico de candlestick
    updateCandlestickData() {
        // Implementação simplificada para suporte a candlestick
        // Em um cenário real, precisaríamos de dados OHLC reais
        console.warn('Gráfico de candlestick não implementado completamente');
        
        // Aqui convertemos dados de linha para candlestick simulados
        // Em uma implementação real, usaríamos dados OHLC reais da API
    }
    
    // Mudar o timeframe
    changeTimeframe(timeframe) {
        console.log(`Mudando timeframe para: ${timeframe}`);
        
        // Salvar o timeframe
        this.options.timeframe = timeframe;
        
        // Se tiver um token selecionado, recarregar dados
        if (this.tokenData) {
            // Verificar se já temos dados para esse timeframe
            const priceData = this.tokenData.priceData?.[timeframe];
            if (priceData) {
                this.updateChartData(priceData);
                this.updateChartStats(priceData);
            } else {
                // Precisamos buscar novos dados
                this.showLoading(true);
                
                // Em uma implementação real, buscaríamos dados da API
                // Para o mockup, vamos gerar dados simulados
                setTimeout(() => {
                    const newPriceData = this.generateMockPriceData(this.tokenData.price, timeframe);
                    
                    // Atualizar dados do token
                    if (!this.tokenData.priceData) {
                        this.tokenData.priceData = {};
                    }
                    this.tokenData.priceData[timeframe] = newPriceData;
                    
                    // Atualizar gráfico
                    this.updateChartData(newPriceData);
                    this.updateChartStats(newPriceData);
                    
                    this.showLoading(false);
                }, 500);
            }
        }
    }
    
    // Gerar dados mockup de preço
    generateMockPriceData(basePrice, timeframe) {
        const now = new Date();
        let dataPoints = 0;
        let startTime = new Date();
        let volatility = 0;
        
        // Definir parâmetros com base no timeframe
        switch(timeframe) {
            case '1h':
                dataPoints = 60;
                startTime = new Date(now - 60 * 60 * 1000);
                volatility = 0.5;
                break;
            case '24h':
                dataPoints = 24;
                startTime = new Date(now - 24 * 60 * 60 * 1000);
                volatility = 1.5;
                break;
            case '7d':
                dataPoints = 7;
                startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
                volatility = 3;
                break;
            case '30d':
                dataPoints = 30;
                startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
                volatility = 5;
                break;
            case 'all':
                dataPoints = 90;
                startTime = new Date(now - 90 * 24 * 60 * 60 * 1000);
                volatility = 8;
                break;
            default:
                dataPoints = 24;
                startTime = new Date(now - 24 * 60 * 60 * 1000);
                volatility = 1.5;
        }
        
        // Gerar dados simulados
        const priceData = [];
        let currentPrice = basePrice;
        
        for (let i = 0; i < dataPoints; i++) {
            // Calcular timestamp para o ponto
            const timestamp = new Date(startTime.getTime() + (i * (now - startTime) / dataPoints));
            
            // Gerar variação de preço aleatória
            const change = (Math.random() - 0.5) * 2 * (volatility / 100) * basePrice;
            currentPrice += change;
            
            // Garantir que o preço não fique negativo
            if (currentPrice <= 0) {
                currentPrice = 0.00001;
            }
            
            // Gerar volume simulado
            const volume = Math.random() * basePrice * 100000;
            
            // Adicionar ao array de dados
            priceData.push({
                timestamp: timestamp.toISOString(),
                price: currentPrice,
                volume: volume
            });
        }
        
        return priceData;
    }
    
    // Formatar valor monetário
    formatCurrency(value) {
        if (value === undefined || value === null) return '$0';
        
        const num = Number(value);
        if (isNaN(num)) return '$0';
        
        if (num < 0.000001) {
            return `$${num.toExponential(2)}`;
        } else if (num < 0.01) {
            return `$${num.toFixed(6)}`;
        } else if (num < 1) {
            return `$${num.toFixed(4)}`;
        } else if (num >= 1000000000) {
            return `$${(num / 1000000000).toFixed(2)}B`;
        } else if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`;
        } else {
            return `$${num.toFixed(2)}`;
        }
    }
    
    // Destruir o componente e liberar recursos
    destroy() {
        console.log('Destruindo componente Price Chart...');
        
        // Destruir gráfico se existir
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Limpar container
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('price-chart-widget', 'dark-mode');
        }
        
        console.log('Componente Price Chart destruído com sucesso');
    }
}

// Exportar a classe para uso global
window.RunesPriceChart = RunesPriceChart; 