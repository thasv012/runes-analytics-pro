// RUNES Analytics Pro - Aplicação Principal
// Versão simplificada sem módulos ES6 para garantir compatibilidade

// Estado global da aplicação
const appState = {
    currentSection: 'dashboard',
    isDarkMode: false,
    user: {
        level: 3,
        isLoggedIn: true,
        hasPremium: false
    },
    alerts: [],
    favorites: [],
    selectedRune: 'ORDI',
    timeframe: '1D',
    soundEnabled: true  // Nova propriedade para controle de som
};

function formatCurrency(num) {
    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
    } else {
        return `$${num.toFixed(2)}`;
    }
}

/**
 * Função utilitária para garantir que todos os containers necessários existam
 * e criar aqueles que estão faltando
 */
function setupContainers() {
    console.log('Configurando containers da aplicação...');
    
    // Lista de containers necessários
    const requiredContainers = [
        { id: 'dashboard', title: 'Dashboard', icon: '📊' },
        { id: 'market-data', title: 'Dados de Mercado', icon: '📈' },
        { id: 'whale-tracking', title: 'Rastreador de Whales', icon: '🐋' },
        { id: 'ranking', title: 'Ranking', icon: '🏆' },
        { id: 'alerts', title: 'Sistema de Alertas', icon: '🔔' },
        { id: 'sentiment', title: 'Análise de Sentimento', icon: '😊' }
    ];
    
    // Container principal que conterá todas as seções
    let mainContent = document.querySelector('main');
    if (!mainContent) {
        console.log('Container principal não encontrado, criando um novo');
        mainContent = document.createElement('main');
        mainContent.className = 'main-content';
        document.body.appendChild(mainContent);
    }
    
    // Criar cada container que não existe
    requiredContainers.forEach(container => {
        let section = document.getElementById(container.id);
        if (!section) {
            console.log(`Criando seção ${container.id}...`);
            section = document.createElement('section');
            section.id = container.id;
            section.className = `section ${container.id}-section`;
            section.innerHTML = `
                <div class="section-header">
                    <div class="section-icon">${container.icon}</div>
                    <h2>${container.title}</h2>
                </div>
                <div class="section-content" id="${container.id}-content"></div>
            `;
            mainContent.appendChild(section);
        }
    });
    
    return true;
}

// Quando o documento estiver carregado, iniciar a aplicação
 document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ RUNES Analytics Pro - Inicializando aplicação...');
    
    // Garantir que todos os containers necessários existam
    setupContainers();
    
    // Inicializar os serviços de dados
    initDataService();
    
    // Inicializar os componentes básicos
    initBasicComponents();
    
    // Inicializar componentes avançados
    initAdvancedComponents();
    
    // Configurar o tema
    setupThemeToggle();
    
    // Carregar preferências do usuário
    loadUserPreferences();
    
    console.log('✅ RUNES Analytics Pro - Aplicação iniciada com sucesso!');
});

// Inicializar o serviço de dados RUNES
function initDataService() {
    console.log('Inicializando RunesDataService...');
    try {
        // Verificar se o RunesDataService já está disponível globalmente
        if (typeof window.RunesDataService !== 'undefined') {
            console.log('RunesDataService já está disponível globalmente');
            
            // Verificar se já existe uma instância
            if (!window.runesDataService) {
                window.runesDataService = window.RunesDataService;
            }
            
            // Verificar se o método init existe antes de chamá-lo
            if (typeof window.runesDataService.init === 'function') {
                window.runesDataService.init();
            } else {
                console.warn('O método init() não foi encontrado no RunesDataService');
            }
        } else if (typeof RunesDataService !== 'undefined') {
            // Instanciar a classe se ela existir, mas não estiver no objeto window
        window.runesDataService = new RunesDataService();
            
            // Verificar se o método init existe antes de chamá-lo
            if (typeof window.runesDataService.init === 'function') {
        window.runesDataService.init();
    } else {
                console.warn('O método init() não foi encontrado no RunesDataService');
            }
        } else {
            // Tentar carregar o script dinamicamente
            console.warn('RunesDataService não encontrado, tentando carregar o script...');
            const script = document.createElement('script');
            script.src = 'services/RunesDataService.js';
            script.onload = function() {
                console.log('Script RunesDataService carregado com sucesso');
                
                // Verificar novamente se o serviço está disponível
                if (typeof window.RunesDataService !== 'undefined') {
                    window.runesDataService = window.RunesDataService;
                    
                    // Verificar se o método init existe antes de chamá-lo
                    if (typeof window.runesDataService.init === 'function') {
                        window.runesDataService.init();
                    } else {
                        console.warn('O método init() não foi encontrado no RunesDataService carregado');
                    }
                } else {
                    console.error('RunesDataService não encontrado mesmo após carregar o script');
                }
            };
            script.onerror = function() {
                console.error('Erro ao carregar o script RunesDataService');
            };
            document.head.appendChild(script);
        }
    } catch (error) {
        console.error('Erro ao inicializar RunesDataService:', error);
    }
}

// Inicializar o componente de ranking
function initRanking() {
    console.log('Inicializando componente de Ranking RUNES...');
    if (typeof RunesRanking !== 'undefined') {
        window.runesRanking = new RunesRanking();
        window.runesRanking.init();
    } else {
        console.error('RunesRanking não encontrado!');
    }
}

// Inicializar a análise de sentimentos
function initSentimentAnalysis() {
    console.log('Inicializando análise de sentimentos...');
    try {
        // Usar o ComponentManager para inicializar o componente
        if (window.componentManager) {
            window.componentManager.initComponent('RunesSentimentAnalysis')
                .then(instance => {
                    console.log('✅ Análise de sentimento inicializada com sucesso');
                })
                .catch(error => {
                    console.warn('⚠️ RunesSentimentAnalysis não pôde ser inicializado. Este componente pode estar bloqueado pelo seu nível atual.');
                });
        } else {
            // Fallback para o método antigo
        if (typeof RunesSentimentAnalysis !== 'undefined') {
            window.runesSentiment = new RunesSentimentAnalysis();
            window.runesSentiment.init();
        } else {
            console.warn('RunesSentimentAnalysis não encontrado. Este componente pode estar bloqueado pelo seu nível atual.');
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar análise de sentimentos:', error);
    }
}

// Inicializar o rastreador de baleias
function initWhaleTracker() {
    console.log('🐳 Inicializando rastreador de baleias...');
    
    try {
        // Usar o ComponentManager para inicializar o componente
        if (window.componentManager) {
            window.componentManager.initComponent('RunesWhaleTracker')
                .then(instance => {
                    console.log('✅ Rastreador de baleias inicializado com sucesso!');
                })
                .catch(error => {
                    console.error('❌ Erro ao inicializar rastreador de baleias:', error);
                });
        } else {
            // Fallback para o método antigo
        if (window.RunesWhaleTracker) {
            window.whaleTracker = new RunesWhaleTracker();
            window.whaleTracker.init();
            
            console.log('✅ Rastreador de baleias inicializado com sucesso!');
        } else {
            console.error('❌ Componente RunesWhaleTracker não encontrado');
            
            // Tentar carregar o componente se o script ainda não foi carregado
            const script = document.createElement('script');
            script.src = 'components/runes-whale-tracker.js';
            script.onload = function() {
                console.log('✅ Script de rastreador de baleias carregado, tentando inicializar...');
                window.whaleTracker = new RunesWhaleTracker();
                window.whaleTracker.init();
            };
            document.head.appendChild(script);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar rastreador de baleias:', error);
    }
}

// Inicializar a análise técnica
function initTechnicalAnalysis() {
    console.log('Inicializando análise técnica...');
    try {
        // Usar o ComponentManager para inicializar o componente
        if (window.componentManager) {
            window.componentManager.initComponent('RunesAnalysis')
                .then(instance => {
                    console.log('✅ Análise técnica inicializada com sucesso');
                })
                .catch(error => {
                    console.warn('⚠️ RunesAnalysis não pôde ser inicializado. Este componente pode estar bloqueado pelo seu nível atual.');
                });
        } else {
            // Fallback para o método antigo
        if (typeof RunesAnalysis !== 'undefined') {
            window.runesAnalysis = new RunesAnalysis();
            window.runesAnalysis.init();
        } else {
            console.warn('RunesAnalysis não encontrado. Este componente pode estar bloqueado pelo seu nível atual.');
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar análise técnica:', error);
    }
}

// Inicializar sistema de gamificação
function initGamification() {
    console.log('Inicializando sistema de gamificação...');
    try {
        // Usar o ComponentManager para inicializar o componente
        if (window.componentManager) {
            window.componentManager.initComponent('RunesGamification')
                .then(instance => {
                    console.log('✅ Sistema de gamificação inicializado com sucesso');
                })
                .catch(error => {
                    console.warn('⚠️ RunesGamification não pôde ser inicializado.');
                });
        } else {
            // Fallback para o método antigo
        if (typeof RunesGamification !== 'undefined') {
            window.runesGamification = new RunesGamification();
            window.runesGamification.init();
        } else {
            console.warn('RunesGamification não encontrado.');
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar sistema de gamificação:', error);
        }
    }
    
    // Inicializar sistema de alertas
function initAlertsSystem() {
    console.log('Inicializando sistema de alertas...');
    
    // Garantir que o contêiner de alertas exista
    ensureContainerExists('alerts-section', 'Alertas');
    
    // Configurar formulário de novos alertas
    const alertsForm = document.getElementById('new-alert-form');
    if (alertsForm) {
        alertsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const tokenInput = document.getElementById('alert-token');
            const conditionInput = document.getElementById('alert-condition');
            const valueInput = document.getElementById('alert-value');
            const notificationInput = document.getElementById('alert-notification');
            
            if (tokenInput && conditionInput && valueInput && notificationInput) {
                const newAlert = {
                    id: 'alert-' + Date.now(),
                    token: tokenInput.value,
                    condition: conditionInput.value,
                    value: valueInput.value,
                    notification: notificationInput.value,
                    active: true,
                    createdAt: new Date()
                };
                
                window.appState.alerts.push(newAlert);
                updateAlertsList();
                
                // Limpar formulário
                alertsForm.reset();
            }
        });
    }
    
    // Exemplo de alerta para demonstração
    const sampleAlert = {
        id: 'alert-sample',
        token: 'RUNES',
        condition: 'above',
        value: '1.00',
        notification: 'telegram',
        active: true,
        createdAt: new Date()
    };
    
    window.appState.alerts.push(sampleAlert);
    updateAlertsList();
}

// Atualizar lista de alertas na interface
function updateAlertsList() {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    if (window.appState.alerts.length === 0) {
        alertsList.innerHTML = '<div class="empty-state">Nenhum alerta configurado. Crie seu primeiro alerta usando o formulário acima.</div>';
        return;
    }
    
    window.appState.alerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.dataset.id = alert.id;
        
        const conditionText = alert.condition === 'above' ? 'acima de' : 'abaixo de';
        const notificationMethod = alert.notification === 'telegram' ? 'Telegram' : 
                                alert.notification === 'email' ? 'E-mail' : 'No site';
        
        alertItem.innerHTML = `
            <div class="alert-item-header">
                <span class="alert-token">${alert.token}</span>
                <div class="alert-actions">
                    <button class="toggle-alert" title="${alert.active ? 'Desativar' : 'Ativar'} alerta">
                        <i class="fas fa-${alert.active ? 'toggle-on' : 'toggle-off'}"></i>
                    </button>
                    <button class="delete-alert" title="Remover alerta">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="alert-details">
                <div class="alert-condition">
                    Alertar quando o preço estiver ${conditionText} $${alert.value}
                </div>
                <div class="alert-notification">
                    Notificar via: ${notificationMethod}
                </div>
            </div>
        `;
        
        // Adicionar manipuladores de eventos
        const toggleBtn = alertItem.querySelector('.toggle-alert');
        const deleteBtn = alertItem.querySelector('.delete-alert');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const alertId = alertItem.dataset.id;
                const alertObj = window.appState.alerts.find(a => a.id === alertId);
                if (alertObj) {
                    alertObj.active = !alertObj.active;
                    updateAlertsList();
                }
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const alertId = alertItem.dataset.id;
                window.appState.alerts = window.appState.alerts.filter(a => a.id !== alertId);
                updateAlertsList();
            });
        }
        
        alertsList.appendChild(alertItem);
    });
}

// Configurar alternância de tema
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            window.appState.isDarkMode = document.body.classList.contains('dark-mode');
            saveUserPreferences();
        });
    }
}

// Salvar preferências do usuário
function saveUserPreferences() {
    try {
        const preferences = {
            isDarkMode: window.appState.isDarkMode,
            soundEnabled: window.appState.soundEnabled
        };
        localStorage.setItem('runesAnalyticsPrefs', JSON.stringify(preferences));
    } catch (error) {
        console.error('Erro ao salvar preferências:', error);
    }
}

// Carregar preferências do usuário
function loadUserPreferences() {
    try {
        const prefsStr = localStorage.getItem('runesAnalyticsPrefs');
        if (prefsStr) {
            const prefs = JSON.parse(prefsStr);
            window.appState.isDarkMode = prefs.isDarkMode;
            window.appState.soundEnabled = prefs.soundEnabled;
            
            if (window.appState.isDarkMode) {
                document.body.classList.add('dark-mode');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar preferências:', error);
    }
}

// Utilitário para garantir que contêineres necessários existam
function ensureContainerExists(id, title) {
    if (!document.getElementById(id)) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const newSection = document.createElement('section');
            newSection.id = id;
            newSection.className = 'content-section hidden';
            newSection.innerHTML = `<h2 class="section-title">${title}</h2>`;
            mainContent.appendChild(newSection);
        }
    }
    return document.getElementById(id);
}

function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

// Adicione esta função ao app.js se ela não existir
function formatRunePrice(price) {
    if (!price) return '0.00 sats';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Converter para satoshis (1 BTC = 100,000,000 sats)
    const satPrice = numPrice < 1 ? numPrice * 100000000 : numPrice;
    
    if (satPrice < 0.01) return satPrice.toExponential(2) + ' sats';
    if (satPrice < 1) return satPrice.toFixed(5) + ' sats';
    if (satPrice < 10) return satPrice.toFixed(4) + ' sats';
    if (satPrice < 100) return satPrice.toFixed(3) + ' sats';
    if (satPrice < 1000) return satPrice.toFixed(2) + ' sats';
    return Math.round(satPrice) + ' sats';
}

// Inicializar navegação da barra lateral
function initSidebarNavigation() {
    // Selecionar todos os links da sidebar sem utilizar seletores complexos
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    
    console.log(`Encontrados ${sidebarLinks.length} links no menu lateral`);
    
    // Remover qualquer evento de clique existente e adicionar novos
    sidebarLinks.forEach(function(link) {
        // Remover eventos anteriores
        link.removeEventListener('click', handleMenuClick);
        
        // Adicionar novo evento de clique
        link.addEventListener('click', handleMenuClick);
        
        console.log(`Link configurado: ${link.textContent.trim()} -> ${link.getAttribute('href')}`);
    });
    
    console.log('Navegação da barra lateral inicializada');
}

// Função auxiliar para lidar com cliques no menu
function handleMenuClick(e) {
    e.preventDefault();
    
    console.log('Link do menu clicado:', this.textContent.trim());
    
    // Reproduzir som de clique se o gerenciador de sons estiver disponível
    if (window.runesSoundManager) {
        window.runesSoundManager.play('click');
    }
    
    // Obter ID da seção de destino
    const href = this.getAttribute('href');
    if (!href) return;
    
    const targetId = href.startsWith('#') ? href.substring(1) : href;
    console.log('Destino:', targetId);
    
    // Remover classe ativa de todos os links
    const allLinks = document.querySelectorAll('.sidebar a');
    allLinks.forEach(link => link.classList.remove('active'));
    
    // Adicionar classe ativa ao link clicado
    this.classList.add('active');
    
    // Usar nossa função robusta de alternância de seções
    toggleSections(targetId);
    
    return false; // Prevenir comportamento padrão
}

// Inicializar navegação do cabeçalho
function initHeaderNavigation() {
    const headerLinks = document.querySelectorAll('header nav a');
    
    headerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obter ID do destino
            const targetId = this.getAttribute('href').substring(1);
            
            // Atualizar links ativos
            headerLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Mudar para a seção selecionada
            changeActiveSection(targetId);
            
            console.log(`Menu de cabeçalho clicado: ${targetId}`);
        });
    });
}

/**
 * Muda a seção ativa na aplicação
 * @param {string} sectionId - O ID da seção a ser ativada
 */
function changeActiveSection(sectionId) {
    console.log(`Alterando seção ativa para: ${sectionId}`);
    
    // Esconder todas as seções
    const allSections = document.querySelectorAll('main.main-content > section');
    allSections.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    // Tentar encontrar a seção pelo ID
    let section = document.getElementById(sectionId);
    
    // Se não encontrar pelo ID, tentar pelo nome da classe
    if (!section) {
        section = document.querySelector(`.${sectionId}-section`);
    }
    
    // Se encontrou a seção, mostrá-la
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
        
        // Atualizar o título da página
        updatePageTitle(sectionId);
        
        // Inicializar componentes da seção
        initSectionComponents(sectionId);
        
        // Atualizar o link ativo no menu
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            // Remover o # do href para obter apenas o ID da seção
            const linkTarget = link.getAttribute('href').substring(1);
            
            if (linkTarget === sectionId) {
                link.classList.add('active');
        } else {
                link.classList.remove('active');
            }
        });
    } else {
        console.error(`❌ Não foi possível encontrar a seção: ${sectionId}`);
        
        // Fallback: mostrar a primeira seção como padrão
        const firstSection = document.querySelector('main.main-content > section');
            if (firstSection) {
                firstSection.classList.add('active');
                firstSection.style.display = 'block';
            console.log(`Mostrando seção padrão: ${firstSection.id || firstSection.className}`);
        }
    }
}

/**
 * Atualiza o link ativo no menu principal
 */
function updateActiveMenuLink(sectionId) {
    const links = document.querySelectorAll('.main-nav a');
    links.forEach(link => {
        const linkHref = link.getAttribute('href').substring(1); // Remover o # do href
        if (linkHref === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Inicializar componentes específicos de cada seção
function initSectionComponents(sectionId) {
    console.log(`Inicializando componentes para seção: ${sectionId}`);
    
    // Usar o ComponentManager para garantir que apenas componentes disponíveis sejam inicializados
    if (window.componentManager) {
    switch(sectionId) {
            case 'sentiment-section':
                window.componentManager.initComponent('RunesSentimentAnalysis')
                    .then(instance => {
                        if (instance && typeof instance.loadSentimentData === 'function') {
                            instance.loadSentimentData();
                        }
                    })
                    .catch(error => console.warn('⚠️ Componente de análise de sentimento não disponível'));
            break;
            
            case 'whale-tracker-section':
                window.componentManager.initComponent('RunesWhaleTracker')
                    .then(instance => {
                        if (instance && typeof instance.updateUI === 'function') {
                            instance.updateUI();
                        }
                    })
                    .catch(error => console.warn('⚠️ Componente de rastreador de baleias não disponível'));
            break;
            
            case 'technical-analysis-section':
                window.componentManager.initComponent('RunesAnalysis')
                    .then(instance => {
                        if (instance && typeof instance.updateTokenInfo === 'function') {
                            instance.updateTokenInfo();
                        }
                    })
                    .catch(error => console.warn('⚠️ Componente de análise técnica não disponível'));
            break;
            
            case 'gamification-section':
                window.componentManager.initComponent('RunesGamification')
                    .then(instance => {
                        if (instance && typeof instance.updateXPProgress === 'function') {
                            instance.updateXPProgress();
                        }
                    })
                    .catch(error => console.warn('⚠️ Componente de gamificação não disponível'));
            break;
            
            // Outros casos podem ser adicionados aqui
            
            default:
                // Sem componentes específicos para inicializar
                break;
        }
    } else {
        // Fallback para o método antigo
        switch(sectionId) {
            case 'sentiment-section':
                if (window.runesSentiment && typeof window.runesSentiment.loadSentimentData === 'function') {
                    window.runesSentiment.loadSentimentData();
                }
            break;
            
            case 'whale-tracker-section':
                if (window.whaleTracker && typeof window.whaleTracker.updateUI === 'function') {
                    window.whaleTracker.updateUI();
                }
            break;
            
            case 'technical-analysis-section':
                if (window.runesAnalysis && typeof window.runesAnalysis.updateTokenInfo === 'function') {
                    window.runesAnalysis.updateTokenInfo();
                }
            break;
        
            case 'gamification-section':
                if (window.runesGamification && typeof window.runesGamification.updateXPProgress === 'function') {
                    window.runesGamification.updateXPProgress();
                }
            break;
                
            // Outros casos podem ser adicionados aqui
        }
    }
}

// Atualizar métricas do dashboard
function updateDashboardMetrics() {
    // Dados mockup especificamente para RUNES
    const mockData = {
        volumeTotal: 187500000, // Volume de trading de RUNES
        volumeChange: 8.7,
        transactionCount: 283416, // Transações de RUNES
        transactionChange: 12.3,
        newMints: 895, // Novos mints de RUNES
        mintsChange: 5.8,
        sentiment: 76.4, // Sentimento geral para RUNES
        sentimentChange: 2.1,
        totalRunes: 628, // Total de tokens RUNES diferentes
        runesChange: 1.3,
        whaleActivity: 'Alto', // Nível de atividade de whales
        whaleActivityChange: 3.9
    };
    
    // Tentar atualizar elementos por ID e classes
    updateElementContent('volume-value, #volume-24h', formatCurrency(mockData.volumeTotal));
    updateElementContent('volume-change, #volume-change', `${mockData.volumeChange > 0 ? '+' : ''}${mockData.volumeChange}%`);
    
    updateElementContent('tx-value, #transactions-24h', formatNumber(mockData.transactionCount));
    updateElementContent('tx-change, #transactions-change', `${mockData.transactionChange > 0 ? '+' : ''}${mockData.transactionChange}%`);
    
    updateElementContent('mints-value, #newMints', formatNumber(mockData.newMints));
    updateElementContent('mints-change', `${mockData.mintsChange > 0 ? '+' : ''}${mockData.mintsChange}%`);
    
    updateElementContent('sentiment-value', mockData.sentiment.toFixed(1));
    updateElementContent('sentiment-change', `${mockData.sentimentChange > 0 ? '+' : ''}${mockData.sentimentChange}%`);
    
    // Atualizar o título da seção do gráfico principal
    updateElementContent('.chart-header h3', 'RUNES Market Overview');
}

// Função auxiliar para atualizar conteúdo
function updateElementContent(selectors, content) {
    const selectorList = selectors.split(',').map(s => s.trim());
    
    for (const selector of selectorList) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = content;
            return; // Parar depois de encontrar o primeiro elemento
        }
    }
}

// Inicializar botões de timeframe
function initTimeframeButtons() {
    const buttons = document.querySelectorAll('.timeframe-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const timeframe = this.textContent || this.getAttribute('data-interval');
            appState.timeframe = timeframe;
            
            console.log(`Timeframe alterado para: ${timeframe}`);
        });
    });
}

// Criar gráfico mockup
function createMockChart() {
    const chartContainers = document.querySelectorAll('#main-chart, #runesChart');
    
    chartContainers.forEach(container => {
        if (!container) {
            return;
        }
        
        console.log(`Criando gráfico para: ${container.id}`);
        
        // Limpar o container
        container.innerHTML = '';
        
        // Dados mockup para o gráfico
        const mockData = generateRandomData(30, 20, 2);
        
        // Criar canvas
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        
        // Se Chart.js estiver disponível, usar Chart.js
        if (typeof Chart !== 'undefined') {
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
            type: 'line',
            data: {
                    labels: Array.from({length: mockData.length}, (_, i) => i + 1),
                datasets: [{
                        label: 'Preço',
                        data: mockData,
                    borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                        fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
        } else {
            // Fallback para canvas simples
            drawSimpleChart(canvas, mockData);
        }
    });
}

// Desenhar gráfico simples usando canvas
function drawSimpleChart(canvas, data) {
    canvas.width = canvas.parentElement.offsetWidth || 800;
    canvas.height = canvas.parentElement.offsetHeight || 400;
    
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    // Encontrar min/max
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue;
    
    // Desenhar eixos
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Desenhar dados
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth * (index / (data.length - 1)));
        const y = padding + chartHeight - (chartHeight * ((value - minValue) / valueRange));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Área sob a linha
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = padding + (chartWidth * (index / (data.length - 1)));
        const y = padding + chartHeight - (chartHeight * ((value - minValue) / valueRange));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.lineTo(padding + chartWidth, canvas.height - padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.closePath();
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fill();
}

// Gerar dados aleatórios
function generateRandomData(count, base = 100, volatility = 10) {
    const data = [];
    let value = base;
    
    for (let i = 0; i < count; i++) {
        value += (Math.random() - 0.5) * volatility;
        value = Math.max(value, 1); // Garantir valor positivo
        data.push(value);
    }
    
    return data;
}

// Inicializar Rastreador de Whales
function initWhaleTracking() {
    console.log('Inicializando Rastreador de Whales de RUNES...');
    
    // Procurar por vários possíveis containers
    const containers = [
        document.getElementById('whales-container'),
        document.getElementById('holders-graph'),
        document.querySelector('.whales-list'),
        document.querySelector('.whale-dashboard')
    ];
    
    // Encontrar o primeiro container válido
    const container = containers.find(c => c !== null);
    
    if (!container) {
        console.error('Container para o Rastreador de Whales não encontrado');
        return;
    }
    
    console.log(`Container para Whales encontrado: ${container.id || 'sem ID'}`);
    
    // Dados mockup para whales de RUNES (com endereços no formato Bitcoin)
    const whalesData = [
        { address: 'bc1p3vr4...', token: 'DOG•GO•TO•THE•MOON', balance: '132.8M', valueUSD: '$22.5M', change: '+2.7%', riskScore: 82, transactions: 28, lastActive: '1h' },
        { address: 'bc1q9zd8...', token: 'MAGIC•INTERNET•MONEY', balance: '85.2M', valueUSD: '$11.1M', change: '-1.3%', riskScore: 58, transactions: 12, lastActive: '3h' },
        { address: 'bc1qar0s...', token: 'NIKOLA•TESLA•GOD', balance: '26.5M', valueUSD: '$4.2M', change: '+0.8%', riskScore: 45, transactions: 7, lastActive: '5h' },
        { address: '1A1zP1eP...', token: 'CRAZY•THURSDAY', balance: '48.1M', valueUSD: '$19.7M', change: '+4.1%', riskScore: 76, transactions: 31, lastActive: '30m' },
        { address: 'bc1q6hk2...', token: 'GCM•BITCOIN•PARTNER', balance: '5.2M', valueUSD: '$21.8M', change: '-0.9%', riskScore: 63, transactions: 15, lastActive: '2h' }
    ];
    
    // Limpar container
    container.innerHTML = '';
    
    // Adicionar título da seção
    const titleDiv = document.createElement('div');
    titleDiv.className = 'section-intro';
    titleDiv.innerHTML = `
        <h3>Rastreador de Whales de RUNES</h3>
        <p>Monitore os movimentos dos maiores detentores de tokens RUNES e identifique possíveis manipulações de mercado.</p>
    `;
    container.appendChild(titleDiv);
    
    // Criar tabela de whales se estivermos em um container de lista
    if (container.classList.contains('whales-list')) {
        const whalesTable = document.createElement('table');
        whalesTable.className = 'data-table';
        
        // Cabeçalho
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Endereço</th>
                <th>Token RUNE</th>
                <th>Saldo</th>
                <th>Valor (USD)</th>
                <th>Var. 24h</th>
                <th>Risco</th>
                <th>Última Atividade</th>
            </tr>
        `;
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        
        whalesData.forEach(whale => {
            const row = document.createElement('tr');
            
            const changeClass = whale.change.startsWith('+') ? 'positive' : 'negative';
            
            // Determinar classe de risco
            let riskClass = 'low-risk';
            if (whale.riskScore > 70) {
                riskClass = 'high-risk';
            } else if (whale.riskScore > 40) {
                riskClass = 'medium-risk';
            }
            
            row.innerHTML = `
                <td class="address-cell">${whale.address}</td>
                <td>${whale.token}</td>
                <td>${whale.balance}</td>
                <td>${whale.valueUSD}</td>
                <td class="${changeClass}">${whale.change}</td>
                <td><span class="risk-badge ${riskClass}">${whale.riskScore}</span></td>
                <td>${whale.lastActive}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        whalesTable.appendChild(thead);
        whalesTable.appendChild(tbody);
        container.appendChild(whalesTable);
    }
    // Criar cards visuais para cada whale
    else {
        const whalesGrid = document.createElement('div');
        whalesGrid.className = 'runes-grid';
        
        whalesData.forEach(whale => {
            const whaleCard = document.createElement('div');
            whaleCard.className = 'rune-card';
            
            const changeClass = whale.change.startsWith('+') ? 'positive' : 'negative';
            
            // Determinar classe de risco
            let riskClass = 'low-risk';
            if (whale.riskScore > 70) {
                riskClass = 'high-risk';
            } else if (whale.riskScore > 40) {
                riskClass = 'medium-risk';
            }
            
            whaleCard.innerHTML = `
                <div class="rune-card-header">
                    <div class="rune-card-symbol">🐋</div>
                    <div class="rune-card-title">
                        <h4>${whale.address}</h4>
                        <div class="rune-card-subtitle">${whale.token}</div>
                    </div>
                </div>
                
                <div class="rune-card-body">
                    <div class="rune-stat">
                        <div class="rune-stat-label">Saldo</div>
                        <div class="rune-stat-value">${whale.balance}</div>
                    </div>
                    <div class="rune-stat">
                        <div class="rune-stat-label">Valor (USD)</div>
                        <div class="rune-stat-value">${whale.valueUSD}</div>
                    </div>
                    <div class="rune-stat">
                        <div class="rune-stat-label">Var. 24h</div>
                        <div class="rune-stat-value ${changeClass}">${whale.change}</div>
                    </div>
                    <div class="rune-stat">
                        <div class="rune-stat-label">Risco</div>
                        <div class="rune-stat-value">
                            <span class="risk-badge ${riskClass}">${whale.riskScore}</span>
                        </div>
                    </div>
                </div>
                
                <div class="rune-card-footer">
                    <div>Última atividade: ${whale.lastActive}</div>
                    <div>${whale.transactions} transações</div>
                </div>
            `;
            
            whalesGrid.appendChild(whaleCard);
        });
        
        container.appendChild(whalesGrid);
        
        // Adicionar estatísticas gerais
        const statsDiv = document.createElement('div');
        statsDiv.className = 'whales-stats-summary';
        statsDiv.innerHTML = `
            <div class="stats-header">
                <h3>Resumo de Atividade de Whales</h3>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">48.7%</div>
                    <div class="stat-label">Concentração dos Top 50 Holders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">37.2M</div>
                    <div class="stat-label">Volume médio por transação</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value high-risk">Alto</div>
                    <div class="stat-label">Nível de Risco de Manipulação</div>
                </div>
            </div>
        `;
        
        container.appendChild(statsDiv);
    }
}

// Função para inicializar a seção de ranking de RUNES
function initRunesRanking() {
    console.log('Verificando inicialização do RUNES Ranking');

    // Não inicializamos mais o componente aqui, pois isso é feito pelo módulo ES6
    // Verificamos apenas se o container existe
        const container = document.getElementById('ranking-container');
        if (!container) {
            console.error('Container de ranking não encontrado!');
            return;
        }

    // Se necessário, podemos forçar uma atualização do componente existente
    if (window.runesRanking) {
        console.log('Componente de ranking já inicializado pelo módulo ES6');
    } else {
        console.log('Aguardando inicialização do componente de ranking pelo módulo ES6');
    }
}

// Função para atualizar a lista de top RUNES
function updateTopRunesList() {
    // Encontrar o container para a lista de RUNES
    const runesList = document.querySelector('.top-runes-list');
    if (!runesList) {
        console.error('Container .top-runes-list não encontrado');
        return;
    }
    
    console.log('Atualizando lista de top RUNES...');
    
    // Limpar container
    runesList.innerHTML = '';
    
    // Verificar se temos os dados de topRunes
    if (!topRunes || !Array.isArray(topRunes) || topRunes.length === 0) {
        console.error('Dados de topRunes não encontrados ou inválidos');
        runesList.innerHTML = '<div class="error-message">Dados não disponíveis</div>';
        return;
    }
    
    // Pegar os primeiros 3 RUNES do array e criar elementos para cada um
    topRunes.slice(0, 3).forEach(function(rune) {
        const runeItem = document.createElement('div');
        runeItem.className = 'rune-item';
        
        // Criar elementos para nome, preço e variação
        runeItem.innerHTML = `
            <div class="rune-name">${rune.ticker}</div>
            <div class="rune-price">${formatCurrency(rune.price)}</div>
            <div class="rune-change ${rune.change > 0 ? 'positive' : 'negative'}">${rune.change > 0 ? '+' : ''}${rune.change}%</div>
        `;
        
        // Adicionar o item à lista
        runesList.appendChild(runeItem);
    });
    
    console.log('Lista de top RUNES atualizada com sucesso');
}

// Melhorar função toggleSections para garantir que funcione corretamente
function toggleSections(sectionId) {
    console.log('Mudando para a seção:', sectionId);
    
    // Esconder todas as seções primeiro
    const allSections = document.querySelectorAll('section.section');
    allSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Mostrar a seção solicitada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log('Seção ativada:', sectionId);
        
        // Inicializar componentes específicos da seção
        initSectionComponents(sectionId);
        
        // Atualizar o estado da aplicação
        appState.currentSection = sectionId;
    } else {
        console.error('Seção não encontrada:', sectionId);
        
        // Fallback para o dashboard se a seção não for encontrada
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
            dashboardSection.classList.add('active');
            appState.currentSection = 'dashboard';
        }
    }
}

// Limpar recursos e listeners quando o componente é destruído
function destroyRunesRanking() {
    console.log('Destruindo componente RunesRanking...');
    
    // Remover event listeners para evitar memory leaks
    const metricSelect = document.getElementById('metric-select');
    const sortAscBtn = document.getElementById('sort-asc');
    const sortDescBtn = document.getElementById('sort-desc');
    const tableViewBtn = document.getElementById('table-view');
    const gridViewBtn = document.getElementById('grid-view');
    
    if (metricSelect) metricSelect.removeEventListener('change', window.handleMetricChange);
    if (sortAscBtn) sortAscBtn.removeEventListener('click', window.handleSortAsc);
    if (sortDescBtn) sortDescBtn.removeEventListener('click', window.handleSortDesc);
    if (tableViewBtn) tableViewBtn.removeEventListener('click', window.handleTableView);
    if (gridViewBtn) gridViewBtn.removeEventListener('click', window.handleGridView);
    
    // Limpar quaisquer timers ou WebSockets
    if (window.realtimeInterval) {
        clearInterval(window.realtimeInterval);
        window.realtimeInterval = null;
    }
}

/**
 * Inicializa os componentes avançados (Sentimento, Rastreador de Baleias)
 */
function initAdvancedComponents() {
    console.log('Inicializando componentes avançados...');
    
    // Usar o ComponentManager para todos os componentes avançados
    if (window.componentManager) {
        // Array de promessas para inicialização dos componentes
        const componentPromises = [
            window.componentManager.initComponent('RunesSentimentAnalysis'),
            window.componentManager.initComponent('RunesWhaleTracker'),
            window.componentManager.initComponent('RunesAnalysis'),
            window.componentManager.initComponent('RunesGamification')
        ];
        
        // Inicializar todos os componentes em paralelo
        Promise.allSettled(componentPromises)
            .then(results => {
                console.log('✅ Componentes avançados inicializados');
                
                // Verificar resultados individuais
                results.forEach((result, index) => {
                    const componentNames = ['RunesSentimentAnalysis', 'RunesWhaleTracker', 'RunesAnalysis', 'RunesGamification'];
                    if (result.status === 'fulfilled') {
                        console.log(`✅ ${componentNames[index]} inicializado com sucesso`);
                    } else {
                        console.warn(`⚠️ ${componentNames[index]} não pôde ser inicializado: ${result.reason}`);
                    }
                });
            });
    } else {
        // Fallback para os métodos antigos de inicialização
        if (window.RunesSentimentAnalysis) {
            window.runesSentiment = new RunesSentimentAnalysis();
            window.runesSentiment.initialize().then(() => {
                console.log('✅ Análise de sentimento inicializada com sucesso!');
            }).catch(() => {
            console.error('Componente RunesSentimentAnalysis não encontrado!');
            });
    }
    
        if (window.RunesWhaleTracker) {
            window.whaleTracker = new RunesWhaleTracker();
            window.whaleTracker.init();
            console.log('✅ Rastreador de baleias inicializado com sucesso!');
        } else {
            console.error('Componente RunesWhaleTracker não encontrado!');
    }
    
        if (window.RunesAnalysis) {
            window.runesAnalysis = new RunesAnalysis();
            window.runesAnalysis.initialize().then(() => {
                console.log('✅ Análise técnica inicializada com sucesso!');
            }).catch(() => {
            console.error('Componente RunesAnalysis não encontrado!');
            });
    }
    
        if (window.RunesGamification) {
            window.runesGamification = new RunesGamification();
            window.runesGamification.init();
            console.log('✅ Sistema de gamificação inicializado com sucesso!');
        } else {
            console.error('Componente RunesGamification não encontrado!');
        }
    }
}

/**
 * Inicializa o sistema de gerenciamento de sons
 */
function initSoundManager() {
    console.log('Inicializando sistema de gerenciamento de sons...');
    
    // Verificar se a classe está disponível
    if (typeof SoundManager === 'undefined') {
        console.error('Gerenciador de sons não encontrado!');
        return;
    }
    
    // Inicializar o gerenciador de sons
    const soundManager = new SoundManager();
    
    // Armazenar a instância para uso global
    window.runesSoundManager = soundManager;
    
    // Inicializar o componente
    soundManager.initialize();
    
    console.log('Sistema de som inicializado com sucesso!');
}

function initBasicComponents() {
    console.log('Inicializando componentes básicos...');
    
    // Inicializar ranking de RUNES
    initRanking();
    
    // Inicializar dashboard
    updateDashboardMetrics();
    createMockChart();
    
    // Inicializar sistema de alertas
    initAlertsSystem();
    
    // Inicializar seletor de timeframe
    initTimeframeButtons();
}
