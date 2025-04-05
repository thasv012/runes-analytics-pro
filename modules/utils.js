/**
 * RUNES Analytics Pro - Utilitários
 * 
 * Funções auxiliares para formatação, cálculos e operações comuns
 * utilizadas pelo sistema de monitoramento da malha neural.
 */

/**
 * Formata um número para exibição amigável
 * Adiciona separadores de milhar e trunca grandes números com K, M, B
 * 
 * @param {Number} number - Número a ser formatado
 * @param {Number} maximumFractionDigits - Número máximo de casas decimais
 * @returns {String} - Número formatado
 */
export function formatNumber(number, maximumFractionDigits = 2) {
  // Verifica se é um número válido
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  // Formata números pequenos normalmente
  if (number < 1000) {
    return Number(number).toLocaleString(undefined, {
      maximumFractionDigits: maximumFractionDigits
    });
  }

  // Formata números grandes com sufixos k, M, B
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(Math.abs(number)) / 3);
  
  const shortNumber = number / Math.pow(1000, suffixIndex);
  
  return shortNumber.toLocaleString(undefined, {
    maximumFractionDigits: maximumFractionDigits
  }) + suffixes[suffixIndex];
}

/**
 * Calcula o score de desempenho de um nó com base em vários fatores
 * 
 * @param {Object} node - Dados do nó
 * @returns {Number} - Score de desempenho (0-100)
 */
export function calculatePerformanceScore(node) {
  // Se o nó estiver offline, retorna um valor baixo
  if (node.status && node.status.toLowerCase() === 'offline') {
    return Math.max(5, Math.min(25, node.lastPerformance || 10));
  }
  
  // Se temos um valor de desempenho armazenado, o usamos
  if (node.performance !== undefined && node.performance !== null) {
    return Math.max(0, Math.min(100, node.performance));
  }
  
  // Temos que calcular com base em outros fatores
  
  // 1. Fator de ping (melhor = mais pontos)
  const pingFactor = node.ping ? Math.max(0, 100 - (node.ping / 5)) : 50;
  
  // 2. Fator de karma (mais karma = mais pontos)
  const karmaValue = node.karma || 0;
  const karmaFactor = Math.min(100, karmaValue / 100);
  
  // 3. Fator de memória (mais memória = mais pontos)
  const memoryGB = parseGPUMemory(node.gpu, node.memory);
  const memoryFactor = Math.min(100, memoryGB * 5);
  
  // 4. Fator de sigilos (mais sigilos = mais pontos)
  const sigilsCount = node.sigils ? node.sigils.length : 0;
  const sigilsFactor = Math.min(100, sigilsCount * 10);
  
  // Ponderação dos fatores
  const weights = {
    ping: 0.3,
    karma: 0.3,
    memory: 0.2,
    sigils: 0.2
  };
  
  // Cálculo ponderado
  const score = (
    pingFactor * weights.ping +
    karmaFactor * weights.karma +
    memoryFactor * weights.memory +
    sigilsFactor * weights.sigils
  );
  
  // Certifica que está entre 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Extrai a informação de memória da GPU
 * 
 * @param {String} gpuString - String com informações da GPU
 * @param {Number} fallbackValue - Valor padrão se não conseguir extrair
 * @returns {Number} - Quantidade de memória em GB
 */
function parseGPUMemory(gpuString, fallbackValue = 4) {
  if (!gpuString) return fallbackValue;
  
  // Tenta extrair o valor de GB da string da GPU
  const memoryMatch = gpuString.match(/(\d+)\s*GB/i);
  if (memoryMatch && memoryMatch[1]) {
    return parseInt(memoryMatch[1], 10);
  }
  
  // Retorna valor padrão se não encontrou
  return fallbackValue;
}

/**
 * Gera um ID aleatório
 * 
 * @param {Number} length - Comprimento do ID
 * @returns {String} - ID gerado
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}

/**
 * Calcula o tempo decorrido e retorna em formato amigável
 * 
 * @param {Date|Number|String} date - Data ou timestamp
 * @returns {String} - Tempo decorrido formatado
 */
export function timeAgo(date) {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);
  
  if (isNaN(seconds)) return 'N/A';
  
  if (seconds < 60) {
    return `${seconds}s atrás`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m atrás`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h atrás`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d atrás`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}m atrás`;
  }
  
  const years = Math.floor(months / 12);
  return `${years}a atrás`;
}

/**
 * Converte um valor para um código de cor HSL baseado no valor
 * Útil para mapear valores numéricos em um gradiente de cores
 * 
 * @param {Number} value - Valor a ser convertido para cor
 * @param {Number} min - Valor mínimo do intervalo
 * @param {Number} max - Valor máximo do intervalo
 * @param {Number} startHue - Matiz inicial (0-360)
 * @param {Number} endHue - Matiz final (0-360)
 * @returns {String} - Cor no formato HSL
 */
export function valueToColor(value, min = 0, max = 100, startHue = 0, endHue = 120) {
  // Certifica que o valor está dentro do intervalo
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Normaliza para 0-1
  const normalizedValue = (clampedValue - min) / (max - min);
  
  // Calcula o matiz
  const hue = startHue + normalizedValue * (endHue - startHue);
  
  // Retorna a cor HSL
  return `hsl(${hue}, 100%, 50%)`;
}

/**
 * Trunca um texto longo adicionando ellipsis
 * 
 * @param {String} text - Texto a ser truncado
 * @param {Number} maxLength - Comprimento máximo
 * @returns {String} - Texto truncado com ellipsis se necessário
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce para evitar chamadas repetidas de funções
 * 
 * @param {Function} func - Função a ser executada
 * @param {Number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
} 