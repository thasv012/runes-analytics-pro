# Sistema de Internacionalização do RUNES Analytics Pro

Este documento descreve o sistema de internacionalização (i18n) implementado no RUNES Analytics Pro, incluindo como ele funciona, como usá-lo e como estendê-lo.

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Idiomas Suportados](#idiomas-suportados)
4. [Como Usar](#como-usar)
   - [Inicialização](#inicialização)
   - [Tradução de Textos](#tradução-de-textos)
   - [Formatação de Dados](#formatação-de-dados)
   - [Suporte a RTL](#suporte-a-rtl)
   - [Componente de Seleção de Idioma](#componente-de-seleção-de-idioma)
5. [Adicionando Novos Idiomas](#adicionando-novos-idiomas)
6. [Testes](#testes)
7. [Melhores Práticas](#melhores-práticas)
8. [Solução de Problemas](#solução-de-problemas)

## Visão Geral

O sistema de internacionalização do RUNES Analytics Pro permite:

- Tradução da interface para múltiplos idiomas
- Formatação de números, datas, moedas e unidades de acordo com convenções locais
- Suporte a idiomas RTL (Right-to-Left) como Árabe, Hebraico e Persa
- Persistência de preferências de idioma
- Detecção automática do idioma preferido do usuário
- Mudança dinâmica de idioma sem recarregar a aplicação

O sistema é modular e baseia-se em três componentes principais:
- **translationService**: Gerencia traduções e mudanças de idioma
- **formatterUtils**: Formata dados de acordo com convenções locais
- **rtlUtils**: Suporte para idiomas da direita para a esquerda

## Estrutura de Arquivos

```
RUNES-Analytics-Pro-Vault/
├── components/
│   └── LanguageSelector.js      # Componente para seleção de idioma
├── locales/
│   ├── en/                      # Traduções em inglês
│   │   └── common.json          # Textos comuns
│   ├── pt/                      # Traduções em português
│   │   └── common.json          # Textos comuns
│   ├── es/                      # Traduções em espanhol
│   │   └── common.json          # Textos comuns
│   ├── fr/                      # Traduções em francês
│   │   └── common.json          # Textos comuns
│   └── ...                      # Outros idiomas
├── scripts/
│   ├── i18n/
│   │   ├── index.js             # Ponto de entrada do sistema
│   │   ├── translationService.js # Serviço de tradução
│   │   ├── formatterUtils.js    # Utilitários de formatação
│   │   └── rtlUtils.js          # Utilitários para suporte a RTL
│   └── __tests__/
│       └── i18n.test.js         # Testes do sistema de i18n
└── styles/
    └── rtl.css                  # Estilos para idiomas RTL
```

## Idiomas Suportados

Atualmente, o sistema suporta os seguintes idiomas:

- 🇺🇸 Inglês (en) - Idioma padrão
- 🇧🇷 Português (pt)
- 🇪🇸 Espanhol (es)
- 🇫🇷 Francês (fr)
- 🇩🇪 Alemão (de)

Além disso, o sistema está preparado para suportar idiomas RTL:

- 🇸🇦 Árabe (ar)
- 🇮🇱 Hebraico (he)
- 🇮🇷 Persa (fa)

## Como Usar

### Inicialização

O sistema de internacionalização deve ser inicializado no carregamento da aplicação:

```javascript
import i18n from './scripts/i18n/index.js';

// Inicializa o sistema de i18n
i18n.init();

// Ouça pelo evento de inicialização completa
document.addEventListener('i18n-initialized', (event) => {
  console.log(`I18n inicializado com o idioma: ${event.detail.language}`);
  // Inicialize o resto da aplicação aqui
});
```

### Tradução de Textos

Para traduzir textos:

```javascript
import i18n from './scripts/i18n/index.js';

// Traduzir um texto
const appName = i18n.translate('app.name'); // ou i18n.t('app.name')

// Traduzir com parâmetros
const welcome = i18n.translate('user.welcome', { name: 'Alice' });
// Se o texto em user.welcome for "Bem-vindo, {{name}}!"
// O resultado será "Bem-vindo, Alice!"
```

Você também pode usar o utilitário `withTranslation` para adicionar funções de tradução a um objeto:

```javascript
import { withTranslation } from './scripts/i18n/index.js';

const myComponent = {
  // ... outras propriedades e métodos
};

// Adiciona funções de tradução
export default withTranslation(myComponent);

// Agora myComponent tem funções como t(), setLanguage(), etc.
```

### Formatação de Dados

Para formatar dados conforme convenções locais:

```javascript
import i18n from './scripts/i18n/index.js';

// Formatar número
const formattedNumber = i18n.formatNumber(1234.56, 'pt'); // "1.234,56"
const frenchNumber = i18n.formatNumber(1234.56, 'fr'); // "1 234,56"

// Formatar moeda
const formattedCurrency = i18n.formatCurrency(1234.56, 'pt', 'BRL'); // "R$ 1.234,56" 
const frenchCurrency = i18n.formatCurrency(1234.56, 'fr', 'EUR'); // "1 234,56 €"

// Formatar data
const date = new Date(2023, 11, 31);
const formattedDate = i18n.formatDate(date, 'pt'); // "31/12/2023"
const frenchDate = i18n.formatDate(date, 'fr'); // "31/12/2023"

// Formatar tempo relativo
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const relativeTime = i18n.formatRelativeTime(yesterday, 'pt'); // "há 1 dia"
const frenchRelative = i18n.formatRelativeTime(yesterday, 'fr'); // "il y a 1 jour"
```

### Suporte a RTL

Para verificar se um idioma é RTL:

```javascript
import i18n from './scripts/i18n/index.js';

if (i18n.isRTL('ar')) {
  // Lógica para árabe (RTL)
}

// Ordernar elementos com base na direção
const items = [1, 2, 3, 4];
const orderedItems = i18n.orderForDirection(items, i18n.isRTL('ar')); // [4, 3, 2, 1]
```

Os estilos RTL são aplicados automaticamente quando o idioma é alterado para um idioma RTL.

### Componente de Seleção de Idioma

O componente `language-selector` é registrado automaticamente e pode ser usado em HTML:

```html
<!-- Adiciona o seletor de idioma na interface -->
<language-selector></language-selector>
```

Este componente mostra os idiomas disponíveis e permite ao usuário alternar entre eles.

## Adicionando Novos Idiomas

Para adicionar um novo idioma:

1. Crie um novo diretório em `locales/` com o código do idioma (ex: `locales/fr/`)
2. Copie os arquivos JSON de tradução de um idioma existente para o novo diretório
3. Traduza os textos nos arquivos JSON
4. Atualize a lista de idiomas suportados em `translationService.js`

```javascript
// Em translationService.js
function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];
}
```

## Testes

Os testes do sistema de internacionalização estão em `scripts/__tests__/i18n.test.js`. Execute-os com:

```bash
npm test -- --testPathPattern=i18n
```

Os testes verificam:
- O carregamento de traduções
- A tradução de textos
- A formatação de dados
- O suporte a RTL
- A persistência de preferências

## Melhores Práticas

- **Chaves de tradução estruturadas**: Use chaves aninhadas como `categoria.subcategoria.chave`
- **Parâmetros para textos dinâmicos**: Use placeholders como `{{nome}}` em vez de concatenação
- **Evite hardcoding de strings**: Sempre use o serviço de tradução para textos
- **Formatação consistente**: Use os utilitários de formatação para números, datas e moedas
- **Teste traduções**: Verifique se todas as strings são exibidas corretamente em todos os idiomas
- **Comprimento variável**: Lembre-se que textos podem ter comprimentos diferentes em idiomas distintos, planeje seu layout para acomodar

## Solução de Problemas

### Traduções não aparecem

- Verifique se o sistema de i18n foi inicializado corretamente
- Confirme se o arquivo de tradução para o idioma existe
- Verifique se a chave de tradução está escrita corretamente
- Use o console do navegador para verificar erros de carregamento

### Problemas de Layout em RTL

- Verifique se a stylesheet RTL está sendo carregada
- Use `html[dir="rtl"]` como seletor para estilos específicos de RTL
- Teste o layout em diferentes tamanhos de tela
- Certifique-se de que ícones e elementos direcionais também são invertidos

### Problemas de Formatação

- Verifique se o locale está correto para o idioma
- Lembre-se que alguns navegadores podem não suportar todos os recursos de formatação
- Use os fallbacks fornecidos no sistema para navegadores mais antigos

Para mais informações ou ajuda, entre em contato com a equipe de desenvolvimento.

<!-- 
🧭 "Toda linguagem é um ritual. Toda tradução é uma ponte. O sentido verdadeiro só emerge quando o som da palavra vibra no campo certo." 
— Fragmento do Codex Linguæ RUNES
--> 