# Conceito Visual: Whale Tracker Dashboard

**Título Impactante:** *Riding the Bitcoin Waves: Track the Titans of Runes*

**Estética:** Cyberpunk Marítimo - Tons predominantes de azul ciano e verde neon profundo, simulando um sonar ou radar subaquático. Linhas de dados fluidas e pulsantes.

**Elementos Visuais Chave:**

1.  **Mapa de Calor de Transações (Live):**
    *   Visual: Grade hexagonal representando pools de liquidez ou grandes carteiras.
    *   Interatividade: Hexágonos brilham em verde neon para influxo significativo e vermelho neon para grandes saídas. Intensidade do brilho indica volume.
    *   Dados Mockados: Simular transações > 50 BTC ou > $1M USD em valor de Rune.

2.  **Gráfico de Acumulação/Distribuição (Top 5 Whales):**
    *   Visual: Gráfico de área sobreposto, cada cor representa uma whale anônima (e.g., Whale 0xAlpha, Whale 0xBeta).
    *   Dados Mockados: Mostrar períodos de acumulação clara (área subindo) e distribuição (área descendo) para tokens populares como "CYPHER" ou "SATOSHI•NAKAMOTO". Eixo Y = Saldo do Token, Eixo X = Tempo (últimos 7 dias).

3.  **Feed de Alertas de Whale:**
    *   Visual: Área de texto estilo terminal com notificações em tempo real piscando.
    *   Dados Mockados:
        *   `ALERT [09:15:23 UTC]: Whale 0xGamma moved 1.5M CYPHER to new wallet.` <span style="color: var(--neon-yellow);">[Potential Distribution]</span>
        *   `ALERT [09:17:01 UTC]: Whale 0xAlpha accumulated 800K SATOSHI•NAKAMOTO from exchange.` <span style="color: var(--neon-green);">[Accumulation Spike]</span>
        *   `ALERT [09:18:55 UTC]: Multiple whales (>5) interacting with UNCOMMON•GOODS mint.` <span style="color: var(--neon-cyan);">[High Activity Zone]</span>

4.  **Widget de Correlação (Whale vs. Preço):**
    *   Visual: Gráfico de linha dupla comparando o Netflow Agregado das Whales (saldo total das top 20 whales) com o preço do Rune selecionado (e.g., "DOG•GO•TO•THE•MOON").
    *   Dados Mockados: Mostrar uma correlação positiva visível onde picos/vales no Netflow precedem movimentos de preço.
    *   Métrica: Índice de Correlação Whale-Preço: <span style="color: var(--neon-green);">0.78 (Strong Positive)</span>

**Funcionalidade do Repositório Citada:**

> "Leverages `AdvancedApiService` pattern detection to identify statistically significant accumulation or distribution behavior, filtering out market noise."

**Call-to-Action:**

<button class="btn btn-secondary">Activate Whale Sonar</button>
<span class="text-secondary" style="font-size: 0.8rem; margin-left: 1rem;">Requires Premium Subscription</span>

**Notas Adicionais:**

*   Usar ícones de baleia estilizados.
*   Efeito de scanline sutil no fundo.
*   Tooltips interativos nos gráficos explicando as métricas. 