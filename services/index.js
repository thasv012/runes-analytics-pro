/**
 * RUNES Analytics Pro - Índice de Serviços
 * 
 * Exporta todos os serviços disponíveis na aplicação para fácil acesso
 */

// Importar serviços de API
const api = require('./api');

// Importar serviço de cache
const cache = require('./cache/AdvancedCacheService');

// Exportar todos os serviços
module.exports = {
  api,
  cache,
  
  // Atalhos para serviços mais utilizados
  runesApi: api.runesApi,
  middleware: api.apiMiddleware,
  ordiscan: api.ordiscan,
  geniidata: api.geniidata
};

// Para uso no navegador
if (typeof window !== 'undefined') {
  window.services = module.exports;
} 