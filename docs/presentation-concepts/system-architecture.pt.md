# Conceito Visual: Blueprint da Arquitetura do Sistema

**Título Impactante:** *RUNES Analytics Pro: Desconstruindo o Fluxo de Dados*

**Estética:** Blueprint Técnico Digital - Fundo escuro com grid azul claro sutil. Linhas conectando componentes em branco ou ciano. Elementos de UI mínimos, foco na estrutura e fluxo de dados. Fontes monoespaçadas.

**Elementos Visuais Chave:**

1.  **Diagrama Principal de Arquitetura (Interativo):**
    *   Visual: Representação gráfica dos principais módulos (Frontend, API Gateway/Middleware, Serviços de Dados, Sistema de Cache, Banco de Dados, APIs Externas).
    *   Interatividade: Hover sobre um módulo revela descrição e tecnologias chave. Clicar em um módulo faz "zoom in", mostrando subcomponentes ou código relevante.
    *   Dados Simulados (ao hover):
        *   `API Gateway`: Processa 5K req/seg, Latência Média: 45ms.
        *   `Sistema de Cache`: Taxa de Acerto: 92%, Uso de Memória: 8.5GB.
        *   `Serviços de Dados`: Processando 100+ fontes, Freq. Atualização: < 1s.

2.  **Visualização do Fluxo de Dados (Animado):**
    *   Visual: Linhas animadas mostrando o caminho de uma requisição do usuário (Frontend) -> API Gateway -> Cache (erro) -> Serviço de Dados -> Banco de Dados -> Resposta de volta ao Frontend.
    *   Interatividade: Botões para simular diferentes cenários (Acerto no Cache, Falha de API -> Fallback).

3.  **Zoom-in: `ApiManager` & `ApiMiddleware`:**
    *   Visual: Ao clicar no API Gateway/Middleware no diagrama principal, expande para mostrar blocos representando `ApiManager.js` e `ApiMiddleware.js`.
    *   Código Relevante (Snippet estilizado):
        ```javascript
        // ApiMiddleware.js - Snippet de Limite de Taxa
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutos
          max: 100, // limita cada IP a 100 requisições por janela
          message: 'Limite de taxa excedido',
          standardHeaders: true,
          legacyHeaders: false,
        });
        app.use('/api/', limiter);

        // ApiManager.js - Snippet de Lógica de Fallback
        async fetchData(endpoint) {
          for (const Service of this.apiServices) {
            try {
              const data = await Service.fetch(endpoint);
              if (data) return this.transformer.transform(data, Service.source);
            } catch (error) {
              this.logError(Service.source, error);
              // Tenta próximo serviço...
            }
          }
          return this.cache.get(`fallback:${endpoint}`); // Fallback para cache
        }
        ```

4.  **Widget de Métricas de Performance:**
    *   Visual: Pequenos gráficos de linha ou indicadores numéricos mostrando métricas chave.
    *   Dados Simulados:
        *   Tempo Médio de Resposta API: <span style="color: var(--neon-green);">55ms</span>
        *   Velocidade Consulta Banco de Dados: <span style="color: var(--neon-green);">15ms (média)</span>
        *   Taxa de Acerto Cache: <span style="color: var(--neon-cyan);">92.3%</span>
        *   Uptime do Sistema: <span style="color: var(--neon-green);">99.98%</span>

**Funcionalidade do Repositório Citada:**

> "Robusto `ApiManager` orquestra múltiplas fontes de dados (`RunesApiService`, `GeniiDataService`, etc.) com fallback inteligente e normalização de dados via `transformers.js`, garantindo alta disponibilidade e consistência dos dados."

**Chamada para Ação (Call-to-Action):**

<button class="btn btn-secondary btn-outline">Explorar Documentação Técnica</button>
<a href="#" style="margin-left: 1rem; font-size: 0.8rem; color: var(--neon-cyan);">Ver Especificação da API</a>

**Notas Adicionais:**

*   Manter um visual limpo e técnico.
*   Usar ícones simples para representar bancos de dados, APIs, etc.
*   Animações devem ser sutis e focadas em ilustrar o fluxo. 