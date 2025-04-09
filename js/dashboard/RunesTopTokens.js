// RunesTopTokens.js - Componente para exibição da lista dos principais tokens Runes
// Exibe uma tabela classificável com informações detalhadas sobre cada token

class RunesTopTokens {
    constructor(options = {}) {
        // Opções do componente
        this.options = {
            container: options.container || 'top-tokens-widget',
            darkMode: options.darkMode || false,
            maxTokens: options.maxTokens || 20,
            pageSize: options.pageSize || 10,
            showPagination: options.showPagination !== false,
            sortable: options.sortable !== false,
            defaultSort: options.defaultSort || 'marketCap',
            defaultOrder: options.defaultOrder || 'desc'
        };
        
        // Dados dos tokens
        this.tokensData = [];
        
        // Estado do componente
        this.state = {
            currentPage: 1,
            sortField: this.options.defaultSort,
            sortOrder: this.options.defaultOrder,
            selectedToken: null,
            filteredTokens: []
        };
        
        // Referência ao container
        this.container = null;
        
        // Referência à tabela
        this.table = null;
        
        // Callbacks para eventos
        this.callbacks = {
            onTokenSelect: []
        };
        
        console.log('RunesTopTokens inicializado com opções:', this.options);
    }
    
    // Inicializar o componente
    async init() {
        console.log('Inicializando componente Top Tokens...');
        
        // Obter o container
        this.container = document.getElementById(this.options.container);
        if (!this.container) {
            console.error(`Container '${this.options.container}' não encontrado!`);
            return false;
        }
        
        // Renderizar estrutura inicial
        this.renderStructure();
        
        // Configurar handlers de eventos
        this.setupEventHandlers();
        
        // Carregar dados iniciais
        await this.loadInitialData();
        
        console.log('Componente Top Tokens inicializado com sucesso');
        return true;
    }
    
    // Renderizar a estrutura base do componente
    renderStructure() {
        // Adicionar classes ao container
        this.container.classList.add('top-tokens-widget');
        if (this.options.darkMode) {
            this.container.classList.add('dark-mode');
        }
        
        // Estrutura HTML
        this.container.innerHTML = `
            <div class="widget-header">
                <h3>Top Tokens Runes</h3>
                <div class="tokens-controls">
                    <div class="search-box">
                        <input type="text" id="search-token" placeholder="Buscar token...">
                        <button id="clear-search" class="clear-search-btn">×</button>
                    </div>
                    <div class="display-settings">
                        <select id="page-size">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="tokens-table-container">
                <table class="tokens-table" id="tokens-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-sort="rank">#</th>
                            <th class="sortable" data-sort="name">Nome</th>
                            <th class="sortable" data-sort="price">Preço</th>
                            <th class="sortable" data-sort="priceChange24h">24h %</th>
                            <th class="sortable" data-sort="marketCap">Cap. de Mercado</th>
                            <th class="sortable" data-sort="volume24h">Volume 24h</th>
                            <th class="sortable" data-sort="holders">Holders</th>
                        </tr>
                    </thead>
                    <tbody id="tokens-table-body">
                        <tr class="token-loading">
                            <td colspan="7">Carregando tokens...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="tokens-pagination" id="tokens-pagination">
                <button class="pagination-btn" id="prev-page" disabled>&laquo;</button>
                <div class="pagination-info" id="pagination-info">
                    Página 1 de 1
                </div>
                <button class="pagination-btn" id="next-page" disabled>&raquo;</button>
            </div>
        `;
        
        // Armazenar referência à tabela
        this.table = this.container.querySelector('#tokens-table');
        
        // Configurar tamanho da página
        const pageSizeSelect = this.container.querySelector('#page-size');
        if (pageSizeSelect) {
            pageSizeSelect.value = this.options.pageSize.toString();
        }
        
        // Ocultar paginação se não for necessária
        if (!this.options.showPagination) {
            const paginationDiv = this.container.querySelector('#tokens-pagination');
            if (paginationDiv) {
                paginationDiv.style.display = 'none';
            }
        }
        
        console.log('Estrutura Top Tokens renderizada');
    }
    
    // Configurar handlers de eventos
    setupEventHandlers() {
        // Handlers para classificação da tabela
        const sortableHeaders = this.container.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.getAttribute('data-sort');
                this.sortTable(sortField);
            });
        });
        
        // Handler para pesquisa de tokens
        const searchInput = this.container.querySelector('#search-token');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTokens(e.target.value);
            });
            
            // Botão para limpar pesquisa
            const clearButton = this.container.querySelector('#clear-search');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    searchInput.value = '';
                    this.filterTokens('');
                });
            }
        }
        
        // Handlers para paginação
        const prevButton = this.container.querySelector('#prev-page');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.state.currentPage > 1) {
                    this.changePage(this.state.currentPage - 1);
                }
            });
        }
        
        const nextButton = this.container.querySelector('#next-page');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const totalPages = Math.ceil(this.state.filteredTokens.length / this.options.pageSize);
                if (this.state.currentPage < totalPages) {
                    this.changePage(this.state.currentPage + 1);
                }
            });
        }
        
        // Handler para alterar tamanho da página
        const pageSizeSelect = this.container.querySelector('#page-size');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.options.pageSize = parseInt(e.target.value, 10);
                this.state.currentPage = 1;
                this.renderTokensTable();
                this.updatePagination();
            });
        }
    }
    
    // Carregar dados iniciais
    async loadInitialData() {
        console.log('Carregando dados iniciais para Top Tokens...');
        
        try {
            // Verificar se o serviço de dados está disponível
            if (window.runesDataService) {
                const tokensData = await window.runesDataService.getRunesRanking();
                this.updateData(tokensData);
            } else {
                console.warn('RunesDataService não disponível. Usando dados mockup...');
                this.updateData(this.getMockTokensData());
            }
        } catch (error) {
            console.error('Erro ao carregar dados iniciais dos Top Tokens:', error);
            // Usar dados mockup em caso de erro
            this.updateData(this.getMockTokensData());
        }
    }
    
    // Atualizar os dados exibidos
    updateData(tokensData) {
        console.log(`Atualizando dados dos Top Tokens: ${tokensData.length} tokens`);
        
        if (!tokensData || !Array.isArray(tokensData)) {
            console.warn('Dados de tokens inválidos');
            return;
        }
        
        // Armazenar dados
        this.tokensData = tokensData;
        
        // Aplicar filtros atuais
        this.filterTokens(document.querySelector('#search-token')?.value || '');
        
        // Ordenar dados
        this.sortTokensData();
        
        // Renderizar tabela
        this.renderTokensTable();
        
        // Atualizar paginação
        this.updatePagination();
        
        console.log('Dados dos Top Tokens atualizados com sucesso');
    }
    
    // Filtrar tokens com base em texto de busca
    filterTokens(searchQuery) {
        if (!searchQuery || searchQuery.trim() === '') {
            // Sem filtro, usar todos os tokens
            this.state.filteredTokens = [...this.tokensData];
        } else {
            // Filtrar tokens que correspondem à consulta
            const query = searchQuery.toLowerCase().trim();
            this.state.filteredTokens = this.tokensData.filter(token => {
                return token.name.toLowerCase().includes(query) || 
                       token.ticker.toLowerCase().includes(query);
            });
        }
        
        // Voltar para a primeira página
        this.state.currentPage = 1;
        
        // Ordenar dados filtrados
        this.sortTokensData();
        
        // Renderizar tabela
        this.renderTokensTable();
        
        // Atualizar paginação
        this.updatePagination();
    }
    
    // Ordenar a tabela por um campo específico
    sortTable(field) {
        // Se o campo é o mesmo, inverter a ordem
        if (field === this.state.sortField) {
            this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            // Novo campo, usar ordem padrão desc para a maioria dos campos
            this.state.sortField = field;
            // Use asc para rank, desc para os outros campos
            this.state.sortOrder = field === 'rank' ? 'asc' : 'desc';
        }
        
        // Atualizar classes de cabeçalho
        this.updateSortHeaders();
        
        // Ordenar dados
        this.sortTokensData();
        
        // Renderizar tabela
        this.renderTokensTable();
    }
    
    // Ordenar os dados dos tokens
    sortTokensData() {
        const { sortField, sortOrder } = this.state;
        
        this.state.filteredTokens.sort((a, b) => {
            let valueA, valueB;
            
            // Determinar os valores a serem comparados com base no campo de ordenação
            if (sortField === 'name') {
                valueA = a.name || '';
                valueB = b.name || '';
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            } else {
                valueA = a[sortField] !== undefined ? a[sortField] : 0;
                valueB = b[sortField] !== undefined ? b[sortField] : 0;
                
                // Para números, usar comparação numérica
                if (sortOrder === 'asc') {
                    return valueA - valueB;
                } else {
                    return valueB - valueA;
                }
            }
        });
    }
    
    // Atualizar classes de cabeçalho de acordo com a ordenação atual
    updateSortHeaders() {
        // Remover classes de ordenação existentes
        const headers = this.container.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Adicionar classe ao cabeçalho atual
        const currentHeader = this.container.querySelector(`th[data-sort="${this.state.sortField}"]`);
        if (currentHeader) {
            currentHeader.classList.add(this.state.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
    
    // Renderizar a tabela de tokens
    renderTokensTable() {
        const tableBody = this.container.querySelector('#tokens-table-body');
        if (!tableBody) return;
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        // Verificar se existem tokens filtrados
        if (this.state.filteredTokens.length === 0) {
            tableBody.innerHTML = `
                <tr class="no-tokens">
                    <td colspan="7">Nenhum token encontrado</td>
                </tr>
            `;
            return;
        }
        
        // Calcular índices para a página atual
        const startIndex = (this.state.currentPage - 1) * this.options.pageSize;
        const endIndex = Math.min(startIndex + this.options.pageSize, this.state.filteredTokens.length);
        
        // Tokens para a página atual
        const tokensForPage = this.state.filteredTokens.slice(startIndex, endIndex);
        
        // Gerar linhas da tabela
        tokensForPage.forEach((token, index) => {
            const row = document.createElement('tr');
            row.classList.add('token-row');
            
            // Adicionar classe para o token selecionado
            if (token.ticker === this.state.selectedToken) {
                row.classList.add('selected-token');
            }
            
            // Calcular rank absoluto
            const rank = startIndex + index + 1;
            
            // Formatar a mudança de preço com classes para valores positivos/negativos
            const priceChangeClass = token.priceChange24h > 0 ? 'positive' : token.priceChange24h < 0 ? 'negative' : 'neutral';
            const priceChangeSign = token.priceChange24h > 0 ? '+' : '';
            
            // Criar HTML da linha
            row.innerHTML = `
                <td class="token-rank">${rank}</td>
                <td class="token-name">
                    <div class="token-name-container">
                        <div class="token-icon">${this.getTokenIcon(token.ticker)}</div>
                        <div class="token-name-details">
                            <div class="token-ticker">${token.ticker}</div>
                            <div class="token-full-name">${token.name}</div>
                        </div>
                    </div>
                </td>
                <td class="token-price">${this.formatCurrency(token.price)}</td>
                <td class="token-change ${priceChangeClass}">${priceChangeSign}${token.priceChange24h.toFixed(2)}%</td>
                <td class="token-market-cap">${this.formatCurrency(token.marketCap)}</td>
                <td class="token-volume">${this.formatCurrency(token.volume24h)}</td>
                <td class="token-holders">${this.formatNumber(token.holders)}</td>
            `;
            
            // Adicionar event listener para seleção de token
            row.addEventListener('click', () => {
                this.handleTokenSelect(token);
            });
            
            tableBody.appendChild(row);
        });
    }
    
    // Manipular seleção de token
    handleTokenSelect(token) {
        // Atualizar estado
        this.state.selectedToken = token.ticker;
        
        // Atualizar classes na tabela
        const rows = this.container.querySelectorAll('.token-row');
        rows.forEach(row => {
            row.classList.remove('selected-token');
            
            const ticker = row.querySelector('.token-ticker')?.textContent;
            if (ticker === token.ticker) {
                row.classList.add('selected-token');
            }
        });
        
        // Notificar callbacks sobre a seleção
        this.notifyTokenSelect(token.ticker);
    }
    
    // Atualizar a paginação
    updatePagination() {
        if (!this.options.showPagination) return;
        
        const paginationInfo = this.container.querySelector('#pagination-info');
        const prevButton = this.container.querySelector('#prev-page');
        const nextButton = this.container.querySelector('#next-page');
        
        if (!paginationInfo || !prevButton || !nextButton) return;
        
        // Calcular total de páginas
        const totalTokens = this.state.filteredTokens.length;
        const totalPages = Math.max(1, Math.ceil(totalTokens / this.options.pageSize));
        
        // Atualizar informação de página
        paginationInfo.textContent = `Página ${this.state.currentPage} de ${totalPages}`;
        
        // Atualizar estado dos botões
        prevButton.disabled = this.state.currentPage <= 1;
        nextButton.disabled = this.state.currentPage >= totalPages;
    }
    
    // Mudar para uma página específica
    changePage(page) {
        const totalPages = Math.ceil(this.state.filteredTokens.length / this.options.pageSize);
        
        // Validar página
        if (page < 1 || page > totalPages) return;
        
        // Atualizar estado
        this.state.currentPage = page;
        
        // Renderizar tabela
        this.renderTokensTable();
        
        // Atualizar paginação
        this.updatePagination();
    }
    
    // Aplicar filtros externos
    applyFilters(filters) {
        if (!filters) return;
        
        let filteredTokens = [...this.tokensData];
        
        // Aplicar filtro por consulta de texto
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase().trim();
            filteredTokens = filteredTokens.filter(token => {
                return token.name.toLowerCase().includes(query) || 
                       token.ticker.toLowerCase().includes(query);
            });
        }
        
        // Aplicar filtro por categoria
        if (filters.category && filters.category !== 'all') {
            filteredTokens = filteredTokens.filter(token => token.category === filters.category);
        }
        
        // Aplicar filtro por cap. de mercado mínimo
        if (filters.minMarketCap) {
            filteredTokens = filteredTokens.filter(token => token.marketCap >= filters.minMarketCap);
        }
        
        // Aplicar filtro por idade máxima do token
        if (filters.maxTokenAge) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - filters.maxTokenAge);
            
            filteredTokens = filteredTokens.filter(token => {
                if (!token.created) return true;
                const createDate = new Date(token.created);
                return createDate >= cutoffDate;
            });
        }
        
        // Atualizar estado
        this.state.filteredTokens = filteredTokens;
        this.state.currentPage = 1;
        
        // Atualizar ordenação
        if (filters.sortBy) {
            this.state.sortField = filters.sortBy;
        }
        
        if (filters.sortOrder) {
            this.state.sortOrder = filters.sortOrder;
        }
        
        // Ordenar dados
        this.sortTokensData();
        
        // Atualizar headers de ordenação
        this.updateSortHeaders();
        
        // Renderizar tabela
        this.renderTokensTable();
        
        // Atualizar paginação
        this.updatePagination();
    }
    
    // Registrar callback para evento de seleção de token
    onTokenSelect(callback) {
        if (typeof callback === 'function') {
            this.callbacks.onTokenSelect.push(callback);
        }
        return this;
    }
    
    // Notificar sobre seleção de token
    notifyTokenSelect(ticker) {
        this.callbacks.onTokenSelect.forEach(callback => {
            try {
                callback(ticker);
            } catch (error) {
                console.error('Erro ao executar callback de seleção de token:', error);
            }
        });
    }
    
    // Obter ícone de token
    getTokenIcon(ticker) {
        // Aqui poderíamos buscar ícones personalizados para cada token
        // Por simplicidade, usamos emoji baseado na primeira letra
        
        // Mapeamento de alguns tokens conhecidos para ícones
        const iconMap = {
            'ORDI': '🟠',
            'PEPE': '🐸',
            'DOGE': '🐕',
            'SATS': '₿',
            'BTC': '₿',
            'MEME': '😂',
            'SHIB': '🐕',
            'GOLD': '🥇',
            'SILVER': '🥈',
            'MAGIC': '✨',
            'DIAMOND': '💎',
            'BOME': '💣',
            'CHILL': '❄️',
            'MOON': '🌙',
            'PUNK': '🎸'
        };
        
        if (iconMap[ticker]) {
            return iconMap[ticker];
        }
        
        // Fallback para a primeira letra
        const firstLetter = ticker.charAt(0).toUpperCase();
        return firstLetter;
    }
    
    // Formatar valor monetário
    formatCurrency(value) {
        if (value === undefined || value === null) return '$0';
        
        const num = Number(value);
        if (isNaN(num)) return '$0';
        
        if (num >= 1000000000) {
            return `$${(num / 1000000000).toFixed(2)}B`;
        } else if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`;
        } else {
            return `$${num.toFixed(2)}`;
        }
    }
    
    // Formatar valor numérico
    formatNumber(value) {
        if (value === undefined || value === null) return '0';
        
        const num = Number(value);
        if (isNaN(num)) return '0';
        
        if (num >= 1000000000) {
            return `${(num / 1000000000).toFixed(1)}B`;
        } else if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        } else {
            return num.toString();
        }
    }
    
    // Dados mockup para desenvolvimento
    getMockTokensData() {
        return [
            {
                ticker: 'ORDI',
                name: 'Ordinals',
                price: 54.32,
                priceChange24h: 2.5,
                marketCap: 1200000000,
                volume24h: 150000000,
                holders: 125000,
                rank: 1,
                category: 'nft'
            },
            {
                ticker: 'PEPE',
                name: 'Pepe Rune',
                price: 0.0012,
                priceChange24h: 15.75,
                marketCap: 580000000,
                volume24h: 85000000,
                holders: 98000,
                rank: 2,
                category: 'meme'
            },
            {
                ticker: 'SATS',
                name: 'Satoshi',
                price: 0.00042,
                priceChange24h: 1.2,
                marketCap: 420000000,
                volume24h: 42000000,
                holders: 87500,
                rank: 3,
                category: 'defi'
            },
            {
                ticker: 'DOGE',
                name: 'Bitcoin Doge',
                price: 0.0085,
                priceChange24h: -8.32,
                marketCap: 310000000,
                volume24h: 32000000,
                holders: 75800,
                rank: 4,
                category: 'meme'
            },
            {
                ticker: 'MEME',
                name: 'Meme Coin',
                price: 0.0032,
                priceChange24h: 5.8,
                marketCap: 285000000,
                volume24h: 28000000,
                holders: 65400,
                rank: 5,
                category: 'meme'
            },
            {
                ticker: 'GOLD',
                name: 'Bitcoin Gold',
                price: 12.85,
                priceChange24h: -1.5,
                marketCap: 198000000,
                volume24h: 22000000,
                holders: 43200,
                rank: 6,
                category: 'other'
            },
            {
                ticker: 'MAGIC',
                name: 'Magic Internet Money',
                price: 0.25,
                priceChange24h: 3.8,
                marketCap: 175000000,
                volume24h: 19500000,
                holders: 38700,
                rank: 7,
                category: 'defi'
            },
            {
                ticker: 'PUNK',
                name: 'Crypto Punk',
                price: 2.45,
                priceChange24h: 7.2,
                marketCap: 142000000,
                volume24h: 15800000,
                holders: 32400,
                rank: 8,
                category: 'nft'
            },
            {
                ticker: 'DIAMOND',
                name: 'Diamond Hands',
                price: 0.85,
                priceChange24h: 0.3,
                marketCap: 120000000,
                volume24h: 12500000,
                holders: 28900,
                rank: 9,
                category: 'other'
            },
            {
                ticker: 'MOON',
                name: 'To The Moon',
                price: 0.12,
                priceChange24h: 12.5,
                marketCap: 98000000,
                volume24h: 10200000,
                holders: 25300,
                rank: 10,
                category: 'meme'
            },
            {
                ticker: 'BOME',
                name: 'Bomb Token',
                price: 0.032,
                priceChange24h: -5.2,
                marketCap: 75000000,
                volume24h: 8500000,
                holders: 18700,
                rank: 11,
                category: 'gaming'
            },
            {
                ticker: 'CHILL',
                name: 'Chill Vibes',
                price: 0.075,
                priceChange24h: 2.1,
                marketCap: 65000000,
                volume24h: 7200000,
                holders: 15400,
                rank: 12,
                category: 'other'
            }
        ];
    }
    
    // Destruir o componente e liberar recursos
    destroy() {
        console.log('Destruindo componente Top Tokens...');
        
        // Limpar container
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('top-tokens-widget', 'dark-mode');
        }
        
        // Limpar callbacks
        this.callbacks.onTokenSelect = [];
        
        console.log('Componente Top Tokens destruído com sucesso');
    }
}

// Exportar a classe para uso global
window.RunesTopTokens = RunesTopTokens; 