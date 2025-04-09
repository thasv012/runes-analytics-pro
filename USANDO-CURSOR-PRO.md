# 🚀 Guia do RUNES Analytics - Ambiente de Produtividade com Cursor

Este guia explica como aproveitar ao máximo o ambiente de produtividade que configuramos para desenvolvimento do RUNES Analytics Pro usando o editor Cursor potencializado por IA.

## 📋 O Que Temos Disponível

O ambiente inclui:

1. **Comandos Personalizados** - Via `.cursor-config.json`
2. **Agente IA Local** - Via `agente-local.js`
3. **Simulador de GPUs** - Via `scripts/addGpuNodes.js`
4. **Sistema de Notificações** - Via `js/mesh-notify.js`
5. **Layout Visual de Produtividade** - Via `cursor-productivity-layout.html`

## 🔧 Como Iniciar

1. Abra o projeto no Cursor
2. Execute o servidor de desenvolvimento:
   ```bash
   npx live-server --port=3000
   ```
3. Acesse o layout de produtividade:
   ```
   http://localhost:3000/cursor-productivity-layout.html
   ```

## ⌨️ Atalhos do Cursor (via .cursor-config.json)

| Atalho | Ação |
|--------|------|
| `Ctrl+Shift+A` | Adicionar 5 nós GPU à rede |
| `Ctrl+Shift+T` | Testar conexão GPU Mesh |
| `Ctrl+Shift+R` | Analisar código Runes |
| `Ctrl+Shift+C` | Enviar seleção para o ChatGPT |
| `Ctrl+Alt+L` | Iniciar Live Server |
| `Ctrl+Alt+M` | Abrir Demo GPU Mesh |
| `Ctrl+Alt+E` | Explicar código selecionado |
| `Ctrl+Alt+O` | Otimizar código selecionado |
| `Ctrl+Alt+D` | Debugar código selecionado |
| `Ctrl+Alt+G` | Gerar documentação para código |

## 🤖 Comandos do Agente IA Local

Abra o console do navegador (F12) e use:

```javascript
// Formato geral
agente('/comando parâmetro1 parâmetro2');

// Ou use o atalho
a('/comando parâmetro1 parâmetro2');
```

### Comandos Disponíveis:

- **GPU**: `/gpu [add|remove|list|status] [quantidade]`
  ```javascript
  a('/gpu add 5'); // Adiciona 5 nós GPU
  a('/gpu list');  // Lista todos os nós ativos
  a('/gpu status'); // Mostra status da rede GPU
  ```

- **RUNE**: `/rune [id|nome]`
  ```javascript
  a('/rune CYPHER'); // Analisa o token CYPHER
  a('/rune XYZ123'); // Analisa token por ID
  ```

- **MESH**: `/mesh`
  ```javascript
  a('/mesh'); // Mostra status da rede Mesh
  ```

- **DOC**: `/doc [módulo]`
  ```javascript
  a('/doc gpuClient'); // Gera documentação para o módulo
  a('/doc todos');     // Documenta todos os módulos
  ```

- **TEST**: `/test [suite]`
  ```javascript
  a('/test gpuMesh'); // Executa testes para o módulo
  a('/test todos');   // Executa todos os testes
  ```

## 🔌 Simulador de Nós GPU

Para adicionar nós GPU à visualização:

1. **Via Interface:**
   - Acesse `http://localhost:3000/gpu-mesh-demo.html`
   - Use o campo para definir quantidade de nós
   - Clique em "Adicionar GPUs"

2. **Via Console:**
   ```javascript
   // Adiciona 10 nós GPU
   simulateGpuNodes(10);
   
   // Para a simulação
   stopGpuSimulation();
   ```

3. **Via Comando do Agente:**
   ```javascript
   a('/gpu add 8');
   ```

## 🔔 Sistema de Notificações

Para usar o sistema de notificações em seus scripts:

```javascript
import { notifyOwl, notifyWarning, notifySuccess, notifyError } from './js/mesh-notify.js';

// Enviar uma notificação de informação
notifyOwl("Operação concluída", { detalhe: valor });

// Enviar erro
notifyError("Falha ao conectar", { razão: erro });

// Enviar sucesso
notifySuccess("Tarefa concluída com sucesso", { id: taskId });

// Enviar alerta
notifyWarning("Alta utilização detectada", { uso: "95%" });
```

## 📊 Monitoramento em Tempo Real

O layout de produtividade inclui:

- Visualização da rede GPU Mesh
- Painel de status de nós
- Fluxos de dados em tempo real
- Log de eventos críticos
- Estatísticas de desempenho

## 💡 Fluxo de Trabalho Recomendado

1. **Iniciar o Dia:**
   - Execute o live-server (`Ctrl+Alt+L`)
   - Abra o painel de produtividade
   - Inicialize o ambiente com `a('/gpu status')`

2. **Durante o Desenvolvimento:**
   - Use os atalhos do Cursor para tarefas comuns
   - Monitore o sistema via layout de produtividade
   - Use o agente para comandos rápidos
   - Teste novas funcionalidades com o simulador

3. **Ao Finalizar:**
   - Verifique mensagens de erro com `a('/mesh')`
   - Documente o código com `a('/doc módulo')`
   - Execute testes finais com `a('/test todos')`

## 🧩 Expandindo o Sistema

### Adicionando Novos Comandos:

Edite `agente-local.js` e adicione um novo método e entrada na lista de comandos:

```javascript
// Na lista de comandos
this.comandos = {
  '/comando': this.novoComando,
  // ... outros comandos existentes
};

// Adicione seu método
novoComando(args) {
  // Sua implementação aqui
  return `✅ Resultado do novo comando com ${args.join(', ')}`;
}
```

### Adicionando Novos Atalhos:

Edite `.cursor-config.json` para adicionar novos atalhos:

```json
"keybindings": {
  "custom": {
    "meu-atalho": "ctrl+shift+z"
  }
}
```

---

⚡ Este sistema foi desenvolvido para maximizar sua produtividade no desenvolvimento do RUNES Analytics Pro. Para dúvidas ou sugestões, consulte a documentação ou use o comando `/doc ajuda` no agente local.

🔗 **Links Úteis:**
- Demo: [http://localhost:3000/gpu-mesh-demo.html](http://localhost:3000/gpu-mesh-demo.html)
- Layout: [http://localhost:3000/cursor-productivity-layout.html](http://localhost:3000/cursor-productivity-layout.html)
- Documentação: [http://localhost:3000/docs/index.html](http://localhost:3000/docs/index.html) 