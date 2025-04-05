/**
 * RUNES Analytics Pro - Serviço de Compartilhamento e Exportação
 * 
 * Este serviço oferece funcionalidades para:
 * - Gerar URLs compartilháveis que preservam o estado da aplicação
 * - Criar cartões sociais (Twitter, Discord) com visualizações 
 * - Exportar dados para CSV/JSON
 */

class SharingService {
  constructor() {
    // Configurações padrão
    this.config = {
      baseUrl: window.location.origin,
      apiEndpoint: '/api/share',
      compressionEnabled: true,
      shortUrlEnabled: true,
      shortUrlService: 'interno', // 'interno', 'bitly', etc.
      socialCardTemplates: {
        twitter: {
          width: 1200,
          height: 600,
          template: 'twitter-card-template'
        },
        discord: {
          width: 1200,
          height: 630,
          template: 'discord-card-template'
        }
      },
      securitySettings: {
        expirationTime: 30 * 24 * 60 * 60 * 1000, // 30 dias em ms
        maxStateSize: 100 * 1024, // 100KB máximo para estado
        sensitiveFields: ['apiKey', 'userToken', 'password']
      }
    };

    // Inicializar dependências
    this.initializeDependencies();
  }

  /**
   * Inicializa as dependências necessárias
   */
  initializeDependencies() {
    // Verificar se o LZString está disponível para compressão
    if (typeof LZString === 'undefined') {
      console.warn('LZString não encontrado. A compressão de estado será desabilitada.');
      this.config.compressionEnabled = false;
    }

    // Verificar suporte a Canvas para geração de imagens
    this.canvasSupported = typeof document !== 'undefined' && !!document.createElement('canvas').getContext;
    if (!this.canvasSupported) {
      console.warn('Canvas não suportado. Geração de cartões sociais será limitada.');
    }

    // Verificar suporte a Blob para exportação de arquivos
    this.blobSupported = typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    if (!this.blobSupported) {
      console.warn('API Blob não suportada. Exportação de arquivos será limitada.');
    }
  }

  /**
   * Configura o serviço
   * @param {Object} options - Opções de configuração
   */
  configure(options) {
    this.config = { ...this.config, ...options };
    return this;
  }

  /**
   * Gera uma URL compartilhável com o estado atual da aplicação
   * @param {Object} state - Estado da aplicação a ser codificado na URL
   * @param {Object} options - Opções adicionais para geração da URL
   * @returns {Promise<string>} - URL compartilhável
   */
  async generateShareableUrl(state, options = {}) {
    try {
      // Sanitizar o estado para remover dados sensíveis
      const sanitizedState = this.sanitizeState(state);
      
      // Verificar tamanho do estado
      const stateString = JSON.stringify(sanitizedState);
      if (stateString.length > this.config.securitySettings.maxStateSize) {
        throw new Error(`Estado excede o tamanho máximo permitido (${this.config.securitySettings.maxStateSize / 1024}KB)`);
      }

      // Comprimir o estado se habilitado
      let stateParam;
      if (this.config.compressionEnabled && typeof LZString !== 'undefined') {
        stateParam = LZString.compressToEncodedURIComponent(stateString);
      } else {
        stateParam = encodeURIComponent(stateString);
      }

      // Construir URL base
      let shareUrl = `${this.config.baseUrl}${options.path || window.location.pathname}?state=${stateParam}`;
      
      // Adicionar parâmetros adicionais se fornecidos
      if (options.additionalParams) {
        const params = new URLSearchParams(options.additionalParams);
        shareUrl += `&${params.toString()}`;
      }

      // Gerar URL curta se solicitado
      if (options.useShortUrl && this.config.shortUrlEnabled) {
        return await this.generateShortUrl(shareUrl);
      }

      return shareUrl;
    } catch (error) {
      console.error('Erro ao gerar URL compartilhável:', error);
      throw new Error(`Falha ao gerar URL de compartilhamento: ${error.message}`);
    }
  }

  /**
   * Gera uma URL curta para compartilhamento
   * @param {string} longUrl - URL original
   * @returns {Promise<string>} - URL curta
   */
  async generateShortUrl(longUrl) {
    try {
      // Se usar serviço interno
      if (this.config.shortUrlService === 'interno') {
        const response = await fetch(`${this.config.apiEndpoint}/shorten`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: longUrl })
        });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data.shortUrl;
      } 
      // Se usar Bitly ou outro serviço externo
      else if (this.config.shortUrlService === 'bitly' && this.config.bitlyToken) {
        const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.bitlyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ long_url: longUrl })
        });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data.link;
      }
      
      // Fallback para URL normal se o serviço não estiver disponível
      return longUrl;
    } catch (error) {
      console.warn('Falha ao gerar URL curta, usando URL completa:', error);
      return longUrl;
    }
  }

  /**
   * Recupera o estado da aplicação a partir da URL atual
   * @returns {Object|null} - Estado recuperado ou null se não encontrado
   */
  getStateFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const stateParam = urlParams.get('state');
      
      if (!stateParam) {
        return null;
      }
      
      let stateString;
      // Tentar descomprimir o estado se a compressão estiver habilitada
      if (this.config.compressionEnabled && typeof LZString !== 'undefined') {
        try {
          stateString = LZString.decompressFromEncodedURIComponent(stateParam);
        } catch (e) {
          // Fallback: tentar como string não comprimida
          stateString = decodeURIComponent(stateParam);
        }
      } else {
        stateString = decodeURIComponent(stateParam);
      }
      
      // Verificar se o estado não é muito grande (medida de segurança)
      if (stateString && stateString.length > this.config.securitySettings.maxStateSize) {
        console.error('Estado da URL excede o tamanho máximo permitido');
        return null;
      }
      
      return JSON.parse(stateString);
    } catch (error) {
      console.error('Erro ao recuperar estado da URL:', error);
      return null;
    }
  }

  /**
   * Sanitiza o estado removendo campos sensíveis
   * @param {Object} state - Estado a ser sanitizado
   * @returns {Object} - Estado sanitizado
   */
  sanitizeState(state) {
    const sensitiveFields = this.config.securitySettings.sensitiveFields;
    
    // Função recursiva para limpar objetos
    const cleanObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      // Se for um array, mapear e limpar cada item
      if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item));
      }
      
      // Para objetos regulares
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        // Pular campos sensíveis
        if (sensitiveFields.includes(key)) {
          continue;
        }
        
        // Processar recursivamente objetos aninhados
        if (value && typeof value === 'object') {
          cleaned[key] = cleanObject(value);
        } else {
          cleaned[key] = value;
        }
      }
      
      return cleaned;
    };
    
    return cleanObject(state);
  }

  /**
   * Gera uma imagem para compartilhamento em redes sociais
   * @param {Object} data - Dados para renderizar no cartão
   * @param {string} platform - Plataforma (twitter, discord, etc)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<string>} - URL da imagem ou data URL
   */
  async generateSocialCard(data, platform = 'twitter', options = {}) {
    if (!this.canvasSupported) {
      throw new Error('Canvas não suportado neste ambiente.');
    }
    
    try {
      // Obter configuração do template
      const template = this.config.socialCardTemplates[platform];
      if (!template) {
        throw new Error(`Template para plataforma ${platform} não encontrado`);
      }
      
      // Opções de renderização
      const renderOptions = {
        width: options.width || template.width,
        height: options.height || template.height,
        templateId: options.templateId || template.template,
        backgroundColor: options.backgroundColor || '#1a1a2e',
        textColor: options.textColor || '#ffffff',
        accentColor: options.accentColor || '#5352ed',
        logoUrl: options.logoUrl || '/assets/logo.png',
        ...options
      };
      
      // Se foi fornecido um elemento HTML para renderizar
      if (options.targetElement) {
        return await this.renderElementToImage(options.targetElement, renderOptions);
      }
      
      // Caso contrário, renderizar a partir do template e dados
      return await this.renderTemplateToImage(data, renderOptions);
    } catch (error) {
      console.error('Erro ao gerar cartão social:', error);
      throw new Error(`Falha ao gerar cartão social: ${error.message}`);
    }
  }

  /**
   * Renderiza um elemento HTML existente em uma imagem
   * @param {HTMLElement} element - Elemento a ser renderizado
   * @param {Object} options - Opções de renderização
   * @returns {Promise<string>} - Data URL da imagem
   */
  async renderElementToImage(element, options) {
    // Usar html2canvas se disponível
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas não está disponível. Instale-o para usar esta funcionalidade.');
    }
    
    try {
      // Configurações da renderização
      const canvas = await html2canvas(element, {
        backgroundColor: options.backgroundColor,
        width: options.width,
        height: options.height,
        scale: options.scale || 2, // Para melhor qualidade
        useCORS: true, // Para imagens externas
        logging: false
      });
      
      // Converter para data URL ou Blob
      if (options.outputFormat === 'blob' && this.blobSupported) {
        return new Promise((resolve) => {
          canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
          }, 'image/png');
        });
      } else {
        return canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.error('Erro ao renderizar elemento para imagem:', error);
      throw error;
    }
  }

  /**
   * Renderiza um template com dados em uma imagem
   * @param {Object} data - Dados para o template
   * @param {Object} options - Opções de renderização
   * @returns {Promise<string>} - Data URL da imagem
   */
  async renderTemplateToImage(data, options) {
    // Criar um elemento temporário para o template
    const templateContainer = document.createElement('div');
    templateContainer.style.position = 'absolute';
    templateContainer.style.top = '-9999px';
    templateContainer.style.left = '-9999px';
    templateContainer.style.width = `${options.width}px`;
    templateContainer.style.height = `${options.height}px`;
    
    // Obter o template
    let template;
    if (options.templateId && document.getElementById(options.templateId)) {
      template = document.getElementById(options.templateId).innerHTML;
    } else {
      // Template padrão se nenhum for encontrado
      template = this.getDefaultTemplate(options.platform);
    }
    
    // Aplicar dados ao template
    const html = this.applyDataToTemplate(template, data);
    templateContainer.innerHTML = html;
    
    // Adicionar ao body temporariamente
    document.body.appendChild(templateContainer);
    
    try {
      // Renderizar com html2canvas
      const imageUrl = await this.renderElementToImage(templateContainer, options);
      return imageUrl;
    } finally {
      // Limpar o elemento temporário
      document.body.removeChild(templateContainer);
    }
  }

  /**
   * Obtém um template padrão para uma plataforma
   * @param {string} platform - Nome da plataforma
   * @returns {string} - Template HTML
   */
  getDefaultTemplate(platform = 'twitter') {
    // Template padrão para Twitter
    if (platform === 'twitter') {
      return `
        <div style="width: 100%; height: 100%; background-color: #1a1a2e; display: flex; flex-direction: column; padding: 40px; font-family: 'Inter', sans-serif; color: white;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="{{logoUrl}}" alt="Logo" style="height: 60px; margin-right: 20px;" />
            <h1 style="font-size: 28px; color: {{accentColor}};">RUNES Analytics Pro</h1>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h2 style="font-size: 40px; margin-bottom: 20px;">{{title}}</h2>
            <p style="font-size: 24px; color: #a0a0c0; margin-bottom: 30px;">{{description}}</p>
            <div style="background-color: rgba(255,255,255,0.1); border-radius: 10px; padding: 20px;">
              <div style="font-size: 20px; margin-bottom: 10px;">{{statLabel}}</div>
              <div style="font-size: 36px; font-weight: bold; color: {{accentColor}};">{{statValue}}</div>
            </div>
          </div>
          <div style="font-size: 16px; color: #a0a0c0; margin-top: 30px;">{{footer}}</div>
        </div>
      `;
    }
    
    // Template padrão para Discord
    if (platform === 'discord') {
      return `
        <div style="width: 100%; height: 100%; background-color: #1a1a2e; display: flex; flex-direction: column; padding: 40px; font-family: 'Inter', sans-serif; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div style="display: flex; align-items: center;">
              <img src="{{logoUrl}}" alt="Logo" style="height: 50px; margin-right: 15px;" />
              <h1 style="font-size: 24px; color: {{accentColor}};">RUNES Analytics Pro</h1>
            </div>
            <div style="background-color: rgba(255,255,255,0.1); border-radius: 20px; padding: 8px 16px; font-size: 14px;">
              {{timestamp}}
            </div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h2 style="font-size: 36px; margin-bottom: 15px;">{{title}}</h2>
            <p style="font-size: 22px; color: #a0a0c0; margin-bottom: 25px;">{{description}}</p>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1; background-color: rgba(255,255,255,0.1); border-radius: 10px; padding: 20px;">
                <div style="font-size: 18px; margin-bottom: 10px;">{{stat1Label}}</div>
                <div style="font-size: 30px; font-weight: bold; color: {{accentColor}};">{{stat1Value}}</div>
              </div>
              <div style="flex: 1; background-color: rgba(255,255,255,0.1); border-radius: 10px; padding: 20px;">
                <div style="font-size: 18px; margin-bottom: 10px;">{{stat2Label}}</div>
                <div style="font-size: 30px; font-weight: bold; color: {{accentColor}};">{{stat2Value}}</div>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 30px; font-size: 16px; color: #a0a0c0;">
            <div>{{footer}}</div>
            <div>runesanalytics.pro</div>
          </div>
        </div>
      `;
    }
    
    // Template genérico para outras plataformas
    return `
      <div style="width: 100%; height: 100%; background-color: #1a1a2e; display: flex; flex-direction: column; padding: 30px; font-family: 'Inter', sans-serif; color: white;">
        <h1 style="font-size: 32px; color: {{accentColor}}; margin-bottom: 20px;">{{title}}</h1>
        <p style="font-size: 20px; color: #a0a0c0; margin-bottom: 30px;">{{description}}</p>
        <div style="font-size: 16px; color: #a0a0c0; margin-top: auto;">RUNES Analytics Pro - {{timestamp}}</div>
      </div>
    `;
  }

  /**
   * Aplica dados a um template usando substituição simples de variáveis
   * @param {string} template - Template HTML com placeholders {{variableName}}
   * @param {Object} data - Dados para substituir no template
   * @returns {string} - HTML processado
   */
  applyDataToTemplate(template, data) {
    let processed = template;
    
    // Substituir todas as variáveis no template
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    }
    
    // Dados padrão para variáveis não substituídas
    const defaultValues = {
      title: 'RUNES Analytics Pro',
      description: 'Análise avançada de tokens Runes',
      timestamp: new Date().toLocaleString(),
      accentColor: '#5352ed',
      logoUrl: '/assets/logo.png',
      footer: 'Compartilhado via RUNES Analytics Pro'
    };
    
    // Substituir variáveis não preenchidas com valores padrão
    for (const [key, value] of Object.entries(defaultValues)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    }
    
    // Remover quaisquer variáveis restantes
    processed = processed.replace(/{{[^{}]+}}/g, '');
    
    return processed;
  }

  /**
   * Exporta dados para um arquivo CSV
   * @param {Array} data - Array de objetos com os dados
   * @param {Object} options - Opções de exportação
   * @returns {Promise<string>} - URL para download ou data URL
   */
  async exportToCsv(data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Dados inválidos para exportação CSV');
    }
    
    try {
      // Obter cabeçalhos a partir das chaves do primeiro objeto ou das opções
      const headers = options.headers || Object.keys(data[0]);
      
      // Mapear cabeçalhos personalizados se fornecidos
      const headerLabels = options.headerLabels || headers;
      
      // Iniciar com linha de cabeçalho
      let csvContent = headerLabels.join(',') + '\r\n';
      
      // Função para escapar valores para CSV
      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) return '';
        let str = value.toString();
        // Se contiver vírgula, aspas ou quebra de linha, colocar entre aspas
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          // Escape de aspas
          str = str.replace(/"/g, '""');
          return `"${str}"`;
        }
        return str;
      };
      
      // Adicionar linhas de dados
      for (const row of data) {
        const values = headers.map(header => escapeCsvValue(row[header]));
        csvContent += values.join(',') + '\r\n';
      }
      
      // Criar blob com BOM UTF-8 para suporte a caracteres especiais no Excel
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
      
      // Retornar URL para download ou data URL
      if (options.returnDataUrl) {
        return URL.createObjectURL(blob);
      } else {
        this.downloadFile(blob, options.filename || 'runes-data-export.csv');
        return true;
      }
    } catch (error) {
      console.error('Erro ao exportar para CSV:', error);
      throw new Error(`Falha ao exportar dados: ${error.message}`);
    }
  }

  /**
   * Exporta dados para um arquivo JSON
   * @param {Object|Array} data - Dados a serem exportados
   * @param {Object} options - Opções de exportação
   * @returns {Promise<string>} - URL para download ou data URL
   */
  async exportToJson(data, options = {}) {
    try {
      // Converter dados para JSON formatado
      const jsonContent = JSON.stringify(
        data, 
        options.replacer || null, 
        options.indentation || 2
      );
      
      // Criar blob
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      // Retornar URL para download ou data URL
      if (options.returnDataUrl) {
        return URL.createObjectURL(blob);
      } else {
        this.downloadFile(blob, options.filename || 'runes-data-export.json');
        return true;
      }
    } catch (error) {
      console.error('Erro ao exportar para JSON:', error);
      throw new Error(`Falha ao exportar dados: ${error.message}`);
    }
  }

  /**
   * Inicia o download de um arquivo
   * @param {Blob} blob - Blob com o conteúdo do arquivo
   * @param {string} filename - Nome do arquivo
   */
  downloadFile(blob, filename) {
    if (!this.blobSupported) {
      throw new Error('Exportação de arquivos não suportada neste navegador.');
    }
    
    // Criar URL para o blob
    const url = URL.createObjectURL(blob);
    
    // Criar link de download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Adicionar à página e simular clique
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Compartilha dados/link em redes sociais
   * @param {Object} options - Opções de compartilhamento
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async shareToSocialMedia(options) {
    const { platform, url, title, description, image } = options;
    
    try {
      // Verificar se a Web Share API está disponível
      if (navigator.share && !platform) {
        await navigator.share({
          title: title || 'RUNES Analytics Pro',
          text: description || 'Dados de análise de tokens Runes',
          url: url
        });
        return true;
      }
      
      // Compartilhamento específico para cada plataforma
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title || '')}&url=${encodeURIComponent(url)}`, '_blank');
          break;
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title || '')}`, '_blank');
          break;
          
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
          
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`, '_blank');
          break;
          
        case 'whatsapp':
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent((title || '') + ' ' + url)}`, '_blank');
          break;
          
        default:
          throw new Error(`Plataforma de compartilhamento não suportada: ${platform}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar em redes sociais:', error);
      return false;
    }
  }
}

// Criar e exportar singleton
const sharingService = new SharingService();

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
  window.sharingService = sharingService;
}

// Exportar como módulo se disponível
if (typeof module !== 'undefined') {
  module.exports = sharingService;
} 