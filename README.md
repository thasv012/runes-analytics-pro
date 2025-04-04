# RUNES Analytics Pro - Rastreador de Baleias

![Logo](assets/logo.svg)

## Sobre o Projeto

RUNES Analytics Pro � uma plataforma avan�ada para an�lise de tokens RUNES no Bitcoin, com foco especial no rastreamento de "baleias" (grandes investidores) e detec��o de manipula��o de mercado.

## Funcionalidades Principais

### P�gina Inicial
- Lista de tokens RUNES classificados por volume
- Filtros por diferentes per�odos (1h, 24h, 7d, 30d, total)
- Indicadores de atividade de baleias
- Se��es de maiores altas, quedas e volume

### An�lise Individual de Token
- Gr�ficos detalhados com m�ltiplos timeframes
- An�lise t�cnica com indicadores avan�ados
- N�veis de Fibonacci com suportes e resist�ncias
- Rastreamento de baleias espec�fico para cada token

### Rastreador de Baleias
- Alertas em tempo real de acumula��o e distribui��o
- Detec��o de padr�es de manipula��o
- An�lise de concentra��o de tokens
- Previs�o de movimentos baseada em dados hist�ricos

### Sistema de Favoritos
- Adicione tokens � sua lista de favoritos
- Acesso r�pido aos seus tokens preferidos
- Acompanhamento personalizado

## Como Usar

1. **P�gina Inicial**: Navegue pela lista de tokens e clique em um token para ver an�lise detalhada
2. **Favoritos**: Clique na estrela ao lado de um token para adicion�-lo aos favoritos
3. **An�lise Individual**: Explore os gr�ficos, indicadores e alertas espec�ficos para o token
4. **Alertas de Baleias**: Fique atento aos alertas de acumula��o e distribui��o para identificar oportunidades

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript moderno
- Gr�ficos interativos com Chart.js e D3.js
- An�lise t�cnica avan�ada
- Rastreamento em tempo real de transa��es

## Instala��o e Execu��o

Set-Content -Path "C:\Users\Thierry\Desktop\runes-analytics-pro\assets\logo.svg" -Value @'
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Defini��es de gradientes e filtros -->
    <defs>
        <!-- Gradiente de fundo oce�nico -->
        <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a2e38;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000913;stop-opacity:1" />
        </linearGradient>
        
        <!-- Gradiente para baleia -->
        <linearGradient id="whaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
        </linearGradient>
        
        <!-- Efeito de brilho -->
        <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        
        <!-- Padr�o de ondas -->
        <pattern id="waves" patternUnits="userSpaceOnUse" width="100" height="10" patternTransform="rotate(0)">
            <path d="M0,5 C 20,15 30,-5 50,5 C 70,15 80,-5 100,5" stroke="#3498db" fill="none" stroke-width="0.5" stroke-opacity="0.3"/>
        </pattern>
        
        <!-- Padr�o de bolhas -->
        <pattern id="bubbles" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="rotate(0)">
            <circle cx="10" cy="10" r="2" fill="#a3e4ff" opacity="0.3" />
            <circle cx="30" cy="20" r="1.5" fill="#a3e4ff" opacity="0.2" />
            <circle cx="15" cy="30" r="1" fill="#a3e4ff" opacity="0.3" />
            <circle cx="40" cy="40" r="2.5" fill="#a3e4ff" opacity="0.2" />
        </pattern>
    </defs>

    <!-- C�rculo de fundo oce�nico -->
    <circle cx="100" cy="100" r="95" fill="url(#oceanGradient)"/>
    <circle cx="100" cy="100" r="95" fill="url(#waves)" opacity="0.2"/>
    <circle cx="100" cy="100" r="95" fill="url(#bubbles)" opacity="0.1"/>
    
    <!-- Silhueta de baleia -->
    <g filter="url(#glow)">
        <!-- Corpo da baleia -->
        <path d="M40,100 
                 C 40,80 60,75 80,75 
                 L 140,75 
                 C 160,75 170,90 170,105 
                 C 170,120 160,130 140,130 
                 L 80,130 
                 C 60,130 40,120 40,100 Z" 
              fill="url(#whaleGradient)" opacity="0.8"/>
        
        <!-- Cauda da baleia -->
        <path d="M170,105 
                 L 180,85 
                 L 190,105 
                 L 180,125 
                 L 170,105 Z" 
              fill="url(#whaleGradient)" opacity="0.8"/>
        
        <!-- Jato d'�gua -->
        <path d="M60,75 
                 C 60,60 70,50 80,40 
                 C 90,50 100,60 100,75" 
              fill="none" stroke="#a3e4ff" stroke-width="3" opacity="0.7"/>
        
        <!-- Olho da baleia -->
        <circle cx="70" cy="90" r="5" fill="white"/>
        <circle cx="70" cy="90" r="2" fill="#000"/>
        
        <!-- Detalhes da baleia -->
        <path d="M100,100 C 110,95 120,95 130,100" 
              fill="none" stroke="#2980b9" stroke-width="1.5" opacity="0.6"/>
    </g>
    
    <!-- Gr�fico de pre�o sobreposto -->
    <polyline points="40,110 60,105 80,115 100,90 120,100 140,85 160,95" 
              fill="none" stroke="#2ecc71" stroke-width="2" opacity="0.8"/>
    
    <!-- Pontos de dados -->
    <circle cx="60" cy="105" r="3" fill="#2ecc71"/>
    <circle cx="100" cy="90" r="3" fill="#2ecc71"/>
    <circle cx="140" cy="85" r="3" fill="#2ecc71"/>
    
    <!-- S�mbolo de Bitcoin -->
    <text x="155" cy="120" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          fill="#f1c40f" 
          text-anchor="middle" 
          font-weight="bold"
          filter="url(#glow)">?</text>
    
    <!-- Texto "WHALE TRACKER" -->
    <text x="100" y="155" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          fill="#fff" 
          text-anchor="middle" 
          font-weight="bold"
          filter="url(#glow)">WHALE TRACKER</text>
    
    <!-- Texto "RUNES" -->
    <text x="100" y="175" 
          font-family="Arial, sans-serif" 
          font-size="12" 
          fill="#3498db" 
          text-anchor="middle"
          filter="url(#glow)">RUNES ANALYTICS</text>
    
    <!-- Pequenas bolhas adicionais -->
    <circle cx="50" cy="85" r="2" fill="#a3e4ff" opacity="0.6" />
    <circle cx="55" cy="80" r="1.5" fill="#a3e4ff" opacity="0.5" />
    <circle cx="60" cy="75" r="1" fill="#a3e4ff" opacity="0.4" />
    
    <!-- Estrela (favoritos) -->
    <path d="M175,50 L180,60 L190,62 L182,70 L184,80 L175,75 L166,80 L168,70 L160,62 L170,60 Z"
          fill="#f1c40f" opacity="0.8" filter="url(#glow)"/>
</svg>
