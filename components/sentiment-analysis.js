/**
 * RUNES Analytics Pro - Componente de Análise de Sentimento Avançada
 * Responsável por analisar e exibir dados de sentimento sobre tokens RUNES
 * baseado em dados coletados de redes sociais, notícias e comunidades
 */

class RunesSentimentAnalysis {
    constructor() {
        this.sentimentData = {};
        this.socialSources = ['twitter', 'reddit', 'telegram', 'discord'];
        this.timeframe = '24h'; // Default timeframe
        this.selectedRune = 'DOG'; // Default RUNE
        this.influencerThreshold = 5000; // Número mínimo de seguidores para considerar influenciador
        
        // Mapa de emojis para diferentes níveis de sentimento
        this.sentimentEmojis = {
            'muito-positivo': '🔥',
            'positivo': '😀',
            'neutro': '😐',
            'negativo': '😕',
            'muito-negativo': '💔'
        };
    }
    
    /**
     * Inicializa o componente de análise de sentimento
     */
    async initialize() {
        console.log('Inicializando componente de análise de sentimento avançada...');
        
        // Carregar o container
        this.container = document.getElementById('sentiment-content') || 
                          document.querySelector('.sentiment-section-content');
                          
        if (!this.container) {
            console.error('Container para análise de sentimento não encontrado');
            return false;
        }
        
        // Criar a estrutura base do componente
        this.renderBaseStructure();
        
        // Carregar dados mock iniciais
        await this.loadSentimentData();
        
        // Adicionar event listeners
        this.addEventListeners();
        
        return true;
    }
    
    /**
     * Renderiza a estrutura base do componente
     */
    renderBaseStructure() {
        this.container.innerHTML = `
            <div class="sentiment-dashboard">
                <div class="sentiment-controls">
                    <div class="selector-container">
                        <label>Selecione o token RUNE:</label>
                        <select id="sentiment-rune-selector" class="styled-select">
                            <option value="DOG">DOG•GO•TO•THE•MOON 🐕</option>
                            <option value="MAGIC">MAGIC•INTERNET•MONEY 💰</option>
                            <option value="NIKOLA">NIKOLA•TESLA•GOD ⚡</option>
                            <option value="BILLION">BILLION•DOLLAR•CAT 🐱</option>
                            <option value="CYPHER">CYPHER•GENESIS 🔐</option>
                        </select>
                    </div>
                    
                    <div class="timeframe-selector">
                        <button data-timeframe="24h" class="active">24h</button>
                        <button data-timeframe="7d">7 dias</button>
                        <button data-timeframe="30d">30 dias</button>
                    </div>
                </div>
                
                <div class="sentiment-overview-panel">
                    <div class="sentiment-score-card">
                        <h3>Índice de Sentimento</h3>
                        <div class="sentiment-meter">
                            <div class="meter-value" id="sentiment-meter-value">0</div>
                            <div class="meter-scale">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                                <span>75</span>
                                <span>100</span>
                            </div>
                        </div>
                        <div class="sentiment-indicator" id="sentiment-indicator">
                            <span class="indicator-emoji">😐</span>
                            <span class="indicator-text">Neutro</span>
                        </div>
                    </div>
                    
                    <div class="sentiment-chart-container">
                        <h3>Evolução do Sentimento</h3>
                        <div id="sentiment-trend-chart" class="sentiment-chart"></div>
                    </div>
                </div>
                
                <div class="sentiment-details-grid">
                    <div class="sentiment-source-card">
                        <h3>Sentimento por Fonte</h3>
                        <div id="sentiment-by-source" class="source-list">
                            <!-- Preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="influencers-card">
                        <h3>Influenciadores-Chave</h3>
                        <div id="key-influencers" class="influencers-list">
                            <!-- Preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="trending-topics-card">
                        <h3>Tópicos em Alta</h3>
                        <div id="trending-topics" class="topics-cloud">
                            <!-- Preenchido dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="sentiment-vs-price-card">
                        <h3>Sentimento vs. Preço</h3>
                        <div id="sentiment-price-correlation" class="correlation-chart"></div>
                    </div>
                </div>
                
                <div class="social-pulse-section">
                    <h3>Pulso Social</h3>
                    <div class="social-pulse-stream" id="social-posts-stream">
                        <!-- Stream de posts em tempo real -->
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Carrega os dados de sentimento (mock para demonstração)
     */
    async loadSentimentData() {
        // Simulação de carregamento assíncrono
        return new Promise((resolve) => {
            setTimeout(() => {
                // Dados mockados para demonstração
                this.sentimentData = {
                    DOG: {
                        overallScore: 78.5,
                        sentimentStatus: 'positivo',
                        trendData: [65, 68, 72, 70, 75, 79, 78.5],
                        sourceSentiment: {
                            twitter: 82,
                            reddit: 75,
                            telegram: 80,
                            discord: 77
                        },
                        keyInfluencers: [
                            {name: '@crypto_whale', followers: 125000, sentiment: 'positivo', recentPost: 'DOG é o futuro do ecossistema RUNES! 🚀'},
                            {name: '@runes_trader', followers: 45000, sentiment: 'positivo', recentPost: 'Acabei de comprar mais DOG, o volume está incrível'},
                            {name: '@btc_maxi', followers: 78000, sentiment: 'neutro', recentPost: 'Observando o comportamento de DOG nas últimas 24h'}
                        ],
                        trendingTopics: [
                            {text: 'lançamento', weight: 10},
                            {text: 'alta', weight: 8},
                            {text: 'comprar', weight: 7},
                            {text: 'potencial', weight: 6},
                            {text: 'hold', weight: 5},
                            {text: 'comunidade', weight: 4}
                        ],
                        socialPosts: [
                            {author: '@crypto_fan', platform: 'twitter', content: 'Acabei de comprar mais DOG! Esperando a próxima alta 🚀', time: '3min atrás', sentiment: 'positivo'},
                            {author: 'runesLover', platform: 'reddit', content: 'Alguém mais está acompanhando o volume absurdo de DOG hoje?', time: '7min atrás', sentiment: 'positivo'},
                            {author: 'BTCMaximalist', platform: 'telegram', content: 'Não sou fã de RUNES, mas DOG está impressionando...', time: '15min atrás', sentiment: 'neutro'}
                        ]
                    },
                    MAGIC: {
                        overallScore: 62.3,
                        sentimentStatus: 'positivo',
                        trendData: [58, 60, 63, 64, 60, 61, 62.3],
                        sourceSentiment: {
                            twitter: 65,
                            reddit: 60,
                            telegram: 68,
                            discord: 56
                        },
                        keyInfluencers: [
                            {name: '@magic_hunter', followers: 89000, sentiment: 'positivo', recentPost: 'MAGIC está mostrando sinais de crescimento sustentável'},
                            {name: '@runes_daily', followers: 32000, sentiment: 'neutro', recentPost: 'Comparando MAGIC com outros tokens RUNES...'}
                        ],
                        trendingTopics: [
                            {text: 'crescimento', weight: 9},
                            {text: 'investimento', weight: 7},
                            {text: 'longo prazo', weight: 6},
                            {text: 'volume', weight: 5}
                        ],
                        socialPosts: [
                            {author: 'magic_believer', platform: 'discord', content: 'MAGIC tem o melhor potencial entre os RUNES atuais', time: '5min atrás', sentiment: 'positivo'},
                            {author: '@trader_pro', platform: 'twitter', content: 'Analisando MAGIC vs DOG, ambos parecem promissores', time: '12min atrás', sentiment: 'neutro'}
                        ]
                    }
                };
                
                // Atualizar a interface com os dados carregados
                this.updateSentimentInterface();
                resolve();
            }, 800); // Simulação de delay de rede
        });
    }
    
    /**
     * Atualiza a interface com os dados de sentimento
     */
    updateSentimentInterface() {
        const data = this.sentimentData[this.selectedRune];
        if (!data) return;
        
        // Atualizar o medidor de sentimento
        const meterValue = document.getElementById('sentiment-meter-value');
        if (meterValue) {
            meterValue.textContent = data.overallScore.toFixed(1);
            meterValue.style.left = `${data.overallScore}%`;
        }
        
        // Atualizar o indicador de sentimento
        const indicator = document.getElementById('sentiment-indicator');
        if (indicator) {
            const emoji = this.sentimentEmojis[data.sentimentStatus] || '😐';
            const text = this.getSentimentText(data.sentimentStatus);
            indicator.innerHTML = `
                <span class="indicator-emoji">${emoji}</span>
                <span class="indicator-text">${text}</span>
            `;
        }
        
        // Atualizar sentimento por fonte
        const sourcesList = document.getElementById('sentiment-by-source');
        if (sourcesList) {
            let sourcesHtml = '';
            for (const [source, score] of Object.entries(data.sourceSentiment)) {
                const sentimentClass = this.getSentimentClass(score);
                sourcesHtml += `
                    <div class="source-item">
                        <div class="source-name">${this.getSourceDisplayName(source)}</div>
                        <div class="source-score ${sentimentClass}">${score}</div>
                    </div>
                `;
            }
            sourcesList.innerHTML = sourcesHtml;
        }
        
        // Atualizar influenciadores-chave
        const influencersList = document.getElementById('key-influencers');
        if (influencersList && data.keyInfluencers) {
            let influencersHtml = '';
            data.keyInfluencers.forEach(influencer => {
                influencersHtml += `
                    <div class="influencer-card">
                        <div class="influencer-header">
                            <span class="influencer-name">${influencer.name}</span>
                            <span class="influencer-followers">${this.formatNumber(influencer.followers)} seguidores</span>
                        </div>
                        <div class="influencer-post">
                            <p>${influencer.recentPost}</p>
                            <div class="sentiment-tag ${influencer.sentiment}">${this.getSentimentText(influencer.sentiment)}</div>
                        </div>
                    </div>
                `;
            });
            influencersList.innerHTML = influencersHtml;
        }
        
        // Atualizar tópicos em alta
        const topicsCloud = document.getElementById('trending-topics');
        if (topicsCloud && data.trendingTopics) {
            let topicsHtml = '';
            data.trendingTopics.forEach(topic => {
                const fontSize = 14 + (topic.weight * 0.8); // Escala dinâmica baseada no peso
                topicsHtml += `
                    <span class="topic-tag" style="font-size: ${fontSize}px">${topic.text}</span>
                `;
            });
            topicsCloud.innerHTML = topicsHtml;
        }
        
        // Atualizar stream de posts sociais
        const socialStream = document.getElementById('social-posts-stream');
        if (socialStream && data.socialPosts) {
            let postsHtml = '';
            data.socialPosts.forEach(post => {
                const platformIcon = this.getPlatformIcon(post.platform);
                postsHtml += `
                    <div class="social-post ${post.sentiment}">
                        <div class="post-header">
                            <span class="platform-icon">${platformIcon}</span>
                            <span class="post-author">${post.author}</span>
                            <span class="post-time">${post.time}</span>
                        </div>
                        <div class="post-content">${post.content}</div>
                    </div>
                `;
            });
            socialStream.innerHTML = postsHtml;
        }
        
        // Simular gráficos (em uma implementação real, usaríamos Chart.js ou similar)
        this.simulateCharts(data);
    }
    
    /**
     * Adiciona os event listeners para interatividade
     */
    addEventListeners() {
        // Seletor de RUNE
        const runeSelector = document.getElementById('sentiment-rune-selector');
        if (runeSelector) {
            runeSelector.addEventListener('change', (e) => {
                this.selectedRune = e.target.value;
                this.loadSentimentData().then(() => {
                    console.log(`Dados de sentimento atualizados para ${this.selectedRune}`);
                });
            });
        }
        
        // Seletores de timeframe
        const timeButtons = document.querySelectorAll('.timeframe-selector button');
        timeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remover classe ativa de todos os botões
                timeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                e.target.classList.add('active');
                
                // Atualizar timeframe e recarregar dados
                this.timeframe = e.target.dataset.timeframe;
                this.loadSentimentData();
            });
        });
    }
    
    /**
     * Simula a renderização de gráficos (em produção, usaríamos uma biblioteca como Chart.js)
     */
    simulateCharts(data) {
        // Simulação do gráfico de tendência
        const trendChart = document.getElementById('sentiment-trend-chart');
        if (trendChart && data.trendData) {
            // Gerar um gráfico simples usando DIVs para demonstração
            const values = data.trendData;
            const max = Math.max(...values);
            
            let chartHtml = '<div class="chart-mock">';
            values.forEach(value => {
                const height = (value / max) * 100;
                chartHtml += `<div class="chart-bar" style="height: ${height}%"></div>`;
            });
            chartHtml += '</div>';
            
            trendChart.innerHTML = chartHtml;
        }
        
        // Simulação do gráfico de correlação sentimento vs preço
        const correlationChart = document.getElementById('sentiment-price-correlation');
        if (correlationChart) {
            correlationChart.innerHTML = `
                <div class="dual-line-chart-mock">
                    <div class="chart-legend">
                        <span class="price-legend">Preço</span>
                        <span class="sentiment-legend">Sentimento</span>
                    </div>
                    <div class="chart-area">
                        <!-- Em produção, aqui teríamos um gráfico real -->
                        <div class="chart-placeholder">Gráfico de correlação entre sentimento e preço</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Métodos auxiliares
    
    getSentimentText(sentiment) {
        const map = {
            'muito-positivo': 'Muito Positivo',
            'positivo': 'Positivo',
            'neutro': 'Neutro',
            'negativo': 'Negativo',
            'muito-negativo': 'Muito Negativo'
        };
        return map[sentiment] || 'Neutro';
    }
    
    getSentimentClass(score) {
        if (score >= 80) return 'muito-positivo';
        if (score >= 60) return 'positivo';
        if (score >= 40) return 'neutro';
        if (score >= 20) return 'negativo';
        return 'muito-negativo';
    }
    
    getSourceDisplayName(source) {
        const map = {
            'twitter': 'Twitter',
            'reddit': 'Reddit',
            'telegram': 'Telegram',
            'discord': 'Discord'
        };
        return map[source] || source.charAt(0).toUpperCase() + source.slice(1);
    }
    
    getPlatformIcon(platform) {
        const map = {
            'twitter': '🐦',
            'reddit': '🔥',
            'telegram': '📱',
            'discord': '💬'
        };
        return map[platform] || '🌐';
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Exportar a classe para uso global
window.RunesSentimentAnalysis = RunesSentimentAnalysis; 