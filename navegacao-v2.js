// Script de navegação aprimorado - navegacao-v2.js
console.log("✅ Inicializando sistema de navegação v2...");

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM carregado, configurando navegação...");
    
    // Configurar navegação por seções
    setupNavigation();
    
    // Mostrar seção padrão
    mostrarSecao('dashboard-section');
});

function setupNavigation() {
    console.log("✅ Configurando links de navegação");
    
    // Adicionar event listeners para todos os links de menu
    const menuLinks = document.querySelectorAll('.sidebar-menu a, .nav-link');
    console.log(`📌 Encontrados ${menuLinks.length} links no menu`);
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log(`🔗 Link clicado: ${this.textContent.trim()} - href: ${this.getAttribute('href')}`);
            
            // Obter seção alvo do atributo href ou data-target
            const targetId = this.getAttribute('href')?.replace('#', '') || 
                           this.getAttribute('data-target');
            
            if (targetId) {
                console.log(`🎯 Target ID: ${targetId}`);
                
                // Marcar link atual como ativo
                menuLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar a seção correspondente
                mostrarSecao(targetId);
            }
        });
    });
    
    // Adicionar event listener para botão de toggle do sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        console.log("✅ Configurando botão de toggle do sidebar");
        sidebarToggle.addEventListener('click', function() {
            console.log("🔄 Toggle sidebar clicado");
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
                document.querySelector('.main-content').classList.toggle('expanded');
            }
        });
    } else {
        console.warn("⚠️ Botão de toggle do sidebar não encontrado");
    }
}

function mostrarSecao(sectionId) {
    console.log(`🔍 Mostrando seção: ${sectionId}`);
    
    // Mapear IDs de seção para IDs reais usados no código
    const sectionMappings = {
        'dashboard': 'dashboard-section',
        'sentiment': 'sentiment-section',
        'whale-tracker': 'whale-tracker-section',
        'technical-analysis': 'technical-analysis-section',
        'ranking': 'ranking-section',
        'gamification': 'gamification-section',
        'alerts': 'alerts-section',
        'market-data': 'market-data-section',
        'settings': 'settings-section'
    };
    
    // Obter ID correto da seção
    const targetId = sectionMappings[sectionId] || sectionId;
    console.log(`🎯 ID mapeado: ${targetId}`);
    
    // Obter todas as seções de conteúdo
    const contentSections = document.querySelectorAll('.content-section');
    console.log(`📌 Encontradas ${contentSections.length} seções de conteúdo`);
    
    // Esconder todas as seções
    contentSections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção alvo
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        console.log(`✅ Seção ${targetId} encontrada, exibindo...`);
        targetSection.classList.remove('hidden');
        
        // Atualizar estado global da aplicação
        if (window.appState) {
            window.appState.currentSection = sectionId;
        }
        
        // Inicializar componentes específicos da seção conforme necessário
        initializeComponents(targetId);
    } else {
        console.error(`❌ Seção com ID ${targetId} não encontrada`);
        
        // Mostrar a primeira seção disponível como fallback
        if (contentSections.length > 0) {
            console.warn(`⚠️ Usando primeira seção como fallback: ${contentSections[0].id}`);
            contentSections[0].classList.remove('hidden');
        }
    }
    
    // Atualizar título da página
    updatePageTitle(targetId);
}

function initializeComponents(sectionId) {
    console.log(`🔄 Inicializando componentes para a seção: ${sectionId}`);
    
    // Verificar se o ComponentManager está disponível
    if (window.componentManager) {
        switch(sectionId) {
            case 'sentiment-section':
                window.componentManager.initComponent('RunesSentimentAnalysis')
                    .then(instance => {
                        console.log('📊 Atualizando análise de sentimentos...');
                        // Forçar atualização dos dados
                        if (instance && typeof instance.loadSentimentData === 'function') {
                            instance.loadSentimentData().then(() => {
                                console.log('✅ Dados de sentimento atualizados');
                            });
                        }
                    })
                    .catch(error => {
                        console.error('❌ Componente de análise de sentimento não disponível:', error);
                    });
                break;
                
            case 'whale-tracker-section':
                window.componentManager.initComponent('RunesWhaleTracker')
                    .then(instance => {
                        console.log('🐳 Atualizando rastreador de baleias...');
                        // Atualizar dados do rastreador de baleias
                        if (instance && typeof instance.updateUI === 'function') {
                            instance.updateUI();
                        }
                    })
                    .catch(error => {
                        console.error('❌ Componente de rastreador de baleias não disponível:', error);
                    });
                break;
                
            case 'technical-analysis-section':
                window.componentManager.initComponent('RunesAnalysis')
                    .then(instance => {
                        console.log('📈 Carregando análise técnica...');
                        // Inicializar gráficos ou carregar novos dados
                        if (instance && typeof instance.updateTokenInfo === 'function') {
                            instance.updateTokenInfo();
                        }
                    })
                    .catch(error => {
                        console.error('❌ Componente de análise técnica não disponível:', error);
                    });
                break;
                
            case 'gamification-section':
                window.componentManager.initComponent('RunesGamification')
                    .then(instance => {
                        console.log('🎮 Atualizando sistema de gamificação...');
                        // Atualizar dados de gamificação
                        if (instance && typeof instance.updateXPProgress === 'function') {
                            instance.updateXPProgress();
                        }
                    })
                    .catch(error => {
                        console.error('❌ Componente de gamificação não disponível:', error);
                    });
                break;
                
            case 'ranking-section':
                if (window.runesRanking) {
                    console.log('🏆 Atualizando ranking de RUNES...');
                    // Atualizar rankings
                    window.runesRanking.updateRanking();
                } else if (typeof initRunesRanking === 'function') {
                    console.log('🏆 Inicializando ranking via função global...');
                    initRunesRanking();
                } else {
                    console.error('❌ Componente de ranking não encontrado');
                }
                break;
                
            case 'alerts-section':
                console.log('🔔 Carregando sistema de alertas...');
                // Atualizar lista de alertas
                if (typeof updateAlertsList === 'function') {
                    updateAlertsList();
                } else {
                    console.error('❌ Função updateAlertsList não encontrada');
                }
                break;
                
            case 'dashboard-section':
                console.log('📊 Atualizando dashboard...');
                if (typeof updateDashboardMetrics === 'function') {
                    updateDashboardMetrics();
                }
                if (typeof createMockChart === 'function') {
                    createMockChart();
                }
                break;
                
            case 'market-data-section':
                console.log('📊 Carregando dados de mercado...');
                if (typeof loadMarketData === 'function') {
                    loadMarketData();
                }
                break;
                
            default:
                console.log(`ℹ️ Sem inicialização específica para seção: ${sectionId}`);
        }
    } else {
        // Fallback para o método antigo quando o ComponentManager não está disponível
    switch(sectionId) {
        case 'sentiment-section':
            if (window.runesSentiment) {
                console.log('📊 Atualizando análise de sentimentos...');
                // Forçar atualização dos dados
                window.runesSentiment.loadSentimentData().then(() => {
                    console.log('✅ Dados de sentimento atualizados');
                });
            } else {
                console.error('❌ Componente runesSentiment não encontrado');
            }
            break;
            
        case 'whale-tracker-section':
            if (window.whaleTracker) {
                console.log('🐳 Atualizando rastreador de baleias...');
                // Atualizar dados do rastreador de baleias
                window.whaleTracker.updateUI();
            } else {
                console.error('❌ Componente whaleTracker não encontrado');
            }
            break;
            
        case 'technical-analysis-section':
            if (window.runesAnalysis) {
                console.log('📈 Carregando análise técnica...');
                // Inicializar gráficos ou carregar novos dados
                window.runesAnalysis.updateTokenInfo();
            } else {
                console.error('❌ Componente runesAnalysis não encontrado');
            }
            break;
            
        case 'ranking-section':
            if (window.runesRanking) {
                console.log('🏆 Atualizando ranking de RUNES...');
                // Atualizar rankings
                window.runesRanking.updateRanking();
            } else if (typeof initRunesRanking === 'function') {
                console.log('🏆 Inicializando ranking via função global...');
                initRunesRanking();
            } else {
                console.error('❌ Componente de ranking não encontrado');
            }
            break;
            
        case 'gamification-section':
            if (window.runesGamification) {
                console.log('🎮 Atualizando sistema de gamificação...');
                // Atualizar dados de gamificação
                window.runesGamification.updateXPProgress();
            } else {
                console.error('❌ Componente runesGamification não encontrado');
            }
            break;
            
        case 'alerts-section':
            console.log('🔔 Carregando sistema de alertas...');
            // Atualizar lista de alertas
            if (typeof updateAlertsList === 'function') {
                updateAlertsList();
            } else {
                console.error('❌ Função updateAlertsList não encontrada');
            }
            break;
            
        case 'dashboard-section':
            console.log('📊 Atualizando dashboard...');
            if (typeof updateDashboardMetrics === 'function') {
                updateDashboardMetrics();
            }
            if (typeof createMockChart === 'function') {
                createMockChart();
            }
            break;
            
        case 'market-data-section':
            console.log('📊 Carregando dados de mercado...');
            if (typeof loadMarketData === 'function') {
                loadMarketData();
            }
            break;
        }
    }
    
    // Disparar evento personalizado para notificar outros componentes
    document.dispatchEvent(new CustomEvent('sectionChanged', { 
        detail: { section: sectionId }
    }));
}

function updatePageTitle(sectionId) {
    // Mapear IDs para títulos amigáveis
    const sectionTitles = {
        'dashboard-section': 'Dashboard | RUNES Analytics Pro',
        'sentiment-section': 'Análise de Sentimentos | RUNES Analytics Pro',
        'whale-tracker-section': 'Rastreador de Baleias | RUNES Analytics Pro',
        'technical-analysis-section': 'Análise Técnica | RUNES Analytics Pro',
        'ranking-section': 'Ranking RUNES | RUNES Analytics Pro',
        'gamification-section': 'Gamificação | RUNES Analytics Pro',
        'alerts-section': 'Sistema de Alertas | RUNES Analytics Pro',
        'market-data-section': 'Dados de Mercado | RUNES Analytics Pro',
        'settings-section': 'Configurações | RUNES Analytics Pro'
    };
    
    // Atualizar título da aba
    document.title = sectionTitles[sectionId] || 'RUNES Analytics Pro';
    
    // Atualizar título da página visível (se existir um elemento para isso)
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = sectionTitles[sectionId]?.split(' | ')[0] || 'RUNES Analytics Pro';
    }
    
    console.log(`📝 Título da página atualizado: ${document.title}`);
}