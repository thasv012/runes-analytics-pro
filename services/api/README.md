# Sistema de API Unificada - RUNES Analytics Pro

Este sistema fornece uma camada de abstração robusta para comunicação com múltiplas APIs externas, tratamento de erros, caching e fallbacks inteligentes para a plataforma RUNES Analytics Pro.

## Arquitetura

O sistema é composto pelos seguintes componentes:

```
services/api/
├── ApiMiddleware.js     # Camada de abstração principal
├── RunesApiService.js   # Interface simplificada para dados de Runes
├── transformers.js      # Transformações entre formatos de API
├── BaseApiService.js    # Serviço básico para comunicação com APIs
├── AdvancedApiService.js # Serviço avançado com recursos adicionais
├── OrdiscanService.js   # Cliente para a API Ordiscan
├── GeniiDataService.js  # Cliente para a API GeniiData
├── MempoolService.js    # Cliente para a API Mempool.space (planejado)
├── MetricsService.js    # Serviço para métricas on-chain (planejado)
├── ApiRotationManager.js # Gerenciador de rotação de APIs (planejado)
└── index.js             # Exportação dos serviços
```

## Principais Características

### 1. Middleware Central (ApiMiddleware)

O `ApiMiddleware` atua como orquestrador central para todas as requisições, oferecendo:

- **Abstração de múltiplas APIs**: Gerencia múltiplas fontes de dados com uma interface unificada
- **Padronização de Respostas**: Todas as respostas seguem o mesmo formato, independente da API de origem
- **Sistema de Fallback**: Se uma API falhar, tenta automaticamente outras alternativas
- **Rate Limiting**: Evita sobrecarga nas APIs externas com controle de taxa de requisições
- **Retry com Backoff Exponencial**: Tenta novamente com intervalos crescentes em caso de falha
- **Métricas em Tempo Real**: Coleta estatísticas sobre uso, latência e erros
- **Rotação de APIs**: Sistema inteligente para alternar entre múltiplas fontes (em desenvolvimento)
- **Compressão de Dados**: Redução automática do tamanho de payloads (planejado)

### 2. RunesApiService

Interface simplificada para acesso a dados de tokens Runes, utilizando o middleware como base e oferecendo:

- **Métodos Intuitivos**: API de alto nível com métodos específicos para cada operação
- **Configuração por Operação**: Permite definir a API preferida para cada tipo de requisição
- **Gerenciamento de Cache**: Controle granular do cache por tipo de operação
- **Agregação de Dados**: Combinação de dados de múltiplas fontes para análise avançada (planejado)
- **Análise Técnica**: Indicadores técnicos calculados automaticamente a partir dos dados (planejado)

### 3. Transformadores de Dados

Sistema que permite conversão inteligente entre diferentes formatos de API:

- **Mapeamento Automático**: Converte dados entre os formatos Ordiscan e GeniiData
- **Transformações Específicas**: Conversões especializadas para diferentes tipos de dados
- **API Genérica**: Seleciona automaticamente o transformador correto com base no contexto
- **Validação de Esquema**: Garante que os dados transformados sigam o esquema esperado (planejado)
- **Transformações Bidirecionais**: Conversão em ambas as direções para todas as APIs suportadas (planejado)

### 4. Sistema de Cache Integrado

Utiliza o `AdvancedCacheService` para armazenamento eficiente:

- **Cache com TTL**: Cada tipo de dado tem seu próprio tempo de vida
- **Invalidação por Tags**: Permite limpar grupos relacionados de dados
- **Prioridade de Dados**: Mecanismo de fallback para dados em cache quando API está indisponível
- **Compressão LZ-string**: Redução do tamanho dos dados em cache (planejado)
- **Cache Preditivo**: Pré-carregamento inteligente de dados comumente acessados (planejado)

### 5. Sistema de Rotação de APIs (Planejado)

O novo `ApiRotationManager` implementará:

- **Rotação Automática**: Alternância entre APIs para evitar limites de taxa
- **Balanceamento de Carga**: Distribuição de requisições entre múltiplas fontes
- **Prioridade Dinâmica**: Ajuste automático de prioridades com base em desempenho
- **Detecção de Bloqueio**: Identificação automática quando uma API bloqueia o cliente
- **Reinserção Gradual**: Reintrodução gradual de APIs bloqueadas após período de espera

## Como Usar

### Exemplo Básico

```javascript
// Obter lista de Runes
const result = await runesApi.listRunes({
  sortBy: 'holders',
  limit: 20,
  refresh: false // usar cache se disponível
});

// Acessar os dados padronizados
const runes = result.data;
console.log(`Fonte dos dados: ${result.source}`);
console.log(`De cache: ${result.fromCache}`);
console.log(`Latência: ${result.latency}ms`);
```

### Configurar API Preferida

```javascript
// Definir GeniiData como API preferida para detalhes de runes
runesApi.setPreferredApi('runeDetails', 'geniidata');

// Obter detalhes de uma rune específica da API preferida
const details = await runesApi.getRuneDetails('PEPE');
```

### Invalidar Cache

```javascript
// Invalidar cache para uma rune específica
await runesApi.invalidateRuneCache('PEPE');

// Obter dados frescos
const freshData = await runesApi.getRuneDetails('PEPE', true);
```

### Estatísticas

```javascript
// Obter estatísticas de uso das APIs
const stats = runesApi.getApiStats();
console.log(`Total de requisições: ${stats.totalRequests}`);
console.log(`Taxa de acerto do cache: ${stats.cacheHitRate}`);
console.log(`Taxa de erro: ${stats.errorRate}`);
```

### Rotação de APIs (Planejado)

```javascript
// Configurar grupo de rotação para endpoint específico
apiRotation.configureRotationGroup('/api/v1/runes', {
  apis: ['ordiscan', 'geniidata', 'mempool'],
  strategy: 'round-robin', // ou 'performance', 'random'
  failoverThreshold: 2, // mudar após 2 falhas consecutivas
  cooldownPeriod: 300000 // 5 minutos antes de tentar novamente uma API que falhou
});

// Verificar status atual de rotação
const rotationStatus = apiRotation.getStatus();
console.log(`API atual para /api/v1/runes: ${rotationStatus.currentApi}`);
console.log(`Próxima rotação em: ${rotationStatus.nextRotationTime}`);
```

## Configuração de Fallbacks

O sistema já vem pré-configurado com fallbacks entre Ordiscan e GeniiData para os principais endpoints:

- Lista de Runes: `/api/v1/runes`
- Detalhes de Rune: `/api/v1/runes/:runeName`
- Transações: `/api/v1/runes/:runeName/transactions`
- Holders: `/api/v1/runes/:runeName/holders`

## Transformações

O módulo de transformações permite converter dados entre diferentes formatos de API:

```javascript
// Converter dados do formato GeniiData para Ordiscan
const ordiscanFormat = transformers.transform(
  geniidataData,
  'geniidata',
  'ordiscan',
  'rune-details'
);
```

## Exemplos Avançados

### Uso Direto do Middleware

```javascript
// Fazer uma requisição manual usando o middleware
const result = await apiMiddleware.request({
  endpoint: '/api/v1/runes/PEPE/transactions',
  preferredApi: 'ordiscan',
  params: { limit: 50 },
  cacheOptions: {
    ttl: 300, // 5 minutos
    tag: 'pepe-txs',
    forceFresh: false
  }
});
```

### Registrar uma Nova API

```javascript
// Registrar uma nova fonte de dados
apiMiddleware.registerApi('newApi', {
  baseURL: 'https://api.newprovider.com',
  timeout: 5000,
  priority: 5,
  rateLimits: {
    global: {
      maxRequests: 100,
      interval: 60000
    }
  }
});

// Configurar como fallback para um endpoint
apiMiddleware.setFallbackFor('/api/v1/market', {
  apis: ['ordiscan', 'newApi', 'geniidata'],
  useMock: true
});
```

### Compressão de Dados (Planejado)

```javascript
// Configurar compressão para respostas grandes
apiMiddleware.setCompressionOptions({
  enabled: true,
  threshold: 10240, // comprimir respostas maiores que 10KB
  compressionLevel: 6 // nível de 1-9 (maior = mais compressão, mais CPU)
});

// Verificar estatísticas de compressão
const compressionStats = apiMiddleware.getCompressionStats();
console.log(`Dados economizados: ${compressionStats.bytesSaved} bytes`);
console.log(`Taxa média de compressão: ${compressionStats.averageRatio}`);
```

## APIs Suportadas

| API | Status | Endpoints | Limites |
|-----|--------|-----------|---------|
| Ordiscan | ✅ Ativo | Todos | 100 req/min |
| GeniiData | ✅ Ativo | Todos | 500 req/dia |
| Mempool.space | 🔄 Planejado | Tx, Bloco | 100 req/min |
| CoinGecko | 🔄 Planejado | Preço, Market | 50 req/min |
| Messari | 🔄 Planejado | Métricas | 20 req/min |
| Blockstream | 🔄 Planejado | Tx, Bloco | 200 req/min |

## Melhores Práticas

1. **Use o `RunesApiService`** para a maioria das operações relacionadas a Runes
2. **Configure API preferida** para cada tipo de operação com base no desempenho
3. **Verifique `result.fromCache`** para saber se os dados vieram do cache
4. **Monitore `getApiStats()`** para identificar problemas de desempenho
5. **Defina TTLs apropriados** - dados que mudam frequentemente precisam de TTL mais curto
6. **Configure grupos de rotação** para endpoints com alto volume de requisições
7. **Utilize compressão** para economizar largura de banda e melhorar tempos de resposta

## Demonstração

Para ver o sistema em ação, abra o arquivo `api-demo.html` no navegador:

```
http://localhost:8080/api-demo.html
```

Esta página demonstra o uso do componente `RuneDetails` e exibe estatísticas em tempo real do middleware.

## Próximos Desenvolvimentos

- **WebSockets e Server-Sent Events**: Integração com feeds em tempo real
- **Suporte a GraphQL**: Query unificada para múltiplas APIs
- **Sistema de Métricas Avançadas**: Dashboard detalhado de performance
- **Cache Distribuído**: Suporte para Redis ou similares
- **Mocks Inteligentes**: Geração de dados fictícios baseados em padrões reais
- **Auto-Recuperação**: Sistema que identifica e resolve automaticamente problemas comuns

---

📅 Última atualização: 05/04/2025 às 04:00 