/**
 * RUNES Analytics Pro - Template Manager
 * Sistema avançado para gerenciar templates com funcionalidades estendidas:
 * - Tags e categorias multiníveis
 * - Sistema de avaliação/ranking
 * - Validação de templates
 * - Sincronização com API
 * - Sistema de plugins
 */

class TemplateManager {
  constructor(config = {}) {
    this.config = {
      storageKey: 'runes-templates-advanced',
      apiEndpoint: null,
      validateOnSave: true,
      ...config
    };
    
    this.templates = [];
    this.pluginRegistry = new Map();
    
    // Carregar templates ao inicializar
    this.loadTemplates();
  }
  
  /**
   * Carrega templates do armazenamento local
   */
  loadTemplates() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.templates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      this.templates = [];
    }
  }
  
  /**
   * Salva templates no armazenamento local
   */
  saveTemplates() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.templates));
    } catch (error) {
      console.error('Erro ao salvar templates:', error);
    }
  }
  
  /**
   * Adiciona um novo template
   * @param {Object} template - Template a ser adicionado
   * @returns {Object} Template adicionado
   */
  addTemplate(template) {
    // Validar template se a configuração estiver ativada
    if (this.config.validateOnSave) {
      this.validateTemplate(template);
    }
    
    // Adicionar campos padrão se não existirem
    if (!template.id) {
      template.id = this.generateId();
    }
    
    if (!template.createdAt) {
      template.createdAt = new Date().toISOString();
    }
    
    template.updatedAt = new Date().toISOString();
    
    // Inicializar campos avançados
    if (!template.tags) {
      template.tags = [];
    }
    
    if (!template.category) {
      template.category = 'general';
    }
    
    if (!template.reviews) {
      template.reviews = [];
    }
    
    // Adicionar o template à lista
    this.templates.push(template);
    this.saveTemplates();
    
    return template;
  }
  
  /**
   * Atualiza um template existente
   * @param {string} id - ID do template
   * @param {Object} updates - Atualizações a serem aplicadas
   * @returns {Object|null} Template atualizado ou null se não encontrado
   */
  updateTemplate(id, updates) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const template = { ...this.templates[index], ...updates };
    template.updatedAt = new Date().toISOString();
    
    // Validar template se a configuração estiver ativada
    if (this.config.validateOnSave) {
      this.validateTemplate(template);
    }
    
    this.templates[index] = template;
    this.saveTemplates();
    
    return template;
  }
  
  /**
   * Remove um template
   * @param {string} id - ID do template
   * @returns {boolean} Sucesso da operação
   */
  removeTemplate(id) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.templates.splice(index, 1);
    this.saveTemplates();
    
    return true;
  }
  
  /**
   * Busca templates com filtros avançados
   * @param {Object} options - Opções de filtro
   * @returns {Array} Templates filtrados
   */
  findTemplates(options = {}) {
    const {
      query = '',
      tags = [],
      category = null,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      minRating = 0
    } = options;
    
    return this.templates
      .filter(template => {
        // Filtrar por texto
        if (query && !this.textMatchesTemplate(query, template)) {
          return false;
        }
        
        // Filtrar por tags
        if (tags.length > 0) {
          const templateTags = template.tags || [];
          if (!tags.some(tag => templateTags.includes(tag))) {
            return false;
          }
        }
        
        // Filtrar por categoria (suporta categorias aninhadas)
        if (category) {
          const templateCategory = template.category || 'general';
          
          // Verifica se a categoria é uma correspondência exata OU
          // se é uma subcategoria (usando o formato 'parent/child')
          if (templateCategory !== category && 
              !templateCategory.startsWith(`${category}/`)) {
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
        // Ordenar por campo especificado
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        // Ordem personalizada para avaliação
        if (sortBy === 'rating') {
          const aRating = this.getAverageRating(a);
          const bRating = this.getAverageRating(b);
          return sortOrder === 'asc' ? aRating - bRating : bRating - aRating;
        }
        
        // Ordem padrão para outros campos
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }
  
  /**
   * Verifica se um texto corresponde a um template
   * @param {string} query - Texto de busca
   * @param {Object} template - Template a verificar
   * @returns {boolean} Se há correspondência
   */
  textMatchesTemplate(query, template) {
    const searchText = query.toLowerCase();
    
    // Buscar em campos comuns
    if (template.name?.toLowerCase().includes(searchText) ||
        template.description?.toLowerCase().includes(searchText)) {
      return true;
    }
    
    // Buscar em tags
    if (template.tags?.some(tag => tag.toLowerCase().includes(searchText))) {
      return true;
    }
    
    // Buscar em categoria
    if (template.category?.toLowerCase().includes(searchText)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Obtém a avaliação média de um template
   * @param {Object} template - Template a avaliar
   * @returns {number} Avaliação média
   */
  getAverageRating(template) {
    const reviews = template.reviews || [];
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
    return sum / reviews.length;
  }
  
  /**
   * Adiciona uma avaliação a um template
   * @param {string} templateId - ID do template
   * @param {Object} review - Avaliação (rating, comment)
   * @returns {Object|null} Template atualizado ou null
   */
  addReview(templateId, review) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return null;
    
    // Validar a avaliação
    if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
      throw new Error('Avaliação inválida: rating deve ser um número entre 1 e 5');
    }
    
    // Adicionar metadados à avaliação
    const newReview = {
      ...review,
      id: this.generateId(),
      date: new Date().toISOString()
    };
    
    // Inicializar o array de avaliações se não existir
    if (!template.reviews) {
      template.reviews = [];
    }
    
    // Adicionar a avaliação
    template.reviews.push(newReview);
    
    // Salvar as alterações
    this.saveTemplates();
    
    return template;
  }
  
  /**
   * Valida um template conforme esquema definido
   * @param {Object} template - Template a validar
   * @throws {Error} Se o template for inválido
   */
  validateTemplate(template) {
    // Validações básicas
    if (!template) {
      throw new Error('Template não pode ser nulo');
    }
    
    if (!template.name) {
      throw new Error('Template deve ter um nome');
    }
    
    // Validar categorias aninhadas
    if (template.category && typeof template.category === 'string') {
      // Verifica formato de categoria aninhada (exemplo: 'finance/analytics')
      const parts = template.category.split('/');
      if (parts.some(part => !part.trim())) {
        throw new Error('Categoria inválida: não pode conter partes vazias');
      }
    }
    
    // Validar tags
    if (template.tags) {
      if (!Array.isArray(template.tags)) {
        throw new Error('Tags devem ser um array');
      }
      
      // Verificar se as tags são strings válidas
      if (template.tags.some(tag => typeof tag !== 'string' || !tag.trim())) {
        throw new Error('Tags inválidas: devem ser strings não vazias');
      }
    }
    
    // Validar reviews
    if (template.reviews) {
      if (!Array.isArray(template.reviews)) {
        throw new Error('Reviews devem ser um array');
      }
      
      // Verificar se as reviews são válidas
      template.reviews.forEach(review => {
        if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
          throw new Error('Review inválida: rating deve ser um número entre 1 e 5');
        }
      });
    }
    
    // Validar plugins
    if (template.plugins) {
      if (!Array.isArray(template.plugins)) {
        throw new Error('Plugins devem ser um array');
      }
      
      // Verificar se os plugins têm o formato correto
      template.plugins.forEach(plugin => {
        if (!plugin.id || typeof plugin.id !== 'string') {
          throw new Error('Plugin inválido: deve ter um ID');
        }
        
        if (plugin.scriptUrl && typeof plugin.scriptUrl !== 'string') {
          throw new Error('Plugin inválido: scriptUrl deve ser uma string');
        }
      });
    }
  }
  
  /**
   * Sincroniza templates com a API
   * @returns {Promise<Object>} Resultado da sincronização
   */
  async syncAllWithApi() {
    if (!this.config.apiEndpoint) {
      throw new Error('Endpoint da API não configurado');
    }
    
    // Verificar autenticação
    if (!this.isLoggedIn()) {
      throw new Error('Usuário não autenticado para sincronização');
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${this.config.apiEndpoint}/templates/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ templates: this.templates })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao sincronizar: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Atualizar templates locais com os dados da API
      if (result.templates) {
        this.templates = result.templates;
        this.saveTemplates();
      }
      
      return {
        success: true,
        message: 'Sincronização concluída com sucesso',
        updated: result.updated || 0,
        added: result.added || 0,
        errors: result.errors || []
      };
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }
  
  /**
   * Carrega um plugin para um template
   * @param {Object} plugin - Configuração do plugin
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async loadPlugin(plugin) {
    if (!this.config.enablePlugins) {
      console.warn('Sistema de plugins desativado na configuração');
      return false;
    }
    
    // Verificar se o plugin já está carregado
    if (this.pluginRegistry.has(plugin.id)) {
      return true;
    }
    
    // Carregar script do plugin
    if (!plugin.scriptUrl) {
      console.error('URL do script não fornecida para o plugin:', plugin.id);
      return false;
    }
    
    try {
      // Criar tag de script para carregar o plugin
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = plugin.scriptUrl;
        script.onload = () => {
          // Registrar o plugin como carregado
          this.pluginRegistry.set(plugin.id, true);
          console.log(`Plugin carregado com sucesso: ${plugin.id}`);
          resolve(true);
        };
        script.onerror = (error) => {
          console.error(`Erro ao carregar plugin ${plugin.id}:`, error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Erro ao carregar plugin:', error);
      return false;
    }
  }
  
  /**
   * Verifica se o usuário está logado
   * @returns {boolean} Status de login
   */
  isLoggedIn() {
    return localStorage.getItem('auth_token') !== null;
  }
  
  /**
   * Gera um ID único
   * @returns {string} ID gerado
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

// Exportar a classe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateManager;
} else {
  // Para uso no navegador
  window.TemplateManager = TemplateManager;
} 