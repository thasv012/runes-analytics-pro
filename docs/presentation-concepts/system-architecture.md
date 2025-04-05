# Conceito Visual: System Architecture Blueprint

**Título Impactante:** *RUNES Analytics Pro: Deconstructing the Datastream*

**Estética:** Blueprint Técnico Digital - Fundo escuro com grid azul claro sutil. Linhas conectando componentes em branco ou ciano. Elementos de UI mínimos, foco na estrutura e fluxo de dados. Fontes monoespaçadas.

**Elementos Visuais Chave:**

1.  **Diagrama Principal de Arquitetura (Interativo):**
    *   Visual: Representação gráfica dos principais módulos (Frontend, API Gateway/Middleware, Data Services, Cache System, Database, External APIs).
    *   Interatividade: Hover sobre um módulo revela descrição e tecnologias chave. Clicar em um módulo faz "zoom in", mostrando subcomponentes ou código relevante.
    *   Dados Mockados (ao hover):
        *   `API Gateway`: Handles 5K req/sec, Avg Latency: 45ms.
        *   `Cache System`: Hit Rate: 92%, Memory Usage: 8.5GB.
        *   `Data Services`: Processing 100+ sources, Update Freq: < 1s.

2.  **Visualização do Fluxo de Dados (Animado):**
    *   Visual: Linhas animadas mostrando o caminho de uma requisição do usuário (Frontend) -> API Gateway -> Cache (miss) -> Data Service -> Database -> Resposta de volta ao Frontend.
    *   Interatividade: Botões para simular diferentes cenários (Cache Hit, API Falha -> Fallback).

3.  **Zoom-in: `ApiManager` & `ApiMiddleware`:**
    *   Visual: Ao clicar no API Gateway/Middleware no diagrama principal, expande para mostrar blocos representando `ApiManager.js` e `ApiMiddleware.js`.
    *   Código Relevante (Snippet estilizado):
        ```javascript
        // ApiMiddleware.js - Rate Limiting Snippet
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // limit each IP to 100 requests per windowMs
          message: 'Rate limit exceeded',
          standardHeaders: true,
          legacyHeaders: false,
        });
        app.use('/api/', limiter);

        // ApiManager.js - Fallback Logic Snippet
        async fetchData(endpoint) {
          for (const Service of this.apiServices) {
            try {
              const data = await Service.fetch(endpoint);
              if (data) return this.transformer.transform(data, Service.source);
            } catch (error) {
              this.logError(Service.source, error);
              // Try next service...
            }
          }
          return this.cache.get(`fallback:${endpoint}`); // Fallback to cache
        }
        ```

4.  **Widget de Métricas de Performance:**
    *   Visual: Pequenos gráficos de linha ou indicadores numéricos mostrando métricas chave.
    *   Dados Mockados:
        *   API Avg Response Time: <span style="color: var(--neon-green);">55ms</span>
        *   Database Query Speed: <span style="color: var(--neon-green);">15ms (avg)</span>
        *   Cache Hit Ratio: <span style="color: var(--neon-cyan);">92.3%</span>
        *   System Uptime: <span style="color: var(--neon-green);">99.98%</span>

**Funcionalidade do Repositório Citada:**

> "Robust `ApiManager` orchestrates multiple data sources (`RunesApiService`, `GeniiDataService`, etc.) with intelligent fallback and data normalization via `transformers.js`, ensuring high availability and data consistency."

**Call-to-Action:**

<button class="btn btn-secondary btn-outline">Explore Technical Docs</button>
<a href="#" style="margin-left: 1rem; font-size: 0.8rem; color: var(--neon-cyan);">View API Specification</a>

**Notas Adicionais:**

*   Manter um visual limpo e técnico.
*   Usar ícones simples para representar bancos de dados, APIs, etc.
*   Animações devem ser sutis e focadas em ilustrar o fluxo. 