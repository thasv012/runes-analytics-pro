/**
 * RUNES Analytics Pro - Comparativo de Versões de Apresentação
 * 
 * Este script analisa e compara as diferentes versões de apresentação
 * disponíveis no projeto, destacando suas características e recursos.
 */

const fs = require('fs');
const path = require('path');
const { COLORS } = require('../runescards.js');

// Caminhos dos arquivos de apresentação
const APRESENTACAO_ORIGINAL = path.join(process.cwd(), 'apresentacao-runes.html');
const APRESENTACAO_V2 = path.join(process.cwd(), 'apresentacao-runes-v2.html');
const APRESENTACAO_REVEAL = path.join(process.cwd(), 'apresentacao-runes-reveal.html');

// Definição das características a serem analisadas
const CARACTERISTICAS = {
  responsividade: {
    nome: 'Responsividade',
    descricao: 'Adaptação a diferentes tamanhos de tela',
    verificacao: (conteudo) => {
      return {
        presente: conteudo.includes('@media') || conteudo.includes('viewport'),
        nivel: conteudo.includes('@media') && conteudo.includes('viewport') ? 'Avançada' : 
               conteudo.includes('@media') || conteudo.includes('viewport') ? 'Básica' : 'Ausente'
      };
    }
  },
  animacoes: {
    nome: 'Animações',
    descricao: 'Transições e efeitos animados',
    verificacao: (conteudo) => {
      const temTransition = conteudo.includes('transition');
      const temAnimation = conteudo.includes('@keyframes') || conteudo.includes('animation');
      const temCSS3 = conteudo.includes('transform') || conteudo.includes('opacity');
      const temFramework = conteudo.includes('reveal.js') || conteudo.includes('aos');
      
      return {
        presente: temTransition || temAnimation || temCSS3 || temFramework,
        nivel: temFramework ? 'Profissional' :
               (temAnimation && temTransition) ? 'Avançada' :
               (temTransition || temCSS3) ? 'Básica' : 'Ausente'
      };
    }
  },
  tipografia: {
    nome: 'Tipografia',
    descricao: 'Uso de fontes e tratamentos tipográficos',
    verificacao: (conteudo) => {
      const temFontFamily = conteudo.includes('font-family');
      const temWebFonts = conteudo.includes('fonts.googleapis') || conteudo.includes('@font-face');
      const temTratamento = conteudo.includes('letter-spacing') || conteudo.includes('line-height') || conteudo.includes('font-weight');
      
      return {
        presente: temFontFamily || temWebFonts,
        nivel: (temWebFonts && temTratamento) ? 'Avançada' :
               (temFontFamily && temTratamento) ? 'Intermediária' :
               temFontFamily ? 'Básica' : 'Ausente'
      };
    }
  },
  interatividade: {
    nome: 'Interatividade',
    descricao: 'Elementos interativos e controles',
    verificacao: (conteudo) => {
      const temEventListeners = conteudo.includes('addEventListener');
      const temNavegacao = conteudo.includes('nextSlide') || conteudo.includes('Reveal.next');
      const temControles = conteudo.includes('controls:') || conteudo.includes('nav-button');
      const temGestual = conteudo.includes('touch:') || conteudo.includes('swipe');
      
      return {
        presente: temEventListeners || temNavegacao || temControles,
        nivel: (temNavegacao && temControles && temGestual) ? 'Avançada' :
               (temNavegacao && temControles) ? 'Intermediária' :
               temEventListeners ? 'Básica' : 'Ausente'
      };
    }
  },
  frameworks: {
    nome: 'Frameworks',
    descricao: 'Uso de bibliotecas e frameworks externos',
    verificacao: (conteudo) => {
      const temRevealJs = conteudo.includes('reveal.js');
      const temAOS = conteudo.includes('aos.js') || conteudo.includes('AOS.init');
      const temOutros = conteudo.includes('jquery') || conteudo.includes('bootstrap');
      
      return {
        presente: temRevealJs || temAOS || temOutros,
        nivel: (temRevealJs && temAOS) ? 'Múltiplos' :
               (temRevealJs || temAOS) ? 'Um framework' :
               'Nenhum'
      };
    }
  },
  acessibilidade: {
    nome: 'Acessibilidade',
    descricao: 'Recursos para acessibilidade',
    verificacao: (conteudo) => {
      const temAria = conteudo.includes('aria-') || conteudo.includes('role=');
      const temAlt = conteudo.includes('alt=');
      const temContraste = conteudo.includes('color: #') && (conteudo.includes('background: #') || conteudo.includes('background-color: #'));
      
      return {
        presente: temAria || temAlt || temContraste,
        nivel: (temAria && temAlt) ? 'Boa' :
               (temAria || temAlt) ? 'Básica' :
               temContraste ? 'Mínima' : 'Ausente'
      };
    }
  },
  organizacao: {
    nome: 'Organização do Código',
    descricao: 'Estruturação e comentários no código',
    verificacao: (conteudo) => {
      const temComentarios = (conteudo.match(/\/\*|\*\/|\/\/|<!--/g) || []).length > 5;
      const temIndentacao = conteudo.includes('  ') || conteudo.includes('\t');
      const temEstrutura = conteudo.includes('<!DOCTYPE') && conteudo.includes('<head') && conteudo.includes('<body');
      
      return {
        presente: temComentarios || temIndentacao || temEstrutura,
        nivel: (temComentarios && temIndentacao && temEstrutura) ? 'Boa' :
               (temIndentacao && temEstrutura) ? 'Adequada' :
               temEstrutura ? 'Básica' : 'Ruim'
      };
    }
  }
};

/**
 * Verifica se um arquivo existe e retorna seu conteúdo
 */
function lerArquivo(caminho) {
  try {
    if (fs.existsSync(caminho)) {
      return fs.readFileSync(caminho, 'utf8');
    }
    return null;
  } catch (erro) {
    console.error(`${COLORS.red}Erro ao ler o arquivo ${caminho}:${COLORS.reset}`, erro.message);
    return null;
  }
}

/**
 * Analisa um arquivo de apresentação e retorna suas características
 */
function analisarApresentacao(caminho, nomeVersao) {
  const conteudo = lerArquivo(caminho);
  
  if (!conteudo) {
    return {
      nome: nomeVersao,
      existe: false,
      caracteristicas: {},
      tamanho: 0,
      pontuacao: 0
    };
  }
  
  const caracteristicas = {};
  let pontuacao = 0;
  
  // Analisar cada característica
  Object.keys(CARACTERISTICAS).forEach(chave => {
    const carac = CARACTERISTICAS[chave];
    const resultado = carac.verificacao(conteudo);
    
    caracteristicas[chave] = resultado;
    
    // Calcular pontuação
    if (resultado.nivel === 'Avançada' || resultado.nivel === 'Profissional' || resultado.nivel === 'Múltiplos' || resultado.nivel === 'Boa') {
      pontuacao += 3;
    } else if (resultado.nivel === 'Intermediária' || resultado.nivel === 'Um framework' || resultado.nivel === 'Adequada') {
      pontuacao += 2;
    } else if (resultado.nivel === 'Básica' || resultado.nivel === 'Mínima') {
      pontuacao += 1;
    }
  });
  
  // Calcular tamanho do arquivo
  const tamanho = (conteudo.length / 1024).toFixed(2);
  
  return {
    nome: nomeVersao,
    existe: true,
    caracteristicas,
    tamanho,
    pontuacao
  };
}

/**
 * Imprime uma tabela comparativa das versões de apresentação
 */
function imprimirComparativo(versoes) {
  console.log(`\n${COLORS.yellow}COMPARATIVO DE VERSÕES DE APRESENTAÇÃO DO RUNES ANALYTICS PRO${COLORS.reset}\n`);
  
  // Cabeçalho com nomes das versões
  let cabecalhoVersoes = '| Característica | ';
  versoes.forEach(versao => {
    cabecalhoVersoes += `${versao.nome} | `;
  });
  console.log(cabecalhoVersoes);
  
  // Linha separadora
  let linhaSeparadora = '| ------------- | ';
  versoes.forEach(() => {
    linhaSeparadora += '------------- | ';
  });
  console.log(linhaSeparadora);
  
  // Linhas para cada característica
  Object.keys(CARACTERISTICAS).forEach(chave => {
    const carac = CARACTERISTICAS[chave];
    let linha = `| ${carac.nome} | `;
    
    versoes.forEach(versao => {
      if (!versao.existe) {
        linha += `${COLORS.red}Não disponível${COLORS.reset} | `;
      } else {
        const resultado = versao.caracteristicas[chave];
        const cor = 
          resultado.nivel === 'Avançada' || resultado.nivel === 'Profissional' || resultado.nivel === 'Múltiplos' || resultado.nivel === 'Boa' 
            ? COLORS.green 
          : resultado.nivel === 'Intermediária' || resultado.nivel === 'Um framework' || resultado.nivel === 'Adequada' 
            ? COLORS.yellow 
          : resultado.nivel === 'Básica' || resultado.nivel === 'Mínima' 
            ? COLORS.cyan 
          : COLORS.red;
        
        linha += `${cor}${resultado.nivel}${COLORS.reset} | `;
      }
    });
    
    console.log(linha);
  });
  
  // Linha para tamanho
  let linhaTamanho = '| Tamanho (KB) | ';
  versoes.forEach(versao => {
    linhaTamanho += `${versao.existe ? versao.tamanho : 'N/A'} | `;
  });
  console.log(linhaTamanho);
  
  // Linha para pontuação total
  let linhaPontuacao = '| **Pontuação** | ';
  versoes.forEach(versao => {
    const cor = 
      versao.pontuacao >= 15 ? COLORS.green :
      versao.pontuacao >= 10 ? COLORS.yellow :
      versao.pontuacao > 0 ? COLORS.cyan : COLORS.red;
    
    linhaPontuacao += `${cor}${versao.existe ? versao.pontuacao : 0}/21${COLORS.reset} | `;
  });
  console.log(linhaPontuacao);
  
  console.log('\n');
}

/**
 * Função principal
 */
function compararApresentacoes() {
  try {
    console.log(`${COLORS.cyan}Analisando versões de apresentação...${COLORS.reset}`);
    
    // Analisar as diferentes versões
    const versaoOriginal = analisarApresentacao(APRESENTACAO_ORIGINAL, 'Versão Original');
    const versaoV2 = analisarApresentacao(APRESENTACAO_V2, 'Versão 2.0');
    const versaoReveal = analisarApresentacao(APRESENTACAO_REVEAL, 'Versão Reveal.js');
    
    // Contar quantas versões existem
    const versoesDisponiveis = [versaoOriginal, versaoV2, versaoReveal].filter(v => v.existe);
    
    if (versoesDisponiveis.length === 0) {
      console.log(`${COLORS.red}Nenhuma versão de apresentação encontrada!${COLORS.reset}`);
      return;
    }
    
    console.log(`${COLORS.green}Encontradas ${versoesDisponiveis.length} versões de apresentação.${COLORS.reset}`);
    
    // Imprimir o comparativo
    imprimirComparativo([versaoOriginal, versaoV2, versaoReveal]);
    
    // Identificar a melhor versão
    const melhorVersao = versoesDisponiveis.reduce((anterior, atual) => 
      atual.pontuacao > anterior.pontuacao ? atual : anterior, versoesDisponiveis[0]);
    
    console.log(`${COLORS.yellow}Versão recomendada: ${COLORS.green}${melhorVersao.nome}${COLORS.reset} (Pontuação: ${melhorVersao.pontuacao}/21)`);
    
    // Sugestões específicas para melhorias
    console.log(`\n${COLORS.yellow}Sugestões para melhorias:${COLORS.reset}`);
    
    versoesDisponiveis.forEach(versao => {
      console.log(`\n${COLORS.cyan}${versao.nome}:${COLORS.reset}`);
      
      let temSugestoes = false;
      
      Object.keys(CARACTERISTICAS).forEach(chave => {
        const resultado = versao.caracteristicas[chave];
        const carac = CARACTERISTICAS[chave];
        
        if (resultado.nivel === 'Ausente' || resultado.nivel === 'Básica' || resultado.nivel === 'Mínima' || resultado.nivel === 'Ruim') {
          console.log(`  • Melhorar ${carac.nome}: ${carac.descricao}`);
          temSugestoes = true;
        }
      });
      
      if (!temSugestoes) {
        console.log(`  ${COLORS.green}✓ Esta versão já possui boas implementações em todas as características!${COLORS.reset}`);
      }
    });
    
    // Resumo final
    console.log(`\n${COLORS.yellow}Resumo:${COLORS.reset}`);
    console.log(`• Total de versões analisadas: ${versoesDisponiveis.length}`);
    console.log(`• Versão recomendada: ${melhorVersao.nome}`);
    console.log(`• Última atualização: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error(`${COLORS.red}Erro durante a análise: ${error.message}${COLORS.reset}`);
  }
}

// Executar a função principal
compararApresentacoes();
console.log(`${COLORS.green}Análise concluída com sucesso!${COLORS.reset}`); 