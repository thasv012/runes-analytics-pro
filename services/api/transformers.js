/**
 * RUNES Analytics Pro - Transformadores de formato de API
 * 
 * Funções que convertem dados entre diferentes formatos de API,
 * permitindo fallback inteligente entre diferentes provedores
 */

/**
 * Transformações para listagem de runes
 */
const runesListTransformers = {
  /**
   * Transforma dados do Geniidata para o formato do Ordiscan
   * 
   * @param {Object} data - Dados no formato Geniidata
   * @returns {Array} - Dados no formato Ordiscan
   */
  geniidataToOrdiscan: (data) => {
    if (!data || !Array.isArray(data.items)) {
      return [];
    }
    
    return data.items.map(item => ({
      tick: item.tick || item.name,
      max: parseInt(item.max) || 0,
      supply: parseInt(item.supply) || 0,
      holders: parseInt(item.holders) || 0, 
      latest_tx_id: item.latest_tx_id || '',
      mint_time: item.mint_time || '',
      decimals: parseInt(item.decimals) || 0,
      rune_id: item.rune_id || '',
      market_cap: item.market_cap || null
    }));
  },
  
  /**
   * Transforma dados do Ordiscan para o formato do Geniidata
   * 
   * @param {Array} data - Dados no formato Ordiscan
   * @returns {Object} - Dados no formato Geniidata
   */
  ordiscanToGeniidata: (data) => {
    if (!data || !Array.isArray(data)) {
      return { items: [] };
    }
    
    return {
      items: data.map(item => ({
        name: item.tick,
        tick: item.tick,
        max: item.max.toString(),
        supply: item.supply.toString(),
        holders: item.holders.toString(),
        latest_tx_id: item.latest_tx_id,
        mint_time: item.mint_time,
        decimals: item.decimals.toString(),
        rune_id: item.rune_id,
        market_cap: item.market_cap
      }))
    };
  }
};

/**
 * Transformações para detalhes de rune específica
 */
const runeDetailsTransformers = {
  /**
   * Transforma dados de detalhes do Geniidata para o formato do Ordiscan
   * 
   * @param {Object} data - Dados no formato Geniidata
   * @returns {Object} - Dados no formato Ordiscan
   */
  geniidataToOrdiscan: (data) => {
    if (!data || !data.item) {
      return null;
    }
    
    const item = data.item;
    return {
      tick: item.tick || item.name,
      max: parseInt(item.max) || 0,
      supply: parseInt(item.supply) || 0,
      holders: parseInt(item.holders) || 0,
      latest_tx_id: item.latest_tx_id || '',
      mint_time: item.mint_time || '',
      decimals: parseInt(item.decimals) || 0,
      rune_id: item.rune_id || '',
      transactions: item.transactions || 0,
      tx_count: item.tx_count || item.transactions || 0,
      market_data: item.market_data || null,
      description: item.description || '',
      links: item.links || {}
    };
  },
  
  /**
   * Transforma dados de detalhes do Ordiscan para o formato do Geniidata
   * 
   * @param {Object} data - Dados no formato Ordiscan
   * @returns {Object} - Dados no formato Geniidata
   */
  ordiscanToGeniidata: (data) => {
    if (!data) {
      return { item: null };
    }
    
    return {
      item: {
        name: data.tick,
        tick: data.tick,
        max: data.max.toString(),
        supply: data.supply.toString(),
        holders: data.holders.toString(),
        latest_tx_id: data.latest_tx_id,
        mint_time: data.mint_time,
        decimals: data.decimals.toString(),
        rune_id: data.rune_id,
        transactions: data.transactions || data.tx_count || 0,
        tx_count: data.tx_count || data.transactions || 0,
        market_data: data.market_data || null,
        description: data.description || '',
        links: data.links || {}
      }
    };
  }
};

/**
 * Transformações para dados de transações
 */
const transactionsTransformers = {
  /**
   * Transforma dados de transações do Geniidata para o formato do Ordiscan
   * 
   * @param {Object} data - Dados no formato Geniidata
   * @returns {Array} - Dados no formato Ordiscan
   */
  geniidataToOrdiscan: (data) => {
    if (!data || !Array.isArray(data.transactions)) {
      return [];
    }
    
    return data.transactions.map(tx => ({
      tx_id: tx.tx_id || tx.txid,
      block_height: parseInt(tx.block_height) || 0,
      timestamp: tx.timestamp,
      type: tx.type || 'transfer',
      amount: parseInt(tx.amount) || 0,
      from: tx.from || tx.sender || '',
      to: tx.to || tx.receiver || '',
      fee: tx.fee || 0
    }));
  },
  
  /**
   * Transforma dados de transações do Ordiscan para o formato do Geniidata
   * 
   * @param {Array} data - Dados no formato Ordiscan
   * @returns {Object} - Dados no formato Geniidata
   */
  ordiscanToGeniidata: (data) => {
    if (!data || !Array.isArray(data)) {
      return { transactions: [] };
    }
    
    return {
      transactions: data.map(tx => ({
        tx_id: tx.tx_id || tx.txid,
        txid: tx.tx_id || tx.txid,
        block_height: tx.block_height.toString(),
        timestamp: tx.timestamp,
        type: tx.type || 'transfer',
        amount: tx.amount.toString(),
        sender: tx.from || tx.sender || '',
        receiver: tx.to || tx.receiver || '',
        fee: tx.fee ? tx.fee.toString() : '0'
      }))
    };
  }
};

/**
 * Transformações para dados de holders
 */
const holdersTransformers = {
  /**
   * Transforma dados de holders do Geniidata para o formato do Ordiscan
   * 
   * @param {Object} data - Dados no formato Geniidata
   * @returns {Array} - Dados no formato Ordiscan
   */
  geniidataToOrdiscan: (data) => {
    if (!data || !Array.isArray(data.holders)) {
      return [];
    }
    
    return data.holders.map(holder => ({
      address: holder.address,
      balance: parseInt(holder.balance) || 0,
      percentage: parseFloat(holder.percentage) || 0,
      last_tx: holder.last_tx || '',
      rank: holder.rank || 0
    }));
  },
  
  /**
   * Transforma dados de holders do Ordiscan para o formato do Geniidata
   * 
   * @param {Array} data - Dados no formato Ordiscan
   * @returns {Object} - Dados no formato Geniidata
   */
  ordiscanToGeniidata: (data) => {
    if (!data || !Array.isArray(data)) {
      return { holders: [] };
    }
    
    return {
      holders: data.map(holder => ({
        address: holder.address,
        balance: holder.balance.toString(),
        percentage: holder.percentage.toString(),
        last_tx: holder.last_tx || '',
        rank: holder.rank || 0
      }))
    };
  }
};

/**
 * Função auxiliar para debug das transformações
 * 
 * @param {string} from - API de origem
 * @param {string} to - API de destino
 * @param {string} type - Tipo de dados
 * @param {Object|Array} before - Dados antes da transformação
 * @param {Object|Array} after - Dados após a transformação
 */
const logTransformation = (from, to, type, before, after) => {
  console.group(`Transformação ${from} -> ${to} (${type})`);
  console.log('Antes:', before);
  console.log('Depois:', after);
  console.groupEnd();
};

// Exportar todas as transformações
module.exports = {
  runesList: runesListTransformers,
  runeDetails: runeDetailsTransformers,
  transactions: transactionsTransformers,
  holders: holdersTransformers,
  
  // Função genérica que seleciona a transformação apropriada
  transform: (data, fromApi, toApi, dataType) => {
    // Selecionar o conjunto de transformadores correto
    let transformers;
    
    switch (dataType) {
      case 'runes-list':
        transformers = runesListTransformers;
        break;
      case 'rune-details':
        transformers = runeDetailsTransformers;
        break;
      case 'transactions':
        transformers = transactionsTransformers;
        break;
      case 'holders':
        transformers = holdersTransformers;
        break;
      default:
        console.warn(`Tipo de dados não suportado para transformação: ${dataType}`);
        return data;
    }
    
    // Criar a chave para a função de transformação
    const transformKey = `${fromApi}To${toApi.charAt(0).toUpperCase() + toApi.slice(1)}`;
    
    // Verificar se a transformação existe
    if (transformers[transformKey] && typeof transformers[transformKey] === 'function') {
      const result = transformers[transformKey](data);
      
      // Log para debug (comentar em produção)
      // logTransformation(fromApi, toApi, dataType, data, result);
      
      return result;
    }
    
    // Se não houver transformação específica, retornar os dados originais
    console.warn(`Transformação não encontrada: ${fromApi} -> ${toApi} para ${dataType}`);
    return data;
  }
};

// Para uso no navegador
if (typeof window !== 'undefined') {
  window.apiTransformers = module.exports;
} 