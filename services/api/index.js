/**
 * RUNES Analytics Pro - API Services Index
 * Carrega e configura todos os serviços de API disponíveis
 */

// Importar serviços
const OrdiscanService = require('./OrdiscanService');
const GeniiDataService = require('./GeniiDataService');
const apiMiddleware = require('./ApiMiddleware');
const runesApi = require('./RunesApiService');
const transformers = require('./transformers');

// Instanciar serviços
const ordiscan = new OrdiscanService();
const geniidata = new GeniiDataService();

// Configurar middleware
// Registrar APIs
apiMiddleware.registerApi('ordiscan', {
  baseURL: ordiscan.baseURL,
  timeout: 15000,
  priority: 10, // Prioridade alta para Ordiscan
  rateLimits: {
    global: {
      maxRequests: 40,
      interval: 60000 // 1 minuto
    },
    '/api/v1/runes': {
      maxRequests: 20,
      interval: 60000
    }
  }
});

apiMiddleware.registerApi('geniidata', {
  baseURL: geniidata.baseURL,
  timeout: 20000,
  priority: 8,
  rateLimits: {
    global: {
      maxRequests: 50,
      interval: 60000
    }
  }
});

// Configurar fallbacks usando os transformadores
// Fallback para lista de runes
apiMiddleware.setFallbackFor('/api/v1/runes', {
  apis: ['geniidata', 'ordiscan'],
  transformation: {
    geniidataToOrdiscan: (data) => transformers.transform(data, 'geniidata', 'ordiscan', 'runes-list'),
    ordiscanToGeniidata: (data) => transformers.transform(data, 'ordiscan', 'geniidata', 'runes-list')
  },
  useMock: true
});

// Configurar dados mockados para teste/fallback
apiMiddleware.setMockFor('/api/v1/runes', (params) => {
  // Dados de exemplo para lista de runes
  return [
    {
      tick: "PEPE",
      max: 1000000000000,
      supply: 420690000000,
      holders: 12345,
      latest_tx_id: "abcdef123456789",
      mint_time: "2023-03-01T00:00:00Z",
      decimals: 0,
      rune_id: "PEPE"
    },
    {
      tick: "MEME",
      max: 21000000,
      supply: 15000000,
      holders: 5432,
      latest_tx_id: "fedcba987654321",
      mint_time: "2023-02-15T00:00:00Z",
      decimals: 0,
      rune_id: "MEME"
    },
    {
      tick: "WIZARD",
      max: 700000000,
      supply: 100000000,
      holders: 789,
      latest_tx_id: "aaa111bbb222",
      mint_time: "2023-01-20T00:00:00Z",
      decimals: 0,
      rune_id: "WIZARD"
    }
  ];
});

// Configurar fallback para detalhes de rune específica
apiMiddleware.setFallbackFor('/api/v1/runes/:runeName', {
  apis: ['geniidata', 'ordiscan'],
  transformation: {
    geniidataToOrdiscan: (data) => transformers.transform(data, 'geniidata', 'ordiscan', 'rune-details'),
    ordiscanToGeniidata: (data) => transformers.transform(data, 'ordiscan', 'geniidata', 'rune-details')
  },
  useMock: true
});

// Configurar dados mockados para detalhes da rune
apiMiddleware.setMockFor('/api/v1/runes/:runeName', (params) => {
  const runeName = params.runeName || 'unknown';
  
  return {
    tick: runeName,
    max: 1000000000000,
    supply: 420690000000,
    holders: 12345,
    latest_tx_id: "abcdef123456789",
    mint_time: "2023-03-01T00:00:00Z",
    decimals: 0,
    rune_id: runeName,
    transactions: 78901
  };
});

// Configurar fallback para transações
apiMiddleware.setFallbackFor('/api/v1/runes/:runeName/transactions', {
  apis: ['ordiscan', 'geniidata'],
  transformation: {
    geniidataToOrdiscan: (data) => transformers.transform(data, 'geniidata', 'ordiscan', 'transactions'),
    ordiscanToGeniidata: (data) => transformers.transform(data, 'ordiscan', 'geniidata', 'transactions')
  },
  useMock: true
});

// Configurar fallback para holders
apiMiddleware.setFallbackFor('/api/v1/runes/:runeName/holders', {
  apis: ['geniidata', 'ordiscan'],
  transformation: {
    geniidataToOrdiscan: (data) => transformers.transform(data, 'geniidata', 'ordiscan', 'holders'),
    ordiscanToGeniidata: (data) => transformers.transform(data, 'ordiscan', 'geniidata', 'holders')
  },
  useMock: true
});

// Configurar limites de taxa para endpoints específicos
apiMiddleware.setRateLimit('/api/v1/runes', 20, 60000);
apiMiddleware.setRateLimit('/api/v1/runes/:runeName', 30, 60000);
apiMiddleware.setRateLimit('/api/v1/activity', 15, 60000);
apiMiddleware.setRateLimit('/api/v1/runes/:runeName/transactions', 25, 60000);
apiMiddleware.setRateLimit('/api/v1/runes/:runeName/holders', 20, 60000);

// Exportar serviços
module.exports = {
  ordiscan,
  geniidata,
  apiMiddleware,
  runesApi,
  transformers
};

// Para uso no navegador (global)
if (typeof window !== 'undefined') {
  window.api = {
    ordiscan,
    geniidata,
    middleware: apiMiddleware,
    runes: runesApi,
    transformers
  };
} 