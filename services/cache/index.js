/**
 * RUNES Analytics Pro - Serviços de Cache
 * Exporta todos os serviços de cache disponíveis para a aplicação
 */

// Legacy CacheService (para compatibilidade)
const cacheService = require('./CacheService');

// Novo AdvancedCacheService com suporte a IndexedDB e compressão
const advancedCacheService = require('./AdvancedCacheService');

// Biblioteca LZ-String para compressão de dados
const LZString = require('./lz-string');

// Exporta todos os serviços de cache
module.exports = {
    // Serviço legado (para compatibilidade)
    legacy: cacheService,
    
    // Serviço avançado recomendado
    advanced: advancedCacheService,
    
    // Referência direta ao serviço avançado para facilitar a importação
    default: advancedCacheService,
    
    // Utilitário de compressão
    LZString: LZString
};

// Para uso no navegador
if (typeof window !== 'undefined') {
    window.cacheServices = module.exports;
} 