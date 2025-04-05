# Conceito Visual: Dashboard de Rastreador de Whales

**Título Impactante:** *Navegando nas Ondas do Bitcoin: Rastreie os Titãs de Runes*

**Estética:** Cyberpunk Marítimo - Tons predominantes de azul ciano e verde neon profundo, simulando um sonar ou radar subaquático. Linhas de dados fluidas e pulsantes.

**Elementos Visuais Chave:**

1.  **Mapa de Calor de Transações (Ao Vivo):**
    *   Visual: Grade hexagonal representando pools de liquidez ou grandes carteiras.
    *   Interatividade: Hexágonos brilham em verde neon para influxo significativo e vermelho neon para grandes saídas. Intensidade do brilho indica volume.
    *   Dados Simulados: Simular transações > 50 BTC ou > $1M USD em valor de Rune.

2.  **Gráfico de Acumulação/Distribuição (Top 5 Whales):**
    *   Visual: Gráfico de área sobreposto, cada cor representa uma whale anônima (ex: Whale 0xAlpha, Whale 0xBeta).
    *   Dados Simulados: Mostrar períodos de acumulação clara (área subindo) e distribuição (área descendo) para tokens populares como "CYPHER" ou "SATOSHI•NAKAMOTO". Eixo Y = Saldo do Token, Eixo X = Tempo (últimos 7 dias).

3.  **Feed de Alertas de Whale:**
    *   Visual: Área de texto estilo terminal com notificações em tempo real piscando.
    *   Dados Simulados:
        *   `ALERTA [09:15:23 UTC]: Whale 0xGamma moveu 1.5M CYPHER para nova carteira.` <span style="color: var(--neon-yellow);">[Distribuição Potencial]</span>
        *   `ALERTA [09:17:01 UTC]: Whale 0xAlpha acumulou 800K SATOSHI•NAKAMOTO da exchange.` <span style="color: var(--neon-green);">[Pico de Acumulação]</span>
        *   `ALERTA [09:18:55 UTC]: Múltiplas whales (>5) interagindo com mint de UNCOMMON•GOODS.` <span style="color: var(--neon-cyan);">[Zona de Alta Atividade]</span>

4.  **Widget de Correlação (Whale vs. Preço):**
    *   Visual: Gráfico de linha dupla comparando o Fluxo Líquido Agregado das Whales (saldo total das top 20 whales) com o preço do Rune selecionado (ex: "DOG•GO•TO•THE•MOON").
    *   Dados Simulados: Mostrar uma correlação positiva visível onde picos/vales no Fluxo Líquido precedem movimentos de preço.
    *   Métrica: Índice de Correlação Whale-Preço: <span style="color: var(--neon-green);">0.78 (Positiva Forte)</span>

**Funcionalidade do Repositório Citada:**

> "Utiliza a detecção de padrões do `AdvancedApiService` para identificar comportamento de acumulação ou distribuição estatisticamente significativo, filtrando o ruído do mercado."

**Chamada para Ação (Call-to-Action):**

<button class="btn btn-secondary">Ativar Sonar de Whales</button>
<span class="text-secondary" style="font-size: 0.8rem; margin-left: 1rem;">Requer Assinatura Premium</span>

**Notas Adicionais:**

*   Usar ícones de baleia estilizados.
*   Efeito de scanline sutil no fundo.
*   Tooltips interativos nos gráficos explicando as métricas. 