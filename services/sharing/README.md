# Sistema de Compartilhamento e Exportação - RUNES Analytics Pro

Este módulo oferece funcionalidades robustas para compartilhamento e exportação de dados na plataforma RUNES Analytics Pro.

## 📋 Recursos Principais

- **URLs Compartilháveis**: Preservação do estado da aplicação através de URLs que podem ser compartilhadas
- **Compressão Inteligente**: Redução do tamanho das URLs usando LZ-String
- **Cartões Sociais**: Geração de imagens para compartilhamento em redes sociais (Twitter, Discord, etc.)
- **Exportação de Dados**: Suporte para exportação em formatos CSV e JSON
- **Integração com Redes Sociais**: Compartilhamento direto para Twitter, Telegram, WhatsApp e mais
- **Segurança Embutida**: Sanitização de dados sensíveis e validação de tamanho

## 🔧 Arquitetura

O sistema consiste nos seguintes componentes principais:

1. **SharingService.js** - Serviço central que gerencia:
   - Geração de URLs compartilháveis com compressão de estado
   - Criação de cartões sociais usando HTML Canvas
   - Exportação de dados para formatos como CSV e JSON
   - Compartilhamento direto para redes sociais

2. **ShareTools.js** - Componente visual que fornece:
   - Interface do usuário para todas as funcionalidades do serviço
   - Métodos para configurar e processar dados de compartilhamento
   - Feedback visual para ações do usuário

3. **share-tools.css** - Estilos e animações para o componente visual

## 🚀 Instalação

1. Copie os arquivos para as respectivas pastas do seu projeto:
   - `services/sharing/SharingService.js`
   - `components/ShareTools.js`
   - `css/share-tools.css`

2. Adicione as dependências necessárias:
   - [LZ-String](https://github.com/pieroxy/lz-string) para compressão
   - [html2canvas](https://html2canvas.hertzen.com) para geração de imagens

3. Inclua os scripts e estilos no seu HTML:

```html
<!-- Dependências -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- Estilos -->
<link rel="stylesheet" href="css/share-tools.css">

<!-- Scripts -->
<script src="services/sharing/SharingService.js"></script>
<script src="components/ShareTools.js"></script>
```

## 📖 Guia de Uso

### Inicialização Básica

```javascript
// Criar instância do componente
const sharingTools = new ShareTools('container-id', {
  enabledFeatures: {
    shareUrl: true,
    socialCards: true, 
    dataExport: true
  },
  defaultFileName: 'runes-data-export'
});

// Configurar dados para compartilhamento
sharingTools.setData(
  // Dados a serem compartilhados/exportados
  {
    title: 'Análise do token PEPE',
    description: 'Estatísticas detalhadas para o token PEPE',
    statLabel: 'Holders Ativos',
    statValue: '2.483',
    holders: '2.4K',
    transactions: '18.5K'
  },
  // Estado da aplicação (para URL compartilhável)
  {
    view: 'token-details',
    token: 'PEPE',
    period: '30d'
  }
);
```

### Configuração Avançada do SharingService

```javascript
// Configurar compressão, serviço de URLs curtas e segurança
sharingService.configure({
  compressionEnabled: true,
  shortUrlEnabled: true,
  shortUrlService: 'bitly',  // 'interno' ou 'bitly'
  bitlyToken: 'seu_token_bitly',
  
  securitySettings: {
    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxStateSize: 200 * 1024, // 200KB
    sensitiveFields: ['apiKey', 'userToken', 'password']
  },
  
  socialCardTemplates: {
    twitter: {
      width: 1200,
      height: 628,
      template: 'meu-template-personalizado'
    }
  }
});
```

### Personalização do Estado Capturado

Para capturar o estado atual da aplicação de forma personalizada, você pode estender a classe `ShareTools`:

```javascript
class RunesShareTools extends ShareTools {
  getCurrentState() {
    // Capturar estado de filtros, visualizações, etc.
    const activeFilters = runExplorer.getActiveFilters();
    const sortSettings = runExplorer.getSortSettings();
    const selectedToken = runExplorer.getSelectedToken();
    
    return {
      filters: activeFilters,
      sort: sortSettings,
      token: selectedToken,
      view: currentView,
      timestamp: new Date().toISOString()
    };
  }
}
```

### Uso Direto do SharingService

O componente visual `ShareTools` utiliza internamente o `sharingService`. Para uso direto:

```javascript
// Gerar URL compartilhável
const url = await sharingService.generateShareableUrl(state, {
  useShortUrl: true,
  path: '/token-details'
});

// Exportar dados para CSV
await sharingService.exportToCsv(data, {
  filename: 'token-analysis.csv',
  headers: ['name', 'supply', 'holders'],
  headerLabels: ['Nome do Token', 'Supply Total', 'Holders']
});

// Gerar cartão social
const imageUrl = await sharingService.generateSocialCard(data, 'twitter', {
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  accentColor: '#5352ed',
  logoUrl: '/assets/logo.png'
});
```

## 📊 Estrutura de Dados

### Dados para Cartões Sociais

```javascript
{
  title: 'Título principal do cartão',
  description: 'Descrição secundária ou subtítulo',
  statLabel: 'Nome da estatística principal',
  statValue: 'Valor da estatística principal',
  stat1Label: 'Nome da estatística 1',
  stat1Value: 'Valor da estatística 1',
  stat2Label: 'Nome da estatística 2',
  stat2Value: 'Valor da estatística 2',
  timestamp: '01/01/2023', // Data de geração
  footer: 'Texto para rodapé'
}
```

### Estado da Aplicação

```javascript
{
  view: 'token-details', // Página ou vista atual
  token: 'PEPE', // Identificador do token
  period: '30d', // Período de análise
  filters: {}, // Filtros aplicados
  sort: { field: 'volume', direction: 'desc' }, // Configuração de ordenação
  timestamp: '2023-01-01T12:00:00Z' // Data e hora de geração
}
```

## 🔒 Segurança

O sistema implementa várias medidas de segurança:

- **Sanitização de Estado**: Remoção automática de dados sensíveis antes do compartilhamento
- **Limitação de Tamanho**: Prevenção contra URLs excessivamente grandes
- **Compressão Segura**: Uso de algoritmos de compressão padrão da indústria
- **Validação de Dados**: Verificação de integridade dos dados ao restaurar estado da URL

## 💻 Exemplo Completo

Uma página de demonstração está disponível em `sharing-demo.html` para exemplificar o uso completo do sistema.

Para executar:
1. Navegue até o diretório principal do projeto
2. Inicie um servidor local:
   ```
   npx live-server --port=8090
   ```
3. Acesse `http://localhost:8090/sharing-demo.html` no navegador

## 📘 Referências

- [LZ-String Documentation](https://github.com/pieroxy/lz-string) - Biblioteca de compressão utilizada
- [html2canvas Documentation](https://html2canvas.hertzen.com/) - Biblioteca para geração de imagens
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) - API de compartilhamento nativa para navegadores modernos

## 🤝 Contribuições

Para contribuir com melhorias:

1. Verifique as issues abertas ou abra uma nova issue
2. Fork o repositório e crie uma branch para sua feature
3. Envie um pull request com suas mudanças

## 📄 Licença

Este projeto é licenciado sob MIT License. 