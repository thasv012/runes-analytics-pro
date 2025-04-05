/**
 * RUNECARD Template Generator
 * Script para ajudar o Cursor a gerar RUNECARDs com um formato consistente
 */

// Função para gerar um ID baseado no título
function generateId(title, ticker) {
  const base = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${base}-${ticker.toLowerCase()}`;
}

// Função para gerar uma data de lançamento aleatória recente
function generateLaunchDate() {
  const now = new Date();
  const pastDays = Math.floor(Math.random() * 365); // Até um ano atrás
  const launchDate = new Date(now);
  launchDate.setDate(now.getDate() - pastDays);
  return launchDate.toISOString().split('T')[0];
}

// Função para gerar uma quantidade aleatória com formato legível
function generateAmount(min, max) {
  const amount = Math.floor(Math.random() * (max - min) + min);
  
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  
  return amount.toString();
}

// Função para gerar uma cor temática aleatória
function generateThemeColor() {
  const colors = [
    "#0ff",    // Ciano
    "#8A2BE2", // Azul Violeta
    "#FF1493", // Rosa Profundo
    "#FF7F50", // Coral
    "#FFD700", // Ouro
    "#00FF7F", // Verde Primavera
    "#4B0082", // Índigo
    "#F0E68C", // Caqui
    "#FF00FF", // Magenta
    "#1E90FF"  // Azul Dodger
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Função para gerar habilidades baseadas na inspiração
function generateAbilities(inspiration) {
  const techPrefixes = [
    "Quantum", "Cyber", "Neural", "Digital", "Atomic", 
    "Nano", "Photonic", "Vector", "Binary", "Plasma"
  ];
  
  const naturePrefixes = [
    "Cosmic", "Astral", "Void", "Terra", "Eco", 
    "Bio", "Gaia", "Lunar", "Solar", "Elemental"
  ];
  
  const spiritualPrefixes = [
    "Eternal", "Mystic", "Ancient", "Spirit", "Soul", 
    "Ethereal", "Astral", "Divine", "Sacred", "Transcendent"
  ];
  
  const cryptoPrefixes = [
    "Chain", "Block", "Hash", "Consensus", "Node",
    "Wallet", "Ledger", "Crypto", "Token", "Mining"
  ];
  
  const techSuffixes = [
    "Algorithm", "Protocol", "Matrix", "Network", "Core",
    "System", "Array", "Nexus", "Grid", "Interface"
  ];
  
  const energySuffixes = [
    "Pulse", "Wave", "Flux", "Field", "Beam",
    "Surge", "Burst", "Resonance", "Discharge", "Ray"
  ];
  
  const defenseSuffixes = [
    "Shield", "Firewall", "Barrier", "Fortress", "Guardian",
    "Sentinel", "Aegis", "Bastion", "Defense", "Protector"
  ];
  
  const offenseSuffixes = [
    "Strike", "Assault", "Blade", "Blast", "Surge",
    "Attack", "Breach", "Override", "Impact", "Force"
  ];
  
  const spiritualSuffixes = [
    "Wisdom", "Harmony", "Balance", "Insight", "Vision",
    "Awakening", "Echo", "Presence", "Essence", "Aura"
  ];
  
  const natureSuffixes = [
    "Bloom", "Grove", "Root", "Seed", "Leaf",
    "Forest", "Garden", "Valley", "Spring", "Cycle"
  ];
  
  // Selecionar lista de prefixos com base na inspiração
  let prefixLists = [techPrefixes, naturePrefixes, spiritualPrefixes, cryptoPrefixes];
  let suffixLists = [techSuffixes, energySuffixes, defenseSuffixes, offenseSuffixes, spiritualSuffixes, natureSuffixes];
  
  // Palavras-chave para cada categoria
  const techKeywords = ["tecnologia", "digital", "computação", "cyber", "ai", "ia", "quantum", "quântic", "virtual", "tech"];
  const natureKeywords = ["nature", "natural", "floresta", "terra", "sustentável", "eco", "plant", "bio", "verde", "ecossistema"];
  const spiritualKeywords = ["espírito", "alma", "consciência", "meditação", "energia", "cósmic", "místic", "divino", "transcend", "ancient"];
  const cryptoKeywords = ["bitcoin", "blockchain", "crypto", "token", "satoshi", "nakamoto", "hash", "ledger", "consenso", "descentralizad"];
  
  // Determinar o tema principal baseado na inspiração
  const lowerInsp = inspiration.toLowerCase();
  
  let primaryPrefixList, secondaryPrefixList;
  let primarySuffixList, secondarySuffixList;
  
  if (techKeywords.some(word => lowerInsp.includes(word))) {
    primaryPrefixList = techPrefixes;
    secondaryPrefixList = cryptoPrefixes;
    primarySuffixList = techSuffixes;
    secondarySuffixList = energySuffixes;
  } else if (natureKeywords.some(word => lowerInsp.includes(word))) {
    primaryPrefixList = naturePrefixes;
    secondaryPrefixList = spiritualPrefixes;
    primarySuffixList = natureSuffixes;  // Usando sufixos de natureza
    secondarySuffixList = energySuffixes;
  } else if (spiritualKeywords.some(word => lowerInsp.includes(word))) {
    primaryPrefixList = spiritualPrefixes;
    secondaryPrefixList = naturePrefixes;
    primarySuffixList = spiritualSuffixes;  // Usando sufixos espirituais
    secondarySuffixList = energySuffixes;
  } else {
    primaryPrefixList = cryptoPrefixes;
    secondaryPrefixList = techPrefixes;
    primarySuffixList = techSuffixes;
    secondarySuffixList = offenseSuffixes;
  }
  
  // Função para gerar uma habilidade única
  function generateUniqueAbility(existingAbilities) {
    let ability;
    let attempts = 0;
    
    do {
      // Alternar entre listas primárias e secundárias para mais variedade
      const useSecondary = Math.random() > 0.7;
      const prefixList = useSecondary ? secondaryPrefixList : primaryPrefixList;
      const suffixList = useSecondary ? secondarySuffixList : primarySuffixList;
      
      const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
      const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
      
      ability = `${prefix} ${suffix}`;
      attempts++;
    } while (existingAbilities.includes(ability) && attempts < 10);
    
    return ability;
  }
  
  // Gerar 3 habilidades principais
  const coreAbilities = [];
  for (let i = 0; i < 3; i++) {
    coreAbilities.push(generateUniqueAbility(coreAbilities));
  }
  
  // Gerar 2 habilidades de despertar
  const awakeningAbilities = [];
  for (let i = 0; i < 2; i++) {
    awakeningAbilities.push(generateUniqueAbility([...coreAbilities, ...awakeningAbilities]));
  }
  
  // Gerar gatilho de despertar baseado no tema
  let triggerDays;
  if (techKeywords.some(word => lowerInsp.includes(word))) {
    triggerDays = Math.floor(Math.random() * 180 + 90); // 3-9 meses para tech
  } else if (natureKeywords.some(word => lowerInsp.includes(word))) {
    triggerDays = Math.floor(Math.random() * 365 + 180); // 6-18 meses para natureza
  } else if (spiritualKeywords.some(word => lowerInsp.includes(word))) {
    triggerDays = Math.floor(Math.random() * 270 + 120); // 4-13 meses para espiritual
  } else {
    triggerDays = Math.floor(Math.random() * 120 + 60); // 2-6 meses para outros
  }
  
  return {
    core: coreAbilities,
    awakening: {
      trigger: `HODL > ${triggerDays} days`,
      unlocked: awakeningAbilities
    }
  };
}

// Função para gerar uma narrativa baseada na inspiração
function generateNarrative(inspiration, ticker) {
  // Aqui seria ideal usar IA para gerar conteúdo criativo
  // Por enquanto, usamos um template simples
  
  const loreFragments = [
    `Nascido nas profundezas da cadeia, ${ticker} emerge como um símbolo de resistência digital.`,
    `Dizem que quem possuir ${ticker} por tempo suficiente começará a ouvir os ecos do código primordial.`,
    `Em um mundo de tokens efêmeros, ${ticker} permanece como um farol de imutabilidade.`
  ];
  
  return {
    intro: `Inspirado por ${inspiration}, ${ticker} transcende o conceito tradicional de valor.`,
    lore: loreFragments,
    quote: `"Eu sou ${ticker}, a manifestação digital da vontade coletiva."`
  };
}

// Função para gerar tags com base na inspiração
function generateTags(inspiration, ticker) {
  const lowerInsp = inspiration.toLowerCase();
  const tags = ['rune', 'runecard', ticker.toLowerCase()];
  
  // Tags baseadas em palavras-chave da inspiração
  const keywordMap = {
    // Tech
    "tecnologia": ["tech", "digital", "innovation"],
    "digital": ["digital", "tech", "virtual"],
    "computação": ["computing", "tech", "algorithm"],
    "cyber": ["cyber", "digital", "futuristic"],
    "ai": ["ai", "algorithm", "intelligent"],
    "ia": ["ai", "intelligent", "digital"],
    "quantum": ["quantum", "advanced", "tech"],
    "quântic": ["quantum", "advanced", "physics"],
    "virtual": ["virtual", "digital", "metaverse"],
    
    // Nature
    "nature": ["nature", "organic", "ecosystem"],
    "natural": ["natural", "organic", "eco"],
    "floresta": ["forest", "nature", "green"],
    "terra": ["earth", "nature", "organic"],
    "sustentável": ["sustainable", "eco", "green"],
    "eco": ["eco", "green", "sustainable"],
    "plant": ["plant", "growth", "organic"],
    "bio": ["bio", "organic", "life"],
    "verde": ["green", "eco", "sustainable"],
    
    // Spiritual
    "espírito": ["spirit", "soul", "essence"],
    "alma": ["soul", "spirit", "energy"],
    "consciência": ["consciousness", "awareness", "mindful"],
    "meditação": ["meditation", "mindful", "zen"],
    "energia": ["energy", "flow", "spirit"],
    "cósmic": ["cosmic", "universe", "celestial"],
    "místic": ["mystic", "mysterious", "arcane"],
    "divino": ["divine", "sacred", "celestial"],
    "transcend": ["transcendent", "beyond", "elevated"],
    
    // Crypto
    "bitcoin": ["bitcoin", "crypto", "satoshi"],
    "blockchain": ["blockchain", "ledger", "distributed"],
    "crypto": ["crypto", "digital-asset", "blockchain"],
    "token": ["token", "asset", "digital-value"],
    "satoshi": ["satoshi", "bitcoin", "genesis"],
    "nakamoto": ["nakamoto", "bitcoin", "genesis"],
    "hash": ["hash", "cryptography", "secure"],
    "ledger": ["ledger", "record", "immutable"],
    "consenso": ["consensus", "agreement", "protocol"],
    "descentralizad": ["decentralized", "distributed", "autonomous"]
  };
  
  // Adicionar tags com base nas palavras-chave encontradas
  for (const [keyword, relatedTags] of Object.entries(keywordMap)) {
    if (lowerInsp.includes(keyword)) {
      // Adicionar tags relacionadas (evitando duplicatas)
      relatedTags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
  }
  
  // Limitar a 10 tags
  return tags.slice(0, 10);
}

// Função para determinar a categoria do RUNECARD
function generateCategory(inspiration) {
  const lowerInsp = inspiration.toLowerCase();
  
  // Categorias principais e subcategorias
  const categoryMap = {
    "technology": {
      keywords: ["tecnologia", "digital", "computação", "cyber", "ai", "ia", "quantum", "quântic", "virtual", "tech"],
      subcategories: ["ai", "cyber", "quantum", "virtual"]
    },
    "nature": {
      keywords: ["nature", "natural", "floresta", "terra", "sustentável", "eco", "plant", "bio", "verde", "ecossistema"],
      subcategories: ["ecosystem", "sustainable", "organic"]
    },
    "spiritual": {
      keywords: ["espírito", "alma", "consciência", "meditação", "energia", "cósmic", "místic", "divino", "transcend", "ancient"],
      subcategories: ["cosmic", "energy", "consciousness"]
    },
    "cryptocurrency": {
      keywords: ["bitcoin", "blockchain", "crypto", "token", "satoshi", "nakamoto", "hash", "ledger", "consenso", "descentralizad"],
      subcategories: ["bitcoin", "defi", "nft", "mining"]
    }
  };
  
  // Determinar categoria principal
  let mainCategory = "general";
  let subCategory = "";
  let highestMatches = 0;
  
  for (const [category, data] of Object.entries(categoryMap)) {
    const matches = data.keywords.filter(keyword => lowerInsp.includes(keyword)).length;
    
    if (matches > highestMatches) {
      highestMatches = matches;
      mainCategory = category;
      
      // Determinar subcategoria
      for (const sub of data.subcategories) {
        if (lowerInsp.includes(sub)) {
          subCategory = sub;
          break;
        }
      }
    }
  }
  
  // Retornar categoria/subcategoria
  return subCategory ? `${mainCategory}/${subCategory}` : mainCategory;
}

// Função para gerar uma avaliação de exemplo
function generateSampleReview() {
  const comments = [
    "Excelente design, perfeito para minha coleção de Runes!",
    "A narrativa deste card é fascinante, adoro a história por trás dele.",
    "As habilidades são bem balanceadas e refletem a essência do token.",
    "Visualmente impressionante, a animação combina perfeitamente com o tema.",
    "Um dos melhores RUNECARDs que já vi, muito detalhado."
  ];
  
  return {
    rating: Math.floor(Math.random() * 2) + 4, // 4 ou 5 estrelas
    comment: comments[Math.floor(Math.random() * comments.length)],
    date: new Date().toISOString().split('T')[0]
  };
}

// Função principal para gerar o template RUNECARD completo
function generateRunecardTemplate(title, ticker, inspiration) {
  const id = generateId(title, ticker);
  const themeColor = generateThemeColor();
  const totalSupply = generateAmount(1000000, 100000000);
  const holders = generateAmount(1000, 50000);
  const category = generateCategory(inspiration);
  const tags = generateTags(inspiration, ticker);
  
  // Gerar um review de exemplo
  const reviews = [generateSampleReview()];
  
  // Inicializar plugins vazios
  const plugins = [];
  
  return {
    id: id,
    title: title,
    subtitle: title.includes("-") ? title.split("-")[1].trim() : `The ${ticker} Protocol`,
    rune: {
      ticker: ticker,
      id: "0x" + Math.random().toString(16).substring(2, 10),
      minted: totalSupply,
      holders: holders,
      launchDate: generateLaunchDate()
    },
    visual: {
      image: `assets/cards/${id}.png`,
      themeColor: themeColor,
      animation: ["pulse", "glow", "flicker", "awaken", "ripple"][Math.floor(Math.random() * 5)]
    },
    narrative: generateNarrative(inspiration, ticker),
    abilities: generateAbilities(inspiration),
    meta: {
      createdBy: "RUNES Analytics Pro",
      version: "1.0.0",
      lastUpdated: new Date().toISOString().split('T')[0],
      category: category,
      tags: tags
    },
    reviews: reviews,
    plugins: plugins
  };
}

// Exportar as funções
module.exports = {
  generateRunecardTemplate,
  generateTags,
  generateCategory,
  generateSampleReview
};

// Se o script for executado diretamente, exibir um exemplo
if (require.main === module) {
  const exampleCard = generateRunecardTemplate(
    "Quantum Nexus", 
    "QNEX", 
    "tecnologia quântica"
  );
  
  console.log(JSON.stringify(exampleCard, null, 2));
} 