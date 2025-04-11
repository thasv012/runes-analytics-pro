# 🎮 Prompt: Animação para Gamificação - RUNES Analytics Pro

## ✨ Objetivo
Criar uma animação visual elegante, fluida e responsiva que demonstre a gamificação da demo atual do projeto, utilizando XPService, AchievementsManager e UserProfile.

---

## ⚙️ Contexto
- Página: `demo.html`
- Componentes ativos:
  - XPService.js
  - AchievementsManager.js
  - UserProfile.js

---

## 🧩 Requisitos de Animação

### 🎬 Entrada do Perfil
- Animação `fade-in` com leve translação (Y+10px)
- Tempo: 400ms, easing: ease-out

### 🌟 Ganha de XP
- Barra de XP com preenchimento animado (progressivo)
- Efeito de brilho pulsante
- Evento: `xpUpdated`

### 🧠 Level-Up
- Badge surge com efeito `flip` + `sparkle` (CSS keyframes)
- Evento: `levelUp`

### 🏆 Desafio Completo
- Elemento do desafio “brilha” e expande (efeito zoom-in curto)
- Evento: `achievementUnlocked`

### 🔘 Simulação Manual
- Botões de teste:
  - [+50 XP]
  - [Completar Desafio]
  - [Reset Perfil]

---

## 🎨 Estilo Visual

### Tema: Cyberpunk Minimalista
- Fundo escuro (`#0a0a0a`), neon azul e rosa para destaques
- Fontes futuristas (ex: Orbitron ou Rajdhani)
- Bordas arredondadas, sombras suaves

### Animações
- Usar apenas CSS e JS puro (sem frameworks)
- Organizar assets em:
  - `src/animations/`
  - `styles/animations.css`

---

## 🧪 Testes e Integrações

### Bindings
- Escutar eventos emitidos por:
  - `XPService.emit('xpUpdated', xp)`
  - `AchievementsManager.emit('achievementUnlocked', id)`
- Atualizar dinamicamente o DOM

### Responsividade
- Suporte para mobile (mínimo: 360px)
- Testar em tela cheia e painel reduzido

---

## 🧠 Observações

- Evitar clutter, manter animações suaves e feedbacks claros
- Preferência por transições discretas e elegantes
- Garantir que animações não atrapalhem leitura dos dados

---

## 💬 Prompt Final para o Cursor

```bash
/create build-demo-animation.js
@style: minimalista, elegante, responsiva
@goal: gerar animação visual da página `demo.html` com foco em XP, badges e user profile
@animation-lib: CSS + JS puro
@event-binding: XPService & AchievementsManager
@output: src/animations/build-demo-animation.js
