# 🎨 Neural Banner Generator API - RUNES Analytics Pro

Este módulo permite a geração de banners visuais personalizados para o projeto RUNES Analytics Pro, com suporte para diferentes estilos, textos e configurações.

## 📋 Visão Geral

O gerador de banners neurais é um componente do RUNES Analytics Pro que permite criar imagens para:

- Slides de apresentação
- Compartilhamento em redes sociais
- Exibição de conquistas no sistema de gamificação
- Alertas de eventos importantes
- Compartilhamento de portfólio
- Cards de tokens

## 🚀 Como usar a API

### Importação

```html
<!-- Incluir os scripts necessários -->
<script src="js/neural-banner.js"></script>
<script src="js/banner-backgrounds.js"></script>
<script src="js/banner-utils.js"></script>
```

### Geração básica

```javascript
// Gerar um banner com as configurações padrão
const canvas = await NeuralBanner.generate({
  style: "cyberpunk",
  text: "Meu título personalizado",
  resolution: "1280x720"
});

// Baixar o banner gerado
NeuralBanner.download("meu-banner.png");
```

### Configurações disponíveis

```javascript
const canvas = await NeuralBanner.generate({
  // Estilo visual (obrigatório)
  style: "cyberpunk", // "cyberpunk", "neural-glow", "runes-art", "bitcoin-abstract"
  
  // Idioma
  lang: "PT",  // "PT" ou "EN"
  
  // Texto personalizado
  text: "Meu texto personalizado",
  
  // Posição do texto
  textPosition: "center", // "center", "top", "bottom"
  
  // Resolução
  resolution: "1280x720", // Outros formatos: "1920x1080", "1200x630", "800x600"
  
  // QR Code
  qr: "https://runesanalytics.pro", // URL para o QR Code (null para não incluir)
  qrPosition: "bottom-right", // "bottom-right", "bottom-left", "top-right", "top-left"
  
  // Assinatura
  includeSignature: true, // Incluir assinatura do sistema
  
  // Tema
  theme: "dark" // "dark" ou "light"
});
```

## 🎨 Estilos disponíveis

### Cyberpunk
Estilo futurista com grade em perspectiva, luzes neon e efeitos de linha digital. Perfeito para banners de alto impacto visual.

### Neural Glow
Visualização de rede neural com nós interconectados e efeito de brilho. Ideal para apresentações técnicas e conteúdo educacional.

### Runes Art
Símbolos rúnicos e círculos dourados interconectados no estilo blockchain. Ótimo para conteúdo relacionado ao protocolo Runes.

### Bitcoin Abstract
Padrão hexagonal com símbolos Bitcoin e blocos conectados. Perfeito para conteúdo relacionado a Bitcoin e criptomoedas.

## 📊 Casos de uso recomendados

### Apresentações
```javascript
const slideBanner = await NeuralBanner.generate({
  style: "neural-glow",
  text: "RUNES Analytics Pro — Domine o ecossistema Bitcoin",
  resolution: "1920x1080",
  textPosition: "center",
  includeSignature: false
});
```

### Compartilhamento em redes sociais
```javascript
const socialBanner = await NeuralBanner.generate({
  style: "cyberpunk",
  text: "Whales don't follow trends.\nThey start them.",
  resolution: "1200x630",
  textPosition: "center",
  includeSignature: true,
  qr: "https://runesanalytics.pro"
});
```

### Alertas de movimentação de baleias
```javascript
const alertBanner = await NeuralBanner.generate({
  style: "bitcoin-abstract",
  text: `ALERTA DE BALEIA\nRUNES-BTC\nVolume: 500 BTC`,
  resolution: "1000x500",
  textPosition: "center"
});
```

## 💾 Salvando o banner

```javascript
// Retorna o Data URL da imagem
const dataUrl = NeuralBanner.getDataURL();

// Baixa a imagem diretamente
NeuralBanner.download("nome-do-arquivo.png");
```

## 🔄 Integração com outros módulos

O Neural Banner Generator foi projetado para integrar-se com outros componentes do sistema RUNES Analytics Pro:

- **Gamificação**: Gera banners para novas conquistas e níveis
- **Rastreador de Baleias**: Cria alertas visuais para movimentações significativas
- **Compartilhamento Social**: Facilita a exportação de dados para redes sociais
- **Portfólio de Usuário**: Visualiza o progresso e as holdings do usuário

## 📚 Exemplos adicionais

Veja exemplos completos no arquivo `banner-commands.js` neste diretório. 