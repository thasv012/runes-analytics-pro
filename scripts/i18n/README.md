# Sistema de Internacionalização - RUNES Analytics Pro

Este diretório contém os scripts e utilitários para gerenciar a internacionalização (i18n) do site RUNES Analytics Pro.

## Visão Geral

O sistema de internacionalização foi projetado para oferecer as seguintes funcionalidades:

- Alternância entre idiomas (português e inglês) sem recarregar a página
- Persistência da preferência de idioma do usuário
- Integração fácil em páginas existentes
- Ferramentas para diagnóstico e verificação de conformidade
- Scripts para facilitar a migração de páginas existentes para o sistema multilíngue

## Arquivos Principais

### language-switcher.js

Este é o componente principal do sistema de idiomas. Ele fornece:

- Alternância entre idiomas
- Carregamento de arquivos de tradução em JSON
- Persistência da escolha de idioma via localStorage
- Animações de transição entre idiomas
- Suporte para elementos alternáveis via classes `.lang-en` e `.lang-pt`
- Suporte para tradução via atributos `data-i18n`, `data-i18n-placeholder` e `data-i18n-title`

### language-integrator.js

Utilitário para ajudar na integração do seletor de idiomas em páginas existentes:

- Injeção automática do seletor de idiomas em elementos de navegação existentes
- Estilização automática
- Compatibilidade com dispositivos móveis
- Funções auxiliares para preparar elementos de texto para tradução

### language-checker.js

Ferramenta interativa para analisar páginas e encontrar textos não traduzíveis:

- Adiciona um botão flutuante em modo de desenvolvimento
- Identifica todos os nós de texto visíveis que não estão configurados para alternância de idioma
- Destaca visualmente os elementos problemáticos
- Verifica a configuração correta do seletor de idiomas
- Exibe relatório detalhado de problemas

### language-report.js

Script Node.js para gerar relatórios de conformidade em todo o projeto:

- Escaneia todos os arquivos HTML do projeto
- Verifica a implementação correta do sistema de idiomas
- Identifica arquivos sem seletor de idiomas ou com textos não traduzíveis
- Audita chaves de tradução ausentes
- Gera um relatório detalhado em formato Markdown

## Arquivos de Tradução

Os arquivos de tradução estão localizados no diretório `/lang`:

- `/lang/en.json` - Traduções em inglês
- `/lang/pt.json` - Traduções em português

## Como Implementar o Sistema de Idiomas

### 1. Incluir os Scripts Necessários

```html
<link rel="stylesheet" href="styles/language-styles.css">
<script src="language-switcher.js" defer></script>
```

### 2. Adicionar o Seletor de Idiomas ao HTML

```html
<div class="language-selector">
    <button class="language-toggle">
        <span class="current-lang">EN</span>
        <i class="toggle-arrow">&#9660;</i>
    </button>
    <div class="language-dropdown">
        <a href="#" class="language-option" data-lang="en">
            <i class="flag-icon">🇺🇸</i>
            <span>English</span>
        </a>
        <a href="#" class="language-option" data-lang="pt">
            <i class="flag-icon">🇧🇷</i>
            <span>Português</span>
        </a>
    </div>
</div>
```

### 3. Preparar o HTML para Tradução

Há duas abordagens para fazer textos alternáveis entre idiomas:

#### Opção 1: Usando Classes de Idioma

```html
<h1>
    <span class="lang-en">Welcome to RUNES Analytics Pro</span>
    <span class="lang-pt">Bem-vindo ao RUNES Analytics Pro</span>
</h1>
```

#### Opção 2: Usando Atributos data-i18n

```html
<h1 data-i18n="welcome_title">Welcome to RUNES Analytics Pro</h1>
```

E adicionar a chave ao arquivo JSON de tradução:

```json
{
  "welcome_title": "Welcome to RUNES Analytics Pro"
}
```

### 4. Integração Automática

Para páginas existentes, você pode usar o integrador:

```html
<script src="scripts/i18n/language-integrator.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        initLanguageIntegration({
            targetSelector: '.nav-menu',
            mobileDisplay: true
        });
    });
</script>
```

## Verificação de Conformidade

### Verificação Interativa (no Navegador)

1. Adicione o script de verificação:

```html
<script src="scripts/i18n/language-checker.js"></script>
```

2. Um botão 🌐 aparecerá no canto inferior direito da página (apenas em modo de desenvolvimento)
3. Clique nele e execute a verificação para identificar problemas

### Relatório de Verificação (Linha de Comando)

1. Execute o script de relatório:

```bash
node scripts/i18n/language-report.js
```

2. Um arquivo `language-report.md` será gerado na raiz do projeto com análise detalhada

## Boas Práticas

1. Sempre use o atributo `lang` no elemento HTML:
   ```html
   <html lang="en">
   ```

2. Mantenha os arquivos de tradução organizados e consistentes:
   - Use categorias lógicas
   - Mantenha as mesmas chaves em todos os arquivos de idiomas
   - Evite traduções muito longas

3. Faça uma verificação regular de conformidade
   - Execute o script de relatório antes de fazer o deploy
   - Resolva problemas de textos não traduzíveis

4. Teste em diferentes idiomas:
   - Verifique se não há textos "codificados" (hardcoded)
   - Certifique-se de que a interface se adapta a diferentes comprimentos de texto

## Personalizando o Sistema

### Adicionar Novos Idiomas

1. Adicione o novo idioma ao arquivo `language-switcher.js`:

```javascript
const langSwitcherConfig = {
    flagEmojis: {
        en: '🇺🇸',
        pt: '🇧🇷',
        es: '🇪🇸' // Adicionando espanhol
    }
};
```

2. Crie um novo arquivo de tradução em `/lang` (ex: `es.json`)
3. Adicione a opção ao seletor de idiomas em todas as páginas

### Personalizar Estilos

Os estilos para o sistema de idiomas estão localizados em `styles/language-styles.css`. Você pode personalizar:

- Aparência do seletor de idiomas
- Animações de transição
- Comportamento responsivo

## Solução de Problemas

### Texto não muda de idioma

1. Verifique se o elemento usa corretamente as classes `.lang-en` e `.lang-pt` ou o atributo `data-i18n`
2. Verifique se as chaves de tradução existem nos arquivos de tradução
3. Verifique se o `language-switcher.js` está sendo carregado corretamente

### Seletor de idioma não funciona

1. Verifique os erros no console do navegador
2. Verifique se a estrutura HTML do seletor de idiomas está correta
3. Verifique se os eventos de clique estão funcionando

### Problemas de Layout ao Trocar Idiomas

1. Use estilos flexíveis que se adaptem a diferentes comprimentos de texto
2. Evite dimensões fixas em elementos que contêm texto traduzível
3. Teste com textos mais longos e mais curtos

## Recursos Adicionais

- [MDN: Internacionalização](https://developer.mozilla.org/pt-BR/docs/Glossary/Localization)
- [W3C: Práticas de Internacionalização](https://www.w3.org/International/techniques/authoring-html)

---

Desenvolvido para o projeto RUNES Analytics Pro. © 2025. Todos os direitos reservados. 