/**
 * Explorador de Tokens Runes
 * Interface interativa para explorar e analisar tokens Runes
 */
class RunesExplorer {
    constructor() {
        this.apiManager = window.apiManager || new ApiManager();
        this.config = {
            containerSelector: '#runes-explorer',
            cardAnimationDelay: 50,
            filterDebounceTime: 300,
            sortOptions: [
                { id: 'marketCap', label: 'Capitalização de Mercado', direction: 'desc' },
                { id: 'price', label: 'Preço', direction: 'desc' },
                { id: 'change24h', label: 'Mudança 24h', direction: 'desc' },
                { id: 'volume', label: 'Volume 24h', direction: 'desc' },
                { id: 'holders', label: 'Holders', direction: 'desc' },
                { id: 'name', label: 'Nome', direction: 'asc' }
            ],
            defaultSortOption: 'marketCap',
            cacheTTL: 5 * 60 * 1000 // 5 minutos em milissegundos
        };
        
        // Estado do explorador
        this.state = {
            tokens: [],
            filteredTokens: [],
            selectedToken: null,
            filterText: '',
            sortBy: this.config.defaultSortOption,
            sortDirection: 'desc',
            view: 'grid', // 'grid' ou 'table'
            page: 1,
            itemsPerPage: 12,
            isLoading: true,
            initialized: false,
            totalTokens: 0,
            totalPages: 1,
            previousTokens: null // Para comparações de alterações de preço
        };
        
        // Configurações de lazy loading
        this.lazyLoadConfig = {
            enabled: true,
            threshold: 0.2, // O quanto do elemento precisa estar visível para carregar mais
            observer: null,
            loadingMore: false
        };
        
        // Inicializar quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    /**
     * Inicializa o explorador
     */
    async initialize() {
        try {
            this.showLoadingIndicator();
            
            // Verificar se o IndexedDB está disponível e configurado
            this.setupCache();
            
            // Carregar preferências do usuário
            this.loadUserPreferences();
            
            // Configurar elementos da interface
            this.setupUIElements();
            
            // Adicionar event listeners
            this.setupEventListeners();
            
            // Inicializar sistema de gamificação
            this.initializeGamification();
            
            // Configurar intersection observer para lazy loading
            if (this.lazyLoadConfig.enabled) {
                this.setupLazyLoading();
            }
            
            // Limpar cache expirado periodicamente
            this.setupCacheCleanupTask();
            
            // Adicionar ferramentas de desenvolvimento em ambiente local
            this.addDevTools();
            
            // Carregar primeira página de tokens
            await this.loadPagedTokens(1);
            
            // Inicializar paginação
            this.updatePaginationControls();
            this.updatePaginationVisibility();
            
            // Esconder indicador de carregamento
            this.hideLoadingIndicator();
            
            // Mostrar versão do cache na interface
            this.showCacheStats();
        } catch (error) {
            console.error('Erro ao inicializar o explorador de tokens:', error);
            this.state.error = 'Não foi possível carregar os tokens. Tente novamente mais tarde.';
            this.hideLoadingIndicator();
            this.showErrorMessage(this.state.error);
        }
    }
    
    /**
     * Configura o sistema de cache
     */
    setupCache() {
        // Verificar se o IndexedDB Cache está disponível
        this.dbCache = window.dbCache;
        
        if (!this.dbCache || !this.dbCache.isReady()) {
            console.warn('IndexedDB não disponível, usando cache em memória como fallback');
            // Manter a compatibilidade com o cache antigo em memória
            this.dbCache = this.createMemoryCacheFallback();
        } else {
            console.log('✅ Usando IndexedDB para cache persistente');
        }
    }
    
    /**
     * Cria um fallback de cache em memória caso o IndexedDB não esteja disponível
     * @returns {Object} Interface de cache compatível com IndexedDB
     */
    createMemoryCacheFallback() {
        const memoryCache = {
            data: {},
            timestamp: {},
            
            isReady() { return true; },
            
            async get(key) {
                const now = Date.now();
                const item = this.data[key];
                const ts = this.timestamp[key];
                
                if (!item || !ts) return null;
                
                // Verificar expiração
                const age = now - ts;
                if (age > this.config?.cacheTTL) {
                    console.log(`🕒 Cache expirado para: ${key}`);
                    delete this.data[key];
                    delete this.timestamp[key];
                    return null;
                }
                
                console.log(`🔄 Usando dados em cache para: ${key}`);
                return item;
            },
            
            async set(key, data) {
                this.data[key] = JSON.parse(JSON.stringify(data)); // Deep clone
                this.timestamp[key] = Date.now();
                console.log(`📝 Dados armazenados em cache: ${key}`);
            },
            
            async delete(key) {
                delete this.data[key];
                delete this.timestamp[key];
                console.log(`🧹 Cache limpo para: ${key}`);
            },
            
            async clear() {
                this.data = {};
                this.timestamp = {};
                console.log('🧹 Cache completamente limpo');
            },
            
            async getStats() {
                const keys = Object.keys(this.data);
                return {
                    totalItems: keys.length,
                    storeName: 'memoryCache',
                    sizeKB: 'N/A (memória)'
                };
            }
        };
        
        return memoryCache;
    }
    
    /**
     * Configura tarefa de limpeza periódica do cache
     */
    setupCacheCleanupTask() {
        // Limpar cache expirado a cada 30 minutos
        setInterval(() => {
            try {
                console.log('Iniciando limpeza programada do cache...');
                if (this.dbCache && this.dbCache.isReady()) {
                    this.dbCache.clear(true) // Limpar apenas itens expirados
                        .then(() => console.log('Limpeza programada de cache concluída'))
                        .catch(err => console.error('Erro na limpeza programada:', err));
                }
            } catch (e) {
                console.warn('Erro na tarefa de limpeza de cache:', e);
            }
        }, 30 * 60 * 1000); // 30 minutos
    }
    
    /**
     * Mostra estatísticas do cache na interface
     */
    async showCacheStats() {
        try {
            if (this.dbCache && this.dbCache.isReady()) {
                const stats = await this.dbCache.getStats();
                console.info('📊 Estatísticas do cache:', stats);
                
                // Encontrar elemento para exibir estatísticas (opcional)
                const statsEl = document.querySelector('.cache-stats');
                if (statsEl) {
                    statsEl.innerHTML = `
                        <small>Cache: ${stats.totalItems} itens (${stats.sizeKB}KB)</small>
                    `;
                }
            }
        } catch (e) {
            console.warn('Erro ao obter estatísticas do cache:', e);
        }
    }
    
    /**
     * Configura e referencia os elementos da interface
     */
    setupUIElements() {
        // Elementos principais
        this.elements = {
            gridContainer: document.querySelector('.tokens-grid-container'),
            grid: document.querySelector('.tokens-grid'),
            tableContainer: document.querySelector('.tokens-table-container'),
            tableBody: document.querySelector('.tokens-table tbody'),
            loadingIndicator: document.querySelector('.loading-indicator'),
            searchInput: document.getElementById('token-search'),
            sortSelect: document.getElementById('sort-select'),
            sortDirection: document.querySelector('.sort-direction'),
            tokenCount: document.getElementById('tokens-count'),
            paginationContainer: document.querySelector('.pagination-container'),
            currentPage: document.getElementById('current-page'),
            totalPages: document.getElementById('total-pages'),
            prevPageBtn: document.getElementById('prev-page'),
            nextPageBtn: document.getElementById('next-page'),
            viewToggleBtns: document.querySelectorAll('.view-toggle'),
            filterInputs: document.querySelectorAll('.token-filter')
        };
        
        // Adicionar controle de lazy loading na interface
        this.addLazyLoadingToggle();
    }
    
    /**
     * Adiciona controle para ativar/desativar lazy loading
     */
    addLazyLoadingToggle() {
        // Verificar se o container de paginação existe
        if (!this.elements.paginationContainer) return;
        
        // Adicionar classe indicando estado do lazy loading
        if (this.lazyLoadConfig.enabled) {
            this.elements.paginationContainer.classList.add('lazy-enabled');
        }
        
        // Criar botão para toggle
        const toggleButton = document.createElement('button');
        toggleButton.className = 'btn-toggle-lazy';
        toggleButton.innerHTML = this.lazyLoadConfig.enabled ? 
            '<i class="fas fa-toggle-on"></i> Rolagem Infinita' : 
            '<i class="fas fa-toggle-off"></i> Paginação Manual';
        
        // Adicionar ao container de paginação
        this.elements.paginationContainer.appendChild(toggleButton);
        
        // Adicionar evento de clique
        toggleButton.addEventListener('click', () => {
            this.toggleLazyLoading();
            
            // Atualizar texto do botão
            toggleButton.innerHTML = this.lazyLoadConfig.enabled ? 
                '<i class="fas fa-toggle-on"></i> Rolagem Infinita' : 
                '<i class="fas fa-toggle-off"></i> Paginação Manual';
                
            // Atualizar classe do container
            if (this.lazyLoadConfig.enabled) {
                this.elements.paginationContainer.classList.add('lazy-enabled');
            } else {
                this.elements.paginationContainer.classList.remove('lazy-enabled');
            }
            
            // Mostrar notificação
            this.showNotification(
                this.lazyLoadConfig.enabled ? 
                'Rolagem infinita ativada. Role a página para carregar mais tokens.' : 
                'Paginação manual ativada.',
                'info'
            );
            
            // Se ativar lazy loading, configurar observer
            if (this.lazyLoadConfig.enabled) {
                this.setupLazyLoading();
                this.updateLazyLoadingObserver();
            } else if (this.lazyLoadConfig.observer) {
                // Se desativar, desconectar observer
                this.lazyLoadConfig.observer.disconnect();
            }
        });
    }
    
    /**
     * Alterna o modo de lazy loading
     */
    toggleLazyLoading() {
        this.lazyLoadConfig.enabled = !this.lazyLoadConfig.enabled;
        
        // Atualizar visibilidade dos botões de paginação
        this.updatePaginationVisibility();
        
        // Atualizar elemento localStorage para lembrar preferência
        try {
            localStorage.setItem('runesExplorer_lazyLoadEnabled', 
                this.lazyLoadConfig.enabled ? 'true' : 'false');
        } catch (e) {
            console.warn('Não foi possível salvar preferência:', e);
        }
    }
    
    /**
     * Atualiza a visibilidade dos botões de paginação baseado no modo
     */
    updatePaginationVisibility() {
        if (!this.elements.prevPageBtn || !this.elements.nextPageBtn) return;
        
        // No modo lazy loading, esconder botões de página
        const display = this.lazyLoadConfig.enabled ? 'none' : 'block';
        this.elements.prevPageBtn.style.display = display;
        this.elements.nextPageBtn.style.display = display;
    }
    
    /**
     * Inicializa configurações do usuário a partir do localStorage
     */
    loadUserPreferences() {
        try {
            // Carregar preferência de lazy loading
            const lazyLoadEnabled = localStorage.getItem('runesExplorer_lazyLoadEnabled');
            if (lazyLoadEnabled !== null) {
                this.lazyLoadConfig.enabled = lazyLoadEnabled === 'true';
            }
            
            // Carregar outras preferências salvas...
            
        } catch (e) {
            console.warn('Erro ao carregar preferências:', e);
        }
    }
    
    /**
     * Configura o Intersection Observer para lazy loading
     */
    setupLazyLoading() {
        // Se já temos um observer, desconectar
        if (this.lazyLoadConfig.observer) {
            this.lazyLoadConfig.observer.disconnect();
        }
        
        // Criar novo observador
        this.lazyLoadConfig.observer = new IntersectionObserver((entries) => {
            // Se o elemento de carga estiver visível e não estamos já carregando mais
            if (entries[0].isIntersecting && !this.lazyLoadConfig.loadingMore && !this.state.isLoading) {
                // Se temos mais páginas para carregar
                if (this.state.page < this.state.totalPages) {
                    console.log('🔄 Lazy loading: carregando mais tokens...');
                    this.lazyLoadConfig.loadingMore = true;
                    this.loadPagedTokens(this.state.page + 1).finally(() => {
                        this.lazyLoadConfig.loadingMore = false;
                    });
                }
            }
        }, {
            root: null, // viewport
            rootMargin: '0px 0px 300px 0px', // começar a carregar quando estiver a 300px do final
            threshold: this.lazyLoadConfig.threshold
        });
    }
    
    /**
     * Carrega tokens paginados da API com suporte a cache
     * @param {number} page - Número da página a carregar
     */
    async loadPagedTokens(page) {
        try {
            // Se estivermos fazendo lazy loading e a página for maior que 1,
            // não atualizar o estado de carregamento para a página inteira
            if (page === 1 || !this.lazyLoadConfig.loadingMore) {
                this.state.isLoading = true;
            }
            
            this.state.page = page;
            
            // Atualizar indicadores visuais de carregamento
            if (page === 1) {
                this.showLoadingIndicator();
            } else if (this.lazyLoadConfig.loadingMore) {
                // Se for lazy loading, mostrar indicador específico
                this.showLazyLoadingIndicator();
            } else {
                // Se for mudança manual de página
                this.showPageLoadingIndicator();
            }
            
            // Obter parâmetros de filtro e ordenação
            const params = this.getRequestParams();
            
            // Construir chave de cache baseada nos parâmetros
            const cacheKey = this.buildCacheKey(params);
            
            // Verificar se temos dados em cache
            let result = await this.dbCache.get(cacheKey);
            let fromCache = !!result;
            
            // Se não temos cache, buscar da API
            if (!result) {
                result = await this.apiManager.getRunesRanking(params);
                
                // Armazenar no cache
                if (result && result.tokens) {
                    await this.dbCache.set(cacheKey, result, this.config.cacheTTL);
                }
            }
            
            // Guardar tokens anteriores para comparações
            const previousTokens = [...this.state.tokens];
            
            // Se for lazy loading, adicionar aos tokens existentes
            if (this.lazyLoadConfig.loadingMore && page > 1) {
                // Processar os novos tokens e comparar com os existentes
                const newTokens = this.processTokensForDisplay(result.tokens || [], previousTokens);
                // Concatenar os novos tokens aos existentes
                this.state.tokens = [...this.state.tokens, ...newTokens];
            } else {
                // Caso contrário, substituir os tokens existentes
                this.state.tokens = this.processTokensForDisplay(result.tokens || [], previousTokens);
            }
            
            this.state.totalTokens = result.totalCount || this.state.tokens.length;
            this.state.totalPages = Math.ceil(this.state.totalTokens / this.state.itemsPerPage);
            
            // Atualizar contagem visível para o usuário
            if (this.elements.tokenCount) {
                this.elements.tokenCount.textContent = this.state.totalTokens;
            }
            
            // Atrasos diferentes para cache vs API
            const delay = fromCache ? 100 : 300;
            
            // Atualizar interface após o delay
            setTimeout(() => {
                // Se for lazy loading, apenas anexar novos tokens
                if (this.lazyLoadConfig.loadingMore && page > 1) {
                    this.appendNewTokens(result.tokens);
                } else {
                    // Caso contrário, atualizar a visualização toda
                    this.updateView();
                }
                
                this.state.isLoading = false;
                this.hidePageLoadingIndicator();
                this.hideLoadingIndicator();
                this.hideLazyLoadingIndicator();
                
                // Atualizar controles de paginação
                this.updatePaginationControls();
            }, delay);
            
        } catch (error) {
            console.error('Erro ao carregar tokens:', error);
            this.state.error = 'Falha ao carregar tokens. Tente novamente.';
            this.state.isLoading = false;
            this.hideLoadingIndicator();
            this.hidePageLoadingIndicator();
            this.hideLazyLoadingIndicator();
            this.showErrorMessage(this.state.error);
        }
    }
    
    /**
     * Constrói uma chave de cache baseada nos parâmetros da requisição
     * @param {Object} params - Parâmetros da requisição
     * @returns {string} Chave de cache
     */
    buildCacheKey(params) {
        const { page, limit, sortBy, sortDirection, search } = params;
        // Criar string com todos os filtros
        const filtersStr = params.filters ? 
            Object.entries(params.filters).map(([k, v]) => `${k}:${v}`).join(',') : '';
        
        // Criar chave única que identifique este conjunto de parâmetros
        return `tokens_p${page}_l${limit}_s${sortBy}_d${sortDirection}_q${search || ''}_f${filtersStr}`;
    }
    
    /**
     * Processa tokens para exibição, adicionando classes para animações de mudança de preço
     * @param {Array} newTokens - Novos tokens a serem exibidos
     * @param {Array} oldTokens - Tokens antigos para comparação
     * @returns {Array} Tokens processados com classes adicionais
     */
    processTokensForDisplay(newTokens, oldTokens) {
        if (!newTokens || !newTokens.length) return [];
        if (!oldTokens || !oldTokens.length) return newTokens;
        
        // Criar mapa para consulta rápida
        const oldTokensMap = {};
        oldTokens.forEach(token => {
            oldTokensMap[token.id] = token;
        });
        
        // Processar novos tokens e adicionar classes para animação
        return newTokens.map(token => {
            const oldToken = oldTokensMap[token.id];
            
            // Se não temos o token antigo, retornar sem modificações
            if (!oldToken) return token;
            
            // Copiar token para não modificar o original (já que pode estar em cache)
            const processedToken = {...token};
            
            // Verificar mudanças no preço e adicionar classes para animação
            if (parseFloat(processedToken.price) > parseFloat(oldToken.price)) {
                processedToken.priceChangeClass = 'price-changed-up';
            } else if (parseFloat(processedToken.price) < parseFloat(oldToken.price)) {
                processedToken.priceChangeClass = 'price-changed-down';
            }
            
            return processedToken;
        });
    }
    
    /**
     * Obtém parâmetros de requisição baseados no estado atual
     * @returns {Object} Parâmetros para a API
     */
    getRequestParams() {
        return {
            page: this.state.page,
            limit: this.state.itemsPerPage,
            sortBy: this.state.sortBy,
            sortDirection: this.state.sortDirection,
            search: this.state.filterText,
            filters: this.getActiveFilters()
        };
    }
    
    /**
     * Obtém filtros ativos do formulário
     * @returns {Object} Filtros ativos
     */
    getActiveFilters() {
        const filters = {};
        
        if (!this.elements.filterInputs) return filters;
        
        this.elements.filterInputs.forEach(input => {
            const filterType = input.dataset.filter;
            const value = input.value;
            
            if (value && value !== 'all') {
                filters[filterType] = value;
                
                // Registrar uso no sistema de gamificação
                if (window.gamification) {
                    window.gamification.registerFilterUse(filterType);
                }
            }
        });
        
        return filters;
    }
    
    /**
     * Mostra um indicador de carregamento de página
     */
    showPageLoadingIndicator() {
        // Adicionar classe de loading à tabela ou grid
        if (this.state.view === 'grid' && this.elements.grid) {
            this.elements.grid.classList.add('loading');
        } else if (this.elements.tableBody) {
            this.elements.tableBody.classList.add('loading');
        }
        
        // Desabilitar botões de paginação
        if (this.elements.prevPageBtn) this.elements.prevPageBtn.disabled = true;
        if (this.elements.nextPageBtn) this.elements.nextPageBtn.disabled = true;
    }
    
    /**
     * Esconde o indicador de carregamento de página
     */
    hidePageLoadingIndicator() {
        // Remover classe de loading
        if (this.elements.grid) this.elements.grid.classList.remove('loading');
        if (this.elements.tableBody) this.elements.tableBody.classList.remove('loading');
        
        // Habilitar botões de paginação conforme necessário
        this.updatePaginationControls();
    }
    
    /**
     * Atualiza os controles de paginação
     */
    updatePaginationControls() {
        if (!this.elements.paginationContainer) return;
        
        const { page, totalPages } = this.state;
        
        // Atualizar textos
        if (this.elements.currentPage) this.elements.currentPage.textContent = page;
        if (this.elements.totalPages) this.elements.totalPages.textContent = totalPages;
        
        // Atualizar estado dos botões
        if (this.elements.prevPageBtn) this.elements.prevPageBtn.disabled = page <= 1;
        if (this.elements.nextPageBtn) this.elements.nextPageBtn.disabled = page >= totalPages;
        
        // Mostrar/ocultar paginação
        this.elements.paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
    }
    
    /**
     * Mostra mensagem de erro na interface
     * @param {string} message - Mensagem de erro
     */
    showErrorMessage(message) {
        // Criar elemento de erro
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="btn-retry">Tentar novamente</button>
        `;
        
        // Inserir na interface
        if (this.state.view === 'grid' && this.elements.gridContainer) {
            this.elements.gridContainer.appendChild(errorEl);
        } else if (this.elements.tableContainer) {
            this.elements.tableContainer.appendChild(errorEl);
        }
        
        // Adicionar listener para botão de retry
        const retryBtn = errorEl.querySelector('.btn-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                errorEl.remove();
                this.loadPagedTokens(1);
            });
        }
    }
    
    /**
     * Atualiza a visualização com base no estado atual
     */
    updateView() {
        if (this.state.isLoading && this.state.page === 1) {
            this.showLoadingIndicator();
            return;
        } else {
            this.hideLoadingIndicator();
        }
        
        // Atualizar contadores
        if (this.elements.tokenCount) {
            this.elements.tokenCount.textContent = this.state.totalTokens;
        }
        
        // Atualizar paginação
        this.updatePaginationControls();
        
        // Mostrar visualização adequada
        if (this.elements.gridContainer && this.elements.tableContainer) {
            if (this.state.view === 'grid') {
                this.elements.gridContainer.style.display = 'block';
                this.elements.tableContainer.style.display = 'none';
                this.renderGrid();
            } else {
                this.elements.gridContainer.style.display = 'none';
                this.elements.tableContainer.style.display = 'block';
                this.renderTable();
            }
        }
        
        // Atualizar estilos dos botões de visualização
        if (this.elements.viewToggleBtns) {
            this.elements.viewToggleBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === this.state.view);
            });
        }
        
        // Se não houver tokens, mostrar mensagem
        if (this.state.tokens.length === 0) {
            this.showEmptyState();
        }
        
        // Atualizar o observador para lazy loading após renderizar os tokens
        this.updateLazyLoadingObserver();
    }
    
    /**
     * Atualiza o observador para o lazy loading após renderizar conteúdo
     */
    updateLazyLoadingObserver() {
        if (!this.lazyLoadConfig.enabled || !this.lazyLoadConfig.observer) return;
        
        // Observar último token ou elemento sinalizador de "carregar mais"
        let targetElement;
        
        if (this.state.view === 'grid') {
            // Observar último token do grid
            const gridItems = document.querySelectorAll('.token-card');
            if (gridItems.length > 0) {
                targetElement = gridItems[gridItems.length - 1];
            }
        } else {
            // Observar última linha da tabela
            const tableRows = document.querySelectorAll('.tokens-table tbody tr');
            if (tableRows.length > 0) {
                targetElement = tableRows[tableRows.length - 1];
            }
        }
        
        // Se temos um elemento para observar
        if (targetElement) {
            this.lazyLoadConfig.observer.disconnect();
            this.lazyLoadConfig.observer.observe(targetElement);
            console.log('👁️ Observando elemento para lazy loading', targetElement);
        }
    }
    
    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Adicionar debounce à pesquisa para otimizar performance
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', this.debounce((e) => {
                this.state.filterText = e.target.value.trim().toLowerCase();
                this.state.page = 1; // Resetar para a primeira página
                this.loadPagedTokens(1);
            }, this.config.filterDebounceTime));
        }
        
        // Mudar ordenação
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', () => {
                this.state.sortBy = this.elements.sortSelect.value;
                this.state.page = 1;
                this.loadPagedTokens(1);
            });
        }
        
        // Alternar direção de ordenação
        if (this.elements.sortDirection) {
            this.elements.sortDirection.addEventListener('click', () => {
                this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
                
                // Atualizar ícone
                const icon = this.elements.sortDirection.querySelector('i');
                if (icon) {
                    icon.className = this.state.sortDirection === 'asc' 
                        ? 'fas fa-sort-amount-up' 
                        : 'fas fa-sort-amount-down';
                }
                
                this.state.page = 1;
                this.loadPagedTokens(1);
            });
        }
        
        // Paginação
        if (this.elements.prevPageBtn) {
            this.elements.prevPageBtn.addEventListener('click', () => {
                if (this.state.page > 1) {
                    this.loadPagedTokens(this.state.page - 1);
                }
            });
        }
        
        if (this.elements.nextPageBtn) {
            this.elements.nextPageBtn.addEventListener('click', () => {
                if (this.state.page < this.state.totalPages) {
                    this.loadPagedTokens(this.state.page + 1);
                }
            });
        }
        
        // Alternar visualização
        if (this.elements.viewToggleBtns) {
            this.elements.viewToggleBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const newView = btn.dataset.view;
                    if (newView && newView !== this.state.view) {
                        this.state.view = newView;
                        this.updateView();
                    }
                });
            });
        }
        
        // Filtros com debounce
        if (this.elements.filterInputs) {
            this.elements.filterInputs.forEach(input => {
                input.addEventListener('change', this.debounce(() => {
                    const filterType = input.dataset.filter;
                    if (window.gamification && filterType) {
                        window.gamification.registerFilterUse(filterType);
                    }
                    
                    this.state.page = 1;
                    this.loadPagedTokens(1);
                }, 300));
            });
        }
    }
    
    /**
     * Função de debounce para evitar múltiplas chamadas
     * @param {Function} func - Função a ser executada
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função com debounce
     */
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    /**
     * Exibe um estado vazio (sem tokens)
     */
    showEmptyState() {
        const emptyStateHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x"></i>
                <h3>Nenhum token encontrado</h3>
                <p>Tente ajustar os filtros ou termos de busca</p>
                <button class="btn-primary reset-filters-btn">Limpar filtros</button>
            </div>
        `;
        
        if (this.state.view === 'grid' && this.elements.grid) {
            this.elements.grid.innerHTML = emptyStateHTML;
            
            // Adicionar event listener ao botão
            const resetBtn = this.elements.grid.querySelector('.reset-filters-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetFilters());
            }
        } else if (this.elements.tableBody) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        ${emptyStateHTML}
                    </td>
                </tr>
            `;
            
            // Adicionar event listener ao botão
            const resetBtn = this.elements.tableBody.querySelector('.reset-filters-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetFilters());
            }
        }
    }
    
    /**
     * Reseta todos os filtros
     */
    resetFilters() {
        // Limpar campo de busca
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
            this.state.filterText = '';
        }
        
        // Resetar filtros
        if (this.elements.filterInputs) {
            this.elements.filterInputs.forEach(input => {
                input.value = 'all';
            });
        }
        
        // Resetar ordenação
        if (this.elements.sortSelect) {
            this.elements.sortSelect.value = 'rank';
            this.state.sortBy = 'rank';
        }
        
        // Resetar direção
        this.state.sortDirection = 'asc';
        if (this.elements.sortDirection) {
            const icon = this.elements.sortDirection.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sort-amount-up';
            }
        }
        
        // Carregar primeira página
        this.state.page = 1;
        this.loadPagedTokens(1);
    }
    
    /**
     * Mostra o indicador de carregamento
     */
    showLoadingIndicator() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'flex';
        }
        
        if (this.elements.gridContainer) {
            this.elements.gridContainer.style.display = 'none';
        }
        
        if (this.elements.tableContainer) {
            this.elements.tableContainer.style.display = 'none';
        }
        
        if (this.elements.paginationContainer) {
            this.elements.paginationContainer.style.display = 'none';
        }
    }
    
    /**
     * Esconde o indicador de carregamento
     */
    hideLoadingIndicator() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
    }
    
    /**
     * Inicializa a integração com o sistema de gamificação
     */
    initializeGamification() {
        // Verificar se o sistema de gamificação está disponível globalmente
        if (window.gamification) {
            console.log('Sistema de gamificação encontrado. Inicializando integração...');
            
            // Inicializar desafios específicos do explorador
            window.gamification.initializeExplorerChallenges();
            
            // Mostrar desafio diário se estiver disponível
            this.updateDailyChallengeWidget();
        } else {
            console.warn('Sistema de gamificação não encontrado. Funcionalidades de gamificação não estarão disponíveis.');
        }
    }
    
    /**
     * Atualiza o widget de desafio diário
     */
    updateDailyChallengeWidget() {
        if (!window.gamification) return;
        
        const dailyWidget = document.querySelector('.daily-challenge-container');
        if (!dailyWidget) return;
        
        // Encontrar desafio diário do explorador
        const dailyChallenge = window.gamification.findDailyChallenge('explorer');
        
        if (dailyChallenge) {
            // Atualizar texto do widget
            const title = dailyWidget.querySelector('.challenge-title');
            const description = dailyWidget.querySelector('.challenge-description');
            const progress = dailyWidget.querySelector('.challenge-progress-bar');
            const xpReward = dailyWidget.querySelector('.challenge-reward');
            
            if (title) title.textContent = dailyChallenge.name;
            if (description) description.textContent = dailyChallenge.description;
            if (progress) {
                const percent = Math.min(100, (dailyChallenge.progress / dailyChallenge.threshold) * 100);
                progress.style.width = `${percent}%`;
            }
            if (xpReward) xpReward.textContent = `+${dailyChallenge.reward} XP`;
            
            // Mostrar widget
            dailyWidget.style.display = 'block';
        } else {
            // Esconder widget se não houver desafio diário
            dailyWidget.style.display = 'none';
        }
    }
    
    /**
     * Cria a estrutura da interface do explorador
     */
    createInterface(container) {
        container.innerHTML = `
            <div class="explorer-header">
                <h2>Explorador de Tokens Runes</h2>
                <div class="explorer-controls">
                    <div class="search-container">
                        <input type="text" id="runes-search" 
                               placeholder="Buscar por nome, símbolo ou ID..." 
                               class="search-input">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="view-toggles">
                        <button class="view-toggle active" data-view="grid">
                            <i class="fas fa-th-large"></i>
                        </button>
                        <button class="view-toggle" data-view="table">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                    <div class="sort-container">
                        <select id="runes-sort" class="sort-select">
                            ${this.config.sortOptions.map(option => 
                                `<option value="${option.id}" 
                                 data-direction="${option.direction}">
                                 ${option.label}
                                 </option>`).join('')}
                        </select>
                        <i class="fas fa-sort sort-icon"></i>
                    </div>
                </div>
            </div>
            
            <div class="explorer-content">
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Carregando tokens Runes...</p>
                </div>
                
                <div class="tokens-grid-container" style="display: none;">
                    <div class="tokens-grid"></div>
                </div>
                
                <div class="tokens-table-container" style="display: none;">
                    <table class="tokens-table">
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="rank">#</th>
                                <th class="sortable" data-sort="name">Token</th>
                                <th class="sortable" data-sort="price">Preço</th>
                                <th class="sortable" data-sort="change24h">24h %</th>
                                <th class="sortable" data-sort="volume">Volume 24h</th>
                                <th class="sortable" data-sort="marketCap">Cap. de Mercado</th>
                                <th class="sortable" data-sort="holders">Holders</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                
                <div class="pagination-container" style="display: none;">
                    <button class="pagination-btn" id="prev-page">
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <div class="pagination-info">
                        Página <span id="current-page">1</span> de <span id="total-pages">1</span>
                    </div>
                    <button class="pagination-btn" id="next-page">
                        Próxima <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <div class="token-details-modal" id="token-details-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="token-name"></h3>
                        <button class="close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Conteúdo dinâmico do token -->
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Renderiza a visualização em grade
     */
    renderGrid() {
        const gridContainer = document.querySelector('.tokens-grid');
        if (!gridContainer) return;
        
        // Limpar grid
        gridContainer.innerHTML = '';
        
        // Calcular range de tokens a serem exibidos
        const startIndex = (this.state.page - 1) * this.state.itemsPerPage;
        const endIndex = Math.min(startIndex + this.state.itemsPerPage, this.state.filteredTokens.length);
        
        // Se não houver tokens, mostrar mensagem
        if (this.state.filteredTokens.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>Nenhum token encontrado</h3>
                    <p>Tente usar outros termos na busca</p>
                </div>
            `;
            return;
        }
        
        // Renderizar tokens
        for (let i = startIndex; i < endIndex; i++) {
            const token = this.state.filteredTokens[i];
            const tokenCard = this.createTokenCard(token, i - startIndex);
            gridContainer.appendChild(tokenCard);
        }
    }

    /**
     * Cria um card de token para a visualização em grade
     */
    createTokenCard(token, index) {
        const card = document.createElement('div');
        card.className = 'token-card';
        card.style.animationDelay = `${index * this.config.cardAnimationDelay}ms`;
        card.dataset.tokenId = token.id;
        
        // Formatar valores para display
        const priceFormatted = token.price < 0.01 
            ? token.price.toFixed(8) 
            : token.price.toFixed(2);
        
        const marketCapFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(token.marketCap);
        
        const volumeFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(token.volume);
        
        const holdersFormatted = new Intl.NumberFormat('pt-BR', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(token.holders);
        
        // First letter of token name for icon
        const iconText = token.symbol || token.name.charAt(0);
        
        card.innerHTML = `
            <div class="token-header">
                <div class="token-name-container">
                    <div class="token-icon">${iconText}</div>
                    <div class="token-name-info">
                        <div class="token-name">${token.name}</div>
                        <div class="token-id">${token.id}</div>
                    </div>
                </div>
                <div class="token-rank">#${token.rank}</div>
            </div>
            
            <div class="token-body">
                <div class="token-price">$${priceFormatted}</div>
                <div class="token-change ${token.change24h >= 0 ? 'positive' : 'negative'}">
                    ${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%
                    <i class="fas fa-caret-${token.change24h >= 0 ? 'up' : 'down'}"></i>
                </div>
                
                <div class="token-stats">
                    <div class="token-stat">
                        <div class="stat-label">Cap. de Mercado</div>
                        <div class="stat-value">${marketCapFormatted}</div>
                    </div>
                    <div class="token-stat">
                        <div class="stat-label">Volume 24h</div>
                        <div class="stat-value">${volumeFormatted}</div>
                    </div>
                    <div class="token-stat">
                        <div class="stat-label">Holders</div>
                        <div class="stat-value">${holdersFormatted}</div>
                    </div>
                    <div class="token-stat">
                        <div class="stat-label">Divisibilidade</div>
                        <div class="stat-value">${token.divisibility}</div>
                    </div>
                </div>
            </div>
            
            <div class="token-footer">
                <div class="token-properties">
                    ${token.isOpenMint 
                        ? '<span class="token-property"><i class="fas fa-lock-open"></i> Open Mint</span>' 
                        : '<span class="token-property"><i class="fas fa-lock"></i> Mint Fechado</span>'}
                </div>
                <div class="token-action">
                    <button class="token-btn view-details" data-token-id="${token.id}">Detalhes</button>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        const viewDetailsBtn = card.querySelector('.view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                this.showTokenDetails(token.id);
            });
        }
        
        // Também permitir clicar no cartão inteiro
        card.addEventListener('click', (e) => {
            // Verificar se o clique não foi no botão
            if (!e.target.closest('.token-btn')) {
                this.showTokenDetails(token.id);
            }
        });
        
        // Adicionar classe de animação de preço, se disponível
        if (token.priceChangeClass) {
            const priceElement = card.querySelector('.token-price');
            if (priceElement) {
                priceElement.classList.add(token.priceChangeClass);
                // Remover classe após a animação para permitir futuras animações
                setTimeout(() => {
                    priceElement.classList.remove('price-changed-up', 'price-changed-down');
                }, 2000);
            }
        }
        
        return card;
    }

    /**
     * Renderiza a visualização em tabela
     */
    renderTable() {
        const tableBody = document.querySelector('.tokens-table tbody');
        if (!tableBody) return;
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        // Calcular range de tokens a serem exibidos
        const startIndex = (this.state.page - 1) * this.state.itemsPerPage;
        const endIndex = Math.min(startIndex + this.state.itemsPerPage, this.state.filteredTokens.length);
        
        // Se não houver tokens, mostrar mensagem
        if (this.state.filteredTokens.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-table-message">
                        <div class="empty-state">
                            <i class="fas fa-search fa-3x"></i>
                            <h3>Nenhum token encontrado</h3>
                            <p>Tente usar outros termos na busca</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Atualizar cabeçalhos de classificação
        this.updateSortHeaders();
        
        // Renderizar tokens
        for (let i = startIndex; i < endIndex; i++) {
            const token = this.state.filteredTokens[i];
            const row = this.createTableRow(token);
            tableBody.appendChild(row);
        }
    }

    /**
     * Atualiza os cabeçalhos da tabela para mostrar a ordenação atual
     */
    updateSortHeaders() {
        const headers = document.querySelectorAll('.tokens-table th.sortable');
        
        headers.forEach(header => {
            header.classList.remove('asc', 'desc');
            
            if (header.dataset.sort === this.state.sortBy) {
                header.classList.add(this.state.sortDirection);
            }
            
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                
                if (sortField === this.state.sortBy) {
                    // Inverter direção se o mesmo campo
                    this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    // Novo campo, usar direção padrão
                    this.state.sortBy = sortField;
                    this.state.sortDirection = header.dataset.defaultDirection || 'desc';
                }
                
                this.sortTokens();
                this.updateView();
            });
        });
    }

    /**
     * Cria uma linha de tabela para um token
     */
    createTableRow(token) {
        const row = document.createElement('tr');
        row.dataset.tokenId = token.id;
        
        // Formatar valores para display
        const priceFormatted = token.price < 0.01 
            ? token.price.toFixed(8) 
            : token.price.toFixed(2);
        
        const marketCapFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(token.marketCap);
        
        const volumeFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(token.volume);
        
        const holdersFormatted = new Intl.NumberFormat('pt-BR', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(token.holders);
        
        // First letter of token name for icon
        const iconText = token.symbol || token.name.charAt(0);
        
        row.innerHTML = `
            <td>${token.rank}</td>
            <td>
                <div class="token-cell-name">
                    <div class="token-table-icon">${iconText}</div>
                    <div>
                        <div>${token.name}</div>
                        <small class="token-id">${token.id}</small>
                    </div>
                </div>
            </td>
            <td>$${priceFormatted}</td>
            <td class="${token.change24h >= 0 ? 'positive' : 'negative'}">
                ${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%
            </td>
            <td>${volumeFormatted}</td>
            <td>${marketCapFormatted}</td>
            <td>${holdersFormatted}</td>
            <td>
                <div class="token-cell-actions">
                    <button class="token-action-btn view-details" data-token-id="${token.id}">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="token-action-btn add-favorite" data-token-id="${token.id}">
                        <i class="far fa-star"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Adicionar eventos
        const viewDetailsBtn = row.querySelector('.view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                this.showTokenDetails(token.id);
            });
        }
        
        const addFavoriteBtn = row.querySelector('.add-favorite');
        if (addFavoriteBtn) {
            addFavoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar abrir detalhes
                this.toggleFavorite(token.id);
                const icon = addFavoriteBtn.querySelector('i');
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
            });
        }
        
        // Clique na linha inteira para mostrar detalhes
        row.addEventListener('click', (e) => {
            // Verificar se o clique não foi em um botão
            if (!e.target.closest('.token-action-btn')) {
                this.showTokenDetails(token.id);
            }
        });
        
        // Adicionar classe de animação de preço, se disponível
        if (token.priceChangeClass) {
            const priceCell = row.querySelector('.token-price');
            if (priceCell) {
                priceCell.classList.add(token.priceChangeClass);
                // Remover classe após a animação para permitir futuras animações
                setTimeout(() => {
                    priceCell.classList.remove('price-changed-up', 'price-changed-down');
                }, 2000);
            }
        }
        
        return row;
    }

    /**
     * Abre o modal com detalhes do token
     */
    async showTokenDetails(tokenId) {
        this.state.selectedToken = await this.apiManager.getRuneDetails(tokenId);
        
        if (!this.state.selectedToken) {
            console.error(`Token não encontrado: ${tokenId}`);
            return;
        }
        
        const modal = document.getElementById('token-details-modal');
        const modalName = modal.querySelector('.token-name');
        const modalBody = modal.querySelector('.modal-body');
        
        modalName.textContent = `${this.state.selectedToken.name} (${this.state.selectedToken.id})`;
        
        // Renderizar detalhes do token no corpo do modal
        modalBody.innerHTML = `
            <div class="token-details-loading">
                <div class="spinner"></div>
                <p>Carregando detalhes do token...</p>
            </div>
        `;
        
        // Mostrar modal
        modal.classList.add('active');
        
        // Adicionar XP por interação e registrar visualização para o sistema de gamificação
        if (window.gamification) {
            window.gamification.processTokenView(tokenId, this.state.selectedToken);
        }
        
        // Carregar detalhes completos
        this.renderTokenDetails();
    }

    /**
     * Renderiza os detalhes completos do token selecionado
     */
    renderTokenDetails() {
        // Implementação simplificada para este exemplo
        // No futuro, expandir com mais dados e gráficos
        
        const token = this.state.selectedToken;
        const modalBody = document.querySelector('.modal-body');
        
        if (!token || !modalBody) return;
        
        // Formatar valores
        const priceFormatted = token.price < 0.01 
            ? token.price.toFixed(8) 
            : token.price.toFixed(2);
        
        const marketCapFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(token.marketCap);
        
        modalBody.innerHTML = `
            <div class="token-details-grid">
                <div class="token-details-card">
                    <h4>Informações Básicas</h4>
                    <div class="details-items">
                        <div class="details-item">
                            <span class="details-label">Nome:</span>
                            <span class="details-value">${token.name}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">ID Rune:</span>
                            <span class="details-value">${token.id}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Símbolo:</span>
                            <span class="details-value">${token.symbol}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Divisibilidade:</span>
                            <span class="details-value">${token.divisibility}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Fornecimento:</span>
                            <span class="details-value">${token.supply.toLocaleString()}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Data de criação:</span>
                            <span class="details-value">${token.mintedAt}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Criador:</span>
                            <span class="details-value">
                                <span class="address-tag">${token.etcher}</span>
                            </span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Tipo de mint:</span>
                            <span class="details-value">
                                ${token.isOpenMint 
                                    ? '<span class="badge-success">Open Mint</span>' 
                                    : '<span class="badge-neutral">Mint Fechado</span>'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="token-details-card">
                    <h4>Desempenho de Mercado</h4>
                    <div class="details-price-container">
                        <div class="details-price">$${priceFormatted}</div>
                        <div class="details-change ${token.change24h >= 0 ? 'positive' : 'negative'}">
                            ${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}% (24h)
                        </div>
                    </div>
                    <div class="details-items mt-3">
                        <div class="details-item">
                            <span class="details-label">Volume (24h):</span>
                            <span class="details-value">$${token.volume.toLocaleString()}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Cap. de Mercado:</span>
                            <span class="details-value">${marketCapFormatted}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Holders:</span>
                            <span class="details-value">${token.holders.toLocaleString()}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Rank atual:</span>
                            <span class="details-value">#${token.rank}</span>
                        </div>
                    </div>
                </div>
                
                <div class="token-details-card description-card">
                    <h4>Descrição</h4>
                    <p>${token.description}</p>
                </div>
            </div>
            
            <div class="token-details-actions">
                <button class="token-btn add-favorite-detail">
                    <i class="far fa-star"></i> Adicionar aos Favoritos
                </button>
                <button class="token-btn secondary share-token">
                    <i class="fas fa-share-alt"></i> Compartilhar
                </button>
                <button class="token-btn secondary view-explorer">
                    <i class="fas fa-external-link-alt"></i> Ver no Explorer
                </button>
            </div>
        `;
        
        // Adicionar eventos aos botões
        const favoriteBtn = modalBody.querySelector('.add-favorite-detail');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite(token.id);
                const icon = favoriteBtn.querySelector('i');
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
                
                if (icon.classList.contains('fas')) {
                    favoriteBtn.textContent = ' Remover dos Favoritos';
                    favoriteBtn.prepend(icon);
                } else {
                    favoriteBtn.textContent = ' Adicionar aos Favoritos';
                    favoriteBtn.prepend(icon);
                }
            });
        }
        
        const shareBtn = modalBody.querySelector('.share-token');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareToken(token);
            });
        }
        
        const explorerBtn = modalBody.querySelector('.view-explorer');
        if (explorerBtn) {
            explorerBtn.addEventListener('click', () => {
                this.openInExplorer(token.id);
            });
        }
    }

    /**
     * Fecha o modal de detalhes
     */
    closeTokenDetails() {
        const modal = document.getElementById('token-details-modal');
        if (modal) modal.classList.remove('active');
    }

    /**
     * Alterna um token como favorito
     */
    toggleFavorite(tokenId) {
        // Em uma implementação real, salvaria isso no backend ou localStorage
        console.log(`Toggled favorite for token ${tokenId}`);
        
        // Interagir com o sistema de gamificação
        if (window.gamification) {
            window.gamification.processTokenFavorite(tokenId);
        }
        
        // Mostrar notificação
        this.showNotification(`Token adicionado aos favoritos!`, 'success');
    }
    
    /**
     * Compartilha um token
     */
    shareToken(token) {
        const shareText = `Confira o token Rune ${token.name} (${token.id}) na RUNES Analytics Pro!`;
        
        // Em uma implementação real, usaria a Web Share API ou criaria diálogos personalizados
        console.log(`Sharing: ${shareText}`);
        
        // Mostrar notificação
        this.showNotification(`Link de compartilhamento copiado para o clipboard!`, 'success');
        
        // Registrar ação no sistema de gamificação
        if (window.gamification) {
            window.gamification.processTokenShare(token.id);
        }
    }
    
    /**
     * Abre o token em um explorador externo
     */
    openInExplorer(tokenId) {
        // Em uma implementação real, redirecionaria para o explorador de blockchain
        const url = `https://explorer.example.com/runes/${tokenId}`;
        console.log(`Opening in explorer: ${url}`);
        
        // Abrir em nova aba
        window.open(url, '_blank');
        
        // Adicionar XP por exploração
        if (window.gamification) {
            window.gamification.addXP(1);
        }
    }
    
    /**
     * Mostra uma notificação para o usuário
     * @param {string} message - Mensagem para mostrar
     * @param {string} type - Tipo de notificação (info, success, error)
     * @param {number} duration - Duração em ms (opcional, padrão 3000ms)
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Remover notificação anterior se existir
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Definir ícone baseado no tipo
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        
        // Conteúdo da notificação
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-content">
                <p class="notification-message">${message}</p>
            </div>
        `;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(notification);
        
        // Mostrar com animação
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remover após o tempo especificado
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); // Tempo para completar a animação de saída
        }, duration);
        
        return notification;
    }

    /**
     * Aplica os filtros selecionados
     */
    applyFilters() {
        // Implementar lógica de filtros aqui...
        this.filterTokens();
        this.updateView();
    }

    /**
     * Verifica atividade de baleias ("whales") para um token específico
     * Implementa lazy loading e feedback visual aprimorado
     * 
     * @param {string} tokenId - ID do token para verificar atividade
     */
    async checkWhaleActivity(tokenId) {
        try {
            const token = this.state.tokens.find(t => t.id === tokenId);
            if (!token) return;
            
            // Obter o botão que foi clicado e adicionar estado de loading
            const button = document.querySelector(`.whale-check-btn[data-token="${tokenId}"]`);
            if (button) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
                button.disabled = true;
            }
            
            // Verificar se já temos dados em cache para este token
            const cacheKey = `whale_activity_${tokenId}`;
            let whaleData = this.dbCache.get(cacheKey);
            
            if (!whaleData) {
                // Primeiro mostrar feedback visual antes de buscar dados
                this.showNotification(`Analisando atividade de baleias para ${token.name}...`, 'info');
                
                // Simular uma chamada API para atividade de baleias com delay
                whaleData = await new Promise(resolve => {
                    setTimeout(() => {
                        // Simulação de dados reais
                        // Na implementação real, substituir por chamada API
                        resolve(this.generateWhaleActivityData(token));
                    }, 1500);
                });
                
                // Armazenar no cache
                this.dbCache.set(cacheKey, whaleData, this.config.cacheTTL);
            }
            
            // Restaurar o botão ao estado normal
            if (button) {
                button.innerHTML = '<i class="fas fa-whale"></i> Verificar Baleias';
                button.disabled = false;
                
                // Adicionar classe "checked" para indicar que já verificou
                button.classList.add('whale-checked');
                
                // Mudar ícone e texto para indicar que a verificação já foi feita
                button.innerHTML = '<i class="fas fa-check-circle"></i> Verificado';
                
                // Após 3 segundos, restaurar o texto original
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-whale"></i> Verificar Baleias';
                }, 3000);
            }
            
            // Mostrar um modal ou painel com os dados
            this.displayWhaleActivity(tokenId, whaleData);
            
            // Gamificação - atualizar conquistas
            if (window.gamification) {
                window.gamification.registerWhaleCheck(tokenId);
            }
            
        } catch (error) {
            console.error('Erro ao verificar atividade de baleias:', error);
            this.showNotification('Falha ao verificar atividade de baleias. Tente novamente.', 'error');
            
            // Restaurar o botão ao estado normal em caso de erro
            const button = document.querySelector(`.whale-check-btn[data-token="${tokenId}"]`);
            if (button) {
                button.innerHTML = '<i class="fas fa-whale"></i> Verificar Baleias';
                button.disabled = false;
            }
        }
    }
    
    /**
     * Gera dados simulados de atividade de baleias para um token
     * @param {Object} token - Token para gerar dados
     * @returns {Object} Dados simulados de atividade de baleias
     */
    generateWhaleActivityData(token) {
        // Simular diferentes níveis de atividade baseado no preço do token
        const price = parseFloat(token.price || 0);
        const marketCap = token.marketCap || 0;
        
        // Quantidade de transações de baleias
        const transactionCount = Math.floor(Math.random() * 10) + 1;
        
        // Gerar transações
        const transactions = [];
        for (let i = 0; i < transactionCount; i++) {
            // Tipos de transações: buy, sell, transfer
            const types = ['buy', 'sell', 'transfer'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Valor da transação entre 1% e 5% do marketCap
            const percentage = (Math.random() * 4 + 1) / 100;
            const value = marketCap * percentage;
            
            // Endereço pseudo-aleatório
            const address = `bc1q${Math.random().toString(36).substring(2, 10)}...`;
            
            // Timestamp nas últimas 24 horas
            const hoursAgo = Math.floor(Math.random() * 24);
            const date = new Date();
            date.setHours(date.getHours() - hoursAgo);
            
            // Impacto no preço: baixo, médio, alto
            const impacts = ['low', 'medium', 'high'];
            const impact = impacts[Math.floor(Math.random() * impacts.length)];
            
            transactions.push({
                type,
                value,
                address,
                timestamp: date,
                impact
            });
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        transactions.sort((a, b) => b.timestamp - a.timestamp);
        
        return {
            token: token.name,
            tokenId: token.id,
            lastUpdated: new Date(),
            whaleCount: Math.floor(Math.random() * 5) + 1,
            transactions
        };
    }
    
    /**
     * Exibe os dados de atividade de baleias em um modal
     * @param {string} tokenId - ID do token
     * @param {Object} whaleData - Dados de atividade de baleias
     */
    displayWhaleActivity(tokenId, whaleData) {
        // Verificar se já existe um modal e remover
        const existingModal = document.querySelector('.whale-activity-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'whale-activity-modal';
        
        // Formatar timestamp
        const formatTime = (date) => {
            const hours = Math.floor((new Date() - date) / (60 * 60 * 1000));
            return hours === 0 ? 'Há menos de 1 hora' : `Há ${hours} hora${hours > 1 ? 's' : ''}`;
        };
        
        // Formatar valor
        const formatValue = (value) => {
            if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(2)}M`;
            } else if (value >= 1000) {
                return `$${(value / 1000).toFixed(2)}K`;
            }
            return `$${value.toFixed(2)}`;
        };
        
        // HTML do conteúdo do modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-whale"></i> Atividade de Baleias: ${whaleData.token}</h3>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="whale-summary">
                        <div class="whale-stat">
                            <span class="stat-value">${whaleData.whaleCount}</span>
                            <span class="stat-label">Baleias Ativas</span>
                        </div>
                        <div class="whale-stat">
                            <span class="stat-value">${whaleData.transactions.length}</span>
                            <span class="stat-label">Transações</span>
                        </div>
                        <div class="whale-stat">
                            <span class="stat-value">${formatTime(whaleData.lastUpdated)}</span>
                            <span class="stat-label">Última Atualização</span>
                        </div>
                    </div>
                    
                    <h4>Transações Recentes</h4>
                    <div class="whale-transactions">
                        ${whaleData.transactions.map(tx => `
                            <div class="whale-transaction ${tx.type}">
                                <div class="transaction-icon">
                                    <i class="fas fa-${tx.type === 'buy' ? 'arrow-down' : tx.type === 'sell' ? 'arrow-up' : 'exchange-alt'}"></i>
                                </div>
                                <div class="transaction-details">
                                    <div class="transaction-type">
                                        ${tx.type === 'buy' ? 'Compra' : tx.type === 'sell' ? 'Venda' : 'Transferência'}
                                        <span class="transaction-time">${formatTime(tx.timestamp)}</span>
                                    </div>
                                    <div class="transaction-address">
                                        <i class="fas fa-wallet"></i> ${tx.address}
                                    </div>
                                </div>
                                <div class="transaction-value">
                                    <span class="value">${formatValue(tx.value)}</span>
                                    <span class="impact-badge ${tx.impact}">${
                                        tx.impact === 'high' ? 'Alto Impacto' : 
                                        tx.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'
                                    }</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="whale-insight">
                        <h4>Análise de Impacto</h4>
                        <p>
                            ${whaleData.transactions.some(tx => tx.impact === 'high') ? 
                                `<strong>Alerta de alta atividade:</strong> Detectamos transações de alto volume que podem causar volatilidade no preço de ${whaleData.token} nas próximas horas.` : 
                                `A atividade atual de baleias para ${whaleData.token} está dentro dos padrões normais e não indica mudanças significativas iminentes no preço.`}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar ao documento
        document.body.appendChild(modal);
        
        // Animar entrada
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Fechar modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
    }

    /**
     * Mostra indicador de lazy loading
     */
    showLazyLoadingIndicator() {
        // Criar elemento de indicador se não existir
        let indicator = document.querySelector('.lazy-loading-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'lazy-loading-indicator';
            indicator.innerHTML = `
                <div class="spinner"></div>
                <p>Carregando mais tokens...</p>
            `;
            
            // Adicionar ao final da lista
            if (this.state.view === 'grid') {
                this.elements.grid.appendChild(indicator);
            } else {
                const tbody = this.elements.tableBody;
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 8; // Ajustar conforme número de colunas
                td.appendChild(indicator);
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        }
        
        indicator.style.display = 'flex';
    }
    
    /**
     * Esconde indicador de lazy loading
     */
    hideLazyLoadingIndicator() {
        const indicator = document.querySelector('.lazy-loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * Anexa novos tokens à visualização atual sem recarregar tudo
     * @param {Array} newTokens - Novos tokens a serem anexados
     */
    appendNewTokens(newTokens) {
        if (!newTokens || !newTokens.length) return;
        
        if (this.state.view === 'grid') {
            // Anexar ao grid
            newTokens.forEach((token, index) => {
                const card = this.createTokenCard(token);
                // Adicionar com efeito de fade-in
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                this.elements.grid.appendChild(card);
                
                // Animar entrada com atraso baseado no índice
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            });
        } else {
            // Anexar à tabela
            newTokens.forEach((token, index) => {
                const row = this.createTableRow(token);
                // Adicionar com efeito de fade-in
                row.style.opacity = '0';
                this.elements.tableBody.appendChild(row);
                
                // Animar entrada com atraso baseado no índice
                setTimeout(() => {
                    row.style.opacity = '1';
                }, index * 30);
            });
        }
        
        // Atualizar observador após anexar
        this.updateLazyLoadingObserver();
    }

    /**
     * Adiciona botão para limpar cache na interface de desenvolvimento
     */
    addDevTools() {
        // Adicionar apenas em ambiente de desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const devToolsContainer = document.createElement('div');
            devToolsContainer.className = 'dev-tools';
            devToolsContainer.innerHTML = `
                <button class="btn-dev clear-cache">Limpar Cache</button>
                <button class="btn-dev show-stats">Estatísticas</button>
            `;
            
            document.body.appendChild(devToolsContainer);
            
            // Eventos
            devToolsContainer.querySelector('.clear-cache').addEventListener('click', () => {
                if (this.dbCache && this.dbCache.isReady()) {
                    this.dbCache.clear().then(() => {
                        this.showNotification('Cache limpo com sucesso!', 'success');
                        this.showCacheStats();
                    });
                }
            });
            
            devToolsContainer.querySelector('.show-stats').addEventListener('click', () => {
                this.showCacheStats().then(() => {
                    if (this.dbCache && this.dbCache.isReady()) {
                        this.dbCache.getStats().then(stats => {
                            alert(JSON.stringify(stats, null, 2));
                        });
                    }
                });
            });
        }
    }
}

// Inicializar o explorador quando o script for carregado
window.runesExplorer = new RunesExplorer(); 