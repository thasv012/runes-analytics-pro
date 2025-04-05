/**
 * RUNES Analytics Pro - Sistema de Karma e Sigilos
 * 
 * Gerencia pontuações de karma e desbloqueio de sigilos para nós na malha.
 * Utiliza IndexedDB para persistência de dados.
 */

// Banco de dados IndexedDB
let db = null;
const DB_NAME = 'RunesAnalyticsDB';
const DB_VERSION = 1;
const KARMA_STORE = 'karma';
const SIGILS_STORE = 'sigils';

// Lista de sigilos disponíveis
const AVAILABLE_SIGILS = [
  { id: 'sigil-001', name: 'Rune Master', symbol: '⚡', karmaRequired: 0, description: 'Iniciou sua jornada na malha neural' },
  { id: 'sigil-002', name: 'Hash Sage', symbol: '✦', karmaRequired: 1000, description: 'Acumulou 1.000 pontos de karma' },
  { id: 'sigil-003', name: 'Block Oracle', symbol: '☥', karmaRequired: 5000, description: 'Acumulou 5.000 pontos de karma' },
  { id: 'sigil-004', name: 'Satoshi Agent', symbol: '⟠', karmaRequired: 10000, description: 'Acumulou 10.000 pontos de karma' },
  { id: 'sigil-005', name: 'Cipher Monk', symbol: '♅', karmaRequired: 25000, description: 'Acumulou 25.000 pontos de karma' },
  { id: 'sigil-006', name: 'Genesis Guardian', symbol: '⎔', karmaRequired: 50000, description: 'Acumulou 50.000 pontos de karma' },
  { id: 'sigil-007', name: 'Chain Mage', symbol: '⛤', karmaRequired: 100000, description: 'Acumulou 100.000 pontos de karma' },
  { id: 'sigil-008', name: 'Bitcoin Sage', symbol: '⟁', karmaRequired: 250000, description: 'Acumulou 250.000 pontos de karma' },
  
  // Sigilos especiais
  { id: 'sigil-uptime-01', name: 'Time Keeper', symbol: '⧖', karmaRequired: 0, special: 'uptime', requirement: 7, description: 'Manteve um nó online por 7 dias' },
  { id: 'sigil-uptime-02', name: 'Eternal Flame', symbol: '⧗', karmaRequired: 0, special: 'uptime', requirement: 30, description: 'Manteve um nó online por 30 dias' },
  { id: 'sigil-connect-01', name: 'Network Weaver', symbol: '⦿', karmaRequired: 0, special: 'connections', requirement: 5, description: 'Conectou-se a 5 nós diferentes' },
  { id: 'sigil-connect-02', name: 'Mesh Guardian', symbol: '◉', karmaRequired: 0, special: 'connections', requirement: 10, description: 'Conectou-se a 10 nós diferentes' },
  { id: 'sigil-perf-01', name: 'Speed Daemon', symbol: '↯', karmaRequired: 0, special: 'performance', requirement: 90, description: 'Atingiu 90% de performance' },
  { id: 'sigil-gpu-01', name: 'Power Node', symbol: '⚛', karmaRequired: 0, special: 'gpu-memory', requirement: 24, description: 'Possui GPU com 24GB ou mais' },
  { id: 'sigil-gpu-02', name: 'Quantum Core', symbol: '⎊', karmaRequired: 0, special: 'gpu-memory', requirement: 48, description: 'Possui GPU com 48GB ou mais' }
];

/**
 * Inicializa o banco de dados IndexedDB
 * @returns {Promise<void>}
 */
export async function initializeIndexedDB() {
  if (db) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Banco de dados inicializado com sucesso');
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Cria store para karma
      if (!db.objectStoreNames.contains(KARMA_STORE)) {
        db.createObjectStore(KARMA_STORE, { keyPath: 'nodeId' });
        console.log('Store de karma criada');
      }
      
      // Cria store para sigilos
      if (!db.objectStoreNames.contains(SIGILS_STORE)) {
        const sigilsStore = db.createObjectStore(SIGILS_STORE, { keyPath: 'id', autoIncrement: true });
        sigilsStore.createIndex('nodeId', 'nodeId', { unique: false });
        sigilsStore.createIndex('sigilId', 'sigilId', { unique: false });
        sigilsStore.createIndex('nodeId_sigilId', ['nodeId', 'sigilId'], { unique: true });
        console.log('Store de sigilos criada');
      }
    };
  });
}

/**
 * Obtém o karma atual para um nó
 * @param {String} nodeId - ID do nó
 * @returns {Promise<Number>} - Valor do karma
 */
export async function getKarmaForNode(nodeId) {
  if (!db) await initializeIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(KARMA_STORE, 'readonly');
    const store = transaction.objectStore(KARMA_STORE);
    const request = store.get(nodeId);
    
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result) {
        resolve(result.karma);
      } else {
        // Gera um valor inicial aleatório para nós sem karma
        const initialKarma = generateInitialKarma(nodeId);
        updateKarmaForNode(nodeId, initialKarma)
          .then(() => resolve(initialKarma))
          .catch(reject);
      }
    };
    
    request.onerror = (event) => {
      console.error('Erro ao buscar karma:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Atualiza o karma para um nó
 * @param {String} nodeId - ID do nó
 * @param {Number} karma - Novo valor de karma
 * @returns {Promise<void>}
 */
export async function updateKarmaForNode(nodeId, karma) {
  if (!db) await initializeIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(KARMA_STORE, 'readwrite');
    const store = transaction.objectStore(KARMA_STORE);
    
    const request = store.put({
      nodeId,
      karma,
      lastUpdated: new Date().toISOString()
    });
    
    transaction.oncomplete = () => {
      // Verifica sigilos após atualização de karma
      checkSigilsForNode(nodeId, karma)
        .then(() => resolve())
        .catch(reject);
    };
    
    transaction.onerror = (event) => {
      console.error('Erro ao atualizar karma:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Adiciona karma a um nó
 * @param {String} nodeId - ID do nó
 * @param {Number} amount - Quantidade a adicionar
 * @returns {Promise<Number>} - Novo valor de karma
 */
export async function addKarmaToNode(nodeId, amount) {
  const currentKarma = await getKarmaForNode(nodeId);
  const newKarma = currentKarma + amount;
  
  await updateKarmaForNode(nodeId, newKarma);
  return newKarma;
}

/**
 * Obtém todos os sigilos desbloqueados por um nó
 * @param {String} nodeId - ID do nó
 * @returns {Promise<Array>} - Lista de sigilos desbloqueados
 */
export async function getSigilsForNode(nodeId) {
  if (!db) await initializeIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SIGILS_STORE, 'readonly');
    const store = transaction.objectStore(SIGILS_STORE);
    const index = store.index('nodeId');
    const request = index.getAll(nodeId);
    
    request.onsuccess = (event) => {
      const unlockedSigils = event.target.result;
      
      // Mapeia para incluir detalhes completos dos sigilos
      const sigilsWithDetails = unlockedSigils.map(unlocked => {
        const sigilDetails = AVAILABLE_SIGILS.find(s => s.id === unlocked.sigilId) || {
          name: 'Unknown Sigil',
          symbol: '?',
          description: 'Sigil details not found'
        };
        
        return {
          ...sigilDetails,
          unlockedAt: unlocked.unlockedAt
        };
      });
      
      // Verifica se o nó já existente precisa de um primeiro sigilo
      if (sigilsWithDetails.length === 0) {
        // Adiciona o sigilo inicial automaticamente
        unlockSigilForNode(nodeId, 'sigil-001')
          .then(() => {
            // Adiciona o sigilo inicial à lista retornada
            const initialSigil = AVAILABLE_SIGILS.find(s => s.id === 'sigil-001');
            sigilsWithDetails.push({
              ...initialSigil,
              unlockedAt: new Date().toISOString()
            });
            resolve(sigilsWithDetails);
          })
          .catch(error => {
            console.error('Erro ao adicionar sigilo inicial:', error);
            resolve(sigilsWithDetails); // Resolve mesmo com erro
          });
      } else {
        resolve(sigilsWithDetails);
      }
    };
    
    request.onerror = (event) => {
      console.error('Erro ao buscar sigilos:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Desbloqueia um sigilo para um nó
 * @param {String} nodeId - ID do nó
 * @param {String} sigilId - ID do sigilo a desbloquear
 * @returns {Promise<Object>} - Dados do sigilo desbloqueado
 */
export async function unlockSigilForNode(nodeId, sigilId) {
  if (!db) await initializeIndexedDB();
  
  // Verifica se o sigilo existe
  const sigilDetails = AVAILABLE_SIGILS.find(s => s.id === sigilId);
  if (!sigilDetails) {
    return Promise.reject(new Error(`Sigilo ${sigilId} não encontrado`));
  }
  
  // Verifica se o sigilo já está desbloqueado
  const existingSigils = await getSigilsForNode(nodeId);
  if (existingSigils.some(s => s.id === sigilId)) {
    return Promise.resolve(sigilDetails); // Já desbloqueado
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SIGILS_STORE, 'readwrite');
    const store = transaction.objectStore(SIGILS_STORE);
    
    const sigilData = {
      nodeId,
      sigilId,
      unlockedAt: new Date().toISOString()
    };
    
    const request = store.add(sigilData);
    
    request.onsuccess = () => {
      console.log(`Sigilo ${sigilId} desbloqueado para ${nodeId}`);
      resolve({ ...sigilDetails, unlockedAt: sigilData.unlockedAt });
    };
    
    request.onerror = (event) => {
      console.error('Erro ao desbloquear sigilo:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Verifica e desbloqueia novos sigilos com base no karma
 * @param {String} nodeId - ID do nó
 * @param {Number} karma - Karma atual do nó
 * @returns {Promise<Array>} - Novos sigilos desbloqueados
 */
export async function checkSigilsForNode(nodeId, karma, nodeDetails = null) {
  const unlockedSigils = await getSigilsForNode(nodeId);
  const unlockedIds = unlockedSigils.map(s => s.id);
  
  // Filtra sigilos baseados em karma que ainda não foram desbloqueados
  const karmaSigilsToUnlock = AVAILABLE_SIGILS.filter(sigil => 
    !unlockedIds.includes(sigil.id) && 
    !sigil.special && 
    karma >= sigil.karmaRequired
  );
  
  // Verifica sigilos especiais se temos detalhes do nó
  const specialSigilsToUnlock = [];
  if (nodeDetails) {
    for (const sigil of AVAILABLE_SIGILS) {
      if (unlockedIds.includes(sigil.id) || !sigil.special) continue;
      
      let shouldUnlock = false;
      
      switch (sigil.special) {
        case 'uptime':
          // Verifica uptime em dias
          const uptimePattern = /(\d+)d/;
          const match = nodeDetails.uptime?.match(uptimePattern);
          if (match && parseInt(match[1], 10) >= sigil.requirement) {
            shouldUnlock = true;
          }
          break;
          
        case 'connections':
          // Vai ser verificado externamente pelo sistema de conexões
          break;
          
        case 'performance':
          // Verifica performance atual
          if (nodeDetails.performance >= sigil.requirement) {
            shouldUnlock = true;
          }
          break;
          
        case 'gpu-memory':
          // Verifica memória da GPU
          if (nodeDetails.memory >= sigil.requirement) {
            shouldUnlock = true;
          }
          break;
      }
      
      if (shouldUnlock) {
        specialSigilsToUnlock.push(sigil);
      }
    }
  }
  
  // Combina os dois tipos de sigilos para desbloquear
  const sigilsToUnlock = [...karmaSigilsToUnlock, ...specialSigilsToUnlock];
  
  // Desbloqueia todos os sigilos elegíveis
  const newlyUnlocked = [];
  for (const sigil of sigilsToUnlock) {
    try {
      const unlocked = await unlockSigilForNode(nodeId, sigil.id);
      newlyUnlocked.push(unlocked);
    } catch (error) {
      console.error(`Erro ao desbloquear sigilo ${sigil.id}:`, error);
    }
  }
  
  return newlyUnlocked;
}

/**
 * Gera um valor inicial de karma para um novo nó
 * @param {String} nodeId - ID do nó
 * @returns {Number} - Valor inicial de karma
 */
function generateInitialKarma(nodeId) {
  // Usa o ID do nó para gerar um valor pseudo-aleatório
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    const char = nodeId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit integer
  }
  
  // Gera um valor entre 100 e 2000
  const baseValue = Math.abs(hash % 1900) + 100;
  
  // Adiciona um fator aleatório
  const randomFactor = Math.floor(Math.random() * 500);
  
  return baseValue + randomFactor;
}

/**
 * Obtém a lista completa de sigilos disponíveis
 * @returns {Array} - Lista de sigilos
 */
export function getAvailableSigils() {
  return [...AVAILABLE_SIGILS];
}

// Exporta funções adicionais
export {
  AVAILABLE_SIGILS
}; 