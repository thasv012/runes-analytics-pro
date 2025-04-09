# ⚡ Configuração Rápida RUNES + Cursor

Para configurar rapidamente o ambiente de produtividade para RUNES Analytics no Cursor, siga estas etapas:

## 📥 Arquivos Necessários

Confira se você tem os seguintes arquivos:

- `.cursor-config.json` - Comandos personalizados e atalhos
- `agente-local.js` - Agente de IA local
- `js/mesh-notify.js` - Sistema de notificações
- `scripts/addGpuNodes.js` - Simulador de nós GPU
- `cursor-productivity-layout.html` - Layout visual tipo Notion

## 🚀 Instalação em 3 Passos

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar o Cursor

Certifique-se de que o arquivo `.cursor-config.json` está na raiz do projeto. O Cursor reconhecerá automaticamente a configuração ao abrir a pasta.

### 3. Iniciar o Servidor

```bash
npx live-server --port=3000
```

## 🧪 Teste de Ambiente

Para testar se todo o ambiente está funcionando:

1. Navegue para `http://localhost:3000/cursor-productivity-layout.html`
2. Abra o console (F12) e execute:
   ```javascript
   agente('/gpu status');
   ```
3. Verifique se o agente responde com o status da rede

## 🔍 Solução de Problemas

### Atalhos não funcionam no Cursor?

Verifique se você tem a versão mais recente do Cursor e reinicie o aplicativo após criar o arquivo de configuração.

### Agente não está respondendo?

Verifique o console por erros. Pode ser necessário adicionar o script manualmente:

```html
<script type="module" src="./agente-local.js"></script>
```

### Erro no servidor?

Se a porta 3000 estiver ocupada, tente:

```bash
npx live-server --port=3001
```

E atualize as URLs conforme necessário.

---

⚠️ **Nota**: Este é um setup rápido. Para detalhes completos, consulte [USANDO-CURSOR-PRO.md](USANDO-CURSOR-PRO.md) 