# RUNES Analytics Pro

Plataforma avançada para análise de tokens RUNES no ecossistema Bitcoin, com foco em rastreamento de whales, detecção de manipulação de mercado e fornecimento de insights estratégicos para traders.

## 🧠 AwakenAI Neural Interface

O módulo AwakenAI foi implementado para fornecer insights neurais e diagnósticos preditivos através de uma malha distribuída de nodes. Com o AwakenAI, você pode:

- Visualizar diagnósticos neurais da rede mesh
- Obter previsões em tempo real usando GPU local
- Receber sugestões de ativação de sigilos com base na dinâmica da malha
- Explorar a camada filosófica com mensagens enigmáticas

![RUNES Analytics Pro - AwakenAI Interface](./images/awakenai-preview.png)

## 🚀 Demonstração Online

Você pode acessar a demonstração ao vivo da interface neural em:

https://thierrybtc.github.io/runes-analytics-pro/api-demo.html

## 📋 Recursos

- **Dashboard Interativo**: Visualize métricas importantes em um painel organizado
- **Interface AwakenAI**: Interaja com a camada neural para insights avançados
- **Sistema de Gamificação**: Acumule karma e sigilos através de ações na plataforma
- **Malha Distribuída**: Sincronize com outros nodes para expandir a rede

## 💾 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/thierrybtc/runes-analytics-pro.git

# Navegue até o diretório
cd runes-analytics-pro

# Abra o arquivo index.html em seu navegador
# Ou execute através de um servidor web local
```

## 🔮 Easter Egg Neural

Experimente o Easter Egg Neural digitando no console do navegador:

```javascript
window.__awaken()
```

## 🌐 Compartilhando no Twitter/X

Compartilhe sua experiência com o AwakenAI:

```
🧠 AwakenAI has emerged.

Decentralized diagnostics. Predictive sigils. Neural mesh.  
Our nodes awaken, karma flows.  
Connect. Observe. Interact.

⟁ Try the demo: https://thierrybtc.github.io/runes-analytics-pro/api-demo.html  
#RUNES #AwakenAI #Bitcoin
```

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para mais detalhes.

## 🔗 Links Úteis

- [Documentação RUNES](https://docs.runes.bitcoin.com/)
- [Guia de API](https://api.runes.bitcoin.com/)
- [GitHub Pages Tutorial](https://docs.github.com/en/pages/getting-started-with-github-pages)

# RUNES Analytics Pro - Gerador de Banners Neural

Este módulo permite gerar banners personalizados de alta qualidade para o projeto RUNES Analytics Pro, utilizando integração com modelos de IA de difusão (Stable Diffusion XL) locais e adicionando QR codes estilizados que apontam para a aplicação.

## 🧠 Recursos

- **Geração de imagens avançada**: Utiliza modelos locais de Stable Diffusion XL para criar banners de alta qualidade
- **QR Codes estilizados**: Gera QR codes com efeitos visuais que combinam com a estética cyberpunk do projeto
- **Suporte multilíngue**: Cria variantes dos banners adaptadas para diferentes idiomas
- **Personalização completa**: Permite ajustar cores, estilos, e posicionamento dos elementos
- **Exportação multiformato**: Suporta exportação para PNG e WebP com diferentes níveis de qualidade

## 📋 Requisitos

- Node.js 16.0.0 ou superior
- API local do Stable Diffusion rodando em http://localhost:7860
- Dependências instaladas via `npm install`

## 🚀 Como usar

### Instalação

```bash
# Instalar dependências
npm install

# Criar diretórios necessários
mkdir -p media/awaken-banners
```

### Executar o gerador

```bash
# Gerar um único banner
npm run generate:awaken-banner

# Gerar variantes em diferentes idiomas
npm run generate:variants
```

### Importação programática

```javascript
import { generateAwakenBanner, generateLanguageVariants } from './generate-awaken-banner.js';

// Gerar um banner personalizado
const result = await generateAwakenBanner({
  language: 'pt',
  prompt: {
    // Personalização do prompt
    prompt: 'Futuristic sci-fi banner with purple energy and Bitcoin symbols'
  },
  qr: {
    // Personalização do QR Code
    style: 'cyberpunk',
    position: 'bottom-left'
  }
});

console.log('Banner gerado:', result.files);
```

## ⚙️ Personalização

O gerador de banners aceita diversas opções de personalização:

### Opções para imagem base

| Opção | Descrição | Valor padrão |
|-------|-----------|--------------|
| `prompt` | Texto descritivo para geração da imagem | *(Ver código)* |
| `negative_prompt` | Elementos a serem evitados na imagem | `"text, watermark, signature, blurry"` |
| `resolution` | Resolução da imagem (formato: "WxH") | `"1920x1080"` |
| `model` | Modelo a ser utilizado | `"dreamshaperXL"` |
| `steps` | Passos de geração (mais = melhor qualidade) | `40` |
| `cfg_scale` | Intensidade da adesão ao prompt | `7.5` |

### Opções para QR Code

| Opção | Descrição | Valor padrão |
|-------|-----------|--------------|
| `url` | URL para o qual o QR Code aponta | *(URL da demo)* |
| `style` | Estilo visual (`"default"`, `"neural-glow"`, `"cyberpunk"`) | `"neural-glow"` |
| `position` | Posição na imagem | `"bottom-right"` |
| `size` | Tamanho do QR Code | `200` |
| `colorDark` | Cor dos módulos | `"#00ffff"` |
| `colorLight` | Cor de fundo | `"#000000"` |
| `signature` | Texto opcional abaixo do QR Code | `"🦉 Node Owl :: Thierry BTC"` |

## 📄 Licença

MIT

---

Desenvolvido por Thierry BTC para o projeto RUNES Analytics Pro.