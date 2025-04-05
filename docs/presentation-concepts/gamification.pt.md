# Conceito Visual: Showcase da Estrutura de Gamificação

**Título Impactante:** *Suba de Nível no Jogo Runes: O RPG de Análise*

**Estética:** RPG Futurista / UI de Jogo - Cores vibrantes (roxo, dourado, ciano neon), fontes estilizadas (Orbitron), barras de progresso, ícones de conquistas e ranks. Efeitos de brilho e partículas sutis.

**Elementos Visuais Chave:**

1.  **Perfil do Jogador / Widget do Dashboard:**
    *   Visual: Card estilizado exibindo avatar do usuário (genérico), nível atual, barra de XP, rank (ex: Novato Rune, Iniciado Oráculo, Sábio Bitcoin), e moedas do jogo (ex: "RuneShards").
    *   Dados Simulados: Nível 12, XP: 8500/10000, Rank: Iniciado Oráculo, Shards: 1530.
    *   Interatividade: Barra de XP com animação ao ganhar pontos (simulado).

2.  **Showcase de Conquistas (Grid Interativo):**
    *   Visual: Grade de ícones representando diferentes conquistas (achievements). Ícones "bloqueados" em cinza, desbloqueados com cores vibrantes.
    *   Interatividade: Hover sobre uma conquista mostra nome, descrição e recompensa (XP/Shards). Clicar simula o "desbloqueio" com animação.
    *   Exemplos de Conquistas:
        *   `[Bloqueado]` **Primeira Whale Avistada:** Detecte sua primeira transação de whale.
        *   `[Desbloqueado]` **Minerador de Dados:** Explore detalhes de 10 Runes diferentes.
        *   `[Desbloqueado]` **Mestre dos Gráficos:** Use 5 indicadores técnicos diferentes.
        *   `[Bloqueado]` **Colecionador de Runes:** Adicione 25 Runes à sua lista de observação.
        *   `[Desbloqueado]` **Contribuidor da Comunidade:** Compartilhe 3 análises via IPFS.

3.  **Missões Diárias / Desafios:**
    *   Visual: Lista de missões diárias com barra de progresso ou checkbox.
    *   Dados Simulados:
        *   `[Completo]` Analisar 1 novo token Rune (Recompensa: 50 XP, 10 Shards)
        *   `[Em Progresso]` Identificar um padrão potencial de acumulação (Recompensa: 150 XP, 30 Shards)
        *   `[Não Iniciado]` Compartilhar um RunesCard no IPFS (Recompensa: 100 XP, 20 Shards)

4.  **Snippet do Leaderboard:**
    *   Visual: Ranking estilizado mostrando os Top 5 usuários (nomes fictícios) e seus ranks/níveis.
    *   Dados Simulados:
        1.  `0xSatoshiDev` - Rank: Sábio Bitcoin (Nv 50)
        2.  `RuneMasterFlex` - Rank: Oráculo Prime (Nv 48)
        3.  `CypherPunkGrl` - Rank: Oráculo Prime (Nv 47)
        4.  `Você` - Rank: Iniciado Oráculo (Nv 12) <span style="color: var(--neon-cyan);">(Destaque)</span>
        5.  `WhaleWatcher_7` - Rank: Iniciado Oráculo (Nv 11)

**Funcionalidade do Repositório Citada:**

> "Embora não esteja explicitamente na estrutura atual do código, o conceito de gamificação se baseia nos recursos de rastreamento de interação do usuário e apresentação de dados, prevendo ciclos de engajamento vinculados ao uso da plataforma (ex: explorar tokens via `RunesApiService`, compartilhar dados via futura integração IPFS)."
> *Alternativa (se focar no RunesCard):* "Aprimora o `RunesCard System` adicionando elementos colecionáveis, níveis de raridade e conquistas compartilháveis baseadas nos dados do card e na análise do usuário."

**Chamada para Ação (Call-to-Action):**

<button class="btn btn-primary">Comece Sua Jornada Analítica</button>
<span class="text-secondary" style="font-size: 0.8rem; margin-left: 1rem;">Acompanhe seu progresso e suba nos ranks!</span>

**Notas Adicionais:**

*   Usar terminologia de jogos (XP, Nível, Rank, Missões, Conquistas, Recompensas).
*   Animações devem ser satisfatórias (como em jogos ao completar tarefas).
*   Possibilidade de customização de avatar/perfil (sugerido visualmente). 