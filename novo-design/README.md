# RUNES Analytics Pro - Nova Interface

## Visão Geral

O RUNES Analytics Pro é uma plataforma de análise avançada para tokens RUNES no Bitcoin, focada em rastreamento de baleias, detecção de manipulação de mercado e fornecimento de insights estratégicos para traders. Esta atualização traz um redesenho completo da interface com foco em usabilidade, visualização de dados e gamificação.

## Principais Melhorias

### 1. Interface Redesenhada

- **Design Moderno e Intuitivo**: Layout completamente renovado com foco na visualização de dados e análise de mercado
- **Dashboard Personalizável**: Widgets configuráveis que podem ser organizados conforme as preferências do usuário
- **Modo Compacto**: Visualização otimizada para traders profissionais que precisam de mais informações na tela
- **Tema Claro/Escuro**: Suporte para múltiplos temas para uso em diferentes ambientes

### 2. Integração com APIs Reais

- **Sistema de Gerenciamento de APIs**: Integração com múltiplas fontes de dados (Magic Eden, OKX, Ordiscan, Geniidata)
- **Fallback Automático**: Sistema inteligente que alterna entre APIs em caso de falha
- **Cache Otimizado**: Redução de chamadas de API através de sistema de cache inteligente
- **Dados Normalizados**: Conversão de dados de diferentes fontes para um formato padrão

### 3. Sistema de Gamificação Avançado

- **Níveis e Conquistas**: Sistema de progressão que recompensa o uso da plataforma e expertise do usuário
- **Desafios Diários**: Tarefas que incentivam o uso regular da plataforma
- **Streak de Login**: Recompensas por uso consistente da plataforma
- **Emblemas e Recompensas**: Reconhecimento visual de conquistas e habilidades

### 4. Rastreador de Baleias Inteligente

- **Algoritmo Adaptativo**: Detecção estatística de movimentos anômalos em vez de valores fixos
- **Análise de Impacto**: Estimativa do impacto potencial de cada transação no mercado
- **Alertas Personalizados**: Configuração de notificações baseadas em critérios específicos
- **Relatórios Detalhados**: Exportação de análises e dados históricos

## Componentes Principais

### 1. `redesign.css`
Estilos redesenhados com sistema de cores consistente, layout responsivo e componentes modernos.

### 2. `api-manager.js`
Gerenciador centralizado de APIs com fallback, cache e normalização de dados.

### 3. `whale-detector.js`
Detector de movimentos de baleias com análise estatística e algoritmos adaptativos.

### 4. `gamification-system.js`
Sistema completo de gamificação com conquistas, níveis e desafios.

## Instruções de Instalação

1. Copie os arquivos da pasta `novo-design` para a raiz do projeto
2. Adicione as seguintes linhas ao seu arquivo HTML principal:
   ```html
   <link rel="stylesheet" href="redesign.css">
   <!-- Antes de seus scripts atuais -->
   <script src="api-manager.js"></script>
   <script src="whale-detector.js"></script>
   <script src="gamification-system.js"></script>
   ```
3. Inicialize os componentes:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
       // Inicializar componentes
       apiManager.fetchWithFallback('RunesRanking', {limit: 100});
       
       // Carregar dados históricos para o detector de baleias
       const historicalData = []; // Seus dados históricos
       whaleDetector.initialize(historicalData);
       
       // A gamificação já se inicializa automaticamente
   });
   ```

## Próximos Passos

1. **Implementar Análise Preditiva**: Adicionar modelos de machine learning para previsão de movimentos de mercado
2. **Melhorar Alertas**: Adicionar notificações push e integração com Telegram/Discord
3. **Expandir Sistema Social**: Adicionar recursos de comunidade, como ranking de usuários e compartilhamento de insights
4. **Otimizar para Mobile**: Criar versão dedicada para dispositivos móveis

## Contribuição

Sinta-se à vontade para contribuir com este projeto! Abra issues para reportar bugs ou sugerir melhorias.

## Licença

Este projeto é licenciado sob a licença MIT. 