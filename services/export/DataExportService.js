/**
 * RUNES Analytics Pro - Serviço de Exportação de Dados
 * 
 * Este serviço fornece funcionalidades avançadas para exportação de dados de Runes
 * em diversos formatos, com suporte para transformações e customizações.
 */

class DataExportService {
  constructor(options = {}) {
    // Configurações do serviço
    this.config = {
      defaultFormat: 'csv',
      csvDelimiter: ',',
      csvLineDelimiter: '\n',
      jsonIndent: 2,
      maxExportRows: 100000, // Limitar para evitar exportações muito grandes
      exportableFormats: ['csv', 'json', 'xlsx', 'txt', 'html'],
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      defaultFilename: 'runes-data',
      ...options
    };
    
    // Registrar transformadores de dados
    this.transformers = {
      // Transformador para formato padrão (base)
      'standard': this.standardTransformer.bind(this),
      
      // Transformadores específicos para cada formato
      'csv': this.csvTransformer.bind(this),
      'json': this.jsonTransformer.bind(this),
      'xlsx': this.xlsxTransformer.bind(this),
      'txt': this.txtTransformer.bind(this),
      'html': this.htmlTransformer.bind(this),
    };
    
    // Inicializar o serviço
    this.init();
  }
  
  /**
   * Inicializa o serviço de exportação
   */
  init() {
    // Verificar disponibilidade de bibliotecas dependentes
    this.checkDependencies();
    console.log('📊 DataExportService: Serviço de exportação inicializado');
  }
  
  /**
   * Verifica dependências necessárias e ajusta as configurações
   */
  checkDependencies() {
    // Verificar biblioteca ExcelJS para exportação XLSX
    const hasExcelJS = typeof ExcelJS !== 'undefined';
    
    // Se não tiver ExcelJS, remover xlsx dos formatos disponíveis
    if (!hasExcelJS && this.config.exportableFormats.includes('xlsx')) {
      console.warn('DataExportService: ExcelJS não disponível, exportação XLSX desabilitada');
      this.config.exportableFormats = this.config.exportableFormats.filter(
        format => format !== 'xlsx'
      );
    }
  }
  
  /**
   * Exporta dados para o formato especificado
   * 
   * @param {Array|Object} data - Dados a serem exportados
   * @param {String} format - Formato de exportação (csv, json, xlsx, txt, html)
   * @param {Object} options - Opções de exportação
   * @returns {Promise<Blob|String>} - Conteúdo exportado ou Blob
   */
  async exportData(data, format = this.config.defaultFormat, options = {}) {
    // Normalizar o formato
    format = format.toLowerCase();
    
    // Verificar se o formato é suportado
    if (!this.config.exportableFormats.includes(format)) {
      throw new Error(`Formato de exportação '${format}' não suportado`);
    }
    
    // Garantir que data seja um array
    const dataArray = Array.isArray(data) ? data : [data];
    
    // Verificar se há dados para exportar
    if (!dataArray.length) {
      throw new Error('Sem dados para exportação');
    }
    
    // Verificar limite de linhas
    if (dataArray.length > this.config.maxExportRows) {
      console.warn(`Número de linhas excede o limite (${dataArray.length} > ${this.config.maxExportRows})`);
    }
    
    // Configurações padrão
    const settings = {
      filename: `${this.config.defaultFilename}-${new Date().toISOString().slice(0, 10)}`,
      download: true,
      includeMetadata: true,
      csvDelimiter: this.config.csvDelimiter,
      csvHeader: true,
      jsonIndent: this.config.jsonIndent,
      fields: null, // Todos os campos
      dateFormat: this.config.dateFormat,
      transformer: null, // Transformador customizado
      ...options
    };
    
    try {
      // Pré-processar dados com transformador padrão
      let processedData = await this.transformData(dataArray, 'standard', settings);
      
      // Aplicar transformador específico para o formato
      const transformerName = settings.transformer || format;
      const exportResult = await this.transformData(processedData, transformerName, settings);
      
      // Determinar tipo MIME e extensão do arquivo
      const { mimeType, extension } = this.getFormatInfo(format);
      
      // Criar blob se a exportação retornou uma string
      let blob = exportResult;
      if (typeof exportResult === 'string') {
        blob = new Blob([exportResult], { type: mimeType });
      }
      
      // Realizar download se solicitado
      if (settings.download) {
        this.downloadFile(blob, `${settings.filename}${extension}`);
        return true;
      }
      
      // Retornar resultado
      return settings.returnBlob ? blob : exportResult;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }
  
  /**
   * Aplica um transformador aos dados
   * 
   * @param {Array} data - Dados para transformar
   * @param {String|Function} transformer - Nome do transformador ou função
   * @param {Object} settings - Configurações
   * @returns {Promise<any>} - Dados transformados
   */
  async transformData(data, transformer, settings) {
    try {
      // Se for uma função, aplicar diretamente
      if (typeof transformer === 'function') {
        return await transformer(data, settings);
      }
      
      // Se for um transformador registrado, aplicar
      if (this.transformers[transformer]) {
        return await this.transformers[transformer](data, settings);
      }
      
      // Transformador não encontrado
      console.warn(`Transformador '${transformer}' não encontrado, retornando dados originais`);
      return data;
    } catch (error) {
      console.error(`Erro ao aplicar transformador '${transformer}':`, error);
      return data;
    }
  }
  
  /**
   * Transformador padrão para normalizar dados antes da exportação
   * 
   * @param {Array} data - Dados originais
   * @param {Object} settings - Configurações
   * @returns {Array} - Dados normalizados
   */
  standardTransformer(data, settings) {
    // Filtrar campos específicos
    let processedData = this.filterFields(data, settings.fields);
    
    // Formatar datas de acordo com a configuração
    if (settings.dateFormat) {
      processedData = this.formatDates(processedData, settings.dateFormat);
    }
    
    // Adicionar metadados se solicitado
    if (settings.includeMetadata && !settings.metadataAdded) {
      const metadata = {
        exportDate: new Date().toISOString(),
        totalRecords: data.length,
        source: 'RUNES Analytics Pro',
        version: '1.0.0'
      };
      
      // Marcar que os metadados foram adicionados para evitar duplicação
      settings.metadataAdded = true;
      
      // Adicionar metadados dependendo do formato
      if (settings.metadataLocation === 'prepend') {
        return [metadata, ...processedData];
      } else if (settings.metadataLocation === 'append') {
        return [...processedData, metadata];
      }
      
      // Metadados como propriedade separada
      settings.metadata = metadata;
    }
    
    return processedData;
  }
  
  /**
   * Transformador para formato CSV
   * 
   * @param {Array} data - Dados para exportar
   * @param {Object} settings - Configurações
   * @returns {String} - Conteúdo CSV
   */
  csvTransformer(data, settings) {
    // Obter cabeçalhos (nomes das colunas)
    const headers = this.getHeaders(data);
    
    // Definir separadores
    const fieldDelimiter = settings.csvDelimiter;
    const lineDelimiter = this.config.csvLineDelimiter;
    
    // Iniciar com cabeçalho se necessário
    let csvContent = settings.csvHeader 
      ? headers.join(fieldDelimiter) + lineDelimiter 
      : '';
    
    // Adicionar linhas de dados
    data.forEach(item => {
      const row = headers.map(header => {
        // Obter valor da propriedade
        const value = item[header];
        
        // Formatar valor
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escapar aspas e envolver em aspas se contiver delimitador
          const escaped = value.replace(/"/g, '""');
          return escaped.includes(fieldDelimiter) || escaped.includes('\n') 
            ? `"${escaped}"` 
            : escaped;
        } else if (typeof value === 'object' && !(value instanceof Date)) {
          // Converter objetos para JSON e envolver em aspas
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        
        // Retornar outros valores como string
        return String(value);
      });
      
      // Adicionar linha ao CSV
      csvContent += row.join(fieldDelimiter) + lineDelimiter;
    });
    
    // Adicionar BOM para UTF-8 se necessário (ajuda Excel a reconhecer corretamente)
    return '\ufeff' + csvContent;
  }
  
  /**
   * Transformador para formato JSON
   * 
   * @param {Array} data - Dados para exportar
   * @param {Object} settings - Configurações
   * @returns {String} - Conteúdo JSON
   */
  jsonTransformer(data, settings) {
    let exportObject = data;
    
    // Adicionar metadados como objeto wrapper
    if (settings.metadata) {
      exportObject = {
        metadata: settings.metadata,
        data: data
      };
    }
    
    // Retornar string JSON formatada
    return JSON.stringify(exportObject, null, settings.jsonIndent);
  }
  
  /**
   * Transformador para formato XLSX (Excel)
   * 
   * @param {Array} data - Dados para exportar
   * @param {Object} settings - Configurações
   * @returns {Promise<Blob>} - Blob do arquivo XLSX
   */
  async xlsxTransformer(data, settings) {
    // Verificar se ExcelJS está disponível
    if (typeof ExcelJS === 'undefined') {
      throw new Error('ExcelJS não disponível para exportação XLSX');
    }
    
    // Criar workbook e worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Runes Data');
    
    // Obter cabeçalhos
    const headers = this.getHeaders(data);
    
    // Definir colunas
    worksheet.columns = headers.map(header => ({
      header: header,
      key: header,
      width: 15
    }));
    
    // Formatação do cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4240D4' } // Cor primária do tema
    };
    worksheet.getRow(1).font = { 
      bold: true, 
      color: { argb: 'FFFFFF' }
    };
    
    // Adicionar dados
    data.forEach(item => {
      const row = {};
      headers.forEach(header => {
        // Tratar valores especiais
        let value = item[header];
        if (value instanceof Date) {
          // Manter datas como datas
          row[header] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Converter objetos para JSON
          row[header] = JSON.stringify(value);
        } else {
          row[header] = value;
        }
      });
      worksheet.addRow(row);
    });
    
    // Adicionar metadados em uma planilha separada, se necessário
    if (settings.metadata) {
      const metaSheet = workbook.addWorksheet('Metadata');
      metaSheet.columns = [
        { header: 'Propriedade', key: 'property', width: 20 },
        { header: 'Valor', key: 'value', width: 50 }
      ];
      
      // Formatação do cabeçalho
      metaSheet.getRow(1).font = { bold: true };
      
      // Adicionar propriedades de metadados
      Object.entries(settings.metadata).forEach(([key, value]) => {
        metaSheet.addRow({ property: key, value: String(value) });
      });
    }
    
    // Retornar como blob
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  
  /**
   * Transformador para formato TXT (texto simples)
   * 
   * @param {Array} data - Dados para exportar
   * @param {Object} settings - Configurações
   * @returns {String} - Conteúdo TXT
   */
  txtTransformer(data, settings) {
    // Obter cabeçalhos
    const headers = this.getHeaders(data);
    
    // Construir texto
    let txtContent = '';
    
    // Adicionar metadados se disponível
    if (settings.metadata) {
      txtContent += '=== RUNES Analytics Pro Export ===\n';
      Object.entries(settings.metadata).forEach(([key, value]) => {
        txtContent += `${key}: ${value}\n`;
      });
      txtContent += '================================\n\n';
    }
    
    // Adicionar dados
    data.forEach((item, index) => {
      txtContent += `=== Item #${index + 1} ===\n`;
      
      headers.forEach(header => {
        const value = item[header];
        const displayValue = value === null || value === undefined 
          ? ''
          : (typeof value === 'object' ? JSON.stringify(value) : String(value));
        
        txtContent += `${header}: ${displayValue}\n`;
      });
      
      txtContent += '\n';
    });
    
    return txtContent;
  }
  
  /**
   * Transformador para formato HTML
   * 
   * @param {Array} data - Dados para exportar
   * @param {Object} settings - Configurações
   * @returns {String} - Conteúdo HTML
   */
  htmlTransformer(data, settings) {
    // Obter cabeçalhos
    const headers = this.getHeaders(data);
    
    // Construir HTML
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RUNES Analytics Pro - Exported Data</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #4240d4;
            border-bottom: 2px solid #4240d4;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          th {
            background-color: #4240d4;
            color: white;
            font-weight: bold;
            text-align: left;
            padding: 12px;
            position: sticky;
            top: 0;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .meta-section {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .meta-item {
            margin-bottom: 5px;
          }
          .meta-label {
            font-weight: bold;
            color: #4240d4;
          }
        </style>
      </head>
      <body>
        <h1>RUNES Analytics Pro - Dados Exportados</h1>
    `;
    
    // Adicionar metadados
    if (settings.metadata) {
      htmlContent += `
        <div class="meta-section">
          <h2>Metadados</h2>
      `;
      
      // Adicionar cada item de metadados
      Object.entries(settings.metadata).forEach(([key, value]) => {
        htmlContent += `
          <div class="meta-item">
            <span class="meta-label">${this.capitalizeFirst(key)}:</span> ${value}
          </div>
        `;
      });
      
      htmlContent += `</div>`;
    }
    
    // Iniciar tabela
    htmlContent += `
      <table>
        <thead>
          <tr>
    `;
    
    // Cabeçalhos
    headers.forEach(header => {
      htmlContent += `<th>${this.capitalizeFirst(header)}</th>`;
    });
    
    htmlContent += `
          </tr>
        </thead>
        <tbody>
    `;
    
    // Linhas de dados
    data.forEach(item => {
      htmlContent += `<tr>`;
      
      headers.forEach(header => {
        const value = item[header];
        let displayValue = '';
        
        // Formatar valor para exibição
        if (value === null || value === undefined) {
          displayValue = '';
        } else if (typeof value === 'object' && !(value instanceof Date)) {
          try {
            displayValue = JSON.stringify(value);
          } catch (e) {
            displayValue = '[Objeto Complexo]';
          }
        } else {
          displayValue = String(value);
        }
        
        // Escape HTML para evitar problemas com valores que contêm HTML
        displayValue = this.escapeHtml(displayValue);
        
        htmlContent += `<td>${displayValue}</td>`;
      });
      
      htmlContent += `</tr>`;
    });
    
    // Finalizar tabela e documento
    htmlContent += `
        </tbody>
      </table>
      <footer>
        <p style="text-align: center; color: #777; font-size: 12px;">
          Gerado por RUNES Analytics Pro em ${new Date().toLocaleString()}
        </p>
      </footer>
      </body>
      </html>
    `;
    
    return htmlContent;
  }
  
  /**
   * Escapa caracteres HTML especiais
   * 
   * @param {String} text - Texto para escapar
   * @returns {String} - Texto escapado
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, char => map[char]);
  }
  
  /**
   * Capitaliza a primeira letra de uma string
   * 
   * @param {String} text - Texto para capitalizar
   * @returns {String} - Texto capitalizado
   */
  capitalizeFirst(text) {
    if (!text || typeof text !== 'string') return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  /**
   * Obtém informações sobre o formato de exportação
   * 
   * @param {String} format - Formato de exportação
   * @returns {Object} - Informações do formato
   */
  getFormatInfo(format) {
    const formatMap = {
      'csv': { 
        mimeType: 'text/csv;charset=utf-8;', 
        extension: '.csv' 
      },
      'json': { 
        mimeType: 'application/json;charset=utf-8;', 
        extension: '.json' 
      },
      'xlsx': { 
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        extension: '.xlsx' 
      },
      'txt': { 
        mimeType: 'text/plain;charset=utf-8;', 
        extension: '.txt' 
      },
      'html': { 
        mimeType: 'text/html;charset=utf-8;', 
        extension: '.html' 
      }
    };
    
    return formatMap[format] || { mimeType: 'text/plain', extension: '.txt' };
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
        if (Object.prototype.hasOwnProperty.call(item, field)) {
          filteredItem[field] = item[field];
        }
      });
      return filteredItem;
    });
  }
  
  /**
   * Formata as datas nos dados
   * 
   * @param {Array} data - Dados com datas
   * @param {String} format - Formato de data desejado
   * @returns {Array} - Dados com datas formatadas
   */
  formatDates(data, format) {
    if (!format) return data;
    
    // Função para verificar se o valor é uma data
    const isDate = value => 
      value instanceof Date || 
      (typeof value === 'string' && !isNaN(Date.parse(value)));
    
    // Função para formatar data
    const formatDate = (dateValue, format) => {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      
      // Implementação simples de formatação 
      // (use uma biblioteca como date-fns para implementação mais robusta)
      const tokens = {
        YYYY: date.getFullYear(),
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        DD: String(date.getDate()).padStart(2, '0'),
        HH: String(date.getHours()).padStart(2, '0'),
        mm: String(date.getMinutes()).padStart(2, '0'),
        ss: String(date.getSeconds()).padStart(2, '0')
      };
      
      let result = format;
      Object.entries(tokens).forEach(([token, value]) => {
        result = result.replace(token, value);
      });
      
      return result;
    };
    
    // Formatar datas em cada item
    return data.map(item => {
      const formattedItem = { ...item };
      
      // Verificar cada campo
      Object.entries(formattedItem).forEach(([key, value]) => {
        if (isDate(value)) {
          formattedItem[key] = formatDate(value, format);
        }
      });
      
      return formattedItem;
    });
  }
  
  /**
   * Realiza o download de um blob como arquivo
   * 
   * @param {Blob} blob - Blob para download
   * @param {String} filename - Nome do arquivo
   */
  downloadFile(blob, filename) {
    try {
      // Criar URL para o blob
      const url = URL.createObjectURL(blob);
      
      // Criar elemento de link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Acionar download
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Erro ao realizar download:', error);
      throw error;
    }
  }
  
  /**
   * Retorna formatos disponíveis para exportação
   * 
   * @returns {Array} - Lista de formatos disponíveis
   */
  getAvailableFormats() {
    return [...this.config.exportableFormats];
  }
}

// Criar instância global
window.dataExportService = new DataExportService();

// Exportar para uso em módulos
if (typeof module !== 'undefined') {
  module.exports = { DataExportService };
} 