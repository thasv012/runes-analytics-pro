# Modelos Disponíveis na GPU Mesh

Este documento descreve os modelos de processamento disponíveis na infraestrutura da GPU Mesh para análise de tokens Runes.

## Índice

1. [Visão Geral](#visão-geral)
2. [Cypher-v1](#cypher-v1)
3. [RuneGPT-v2](#runegpt-v2)
4. [Neuro-Embed](#neuro-embed)
5. [Rune-Classifier](#rune-classifier)
6. [Especificações Técnicas](#especificações-técnicas)
7. [Roadmap de Novos Modelos](#roadmap-de-novos-modelos)

## Visão Geral

A plataforma GPU Mesh suporta diversos modelos especializados para análise e processamento de dados relacionados a tokens Runes. Cada modelo é otimizado para tarefas específicas e possui seus próprios parâmetros e requisitos.

## Cypher-v1

O modelo Cypher-v1 é especializado na análise de padrões criptográficos e características fundamentais de tokens Runes.

### Capacidades
- Análise de distribuição e propriedades de tokens
- Detecção de anomalias em transações
- Clustering de tokens com características similares
- Análise de raridade e propriedades únicas

### Parâmetros
```javascript
{
  "taskId": "TASK-CYPHER-123",
  "model": "cypher-v1",
  "inputDataURL": "https://runes.pro/data/batch-0425.json",
  "parameters": {
    "analysisDepth": 3,           // Profundidade de análise (1-5)
    "includeHistorical": true,    // Incluir dados históricos na análise
    "clusteringMethod": "kmeans", // Método de agrupamento (kmeans, dbscan, hierarchical)
    "anomalyThreshold": 0.85,     // Limiar para detecção de anomalias (0-1)
    "outputFormat": "full"        // Formato da saída (full, summary, compact)
  },
  "returnLogs": true
}
```

### Requisitos
- Tempo médio de processamento: 30-120 segundos
- Memória GPU necessária: 4GB+
- Compatibilidade: Todos os nós da malha

## RuneGPT-v2

RuneGPT-v2 é um modelo generativo especializado na análise preditiva e geração de insights sobre tokens Runes.

### Capacidades
- Previsão de tendências de curto e médio prazo
- Geração de relatórios e análises textuais
- Identificação de correlações entre tokens
- Análise de sentimento baseada em dados on-chain e sociais

### Parâmetros
```javascript
{
  "taskId": "TASK-RUNEGPT-456",
  "model": "runegpt-v2",
  "inputDataURL": "https://runes.pro/data/batch-0425.json",
  "parameters": {
    "predictionHorizon": 14,       // Horizonte de previsão em dias (1-30)
    "confidenceInterval": 0.95,    // Intervalo de confiança (0-1)
    "includeSocialData": true,     // Incluir dados sociais na análise
    "scenarioAnalysis": ["bull", "bear", "sideways"], // Cenários a analisar
    "outputFormat": "report",      // Formato de saída (report, data, visualization)
    "language": "pt_BR"            // Idioma do relatório (pt_BR, en_US, es_ES)
  },
  "returnLogs": true
}
```

### Requisitos
- Tempo médio de processamento: 60-300 segundos
- Memória GPU necessária: 8GB+
- Compatibilidade: Apenas nós de alto desempenho

## Neuro-Embed

Neuro-Embed é especializado na geração de embeddings e representações vetoriais de tokens Runes para análise de similaridade e busca.

### Capacidades
- Geração de embeddings para tokens
- Cálculo de similaridade entre tokens
- Pesquisa semântica no espaço de tokens
- Visualização de clusters em espaços dimensionais reduzidos

### Parâmetros
```javascript
{
  "taskId": "TASK-EMBED-789",
  "model": "neuro-embed",
  "inputDataURL": "https://runes.pro/data/batch-0425.json",
  "parameters": {
    "embeddingDimension": 128,      // Dimensão do vetor de embedding (64, 128, 256, 512)
    "includeMetadata": true,        // Incluir metadados no embedding
    "normalization": "l2",          // Método de normalização (l1, l2, none)
    "algorithmVersion": "v2.1",     // Versão do algoritmo de embedding
    "outputFormat": "vector_db"     // Formato de saída (json, vector_db, csv)
  },
  "returnLogs": true
}
```

### Requisitos
- Tempo médio de processamento: 15-60 segundos
- Memória GPU necessária: 2GB+
- Compatibilidade: Todos os nós da malha

## Rune-Classifier

Rune-Classifier é um modelo especializado na classificação e categorização automática de tokens Runes com base em suas características.

### Capacidades
- Classificação por utilidade e propósito
- Detecção de tokens de alta potencialidade
- Categorização baseada em padrões de transação
- Identificação de nichos e segmentos emergentes

### Parâmetros
```javascript
{
  "taskId": "TASK-CLASSIFY-101112",
  "model": "rune-classifier",
  "inputDataURL": "https://runes.pro/data/batch-0425.json",
  "parameters": {
    "classificationDepth": "detailed", // Profundidade (basic, standard, detailed)
    "customCategories": ["gaming", "defi", "social"], // Categorias customizadas
    "confidenceThreshold": 0.75,    // Limiar de confiança para classificação (0-1)
    "includeTrends": true,          // Incluir análise de tendências por categoria
    "outputFormat": "categories"    // Formato de saída (categories, scores, matrix)
  },
  "returnLogs": true
}
```

### Requisitos
- Tempo médio de processamento: 20-90 segundos
- Memória GPU necessária: 4GB+
- Compatibilidade: Todos os nós da malha

## Especificações Técnicas

### Formatos de Saída

Todos os modelos suportam os seguintes formatos de saída básicos:

1. **JSON** - Formato padrão com todos os detalhes
2. **CSV** - Formato tabular para análises em ferramentas como Excel
3. **Visualization** - Dados pré-formatados para visualização na UI

Além disso, cada modelo pode suportar formatos específicos conforme documentado nas seções individuais.

### Limitações Comuns

- **Tamanho máximo de entrada:** 100MB
- **Tempo máximo de processamento:** 10 minutos
- **Número máximo de tokens por batch:** 5.000
- **Taxa limite:** 10 tarefas por minuto por usuário

### Cache de Resultados

O sistema mantém um cache de resultados por 24 horas. Consultas idênticas dentro deste período retornarão resultados do cache, otimizando o desempenho e reduzindo a carga nos nós.

## Roadmap de Novos Modelos

### Em Desenvolvimento (Maio 2025)
- **RuneGPT-v3** - Versão aprimorada com maior precisão e capacidades multilíngues
- **HyperScale** - Modelo para processamento de grandes volumes de dados de tokens (100k+)

### Planejados (Q3 2025)
- **Rune-Sentiment** - Análise avançada de sentimento específica para tokens Runes
- **Network-Graph** - Visualização e análise de relações entre tokens e carteiras
- **Fraud-Detector** - Identificação de atividades suspeitas relacionadas a tokens

### Conceito (Futuro)
- **Multi-Chain** - Análise comparativa entre tokens Runes e outros padrões de tokens
- **Market-Maker** - Sistema integrado para análise de liquidez e oportunidades de mercado
- **Holistic-Analyzer** - Análise completa integrando dados on-chain, sociais e econômicos 