/**
 * Serviço de Marketplace de Templates
 * Gerencia templates disponíveis, temas e integração com IPFS
 */
class TemplateMarketplace {
  constructor(config = {}) {
    this.config = {
      ipfsService: null,
      apiEndpoint: null,
      localStorageKey: 'runes-templates',
      validateOnSave: true,
      syncAutomatic: false,
      enablePlugins: true,
      ...config
    };
    
    this.templates = [];
    this.themes = [];
    this.featured = [];
    this.pluginRegistry = new Map();
    
    this.initialize();
  }
  
  /**
   * Inicializa o marketplace
   */
  async initialize() {
    // Carregar templates locais
    this.loadLocalTemplates();
    
    // Carregar temas disponíveis
    await this.loadThemes();
    
    // Carregar templates em destaque
    if (this.config.apiEndpoint) {
      await this.loadFeaturedTemplates();
      
      // Sincronização automática se configurada
      if (this.config.syncAutomatic && this.isLoggedIn()) {
        this.syncAllWithApi().catch(err => {
          console.warn('Sincronização automática falhou:', err);
        });
      }
    }
  }
  
  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn() {
    return localStorage.getItem('auth_token') !== null;
  }
  
  /**
   * Carrega templates salvos localmente
   */
  loadLocalTemplates() {
    try {
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        this.templates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar templates locais:', error);
      this.templates = [];
    }
  }
  
  /**
   * Salva templates localmente
   */
  saveLocalTemplates() {
    try {
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(this.templates));
    } catch (error) {
      console.error('Erro ao salvar templates locais:', error);
    }
  }
  
  /**
   * Carrega temas disponíveis
   */
  async loadThemes() {
    // Temas padrão
    this.themes = [
      {
        id: 'dark',
        name: 'Tema Escuro',
        description: 'Um tema escuro moderno e elegante',
        preview: 'assets/themes/dark-preview.png',
        colors: {
          background: '#1E1E2E',
          text: '#CDD6F4',
          accent: '#CBA6F7',
          secondary: '#F38BA8'
        }
      },
      {
        id: 'light',
        name: 'Tema Claro',
        description: 'Um tema claro e minimalista',
        preview: 'assets/themes/light-preview.png',
        colors: {
          background: '#EFF1F5',
          text: '#4C4F69',
          accent: '#8839EF',
          secondary: '#D20F39'
        }
      },
      {
        id: 'crypto',
        name: 'Crypto Night',
        description: 'Tema inspirado em dashboard de crypto',
        preview: 'assets/themes/crypto-preview.png',
        colors: {
          background: '#0F172A',
          text: '#E2E8F0',
          accent: '#F59E0B',
          secondary: '#10B981'
        }
      },
      {
        id: 'minimal',
        name: 'Minimalista',
        description: 'Tema limpo e direto ao ponto',
        preview: 'assets/themes/minimal-preview.png',
        colors: {
          background: '#FFFFFF',
          text: '#000000',
          accent: '#3B82F6',
          secondary: '#F97316'
        }
      }
    ];
    
    // Carregar temas da API se disponível
    if (this.config.apiEndpoint) {
      try {
        const response = await fetch(`${this.config.apiEndpoint}/themes`);
        if (response.ok) {
          const apiThemes = await response.json();
          // Mesclar com temas padrão, substituindo pelo id
          apiThemes.forEach(theme => {
            const index = this.themes.findIndex(t => t.id === theme.id);
            if (index >= 0) {
              this.themes[index] = theme;
            } else {
              this.themes.push(theme);
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao carregar temas da API:', error);
      }
    }
    
    return this.themes;
  }
  
  /**
   * Carrega templates em destaque do marketplace
   */
  async loadFeaturedTemplates() {
    if (!this.config.apiEndpoint) return [];
    
    try {
      const response = await fetch(`${this.config.apiEndpoint}/templates/featured`);
      if (response.ok) {
        this.featured = await response.json();
      }
    } catch (error) {
      console.warn('Erro ao carregar templates em destaque:', error);
      this.featured = [];
    }
    
    return this.featured;
  }
  
  /**
   * Busca templates no marketplace
   */
  async searchTemplates(query = '', options = {}) {
    const {
      category = null,
      tags = [],
      sortBy = 'popularity',
      minRating = 0,
      page = 1,
      limit = 10
    } = options;
    
    if (!this.config.apiEndpoint) {
      // Busca local se não tiver API
      return this.templates
        .filter(template => {
          // Filtrar pelo termo de busca
          if (query && !template.name.toLowerCase().includes(query.toLowerCase())) {
            return false;
          }
          
          // Filtrar por categoria
          if (category && template.category !== category) {
            return false;
          }
          
          // Filtrar por tags
          if (tags.length > 0) {
            const templateTags = template.tags || [];
            if (!tags.some(tag => templateTags.includes(tag))) {
              return false;
            }
          }
          
          // Filtrar por avaliação
          if (minRating > 0) {
            const avgRating = this.getAverageRating(template);
            if (avgRating < minRating) {
              return false;
            }
          }
          
          return true;
        })
        .sort((a, b) => {
          // Ordenar por popularidade, avaliação ou data
          if (sortBy === 'date') {
            return new Date(b.timestamp) - new Date(a.timestamp);
          } else if (sortBy === 'rating') {
            return this.getAverageRating(b) - this.getAverageRating(a);
          }
          return (b.downloads || 0) - (a.downloads || 0);
        })
        .slice((page - 1) * limit, page * limit);
    }
    
    // Busca na API
    try {
      const queryParams = new URLSearchParams({
        q: query,
        category: category || '',
        tags: tags.join(','),
        minRating: minRating.toString(),
        sortBy,
        page,
        limit
      }).toString();
      
      const response = await fetch(`${this.config.apiEndpoint}/templates/search?${queryParams}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      return [];
    }
  }
  
  /**
   * Calcula a avaliação média de um template
   */
  getAverageRating(template) {
    const reviews = template.reviews || [];
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  }
  
  /**
   * Obtém um template do marketplace
   */
  async getTemplate(id) {
    // Verificar se é um template local
    const localTemplate = this.templates.find(t => t.id === id);
    if (localTemplate) {
      return localTemplate;
    }
    
    // Buscar da API
    if (this.config.apiEndpoint) {
      try {
        const response = await fetch(`${this.config.apiEndpoint}/templates/${id}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error(`Erro ao buscar template ${id}:`, error);
      }
    }
    
    // Verificar no IPFS
    if (this.config.ipfsService && id.startsWith('ipfs-')) {
      const cid = id.replace('ipfs-', '');
      try {
        return await this.config.ipfsService.getFromIpfs(cid);
      } catch (error) {
        console.error(`Erro ao buscar template do IPFS ${cid}:`, error);
      }
    }
    
    return null;
  }
  
  /**
   * Adiciona uma avaliação a um template
   */
  async addReview(templateId, review) {
    // Validar review
    if (!review.rating || review.rating < 1 || review.rating > 5) {
      throw new Error('Avaliação inválida. Deve ser um valor entre 1 e 5.');
    }
    
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }
    
    // Adicionar data se não fornecida
    if (!review.date) {
      review.date = new Date().toISOString().split('T')[0];
    }
    
    // Inicializar array de reviews se não existir
    if (!template.reviews) {
      template.reviews = [];
    }
    
    // Adicionar review
    template.reviews.push(review);
    
    // Salvar template atualizado
    return this.saveTemplate(template);
  }
  
  /**
   * Valida um template
   */
  validateTemplate(template) {
    // Validação básica
    if (!template.name) {
      throw new Error('O template deve ter um nome');
    }
    
    if (!template.elements || !Array.isArray(template.elements) || template.elements.length === 0) {
      throw new Error('O template deve ter pelo menos um elemento');
    }
    
    // Validar plugins
    if (template.plugins && Array.isArray(template.plugins)) {
      template.plugins.forEach(plugin => {
        if (!plugin.id || !plugin.scriptUrl) {
          throw new Error('Plugins devem ter um ID e uma URL de script');
        }
      });
    }
    
    // Validar categoria
    if (template.category && !template.category.includes('/')) {
      throw new Error('Categoria deve estar no formato "categoria/subcategoria"');
    }
    
    // Validar tags
    if (template.tags && !Array.isArray(template.tags)) {
      throw new Error('Tags devem ser um array de strings');
    }
    
    return true;
  }
  
  /**
   * Salva um template
   */
  async saveTemplate(template) {
    if (!template.id) {
      template.id = `template-${Date.now()}`;
    }
    
    template.timestamp = new Date().toISOString();
    
    // Validação opcional
    if (this.config.validateOnSave) {
      try {
        this.validateTemplate(template);
      } catch (error) {
        console.error('Validação de template falhou:', error);
        throw error;
      }
    }
    
    // Verificar se já existe para atualizar
    const index = this.templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      this.templates[index] = template;
    } else {
      this.templates.push(template);
    }
    
    // Salvar localmente
    this.saveLocalTemplates();
    
    // Salvar na API se disponível
    if (this.config.apiEndpoint) {
      try {
        const response = await fetch(`${this.config.apiEndpoint}/templates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify(template)
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        }
      } catch (error) {
        console.error('Erro ao salvar template na API:', error);
      }
    }
    
    return template;
  }
  
  /**
   * Sincroniza todos os templates locais com a API
   */
  async syncAllWithApi() {
    if (!this.config.apiEndpoint) {
      throw new Error('API endpoint não configurado');
    }
    
    if (!this.isLoggedIn()) {
      throw new Error('Usuário não está logado');
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Enviar todos os templates locais para a API
    for (const template of this.templates) {
      try {
        const response = await fetch(`${this.config.apiEndpoint}/templates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify(template)
        });
        
        if (response.ok) {
          const result = await response.json();
          results.success.push(result);
        } else {
          results.failed.push({
            template,
            error: `Erro HTTP ${response.status}: ${response.statusText}`
          });
        }
      } catch (error) {
        results.failed.push({
          template,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  /**
   * Carrega e registra um plugin
   */
  async loadPlugin(plugin) {
    if (!this.config.enablePlugins) {
      console.warn('Plugins desativados na configuração');
      return false;
    }
    
    if (this.pluginRegistry.has(plugin.id)) {
      console.log(`Plugin ${plugin.id} já carregado`);
      return true;
    }
    
    try {
      // Carregar script
      const script = document.createElement('script');
      script.src = plugin.scriptUrl;
      script.id = `plugin-${plugin.id}`;
      
      // Criar uma promessa para saber quando o script carregou
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          console.log(`Plugin ${plugin.id} carregado com sucesso`);
          
          // Verificar se o plugin registrou sua API no namespace global
          if (window.RunesPlugins && window.RunesPlugins[plugin.id]) {
            this.pluginRegistry.set(plugin.id, window.RunesPlugins[plugin.id]);
            resolve(true);
          } else {
            console.warn(`Plugin ${plugin.id} não se registrou corretamente`);
            reject(new Error(`Plugin ${plugin.id} não se registrou corretamente`));
          }
        };
        
        script.onerror = () => {
          reject(new Error(`Erro ao carregar plugin ${plugin.id}`));
        };
      });
      
      // Adicionar ao DOM
      document.head.appendChild(script);
      
      // Aguardar carregamento
      await loadPromise;
      return true;
    } catch (error) {
      console.error(`Erro ao carregar plugin ${plugin.id}:`, error);
      return false;
    }
  }
  
  /**
   * Salva um template no IPFS
   */
  async saveTemplateToIpfs(template) {
    if (!this.config.ipfsService) {
      throw new Error('Serviço IPFS não configurado');
    }
    
    // Validar template antes de salvar
    if (this.config.validateOnSave) {
      this.validateTemplate(template);
    }
    
    // Preparar dados para o IPFS
    const ipfsData = {
      ...template,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Salvar no IPFS
    const result = await this.config.ipfsService.saveToIpfs(ipfsData, {
      name: template.name,
      type: 'template',
      metadata: {
        theme: template.theme,
        category: template.category || 'general',
        tags: template.tags || [],
        elementCount: template.elements?.length || 0
      }
    });
    
    // Adicionar aos templates locais
    const ipfsTemplate = {
      ...template,
      id: `ipfs-${result.cid}`,
      ipfsCid: result.cid,
      ipfsUrl: result.url,
      timestamp: new Date().toISOString()
    };
    
    this.templates.push(ipfsTemplate);
    this.saveLocalTemplates();
    
    return {
      template: ipfsTemplate,
      ipfs: result
    };
  }
  
  /**
   * Deleta um template
   */
  async deleteTemplate(id) {
    // Remover localmente
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveLocalTemplates();
    
    // Remover da API se disponível
    if (this.config.apiEndpoint && this.isLoggedIn()) {
      try {
        await fetch(`${this.config.apiEndpoint}/templates/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });
      } catch (error) {
        console.error(`Erro ao excluir template ${id} da API:`, error);
      }
    }
    
    return true;
  }
  
  /**
   * Verifica licença/permissão de um tema
   */
  async checkThemeLicense(themeId) {
    // Verifique localmente primeiro
    const theme = this.themes.find(t => t.id === themeId);
    if (theme && !theme.requiresLicense) {
      return { licensed: true, theme };
    }
    
    // Verificar na API
    if (this.config.apiEndpoint) {
      try {
        const response = await fetch(`${this.config.apiEndpoint}/themes/${themeId}/license`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error(`Erro ao verificar licença do tema ${themeId}:`, error);
      }
    }
    
    // Fallback: permitir uso com marca d'água
    return { 
      licensed: false, 
      watermark: true,
      message: 'Usando versão gratuita com marca d\'água'
    };
  }
  
  /**
   * Importa um template a partir de URL do IPFS
   */
  async importTemplateFromIpfs(cidOrUrl) {
    if (!this.config.ipfsService) {
      throw new Error('Serviço IPFS não configurado');
    }
    
    // Extrair CID da URL se necessário
    let cid = cidOrUrl;
    if (cidOrUrl.includes('/ipfs/')) {
      cid = cidOrUrl.split('/ipfs/')[1].split('/')[0];
    }
    
    // Buscar do IPFS
    const data = await this.config.ipfsService.getFromIpfs(cid);
    
    // Validar o template importado
    if (this.config.validateOnSave) {
      try {
        this.validateTemplate(data);
      } catch (error) {
        throw new Error(`Template inválido: ${error.message}`);
      }
    }
    
    // Transformar em template local
    const template = {
      ...data,
      id: `ipfs-${cid}`,
      ipfsCid: cid,
      ipfsUrl: `${this.config.ipfsService.config.ipfsGateway}${cid}`,
      imported: true,
      importDate: new Date().toISOString()
    };
    
    // Adicionar aos templates locais
    this.templates.push(template);
    this.saveLocalTemplates();
    
    // Carregar plugins se existirem e estiverem habilitados
    if (this.config.enablePlugins && template.plugins) {
      for (const plugin of template.plugins) {
        await this.loadPlugin(plugin).catch(err => {
          console.warn(`Não foi possível carregar o plugin ${plugin.id}:`, err);
        });
      }
    }
    
    return template;
  }
  
  /**
   * Exporta um template para JSON ou ZIP
   */
  async exportTemplate(id, format = 'json') {
    const template = await this.getTemplate(id);
    if (!template) {
      throw new Error(`Template ${id} não encontrado`);
    }
    
    if (format === 'json') {
      // Gerar arquivo JSON para download
      const json = JSON.stringify(template, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      return { success: true, format: 'json' };
    }
    
    // Implementação para ZIP será adicionada quando necessário
    throw new Error(`Formato de exportação '${format}' não suportado`);
  }
}

// Exportar para uso global
export default TemplateMarketplace; 