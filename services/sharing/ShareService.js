/**
 * RUNES Analytics Pro - Sistema de Compartilhamento e Exportação
 * 
 * Este serviço fornece mecanismos para:
 * 1. Gerar URLs compartilháveis que preservam o estado da aplicação
 * 2. Gerar cartões/imagens sociais para compartilhamento
 * 3. Exportar dados em vários formatos (CSV, JSON)
 */

class ShareService {
  constructor() {
    // Configuração
    this.config = {
      baseUrl: window.location.origin,
      appPath: '/runes',
      compressionEnabled: true,
      defaultCardTemplate: 'standard',
      defaultCardSize: { width: 1200, height: 630 }, // Dimensões otimizadas para compartilhamento social
      maxStateSizeBytes: 10000, // Limite para tamanho do estado na URL (10KB)
      defaultCsvDelimiter: ',',
      additionalParams: [],
      shareBaseUrl: null // Configurado automaticamente
    };

    // Inicializar quando bibliotecas necessárias estiverem carregadas
    this.init();
  }

  /**
   * Inicializa o serviço de compartilhamento
   */
  init() {
    // Detectar ambiente e ajustar configurações
    this.config.shareBaseUrl = this.config.baseUrl + this.config.appPath;
    
    // Verificar se o LZ-String está disponível para compressão
    this.compressionAvailable = typeof LZString !== 'undefined';
    
    // Se a compressão não estiver disponível, desabilitar
    if (this.config.compressionEnabled && !this.compressionAvailable) {
      console.warn('ShareService: Compressão desabilitada - LZString não disponível');
      this.config.compressionEnabled = false;
    }
    
    // Configurar proxy de eventos
    this.setupEvents();
    
    console.log('📤 ShareService: Sistema de compartilhamento inicializado');
  }

  /**
   * Configura eventos para o serviço de compartilhamento
   */
  setupEvents() {
    // Ouvir eventos de URL
    window.addEventListener('popstate', (event) => {
      // Notificar aplicação sobre mudança de estado via URL
      if (event.state && event.state.runesAppState) {
        const customEvent = new CustomEvent('runesAppStateChanged', {
          detail: { state: event.state.runesAppState, source: 'url' }
        });
        window.dispatchEvent(customEvent);
      }
    });
    
    // Verificar URL inicial
    this.processInitialUrl();
  }

  /**
   * Processa a URL inicial para restaurar estado
   */
  processInitialUrl() {
    const stateParam = this.getQueryParam('state');
    
    if (stateParam) {
      try {
        const state = this.decodeState(stateParam);
        
        // Notificar aplicação
        const customEvent = new CustomEvent('runesAppStateChanged', {
          detail: { state, source: 'initialUrl' }
        });
        window.dispatchEvent(customEvent);
        
        console.log('📤 ShareService: Estado restaurado da URL inicial');
      } catch (error) {
        console.error('Erro ao processar estado da URL:', error);
      }
    }
  }

  /**
   * Gera uma URL compartilhável que preserva o estado da aplicação
   * 
   * @param {Object} state - Estado da aplicação a ser codificado na URL
   * @param {Object} options - Opções adicionais
   * @returns {String} URL compartilhável
   */
  generateShareableUrl(state, options = {}) {
    // Mesclar opções com padrões
    const settings = {
      addToHistory: false,
      includeFilters: true,
      includePage: true,
      ...options
    };
    
    try {
      // Filtrar o estado conforme configurações
      const filteredState = this.filterStateForSharing(state, settings);
      
      // Codificar o estado para URL
      const encodedState = this.encodeState(filteredState);
      
      // Verificar tamanho do estado codificado
      const stateSizeBytes = encodedState.length * 2; // Aproximação para caracteres Unicode
      
      if (stateSizeBytes > this.config.maxStateSizeBytes) {
        console.warn(`Estado excede o tamanho máximo recomendado (${stateSizeBytes} bytes)`);
      }
      
      // Construir URL
      const url = new URL(this.config.shareBaseUrl);
      url.searchParams.set('state', encodedState);
      
      // Adicionar parâmetros adicionais (se configurados)
      this.config.additionalParams.forEach(param => {
        if (state[param.key] !== undefined) {
          url.searchParams.set(param.key, state[param.key]);
        }
      });
      
      // Adicionar ao histórico do navegador se solicitado
      if (settings.addToHistory) {
        window.history.pushState(
          { runesAppState: filteredState }, 
          document.title, 
          url.toString()
        );
      }
      
      return url.toString();
    } catch (error) {
      console.error('Erro ao gerar URL compartilhável:', error);
      return window.location.href;
    }
  }

  /**
   * Filtra o estado da aplicação para compartilhamento
   * 
   * @param {Object} state - Estado completo da aplicação
   * @param {Object} settings - Configurações de filtragem
   * @returns {Object} Estado filtrado
   */
  filterStateForSharing(state, settings) {
    // Clone o estado para não modificar o original
    const filteredState = { ...state };
    
    // Remover dados sensíveis ou desnecessários
    delete filteredState.user;
    delete filteredState.authToken;
    delete filteredState.session;
    
    // Remover campos grandes demais para URL
    delete filteredState.rawData;
    
    // Aplicar filtragem condicional conforme configurações
    if (!settings.includeFilters) {
      delete filteredState.filters;
    }
    
    if (!settings.includePage) {
      delete filteredState.page;
      delete filteredState.pageSize;
    }
    
    return filteredState;
  }

  /**
   * Codifica o estado para a URL (com compressão opcional)
   * 
   * @param {Object} state - Estado a codificar
   * @returns {String} Estado codificado
   */
  encodeState(state) {
    // Converter estado para JSON
    const stateJson = JSON.stringify(state);
    
    // Aplicar compressão se habilitada
    if (this.config.compressionEnabled && this.compressionAvailable) {
      return LZString.compressToEncodedURIComponent(stateJson);
    }
    
    // Sem compressão, apenas codificar para URL
    return encodeURIComponent(stateJson);
  }

  /**
   * Decodifica o estado a partir da URL
   * 
   * @param {String} encodedState - Estado codificado da URL
   * @returns {Object} Estado decodificado
   */
  decodeState(encodedState) {
    let stateJson;
    
    // Tentar descomprimir se a compressão estiver habilitada
    if (this.config.compressionEnabled && this.compressionAvailable) {
      try {
        stateJson = LZString.decompressFromEncodedURIComponent(encodedState);
      } catch (e) {
        // Falha na descompressão, tentar como URL simples
        stateJson = decodeURIComponent(encodedState);
      }
    } else {
      // Sem compressão, apenas decodificar URL
      stateJson = decodeURIComponent(encodedState);
    }
    
    // Converter JSON para objeto
    return JSON.parse(stateJson);
  }

  /**
   * Obtém o valor de um parâmetro da URL atual
   * 
   * @param {String} name - Nome do parâmetro
   * @returns {String|null} Valor do parâmetro ou null
   */
  getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Gera uma imagem de cartão social para uma rune específica
   * 
   * @param {Object} runeData - Dados da rune para o cartão
   * @param {Object} options - Opções de configuração do cartão
   * @returns {Promise<String>} URL da imagem gerada (Data URL)
   */
  async generateSocialCard(runeData, options = {}) {
    // Mesclar opções com padrões
    const settings = {
      template: this.config.defaultCardTemplate,
      width: this.config.defaultCardSize.width,
      height: this.config.defaultCardSize.height,
      theme: 'dark',
      includeQRCode: false,
      ...options
    };
    
    // Verificar se o runeData contém informações suficientes
    if (!runeData || !runeData.tick) {
      throw new Error('Dados insuficientes para gerar cartão social');
    }
    
    // Gerar URL compartilhável para o QR code
    const shareableUrl = options.shareableUrl || 
      this.generateShareableUrl({ runeTick: runeData.tick, view: 'details' });
    
    try {
      // Criação do canvas
      const canvas = document.createElement('canvas');
      canvas.width = settings.width;
      canvas.height = settings.height;
      const ctx = canvas.getContext('2d');
      
      // Renderizar template de acordo com a seleção
      await this.renderCardTemplate(ctx, runeData, shareableUrl, settings);
      
      // Converter canvas para data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      return dataUrl;
    } catch (error) {
      console.error('Erro ao gerar cartão social:', error);
      throw error;
    }
  }

  /**
   * Renderiza o template do cartão social no contexto do canvas
   * 
   * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
   * @param {Object} runeData - Dados da rune
   * @param {String} shareableUrl - URL compartilhável
   * @param {Object} settings - Configurações do cartão
   * @returns {Promise<void>}
   */
  async renderCardTemplate(ctx, runeData, shareableUrl, settings) {
    // Aplicar estilo base conforme o tema
    const colors = settings.theme === 'dark' 
      ? {
          background: '#1a1a2e',
          backgroundGradient: '#252547',
          text: '#ffffff',
          textSecondary: '#a0a0c0',
          accent: '#5352ed',
          accentSecondary: '#ff4757'
        }
      : {
          background: '#f5f5ff',
          backgroundGradient: '#e6e6f0',
          text: '#1a1a2e',
          textSecondary: '#555570',
          accent: '#4240d4',
          accentSecondary: '#ff3748'
        };

    // Desenhar background com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, settings.height);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(1, colors.backgroundGradient);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, settings.width, settings.height);
    
    // Carregar a fonte (assíncrono)
    await this.loadFont('Inter', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    // Desenhar borda decorativa
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, settings.width - 40, settings.height - 40);
    
    // Desenhar logotipo RUNES
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('RUNES ANALYTICS PRO', 40, 60);

    // Desenhar ticker da rune
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 72px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(runeData.tick, settings.width / 2, 160);
    
    // Círculo decorativo
    ctx.beginPath();
    ctx.arc(settings.width / 2, 230, 100, 0, 2 * Math.PI);
    ctx.fillStyle = colors.accent + '30'; // 30% de opacidade
    ctx.fill();
    
    // Desenhar estatísticas da rune
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('ESTATÍSTICAS', settings.width / 2, 320);
    
    // Formatar números para exibição
    const formatNumber = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
      if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
      return num.toString();
    };
    
    // Dados estatísticos
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'left';
    
    const statsY = 370;
    const statsGap = 50;
    const col1X = settings.width / 4;
    const col2X = (settings.width / 4) * 3;
    
    // Coluna 1
    ctx.fillText(`Supply: ${formatNumber(runeData.supply || 0)}`, col1X - 100, statsY);
    ctx.fillText(`Max: ${formatNumber(runeData.max || 0)}`, col1X - 100, statsY + statsGap);
    
    // Coluna 2
    ctx.fillText(`Holders: ${formatNumber(runeData.holders || 0)}`, col2X - 100, statsY);
    ctx.fillText(`Decimals: ${runeData.decimals || 0}`, col2X - 100, statsY + statsGap);

    // Desenhar QR code, se solicitado
    if (settings.includeQRCode) {
      await this.drawQRCode(ctx, shareableUrl, settings.width - 150, settings.height - 150, 120);
    }
    
    // Adicionar URL compartilhável como texto
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Veja mais em:', settings.width / 2, settings.height - 70);
    ctx.fillStyle = colors.accent;
    
    // URL encurtada para exibição
    const displayUrl = new URL(shareableUrl).origin + '/runes/' + runeData.tick;
    ctx.fillText(displayUrl, settings.width / 2, settings.height - 40);
  }

  /**
   * Carrega uma fonte para uso no canvas
   * 
   * @param {String} fontName - Nome da fonte
   * @param {String} fontUrl - URL da fonte (CSS)
   * @returns {Promise<void>}
   */
  async loadFont(fontName, fontUrl) {
    // Verificar se a fonte já está carregada
    const fontAvailable = document.fonts.check(`12px ${fontName}`);
    if (fontAvailable) return;
    
    // Carregar a fonte via CSS
    const fontLink = document.createElement('link');
    fontLink.href = fontUrl;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Esperar a fonte carregar
    return new Promise((resolve) => {
      fontLink.onload = () => {
        // Pequeno delay para garantir que a fonte esteja disponível
        setTimeout(resolve, 100);
      };
      // Timeout para não travar se a fonte falhar
      setTimeout(resolve, 3000);
    });
  }

  /**
   * Desenha um QR code no canvas
   * 
   * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
   * @param {String} url - URL para codificar
   * @param {Number} x - Posição X
   * @param {Number} y - Posição Y
   * @param {Number} size - Tamanho do QR code
   * @returns {Promise<void>}
   */
  async drawQRCode(ctx, url, x, y, size) {
    // Verificar se a biblioteca QRCode está disponível
    if (typeof QRCode === 'undefined') {
      console.warn('Biblioteca QRCode não disponível, QR code não será gerado');
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Criar elemento temporário para o QR code
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        
        // Criar QR code
        const qr = new QRCode(tempCanvas, {
          text: url,
          width: size,
          height: size,
          colorDark: '#5352ed',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        
        // Desenhar QR code no canvas principal após um pequeno delay
        setTimeout(() => {
          ctx.drawImage(tempCanvas, x - size/2, y - size/2, size, size);
          resolve();
        }, 200);
      } catch (error) {
        console.error('Erro ao gerar QR code:', error);
        reject(error);
      }
    });
  }

  /**
   * Compartilha dados da rune em uma rede social
   * 
   * @param {Object} runeData - Dados da rune para compartilhar
   * @param {String} network - Rede social (twitter, discord, etc)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<boolean>} - Sucesso do compartilhamento
   */
  async shareToSocial(runeData, network, options = {}) {
    try {
      // Gerar URL compartilhável
      const shareableUrl = options.shareableUrl || 
        this.generateShareableUrl({ runeTick: runeData.tick, view: 'details' });
      
      // Texto padrão para compartilhamento
      const defaultText = `Confira os dados da rune ${runeData.tick} no RUNES Analytics Pro`;
      const shareText = options.text || defaultText;
      
      // Criar URLs específicas para cada rede
      let shareUrl;
      
      switch (network.toLowerCase()) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareableUrl)}`;
          break;
          
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(shareText)}`;
          break;
          
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareableUrl)}`;
          break;
          
        default:
          // Abordagem genérica com API Web Share se disponível
          if (navigator.share) {
            return navigator.share({
              title: 'RUNES Analytics Pro',
              text: shareText,
              url: shareableUrl
            })
            .then(() => true)
            .catch(error => {
              console.error('Erro ao compartilhar via Web Share API:', error);
              return false;
            });
          } else {
            // Fallback para copiar para clipboard
            await navigator.clipboard.writeText(shareableUrl);
            return true;
          }
      }
      
      // Abrir nova janela para compartilhamento
      window.open(shareUrl, '_blank', 'width=600,height=400');
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }

  /**
   * Exporta dados de runes para um formato específico
   * 
   * @param {Array|Object} data - Dados a serem exportados
   * @param {String} format - Formato de exportação (csv, json)
   * @param {Object} options - Opções de exportação
   * @returns {Promise<String|Blob>} - Conteúdo exportado ou Blob
   */
  async exportData(data, format, options = {}) {
    // Garantir que data seja um array
    const dataArray = Array.isArray(data) ? data : [data];
    
    // Verificar se temos dados para exportar
    if (!dataArray.length) {
      throw new Error('Sem dados para exportação');
    }
    
    // Configurações padrão
    const settings = {
      filename: `runes-data-${new Date().toISOString().slice(0, 10)}`,
      download: true,
      csvDelimiter: this.config.defaultCsvDelimiter,
      csvHeader: true,
      jsonIndent: 2,
      fields: null, // Todos os campos
      ...options
    };
    
    try {
      let exportedContent, blob, fileExtension;
      
      switch (format.toLowerCase()) {
        case 'csv':
          exportedContent = this.convertToCSV(dataArray, settings);
          blob = new Blob([exportedContent], { type: 'text/csv;charset=utf-8;' });
          fileExtension = '.csv';
          break;
          
        case 'json':
          exportedContent = JSON.stringify(
            this.filterFields(dataArray, settings.fields), 
            null, 
            settings.jsonIndent
          );
          blob = new Blob([exportedContent], { type: 'application/json;charset=utf-8;' });
          fileExtension = '.json';
          break;
          
        default:
          throw new Error(`Formato de exportação '${format}' não suportado`);
      }
      
      // Realizar download se solicitado
      if (settings.download) {
        this.downloadFile(blob, `${settings.filename}${fileExtension}`);
        return true;
      }
      
      // Retornar conteúdo ou blob conforme solicitado
      return settings.returnBlob ? blob : exportedContent;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  /**
   * Converte dados para formato CSV
   * 
   * @param {Array} data - Dados para converter
   * @param {Object} settings - Configurações da conversão
   * @returns {String} - Conteúdo CSV
   */
  convertToCSV(data, settings) {
    // Filtrar campos se necessário
    const filteredData = this.filterFields(data, settings.fields);
    
    // Obter cabeçalhos (nomes das colunas)
    const headers = this.getHeaders(filteredData);
    
    // Definir separador de linha
    const lineDelimiter = '\n';
    
    // Iniciar com cabeçalho se necessário
    let csvContent = settings.csvHeader 
      ? headers.join(settings.csvDelimiter) + lineDelimiter 
      : '';
    
    // Adicionar linhas de dados
    filteredData.forEach(item => {
      const row = headers.map(header => {
        // Obter valor da propriedade
        const value = item[header];
        
        // Formatar valor
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escapar aspas e envolver em aspas se contiver delimitador
          const escaped = value.replace(/"/g, '""');
          return escaped.includes(settings.csvDelimiter) || escaped.includes('\n') 
            ? `"${escaped}"` 
            : escaped;
        } else if (typeof value === 'object') {
          // Converter objetos para JSON e envolver em aspas
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        
        // Retornar outros valores como string
        return String(value);
      });
      
      // Adicionar linha ao CSV
      csvContent += row.join(settings.csvDelimiter) + lineDelimiter;
    });
    
    return csvContent;
  }

  /**
   * Obtém os cabeçalhos (nomes das colunas) dos dados
   * 
   * @param {Array} data - Dados para extrair cabeçalhos
   * @returns {Array} - Lista de cabeçalhos
   */
  getHeaders(data) {
    // Usar o primeiro item para extrair as chaves
    if (!data.length) return [];
    
    // Obter todas as chaves únicas
    const headers = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => headers.add(key));
    });
    
    return Array.from(headers);
  }

  /**
   * Filtra campos específicos dos dados
   * 
   * @param {Array} data - Dados a serem filtrados
   * @param {Array|null} fields - Campos a manter (null = todos)
   * @returns {Array} - Dados filtrados
   */
  filterFields(data, fields) {
    // Se não houver campos especificados, retornar dados completos
    if (!fields) return data;
    
    // Filtrar campos de cada item
    return data.map(item => {
      const filteredItem = {};
      fields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          filteredItem[field] = item[field];
        }
      });
      return filteredItem;
    });
  }

  /**
   * Realiza o download de um blob como arquivo
   * 
   * @param {Blob} blob - Blob para download
   * @param {String} filename - Nome do arquivo
   */
  downloadFile(blob, filename) {
    // Criar URL para o blob
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Acionar download
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Criar instância global
window.shareService = new ShareService();

// Exportar para uso em módulos
if (typeof module !== 'undefined') {
  module.exports = { ShareService };
} 