/**
 * scripts.js - Funcionalidades gerais da aplicação
 * Parte do RUNES Analytics Pro
 */

import LZString from 'lz-string';

// Objeto principal da aplicação
const App = {
    // Configurações da aplicação
    config: {
        darkMode: false,
        chartPeriod: '7d',
        activeSection: 'dashboard',
        debug: false
    },

    // Inicialização da aplicação
    init() {
        console.log('Inicializando aplicação RUNES Analytics Pro...');
        
        // Inicializar componentes
        this.initDarkMode();
        this.initNavigation();
        this.initializeApiManager();
        
        // Carregar conteúdo inicial
        this.loadDashboard();
        
        console.log('Aplicação inicializada com sucesso!');
    },

    // Inicializa o sistema de navegação
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateTo(section);
            });
        });
        
        // Adiciona listeners para botões móveis
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }
    },

    // Inicializa o sistema de API e cache
    initializeApiManager() {
        if (typeof ApiManager === 'undefined') {
            console.error('ApiManager não encontrado. Verificando alternativas...');
            
            // Se ApiManager não estiver disponível, criar um mock básico
            window.ApiManager = {
                init() {
                    console.log('ApiManager mock inicializado');
                    return this;
                },
                fetchData(endpoint, params = {}) {
                    console.log(`Mock: Buscando dados de ${endpoint}`, params);
                    return Promise.resolve({ success: true, data: [] });
                },
                getTokens() {
                    return Promise.resolve([]);
                },
                getMarketData() {
                    return Promise.resolve({});
                }
            };
            
            console.warn('ApiManager mock criado como fallback temporário');
        }
        
        // Inicializa o gerenciador de API - não chamar .init() já que essa função não existe
        // e a classe já é autoinstanciada no DOM ready 
        console.log('ApiManager verificado com sucesso');
    },

    // Carrega o tema escuro/claro
    initDarkMode() {
        // Verifica preferência salva ou preferência do sistema
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.config.darkMode = savedMode ? savedMode === 'true' : prefersDark;
        this.toggleDarkMode(this.config.darkMode);
        
        // Adiciona listener para o botão de alternar tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.config.darkMode = !this.config.darkMode;
                this.toggleDarkMode(this.config.darkMode);
                localStorage.setItem('darkMode', this.config.darkMode);
            });
        }
    },

    // Alterna entre modo claro e escuro
    toggleDarkMode(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        
        // Atualiza ícone do botão de tema se existir
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // Navegação entre seções
    navigateTo(section) {
        // Oculta todas as seções
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });
        
        // Remove classe ativa de todos os links
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostra a seção selecionada
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Adiciona classe ativa ao link correspondente
            const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            
            // Atualiza seção ativa
            this.config.activeSection = section;
            
            // Carrega dados específicos da seção
            this.loadSectionData(section);
        }
    },

    // Carrega dados específicos para cada seção
    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'tokens':
                // Se RunesExplorer estiver disponível, inicializa
                if (typeof RunesExplorer !== 'undefined') {
                    RunesExplorer.initialize();
                }
                break;
            case 'whale-tracker':
                // Se WhaleDetector estiver disponível, inicializa
                if (typeof WhaleDetector !== 'undefined') {
                    WhaleDetector.initialize();
                }
                break;
            case 'social':
                // Se SocialAnalytics estiver disponível, inicializa
                if (typeof SocialAnalytics !== 'undefined') {
                    SocialAnalytics.initialize();
                }
                break;
            case 'achievements':
                // Se GamificationSystem estiver disponível, carrega conquistas
                if (typeof GamificationSystem !== 'undefined') {
                    GamificationSystem.loadAchievements();
                }
                break;
        }
    },

    // Carrega dashboard com dados
    loadDashboard() {
        console.log('Carregando dashboard...');
        if (typeof window.apiManager !== 'undefined') {
            window.apiManager.getMarketData()
                .then(data => {
                    App.updateDashboardWidgets(data);
                    alert('Dados do dashboard carregados com sucesso!');
                })
                .catch(err => {
                    console.error('Erro ao carregar dados do dashboard:', err);
                    alert('Erro ao carregar dados. Por favor, tente novamente.');
                });
        } else {
            console.error('ApiManager global não encontrado');
        }
    },

    // Atualiza widgets do dashboard com dados
    updateDashboardWidgets(data) {
        // Implementação básica de atualização de widgets
        console.log('Atualizando widgets com dados:', data);
    }
};

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Função para salvar dados no cache com compressão
function saveToCache(key, data) {
    const compressedData = LZString.compress(JSON.stringify(data));
    // Código para salvar compressedData no IndexedDB
}

// Função para recuperar dados do cache com descompressão
function loadFromCache(key) {
    // Código para recuperar compressedData do IndexedDB
    const compressedData = /* código para obter dados do IndexedDB */;
    return JSON.parse(LZString.decompress(compressedData));
}

function preLoadFrequentData() {
    const frequentDataKeys = ['key1', 'key2', 'key3']; // Exemplo de chaves de dados frequentes
    frequentDataKeys.forEach(key => {
        if (!isDataInCache(key)) {
            fetchDataAndCache(key);
        }
    });
}

function isDataInCache(key) {
    // Verifica se os dados estão no cache
}

function fetchDataAndCache(key) {
    // Busca dados da API e armazena no cache
}

// Chamar preLoadFrequentData durante o tempo ocioso
window.addEventListener('load', () => {
    setTimeout(preLoadFrequentData, 5000); // 5 segundos após o carregamento
});

// Função para compartilhar análise
function shareAnalysis() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copiada para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar URL:', err);
        alert('Não foi possível copiar a URL. Tente novamente.');
    });
} 