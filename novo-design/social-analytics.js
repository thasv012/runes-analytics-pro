/**
 * Sistema de Análise de Sentimento Social para RUNES Analytics Pro
 * Responsável por gerenciar dados de sentimento nas redes sociais, influenciadores e tendências
 */
class SocialAnalytics {
    constructor() {
        this.config = {
            // Configuração de atualização
            refreshInterval: 5 * 60 * 1000, // 5 minutos
            autoRefresh: true,
            
            // Configuração de fontes de dados
            dataSources: [
                { id: 'twitter', name: 'Twitter / X', isActive: true, weight: 0.4 },
                { id: 'discord', name: 'Discord', isActive: true, weight: 0.3 },
                { id: 'reddit', name: 'Reddit', isActive: true, weight: 0.2 },
                { id: 'telegram', name: 'Telegram', isActive: true, weight: 0.1 }
            ],
            
            // Configuração de alertas
            alertThresholds: {
                sentimentChange: 10, // Mudança de sentimento em %
                mentionsSpike: 200, // Aumento de menções em %
                priceCorrelation: 0.7 // Coeficiente de correlação mínimo para alertas
            }
        };
        
        this.data = {
            globalSentiment: {
                current: 0,
                previous: 0,
                change: 0,
                history: []
            },
            mentions: {
                total: 0,
                previous: 0,
                change: 0,
                history: [],
                byPlatform: {}
            },
            platforms: {},
            influencers: [],
            keywords: [],
            alerts: {
                positive: [],
                negative: [],
                important: []
            },
            tokens: {}
        };
        
        this.refreshTimer = null;
    }
    
    /**
     * Inicializa o sistema de análise social
     */
    initialize() {
        console.log('Inicializando sistema de análise social exclusivo para Runes...');
        
        // Gerar dados de mock para desenvolvimento
        this.generateMockData();
        
        // Configurar refresh automático
        if (this.config.autoRefresh) {
            this.refreshTimer = setInterval(() => {
                this.refreshData();
            }, this.config.refreshInterval);
        }
        
        // Renderizar os dados iniciais na interface
        this.renderData();
        
        // Adicionar identificadores aos dados
        for (const platform of this.config.dataSources) {
            this.data.platforms[platform.id] = {
                name: platform.name,
                isActive: platform.isActive,
                weight: platform.weight,
                sentiment: 0,
                mentions: 0,
                trends: []
            };
        }
        
        // Adicionar evento aos botões de timeframe
        const timeframeButtons = document.querySelectorAll('#social-section .timeframe-btn');
        timeframeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                timeframeButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.updateTimeframe(e.target.innerText.trim());
            });
        });
        
        // Adicionar evento ao botão de refresh
        const refreshButton = document.querySelector('#social-section .btn-refresh');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                refreshButton.classList.add('rotating');
                this.refreshData().then(() => {
                    setTimeout(() => {
                        refreshButton.classList.remove('rotating');
                    }, 1000);
                });
            });
        }
        
        // Escutar por eventos de gamificação
        document.addEventListener('gamification:challenge-completed', (e) => {
            if (e.detail && e.detail.category === 'social') {
                this.showNotification(`Desafio concluído: ${e.detail.title}`, 'success');
            }
        });
        
        // Configurar palavra-chave cloud
        this.setupWordCloud();
        
        // Configurar eventos de interação
        this.setupInteractions();
        
        // Configurar tooltip de explicação Runes
        this.setupRunesInfoTooltip();
    }
    
    /**
     * Gera dados de mock para desenvolvimento
     */
    generateMockData() {
        // Gerar dados de sentimento global
        this.data.globalSentiment = {
            current: 68,
            previous: 65.3,
            change: 4.2,
            history: this.generateRandomTimeSeries(68, 5, 14)
        };
        
        // Gerar dados de menções
        this.data.mentions = {
            total: 12478,
            previous: 10684,
            change: 16.8,
            history: this.generateRandomTimeSeries(12478, 1000, 14),
            byPlatform: {
                twitter: 6542,
                discord: 4218,
                reddit: 1718
            }
        };
        
        // Gerar dados de plataformas com foco em comunidades Runes
        this.data.platforms = {
            twitter: {
                name: 'Twitter / X',
                sentiment: 72,
                mentions: 6542,
                trends: ['#RunesProtocol', '#BitcoinRunes', '#RunesMinting'],
                users: '1.2M',
                change: 8.3,
                communities: [
                    'Casey Rodarmor (@rodarmor)',
                    'Ordinals Community',
                    'Bitcoin Runes',
                    'Magic Eden Runes'
                ]
            },
            discord: {
                name: 'Discord',
                sentiment: 65,
                mentions: 4218,
                trends: ['runes-protocol', 'runes-minting', 'rune-development'],
                users: '35.8K',
                change: 5.6,
                communities: [
                    'Ordinals Server',
                    'Runes Protocol',
                    'BTC Runes Trading',
                    'Magic Eden Runes'
                ]
            },
            reddit: {
                name: 'Reddit',
                sentiment: 42,
                mentions: 1718,
                trends: ['r/BitcoinRunes', 'r/Ordinals', 'r/RunesProtocol'],
                users: '12.5K',
                change: -3.2,
                communities: [
                    'r/Bitcoin',
                    'r/Ordinals',
                    'r/RunesProtocol',
                    'r/CryptoCurrency'
                ]
            }
        };
        
        // Gerar dados de influenciadores focados em Runes
        this.data.influencers = [
            {
                id: 'casey_rodarmor',
                name: 'Casey Rodarmor',
                handle: '@rodarmor',
                platforms: ['twitter', 'github'],
                sentiment: 'positive',
                reach: '215K',
                impact: 'high',
                tokens: ['RUNES'],
                role: 'Criador do Protocolo Runes',
                lastActivity: '1h ago',
                profileImage: ''
            },
            {
                id: 'magic_eden',
                name: 'Magic Eden',
                handle: '@MagicEden',
                platforms: ['twitter', 'discord'],
                sentiment: 'positive',
                reach: '1.8M',
                impact: 'high',
                tokens: ['RUNES', 'WIZZ'],
                role: 'Marketplace de Runes',
                lastActivity: '3h ago',
                profileImage: ''
            },
            {
                id: 'runes_whale',
                name: 'RunesWhale',
                handle: '@runes_whale',
                platforms: ['twitter', 'discord'],
                sentiment: 'positive',
                reach: '142K',
                impact: 'high',
                tokens: ['UNCOMMON', 'PEPE'],
                role: 'Grande investidor de Runes',
                lastActivity: '5h ago',
                profileImage: ''
            },
            {
                id: 'ordinals_expert',
                name: 'Ordinals Expert',
                handle: '@ordinalsexpert',
                platforms: ['twitter', 'youtube'],
                sentiment: 'neutral',
                reach: '296K',
                impact: 'medium',
                tokens: ['RARE', 'MEME'],
                role: 'Analista de Runes e Ordinals',
                lastActivity: '12h ago',
                profileImage: ''
            }
        ];
        
        // Gerar dados de palavras-chave específicas de Runes
        this.data.keywords = [
            { text: 'Runes Protocol', weight: 100 },
            { text: 'Runestones', weight: 95 },
            { text: 'Bitcoin Runes', weight: 90 },
            { text: 'Etching', weight: 85 },
            { text: 'Fungible', weight: 80 },
            { text: 'Mint', weight: 75 },
            { text: 'RuneID', weight: 70 },
            { text: 'UTXO', weight: 65 },
            { text: 'Divisibility', weight: 60 },
            { text: 'Magic Eden', weight: 55 },
            { text: 'Casey Rodarmor', weight: 50 },
            { text: 'Premine', weight: 45 },
            { text: 'Edicts', weight: 40 },
            { text: 'Ordinals', weight: 35 },
            { text: 'BRC-20', weight: 30 }
        ];
        
        // Gerar dados de alertas específicos para Runes
        this.data.alerts = {
            positive: [
                {
                    type: 'sentiment_spike',
                    token: 'RUNES',
                    message: 'Sentimento positivo em alta para protocolo Runes',
                    change: '+15%',
                    time: '2h ago'
                },
                {
                    type: 'mentions_spike',
                    token: 'UNCOMMON',
                    message: 'Aumento súbito nas menções de UNCOMMON Rune',
                    change: '+120%',
                    time: '4h ago'
                },
                {
                    type: 'influencer_mention',
                    token: 'WIZZ',
                    message: 'Casey Rodarmor mencionou o Rune WIZZ',
                    source: '@rodarmor',
                    time: '8h ago'
                }
            ],
            negative: [
                {
                    type: 'sentiment_drop',
                    token: 'MEME',
                    message: 'Queda no sentimento para o Rune MEME',
                    change: '-12%',
                    time: '6h ago'
                },
                {
                    type: 'fud_detected',
                    token: 'PEPE',
                    message: 'Possível FUD sobre problemas de cenotaphs no Rune PEPE',
                    source: 'Reddit',
                    time: '1d ago'
                }
            ]
        };
        
        // Gerar correlação de preço
        this.data.priceCorrelation = 72;
        
        // Dados sobre comunidades específicas de Runes
        this.data.communities = {
            'telegram': [
                { name: 'Official Runes Protocol', members: 22456, activity: 'Alta', link: 't.me/runesprotocol' },
                { name: 'Runes Trading', members: 15782, activity: 'Média', link: 't.me/runestrading' },
                { name: 'Runes Announcements', members: 9654, activity: 'Baixa', link: 't.me/runesannouncements' }
            ],
            'discord': [
                { name: 'Ordinals Server - Runes Channel', members: 45698, activity: 'Alta', link: 'discord.gg/ordinals' },
                { name: 'Magic Eden - Runes', members: 32145, activity: 'Alta', link: 'discord.gg/magiceden' },
                { name: 'Bitcoin Dev - Runes Protocol', members: 18492, activity: 'Média', link: 'discord.gg/bitcoindev' }
            ],
            'reddit': [
                { name: 'r/BitcoinRunes', members: 12560, activity: 'Média', link: 'reddit.com/r/bitcoinrunes' },
                { name: 'r/Ordinals', members: 35240, activity: 'Alta', link: 'reddit.com/r/ordinals' }
            ]
        };
        
        // Adicionar dados sobre tokens Runes populares
        this.data.runesTokens = [
            { 
                id: '845700:1', 
                name: 'UNCOMMON', 
                symbol: 'U', 
                divisibility: 18,
                supply: 21000000,
                description: 'Um dos primeiros e mais populares Runes do Bitcoin'
            },
            { 
                id: '845702:15', 
                name: 'RARE', 
                symbol: 'R', 
                divisibility: 8,
                supply: 100000,
                description: 'Rune de fornecimento limitado inspirado na raridade'
            },
            { 
                id: '847501:24', 
                name: 'MEME', 
                symbol: 'M', 
                divisibility: 0,
                supply: 69420000,
                description: 'Rune divertido focado na cultura de memes'
            },
            { 
                id: '848010:3', 
                name: 'PEPE', 
                symbol: 'P', 
                divisibility: 18,
                supply: 420690000000,
                description: 'Rune inspirado no meme do sapo Pepe'
            }
        ];
    }
    
    /**
     * Atualiza dados de análise social
     */
    async refreshData() {
        console.log('Atualizando dados de análise social...');
        
        // Se conectado a uma API real, faríamos chamadas aqui
        // Para desenvolvimento, apenas regenerar o mock com pequenas variações
        
        // Atualizar sentimento com uma pequena variação
        this.data.globalSentiment.previous = this.data.globalSentiment.current;
        const sentimentChange = (Math.random() * 4) - 2; // Entre -2% e +2%
        this.data.globalSentiment.current = Math.max(0, Math.min(100, this.data.globalSentiment.current + sentimentChange));
        this.data.globalSentiment.change = ((this.data.globalSentiment.current / this.data.globalSentiment.previous) - 1) * 100;
        this.data.globalSentiment.history.push({
            timestamp: new Date().getTime(),
            value: this.data.globalSentiment.current
        });
        
        // Atualizar menções com uma pequena variação
        this.data.mentions.previous = this.data.mentions.total;
        const mentionsChange = Math.random() * 0.1; // Entre 0% e 10%
        this.data.mentions.total = Math.round(this.data.mentions.total * (1 + mentionsChange));
        this.data.mentions.change = ((this.data.mentions.total / this.data.mentions.previous) - 1) * 100;
        this.data.mentions.history.push({
            timestamp: new Date().getTime(),
            value: this.data.mentions.total
        });
        
        // Verificar se há alertas a serem gerados
        this.checkForAlerts();
        
        // Renderizar os dados atualizados
        this.renderData();
        
        return Promise.resolve();
    }
    
    /**
     * Verifica se há alertas a serem gerados
     */
    checkForAlerts() {
        // Verificar mudanças significativas de sentimento
        if (Math.abs(this.data.globalSentiment.change) >= this.config.alertThresholds.sentimentChange) {
            const isPositive = this.data.globalSentiment.change > 0;
            const alert = {
                type: isPositive ? 'sentiment_spike' : 'sentiment_drop',
                message: `Mudança ${isPositive ? 'positiva' : 'negativa'} significativa no sentimento global`,
                change: `${isPositive ? '+' : ''}${this.data.globalSentiment.change.toFixed(1)}%`,
                time: 'agora'
            };
            
            if (isPositive) {
                this.data.alerts.positive.unshift(alert);
                
                // Mostrar notificação
                this.showNotification(`${alert.message} (${alert.change})`, 'success');
                
                // Adicionar XP se o sistema de gamificação estiver disponível
                if (window.gamification) {
                    window.gamification.addXP(10, 'social_tracking');
                }
            } else {
                this.data.alerts.negative.unshift(alert);
                this.showNotification(`${alert.message} (${alert.change})`, 'warning');
            }
        }
        
        // Verificar aumento súbito nas menções
        if (this.data.mentions.change >= this.config.alertThresholds.mentionsSpike) {
            const alert = {
                type: 'mentions_spike',
                message: 'Aumento súbito no volume de menções',
                change: `+${this.data.mentions.change.toFixed(1)}%`,
                time: 'agora'
            };
            
            this.data.alerts.positive.unshift(alert);
            this.showNotification(`${alert.message} (${alert.change})`, 'info');
        }
    }
    
    /**
     * Atualiza a visualização com base no timeframe selecionado
     * @param {string} timeframe - Timeframe selecionado (1h, 24h, 7d)
     */
    updateTimeframe(timeframe) {
        console.log(`Atualizando para timeframe: ${timeframe}`);
        
        // Filtrar dados com base no timeframe selecionado
        const now = new Date().getTime();
        let timeWindow;
        
        switch(timeframe) {
            case '1h':
                timeWindow = 60 * 60 * 1000; // 1 hora em ms
                break;
            case '7d':
                timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
                break;
            case '24h':
            default:
                timeWindow = 24 * 60 * 60 * 1000; // 24 horas em ms
                break;
        }
        
        // Filtrar histórico com base no timeframe
        const cutoffTime = now - timeWindow;
        
        // Renderizar os dados novamente com o novo timeframe
        this.renderData(cutoffTime);
    }
    
    /**
     * Renderiza os dados na interface
     * @param {number} cutoffTime - Tempo de corte para filtrar dados
     */
    renderData(cutoffTime = null) {
        // Atualizar sentimento global
        const globalSentimentElement = document.querySelector('#social-section .metric-value');
        const globalSentimentChangeElement = document.querySelector('#social-section .metric-change');
        
        if (globalSentimentElement) {
            globalSentimentElement.textContent = `${this.data.globalSentiment.current.toFixed(1)}%`;
        }
        
        if (globalSentimentChangeElement) {
            const changeValue = this.data.globalSentiment.change;
            const changeClass = changeValue >= 0 ? 'positive' : 'negative';
            const changeSign = changeValue >= 0 ? '+' : '';
            
            globalSentimentChangeElement.textContent = `${changeSign}${changeValue.toFixed(1)}%`;
            globalSentimentChangeElement.className = `metric-change ${changeClass}`;
        }
        
        // Atualizar contadores de alerta
        const positiveAlertCount = document.querySelector('#social-section .alert-count.positive');
        const negativeAlertCount = document.querySelector('#social-section .alert-count.negative');
        
        if (positiveAlertCount) {
            positiveAlertCount.textContent = this.data.alerts.positive.length;
        }
        
        if (negativeAlertCount) {
            negativeAlertCount.textContent = this.data.alerts.negative.length;
        }
        
        // Renderizar mini-gráficos
        this.renderMiniCharts();
        
        // Renderizar dados das plataformas
        this.renderPlatformData();
        
        // Atualizar a nuvem de palavras
        this.updateWordCloud();
    }
    
    /**
     * Renderiza mini-gráficos para visualização rápida de tendências
     */
    renderMiniCharts() {
        this.renderSentimentChart();
        this.renderMentionsChart();
    }
    
    /**
     * Renderiza o mini-gráfico de sentimento global
     */
    renderSentimentChart() {
        const chartElement = document.getElementById('global-sentiment-chart');
        if (!chartElement) return;
        
        // Filtramos os últimos 7 pontos de dados para o mini-gráfico
        const data = this.data.globalSentiment.history.slice(-7);
        
        // Em uma implementação real, usaríamos uma biblioteca como Chart.js
        // Para mock, criar uma visualização simples baseada em SVG
        
        // Determinar valores mínimos e máximos para escala
        const values = data.map(point => point.value);
        const minValue = Math.min(...values) * 0.9;
        const maxValue = Math.max(...values) * 1.1;
        const range = maxValue - minValue;
        
        // Criar SVG para o mini-gráfico
        const width = chartElement.clientWidth || 150;
        const height = chartElement.clientHeight || 50;
        const xStep = width / (data.length - 1);
        
        // Criar os pontos para o caminho SVG
        const points = data.map((point, index) => {
            const x = index * xStep;
            const normalizedValue = (point.value - minValue) / range;
            const y = height - (normalizedValue * height);
            return `${x},${y}`;
        }).join(' ');
        
        // Criar o elemento SVG
        const sentimentTrend = this.data.globalSentiment.change >= 0 ? 'positive' : 'negative';
        const gradient = sentimentTrend === 'positive' ? 
            'linear-gradient(to top, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.5))' : 
            'linear-gradient(to top, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.5))';
        
        const strokeColor = sentimentTrend === 'positive' ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
        
        const svgMarkup = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.5" />
                        <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.1" />
                    </linearGradient>
                </defs>
                <path d="M0,${height} ${points} ${width},${height} Z" fill="url(#gradient)" />
                <polyline points="${points}" fill="none" stroke="${strokeColor}" stroke-width="2" />
                ${data.map((point, index) => {
                    const x = index * xStep;
                    const normalizedValue = (point.value - minValue) / range;
                    const y = height - (normalizedValue * height);
                    return `<circle cx="${x}" cy="${y}" r="3" fill="${strokeColor}" />`;
                }).join('')}
            </svg>
        `;
        
        chartElement.innerHTML = svgMarkup;
    }
    
    /**
     * Renderiza o mini-gráfico de menções
     */
    renderMentionsChart() {
        const chartElement = document.getElementById('mentions-chart');
        if (!chartElement) return;
        
        // Filtramos os últimos 7 pontos de dados para o mini-gráfico
        const data = this.data.mentions.history.slice(-7);
        
        // Em uma implementação real, usaríamos uma biblioteca como Chart.js
        // Para mock, criar uma visualização simples baseada em barras
        
        // Determinar valores mínimos e máximos para escala
        const values = data.map(point => point.value);
        const maxValue = Math.max(...values) * 1.1;
        
        // Criar SVG para o mini-gráfico
        const width = chartElement.clientWidth || 150;
        const height = chartElement.clientHeight || 50;
        const barWidth = width / data.length * 0.7;
        const gap = (width / data.length) - barWidth;
        
        // Criar os retângulos para as barras
        const bars = data.map((point, index) => {
            const normalizedValue = point.value / maxValue;
            const barHeight = normalizedValue * height;
            const x = index * (barWidth + gap) + gap/2;
            const y = height - barHeight;
            
            return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="rgba(58, 123, 213, 0.7)" rx="2" />`;
        }).join('');
        
        // Criar o elemento SVG
        const svgMarkup = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                ${bars}
            </svg>
        `;
        
        chartElement.innerHTML = svgMarkup;
    }
    
    /**
     * Atualiza as informações de cada plataforma social
     */
    renderPlatformData() {
        // Atualizar estatísticas para cada plataforma
        Object.keys(this.data.platforms).forEach(platformId => {
            const platform = this.data.platforms[platformId];
            
            // Encontrar elementos correspondentes na interface
            const platformCard = document.querySelector(`.platform-card:has(.platform-icon.fa-${platformId})`);
            if (!platformCard) return;
            
            // Atualizar dados de menções
            const mentionsElement = platformCard.querySelector('.platform-stat:nth-child(1) .stat-value');
            if (mentionsElement) {
                mentionsElement.textContent = platform.mentions.toLocaleString();
            }
            
            // Atualizar dados de sentimento
            const sentimentElement = platformCard.querySelector('.platform-stat:nth-child(2) .stat-value');
            if (sentimentElement) {
                sentimentElement.textContent = `${platform.sentiment}%`;
                sentimentElement.className = platform.sentiment > 50 ? 'stat-value positive' : 'stat-value negative';
            }
            
            // Atualizar tags de tendências
            const trendingContainer = platformCard.querySelector('.platform-trending');
            if (trendingContainer && platform.trends) {
                trendingContainer.innerHTML = '';
                platform.trends.forEach(trend => {
                    const trendTag = document.createElement('div');
                    trendTag.className = 'trending-tag';
                    trendTag.textContent = trend;
                    trendingContainer.appendChild(trendTag);
                });
            }
        });
    }
    
    /**
     * Atualiza a visualização de nuvem de palavras
     */
    updateWordCloud() {
        const wordCloudContainer = document.getElementById('keyword-cloud');
        if (!wordCloudContainer) return;
        
        // Em uma implementação real, usaríamos uma biblioteca como D3.js
        // Para mock, criar uma visualização simples
        
        // Filtra apenas as principais palavras-chave
        const topKeywords = this.data.keywords.slice(0, 15);
        
        // Valor máximo para normalização
        const maxWeight = Math.max(...topKeywords.map(kw => kw.weight));
        
        // Criar elementos para cada palavra
        wordCloudContainer.innerHTML = '';
        
        const cloudDiv = document.createElement('div');
        cloudDiv.className = 'mock-word-cloud';
        cloudDiv.style.display = 'flex';
        cloudDiv.style.flexWrap = 'wrap';
        cloudDiv.style.justifyContent = 'center';
        cloudDiv.style.alignItems = 'center';
        cloudDiv.style.height = '100%';
        
        topKeywords.forEach(keyword => {
            const size = 0.8 + ((keyword.weight / maxWeight) * 1.5);
            const opacity = 0.3 + ((keyword.weight / maxWeight) * 0.7);
            
            const wordSpan = document.createElement('span');
            wordSpan.textContent = keyword.text;
            wordSpan.style.fontSize = `${size}rem`;
            wordSpan.style.opacity = opacity;
            wordSpan.style.padding = '0.5rem 1rem';
            wordSpan.style.color = `rgba(58, 123, 213, ${opacity})`;
            wordSpan.style.fontWeight = Math.round(400 + ((keyword.weight / maxWeight) * 300));
            
            cloudDiv.appendChild(wordSpan);
        });
        
        wordCloudContainer.appendChild(cloudDiv);
    }
    
    /**
     * Configurar nuvem de palavras-chave (mock)
     */
    setupWordCloud() {
        const wordCloudContainer = document.getElementById('keyword-cloud');
        if (!wordCloudContainer) return;
        
        // Em uma implementação real, usaríamos uma biblioteca como D3.js
        // Para mock, apenas mostrar que esta funcionalidade estaria disponível
        wordCloudContainer.innerHTML = 'Nuvem de palavras-chave seria renderizada aqui com D3.js ou similar';
    }
    
    /**
     * Mostra uma notificação ao usuário
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de notificação (success, warning, info, error)
     */
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`Notificação (${type}): ${message}`);
        }
    }
    
    /**
     * Gera uma série temporal aleatória para mock de dados
     * @param {number} baseValue - Valor base
     * @param {number} variance - Variação máxima
     * @param {number} days - Número de dias de histórico
     * @returns {Array} Série temporal
     */
    generateRandomTimeSeries(baseValue, variance, days) {
        const series = [];
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        for (let i = days; i >= 0; i--) {
            const timestamp = now - (i * dayInMs);
            const randomChange = (Math.random() * 2 - 1) * variance;
            const value = Math.max(0, baseValue + randomChange);
            
            series.push({
                timestamp,
                value
            });
        }
        
        return series;
    }
    
    /**
     * Configurar eventos para interação com os dados sociais
     */
    setupInteractions() {
        // Adicionar eventos para os botões de alerta
        const alertsContainer = document.querySelector('#social-section .alert-action .btn-view-all');
        if (alertsContainer) {
            alertsContainer.addEventListener('click', () => {
                this.showAllAlerts();
            });
        }
        
        // Adicionar eventos para os botões de acompanhamento de influenciadores
        const followButtons = document.querySelectorAll('#social-section .action-btn');
        followButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.innerHTML.includes('fa-bell') ? 'alerta' : 'acompanhamento';
                const influencerRow = e.currentTarget.closest('tr');
                const influencerName = influencerRow ? influencerRow.querySelector('.influencer-name').textContent : '';
                
                if (influencerName) {
                    this.showNotification(`${action === 'alerta' ? 'Alerta configurado' : 'Agora você está acompanhando'} ${influencerName}`, 'success');
                    
                    // Adicionar XP por usar o sistema social, se o sistema de gamificação estiver disponível
                    if (window.gamification) {
                        window.gamification.addXP(5, 'social_engagement');
                    }
                }
            });
        });
        
        // Configurar o simulador de impacto
        this.setupImpactSimulator();
    }
    
    /**
     * Configurar o simulador de impacto do sentimento no preço
     */
    setupImpactSimulator() {
        const sentimentRange = document.getElementById('sentiment-range');
        const rangeValue = document.querySelector('.range-value');
        const tokenSelector = document.getElementById('token-selector');
        const periodButtons = document.querySelectorAll('.toggle-btn');
        
        if (!sentimentRange || !rangeValue || !tokenSelector) return;
        
        // Limpar e popular seletor de tokens com Runes reais
        tokenSelector.innerHTML = '';
        const runeOptions = [
            { id: 'RUNES', name: 'RUNES (Protocolo)' },
            { id: 'UNCOMMON', name: 'UNCOMMON (845700:1)' },
            { id: 'RARE', name: 'RARE (845702:15)' },
            { id: 'MEME', name: 'MEME (847501:24)' },
            { id: 'PEPE', name: 'PEPE (848010:3)' }
        ];
        
        runeOptions.forEach(rune => {
            const option = document.createElement('option');
            option.value = rune.id;
            option.textContent = rune.name;
            tokenSelector.appendChild(option);
        });
        
        // Dados de correlação para diferentes tokens e períodos
        const correlationData = {
            'RUNES': {
                '24h': { coefficient: 0.72, multiplier: 0.65 },
                '7d': { coefficient: 0.68, multiplier: 0.58 },
                '30d': { coefficient: 0.61, multiplier: 0.48 }
            },
            'UNCOMMON': {
                '24h': { coefficient: 0.78, multiplier: 0.70 },
                '7d': { coefficient: 0.72, multiplier: 0.63 },
                '30d': { coefficient: 0.67, multiplier: 0.55 }
            },
            'RARE': {
                '24h': { coefficient: 0.65, multiplier: 0.52 },
                '7d': { coefficient: 0.59, multiplier: 0.45 },
                '30d': { coefficient: 0.54, multiplier: 0.40 }
            },
            'MEME': {
                '24h': { coefficient: 0.83, multiplier: 0.80 },
                '7d': { coefficient: 0.76, multiplier: 0.72 },
                '30d': { coefficient: 0.70, multiplier: 0.65 }
            },
            'PEPE': {
                '24h': { coefficient: 0.85, multiplier: 0.85 },
                '7d': { coefficient: 0.78, multiplier: 0.75 },
                '30d': { coefficient: 0.71, multiplier: 0.68 }
            }
        };
        
        // Estado atual do simulador
        const simulatorState = {
            token: 'UNCOMMON',
            sentimentChange: 10,
            period: '24h'
        };
        
        // Atualizar a visualização do valor do range
        const updateRangeValue = () => {
            const value = parseInt(sentimentRange.value);
            const sign = value >= 0 ? '+' : '';
            const valueClass = value >= 0 ? 'positive' : 'negative';
            
            rangeValue.textContent = `${sign}${value}%`;
            rangeValue.className = `range-value ${valueClass}`;
            
            simulatorState.sentimentChange = value;
            this.updateImpactEstimation(simulatorState);
        };
        
        // Evento para o range slider
        sentimentRange.addEventListener('input', updateRangeValue);
        
        // Evento para o seletor de token
        tokenSelector.addEventListener('change', () => {
            simulatorState.token = tokenSelector.value;
            this.updateImpactEstimation(simulatorState);
        });
        
        // Eventos para os botões de período
        periodButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover a classe active de todos os botões
                periodButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar a classe active ao botão clicado
                button.classList.add('active');
                
                // Atualizar o estado do simulador
                simulatorState.period = button.getAttribute('data-period');
                this.updateImpactEstimation(simulatorState);
            });
        });
        
        // Inicializar a estimativa
        this.updateImpactEstimation(simulatorState);
    }
    
    /**
     * Atualiza a estimativa de impacto no preço com base nas entradas do usuário
     * @param {Object} state - Estado atual do simulador
     */
    updateImpactEstimation(state) {
        // Obter os elementos do DOM
        const impactValue = document.querySelector('.impact-value');
        const confidenceFill = document.querySelector('.confidence-fill');
        const confidenceValue = document.querySelector('.confidence-value');
        
        if (!impactValue || !confidenceFill || !confidenceValue) return;
        
        // Dados de correlação para o token e período selecionados
        const correlationData = {
            'RUNES': {
                '24h': { coefficient: 0.72, multiplier: 0.65 },
                '7d': { coefficient: 0.68, multiplier: 0.58 },
                '30d': { coefficient: 0.61, multiplier: 0.48 }
            },
            'UNCOMMON': {
                '24h': { coefficient: 0.78, multiplier: 0.70 },
                '7d': { coefficient: 0.72, multiplier: 0.63 },
                '30d': { coefficient: 0.67, multiplier: 0.55 }
            },
            'RARE': {
                '24h': { coefficient: 0.65, multiplier: 0.52 },
                '7d': { coefficient: 0.59, multiplier: 0.45 },
                '30d': { coefficient: 0.54, multiplier: 0.40 }
            },
            'MEME': {
                '24h': { coefficient: 0.83, multiplier: 0.80 },
                '7d': { coefficient: 0.76, multiplier: 0.72 },
                '30d': { coefficient: 0.70, multiplier: 0.65 }
            },
            'PEPE': {
                '24h': { coefficient: 0.85, multiplier: 0.85 },
                '7d': { coefficient: 0.78, multiplier: 0.75 },
                '30d': { coefficient: 0.71, multiplier: 0.68 }
            }
        };
        
        // Obter coeficiente e multiplicador para o token e período
        const data = correlationData[state.token][state.period];
        
        // Calcular o impacto estimado no preço
        const impactEstimate = state.sentimentChange * data.multiplier;
        const coefficient = data.coefficient * 100; // Para exibição em porcentagem
        
        // Atualizar a interface
        const sign = impactEstimate >= 0 ? '+' : '';
        const valueClass = impactEstimate >= 0 ? 'positive' : 'negative';
        
        impactValue.textContent = `${sign}${impactEstimate.toFixed(1)}%`;
        impactValue.className = `impact-value ${valueClass}`;
        
        confidenceFill.style.width = `${coefficient}%`;
        confidenceValue.textContent = `Confiança: ${coefficient.toFixed(0)}%`;
        
        // Se a confiança for muito alta e o impacto for significativo, adicionar um desafio
        if (coefficient > 75 && Math.abs(impactEstimate) > 10) {
            // Adicionar gamificação se o sistema estiver disponível
            if (window.gamification && Math.random() < 0.3) { // 30% de chance para não ser irritante
                window.gamification.addXP(15, 'market_analysis');
                this.showNotification(`Você ganhou 15 XP por analisar cenários de alto impacto!`, 'success');
            }
        }
    }
    
    /**
     * Mostra todos os alertas sociais em um modal
     */
    showAllAlerts() {
        // Em uma implementação real, isso abriria um modal ou redirecionaria para uma página específica
        // Para o mock, apenas mostrar uma notificação
        const positiveCount = this.data.alerts.positive.length;
        const negativeCount = this.data.alerts.negative.length;
        
        this.showNotification(`Você tem ${positiveCount} alertas positivos e ${negativeCount} alertas negativos. Em uma implementação completa, todos seriam exibidos aqui.`, 'info');
    }
    
    /**
     * Configurar tooltip para explicação sobre Runes
     */
    setupRunesInfoTooltip() {
        // Criar elemento de informação sobre Runes
        const socialSection = document.getElementById('social-section');
        if (!socialSection) return;
        
        const infoButton = document.createElement('button');
        infoButton.className = 'info-button';
        infoButton.innerHTML = '<i class="fas fa-info-circle"></i>';
        infoButton.title = 'O que são Runes?';
        
        const header = socialSection.querySelector('.section-header h2');
        if (header) {
            header.appendChild(infoButton);
        }
        
        // Criar tooltip com informações sobre Runes
        const tooltip = document.createElement('div');
        tooltip.className = 'runes-tooltip';
        tooltip.innerHTML = `
            <h3>O que são tokens Runes?</h3>
            <p>Runes são tokens fungíveis nativos do Bitcoin (diferente dos NFTs Ordinals). Criados por Casey Rodarmor, permitem a criação de tokens na rede Bitcoin usando o modelo UTXO.</p>
            <ul>
                <li><strong>Identificação:</strong> Formato Bloco:TX (ex: 500:20)</li>
                <li><strong>Características:</strong> Nome (até 26 letras), divisibilidade e símbolo</li>
                <li><strong>Estrutura:</strong> Utilizam "runestones" em outputs de transações</li>
                <li><strong>Marketplace:</strong> Negociáveis em plataformas como Magic Eden</li>
            </ul>
            <a href="https://docs.ordinals.com/runes.html" target="_blank">Saiba mais</a>
        `;
        
        socialSection.appendChild(tooltip);
        
        // Adicionar evento para mostrar/esconder tooltip
        infoButton.addEventListener('click', (e) => {
            e.preventDefault();
            tooltip.classList.toggle('show');
            
            // Posicionar tooltip
            const rect = infoButton.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 10}px`;
            tooltip.style.left = `${rect.left - 150}px`;
            
            // Adicionar evento para fechar clicando fora
            if (tooltip.classList.contains('show')) {
                setTimeout(() => {
                    document.addEventListener('click', function closeTooltip(e) {
                        if (!tooltip.contains(e.target) && e.target !== infoButton) {
                            tooltip.classList.remove('show');
                            document.removeEventListener('click', closeTooltip);
                        }
                    });
                }, 10);
                
                // Adicionar XP por aprender sobre Runes
                if (window.gamification) {
                    window.gamification.addXP(5, 'learning');
                }
            }
        });
    }
}

// Inicializar o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.socialAnalytics === 'undefined') {
        window.socialAnalytics = new SocialAnalytics();
        window.socialAnalytics.initialize();
    }
}); 