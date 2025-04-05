/**
 * RUNES Analytics Pro - Componente de Ferramentas de Compartilhamento
 * 
 * Este componente fornece uma interface amigável para:
 * - Compartilhar análises via URL
 * - Gerar imagens para redes sociais
 * - Exportar dados para formatos como CSV e JSON
 */

class ShareTools {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    // Verificar se o container existe
    if (!this.container) {
      console.error(`Container #${containerId} não encontrado`);
      return;
    }
    
    // Armazenar dados e configurações
    this.data = null;
    this.state = {};
    this.config = {
      enabledFeatures: {
        shareUrl: true,
        socialCards: true,
        dataExport: true
      },
      socialPlatforms: ['twitter', 'discord'],
      exportFormats: ['csv', 'json'],
      defaultFileName: 'runes-analytics-export',
      ...options
    };
    
    // Inicializar componente
    this.initialize();
  }
  
  /**
   * Inicializa o componente
   */
  initialize() {
    // Verificar dependências
    if (typeof window.sharingService === 'undefined') {
      console.error('SharingService não encontrado. Certifique-se de carregar services/sharing/SharingService.js');
      this.renderError('Serviço de compartilhamento não disponível');
      return;
    }
    
    // Renderizar interface inicial
    this.render();
    
    // Adicionar listeners de eventos
    this.setupEventListeners();
  }
  
  /**
   * Renderiza a interface do componente
   */
  render() {
    // Estrutura básica do componente
    this.container.innerHTML = `
      <div class="share-tools">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-share-alt"></i>
              Compartilhar e Exportar
            </h3>
          </div>
          
          <div class="card-content">
            <!-- URL Compartilhável -->
            ${this.config.enabledFeatures.shareUrl ? `
            <div class="share-section" data-animate="fade-in">
              <h4 class="section-title">Link Compartilhável</h4>
              <div class="url-share-container">
                <div class="form-group">
                  <input type="text" id="${this.containerId}-share-url" class="form-input" 
                    placeholder="Gere uma URL para compartilhar" readonly>
                  <button id="${this.containerId}-generate-url" class="btn btn-icon" data-tooltip="Gerar URL">
                    <i class="fas fa-link"></i>
                  </button>
                  <button id="${this.containerId}-copy-url" class="btn btn-icon" data-tooltip="Copiar URL" disabled>
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
                <div class="form-group">
                  <div class="checkbox-container">
                    <input type="checkbox" id="${this.containerId}-short-url" class="form-checkbox">
                    <label for="${this.containerId}-short-url">Usar URL encurtada</label>
                  </div>
                </div>
              </div>
              
              <div class="social-buttons">
                <button id="${this.containerId}-share-twitter" class="btn btn-social btn-twitter" disabled>
                  <i class="fab fa-twitter"></i> Twitter
                </button>
                <button id="${this.containerId}-share-telegram" class="btn btn-social btn-telegram" disabled>
                  <i class="fab fa-telegram"></i> Telegram
                </button>
                <button id="${this.containerId}-share-whatsapp" class="btn btn-social btn-whatsapp" disabled>
                  <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
              </div>
            </div>
            ` : ''}
            
            <!-- Cartões Sociais -->
            ${this.config.enabledFeatures.socialCards ? `
            <div class="share-section" data-animate="fade-in" data-delay="100">
              <h4 class="section-title">Cartões para Redes Sociais</h4>
              <div class="social-cards-container">
                <div class="card-preview" id="${this.containerId}-card-preview">
                  <div class="card-placeholder">
                    <i class="fas fa-image"></i>
                    <p>Visualização do cartão</p>
                  </div>
                </div>
                
                <div class="card-controls">
                  <div class="form-group">
                    <label class="form-label">Plataforma</label>
                    <select id="${this.containerId}-card-platform" class="form-select">
                      <option value="twitter">Twitter</option>
                      <option value="discord">Discord</option>
                    </select>
                  </div>
                  
                  <button id="${this.containerId}-generate-card" class="btn btn-primary">
                    <i class="fas fa-wand-magic-sparkles"></i> Gerar Imagem
                  </button>
                  
                  <button id="${this.containerId}-download-card" class="btn btn-outline" disabled>
                    <i class="fas fa-download"></i> Baixar Imagem
                  </button>
                </div>
              </div>
            </div>
            ` : ''}
            
            <!-- Exportação de Dados -->
            ${this.config.enabledFeatures.dataExport ? `
            <div class="share-section" data-animate="fade-in" data-delay="200">
              <h4 class="section-title">Exportar Dados</h4>
              <div class="export-container">
                <p class="export-description">
                  Exporte seus dados para análise externa em formatos populares.
                </p>
                
                <div class="export-buttons">
                  <button id="${this.containerId}-export-csv" class="btn">
                    <i class="fas fa-file-csv"></i> Exportar CSV
                  </button>
                  <button id="${this.containerId}-export-json" class="btn">
                    <i class="fas fa-file-code"></i> Exportar JSON
                  </button>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Inicializar animações se disponível
    if (window.RunesAnimations && RunesAnimations.setupIntersectionObserver) {
      RunesAnimations.setupIntersectionObserver();
    }
  }
  
  /**
   * Configura listeners de eventos para interatividade
   */
  setupEventListeners() {
    // Compartilhamento de URL
    if (this.config.enabledFeatures.shareUrl) {
      // Botão de gerar URL
      const generateUrlBtn = document.getElementById(`${this.containerId}-generate-url`);
      generateUrlBtn.addEventListener('click', () => this.generateShareableUrl());
      
      // Botão de copiar URL
      const copyUrlBtn = document.getElementById(`${this.containerId}-copy-url`);
      copyUrlBtn.addEventListener('click', () => this.copyToClipboard());
      
      // Checkbox de URL curta
      const shortUrlCheckbox = document.getElementById(`${this.containerId}-short-url`);
      
      // Botões de compartilhamento em redes sociais
      const shareTwitterBtn = document.getElementById(`${this.containerId}-share-twitter`);
      shareTwitterBtn.addEventListener('click', () => this.shareToSocial('twitter'));
      
      const shareTelegramBtn = document.getElementById(`${this.containerId}-share-telegram`);
      shareTelegramBtn.addEventListener('click', () => this.shareToSocial('telegram'));
      
      const shareWhatsappBtn = document.getElementById(`${this.containerId}-share-whatsapp`);
      shareWhatsappBtn.addEventListener('click', () => this.shareToSocial('whatsapp'));
    }
    
    // Cartões Sociais
    if (this.config.enabledFeatures.socialCards) {
      // Botão de gerar cartão
      const generateCardBtn = document.getElementById(`${this.containerId}-generate-card`);
      generateCardBtn.addEventListener('click', () => this.generateSocialCard());
      
      // Botão de download do cartão
      const downloadCardBtn = document.getElementById(`${this.containerId}-download-card`);
      downloadCardBtn.addEventListener('click', () => this.downloadSocialCard());
      
      // Seletor de plataforma
      const platformSelect = document.getElementById(`${this.containerId}-card-platform`);
      platformSelect.addEventListener('change', () => {
        // Regenerar cartão social ao mudar plataforma se já tiver um cartão gerado
        if (this.currentCardUrl) {
          this.generateSocialCard();
        }
      });
    }
    
    // Exportação de Dados
    if (this.config.enabledFeatures.dataExport) {
      // Botão de exportar CSV
      const exportCsvBtn = document.getElementById(`${this.containerId}-export-csv`);
      exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
      
      // Botão de exportar JSON
      const exportJsonBtn = document.getElementById(`${this.containerId}-export-json`);
      exportJsonBtn.addEventListener('click', () => this.exportData('json'));
    }
  }
  
  /**
   * Define os dados a serem compartilhados/exportados
   * @param {Object} data - Dados a serem compartilhados
   * @param {Object} state - Estado da aplicação para URL compartilhável
   */
  setData(data, state = {}) {
    this.data = data;
    this.state = state || {};
    
    // Habilitar botões de exportação se houver dados
    if (this.data) {
      if (this.config.enabledFeatures.dataExport) {
        const exportCsvBtn = document.getElementById(`${this.containerId}-export-csv`);
        const exportJsonBtn = document.getElementById(`${this.containerId}-export-json`);
        
        if (exportCsvBtn) exportCsvBtn.disabled = false;
        if (exportJsonBtn) exportJsonBtn.disabled = false;
      }
      
      if (this.config.enabledFeatures.socialCards) {
        const generateCardBtn = document.getElementById(`${this.containerId}-generate-card`);
        if (generateCardBtn) generateCardBtn.disabled = false;
      }
    }
    
    return this;
  }
  
  /**
   * Gera uma URL compartilhável com o estado atual
   */
  async generateShareableUrl() {
    try {
      // Verificar se o estado existe
      if (!this.state || Object.keys(this.state).length === 0) {
        this.state = this.getCurrentState();
      }
      
      // Verificar opção de URL curta
      const shortUrlCheckbox = document.getElementById(`${this.containerId}-short-url`);
      const useShortUrl = shortUrlCheckbox && shortUrlCheckbox.checked;
      
      // Gerar URL compartilhável
      const shareUrl = await window.sharingService.generateShareableUrl(this.state, {
        useShortUrl,
        path: window.location.pathname
      });
      
      // Atualizar campo de URL
      const urlInput = document.getElementById(`${this.containerId}-share-url`);
      urlInput.value = shareUrl;
      
      // Habilitar botões dependentes da URL
      const copyUrlBtn = document.getElementById(`${this.containerId}-copy-url`);
      const shareTwitterBtn = document.getElementById(`${this.containerId}-share-twitter`);
      const shareTelegramBtn = document.getElementById(`${this.containerId}-share-telegram`);
      const shareWhatsappBtn = document.getElementById(`${this.containerId}-share-whatsapp`);
      
      if (copyUrlBtn) copyUrlBtn.disabled = false;
      if (shareTwitterBtn) shareTwitterBtn.disabled = false;
      if (shareTelegramBtn) shareTelegramBtn.disabled = false;
      if (shareWhatsappBtn) shareWhatsappBtn.disabled = false;
      
      // Armazenar URL atual
      this.currentShareUrl = shareUrl;
      
      // Destacar o campo de entrada
      urlInput.focus();
      urlInput.select();
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'URL Gerada',
          message: 'Link de compartilhamento criado com sucesso'
        });
      }
      
      return shareUrl;
    } catch (error) {
      console.error('Erro ao gerar URL compartilhável:', error);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro ao Gerar URL',
          message: error.message || 'Não foi possível criar o link de compartilhamento'
        });
      }
      
      return null;
    }
  }
  
  /**
   * Obtém o estado atual da aplicação
   * @returns {Object} - Estado atual
   */
  getCurrentState() {
    // Este método deve ser sobrescrito pela aplicação
    // para capturar o estado atual conforme necessário
    
    // Estado básico
    const state = {
      timestamp: new Date().toISOString(),
      view: window.location.pathname,
      ...this.state
    };
    
    // Adicionar parâmetros da URL atual
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((value, key) => {
      if (key !== 'state') { // Evitar recursão
        state[key] = value;
      }
    });
    
    return state;
  }
  
  /**
   * Copia a URL compartilhável para a área de transferência
   */
  async copyToClipboard() {
    const urlInput = document.getElementById(`${this.containerId}-share-url`);
    
    if (!urlInput.value) {
      // Gerar URL primeiro se não existir
      await this.generateShareableUrl();
    }
    
    try {
      // Copiar para a área de transferência
      await navigator.clipboard.writeText(urlInput.value);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'URL Copiada',
          message: 'Link copiado para a área de transferência'
        });
      }
      
      // Efeito visual no botão
      const copyBtn = document.getElementById(`${this.containerId}-copy-url`);
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Erro ao copiar para a área de transferência:', error);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro ao Copiar',
          message: 'Não foi possível copiar o link para a área de transferência'
        });
      }
      
      return false;
    }
  }
  
  /**
   * Compartilha nas redes sociais
   * @param {string} platform - Plataforma de compartilhamento
   */
  async shareToSocial(platform) {
    // Verificar se tem URL ou gerar nova
    if (!this.currentShareUrl) {
      await this.generateShareableUrl();
    }
    
    // Obter título e descrição
    const title = this.data && this.data.title 
      ? this.data.title 
      : 'Análise de tokens Runes - RUNES Analytics Pro';
      
    const description = this.data && this.data.description
      ? this.data.description
      : 'Confira esta análise detalhada sobre tokens Runes na blockchain Bitcoin.';
    
    try {
      // Compartilhar usando o serviço
      await window.sharingService.shareToSocialMedia({
        platform,
        url: this.currentShareUrl,
        title,
        description
      });
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'Compartilhado',
          message: `Link compartilhado no ${platform}`
        });
      }
    } catch (error) {
      console.error(`Erro ao compartilhar no ${platform}:`, error);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro ao Compartilhar',
          message: `Não foi possível compartilhar no ${platform}`
        });
      }
    }
  }
  
  /**
   * Gera um cartão social com os dados atuais
   */
  async generateSocialCard() {
    try {
      // Verificar se há dados para o cartão
      if (!this.data) {
        throw new Error('Sem dados para gerar um cartão social');
      }
      
      // Obter plataforma selecionada
      const platformSelect = document.getElementById(`${this.containerId}-card-platform`);
      const platform = platformSelect ? platformSelect.value : 'twitter';
      
      // Preparar dados para o cartão
      const cardData = {
        title: this.data.title || 'Análise de Tokens Runes',
        description: this.data.description || 'RUNES Analytics Pro',
        statLabel: this.data.statLabel || 'Total de Tokens',
        statValue: this.data.statValue || this.data.value || '5.432',
        stat1Label: 'Holders',
        stat1Value: this.data.holders || '1.2K',
        stat2Label: 'Transações',
        stat2Value: this.data.transactions || '8.5K',
        timestamp: new Date().toLocaleString(),
        footer: 'runesanalytics.pro'
      };
      
      // Atualizar UI para modo de carregamento
      const previewContainer = document.getElementById(`${this.containerId}-card-preview`);
      previewContainer.innerHTML = `
        <div class="loading-indicator">
          <div class="spinner"></div>
          <p>Gerando imagem...</p>
        </div>
      `;
      
      // Gerar cartão social
      const cardUrl = await window.sharingService.generateSocialCard(cardData, platform, {
        outputFormat: 'blob'
      });
      
      // Exibir preview
      previewContainer.innerHTML = `
        <img src="${cardUrl}" alt="Cartão social para ${platform}" class="card-image">
      `;
      
      // Armazenar URL da imagem atual
      this.currentCardUrl = cardUrl;
      this.currentCardPlatform = platform;
      
      // Habilitar botão de download
      const downloadCardBtn = document.getElementById(`${this.containerId}-download-card`);
      if (downloadCardBtn) downloadCardBtn.disabled = false;
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'Imagem Gerada',
          message: `Cartão para ${platform} criado com sucesso`
        });
      }
      
      return cardUrl;
    } catch (error) {
      console.error('Erro ao gerar cartão social:', error);
      
      // Atualizar UI para exibir erro
      const previewContainer = document.getElementById(`${this.containerId}-card-preview`);
      previewContainer.innerHTML = `
        <div class="card-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erro ao gerar imagem</p>
          <small>${error.message}</small>
        </div>
      `;
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro ao Gerar Imagem',
          message: error.message || 'Não foi possível criar o cartão social'
        });
      }
      
      return null;
    }
  }
  
  /**
   * Faz download do cartão social gerado
   */
  downloadSocialCard() {
    if (!this.currentCardUrl) {
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'warning',
          title: 'Nenhuma Imagem',
          message: 'Gere uma imagem primeiro antes de baixar'
        });
      }
      return;
    }
    
    try {
      // Criar link para download
      const link = document.createElement('a');
      link.href = this.currentCardUrl;
      link.download = `runes-analytics-${this.currentCardPlatform}-${Date.now()}.png`;
      link.style.display = 'none';
      
      // Adicionar à página e simular clique
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'Download Iniciado',
          message: 'A imagem está sendo baixada'
        });
      }
    } catch (error) {
      console.error('Erro ao baixar cartão social:', error);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro ao Baixar',
          message: error.message || 'Não foi possível baixar a imagem'
        });
      }
    }
  }
  
  /**
   * Exporta os dados para o formato selecionado
   * @param {string} format - Formato de exportação (csv ou json)
   */
  async exportData(format) {
    try {
      // Verificar se há dados para exportar
      if (!this.data) {
        throw new Error('Sem dados para exportar');
      }
      
      // Nome de arquivo padrão
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const defaultFileName = `${this.config.defaultFileName}-${timestamp}`;
      
      // Exportar com base no formato
      if (format === 'csv') {
        // Verificar se os dados são um array ou extrair de um objeto
        const dataToExport = Array.isArray(this.data) 
          ? this.data 
          : (this.data.items || this.data.list || [this.data]);
          
        // Exportar como CSV
        await window.sharingService.exportToCsv(dataToExport, {
          filename: `${defaultFileName}.csv`
        });
      } else if (format === 'json') {
        // Exportar como JSON
        await window.sharingService.exportToJson(this.data, {
          filename: `${defaultFileName}.json`,
          indentation: 2
        });
      } else {
        throw new Error(`Formato de exportação não suportado: ${format}`);
      }
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'Exportação Concluída',
          message: `Dados exportados com sucesso para ${format.toUpperCase()}`
        });
      }
    } catch (error) {
      console.error(`Erro ao exportar para ${format}:`, error);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro na Exportação',
          message: error.message || `Não foi possível exportar para ${format.toUpperCase()}`
        });
      }
    }
  }
  
  /**
   * Renderiza uma mensagem de erro no container
   * @param {string} message - Mensagem de erro
   */
  renderError(message) {
    this.container.innerHTML = `
      <div class="share-tools-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }
}

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
  window.ShareTools = ShareTools;
}

// Exportar como módulo se disponível
if (typeof module !== 'undefined') {
  module.exports = ShareTools;
} 