# RUNES Analytics WebSocket

Sistema de comunicação em tempo real para a plataforma RUNES Analytics, implementando WebSockets para troca de mensagens entre clientes e servidor.

## Visão Geral

O sistema WebSocket do RUNES Analytics permite comunicação bidirecional em tempo real entre os diferentes componentes da plataforma. Ele foi projetado para facilitar:

- Atualizações em tempo real de dados de Runes
- Notificações instantâneas sobre transações e eventos de mercado
- Comunicação entre diferentes interfaces e visualizações
- Sincronização de múltiplos clientes e dispositivos

## Componentes Principais

O sistema é composto por três componentes principais:

1. **Cliente WebSocket** (`websocket-client.js`) - Implementação do cliente que se conecta ao servidor WebSocket.
2. **Servidor WebSocket** (`websocket-server.js`) - Implementação do servidor que gerencia conexões e roteamento de mensagens.
3. **Manipuladores de Dados** (`websocket-data-handlers.js`) - Processadores especializados para diferentes tipos de mensagens e dados.

## Instalação

### Dependências

O sistema requer as seguintes dependências:

```bash
npm install ws uuid
```

### Arquivos do Sistema

Certifique-se de que os seguintes arquivos estejam em seu projeto:

- `js/websocket-client.js` - Cliente WebSocket
- `js/websocket-server.js` - Servidor WebSocket
- `js/websocket-data-handlers.js` - Manipuladores de dados
- `js/websocket-demo.js` - Script de demonstração
- `websocket-demo.html` - Interface de demonstração

## Como Usar

### Iniciar o Servidor

```javascript
const RunesWebSocketServer = require('./js/websocket-server.js');

// Criar e iniciar servidor
const server = new RunesWebSocketServer({
  port: 9999,
  debug: true
});

// O servidor inicia automaticamente na construção por padrão
// Para iniciar manualmente, use:
// server.start();
```

### Conectar um Cliente

#### Em Node.js:

```javascript
const RunesWebSocketClient = require('./js/websocket-client.js');

// Criar e conectar cliente
const client = new RunesWebSocketClient({
  url: 'ws://localhost:9999',
  clientType: 'analytics',
  clientName: 'analytics-client-1',
  onMessage: (message) => {
    console.log('Mensagem recebida:', message);
  }
});
```

#### Em Navegador:

```html
<script src="js/websocket-client.js"></script>
<script>
  // Criar e conectar cliente
  const client = new RunesWebSocketClient({
    url: 'ws://localhost:9999',
    clientType: 'ui',
    clientName: 'ui-client-1'
  });
  
  // Enviar mensagem
  client.send('chat', { content: 'Olá do navegador!' });
</script>
```

### Enviar Mensagens

```javascript
// Enviar mensagem para todos os clientes
client.send('chat', { content: 'Mensagem para todos' });

// Enviar mensagem para um cliente específico
client.send('chat', { content: 'Mensagem privada' }, 'client-id-123');

// Enviar mensagem para um grupo
client.send('chat', { content: 'Mensagem para grupo' }, 'group:admin');

// Enviar mensagem para um tipo específico de cliente
client.send('update', { data: { /* ... */ } }, 'type:ui');
```

### Processar Mensagens

```javascript
// Usar os handlers de dados
const RunesWebSocketHandlers = require('./js/websocket-data-handlers.js');

// Inicializar handlers
RunesWebSocketHandlers.init();

// Processar uma mensagem
const result = RunesWebSocketHandlers.processMessage({
  type: 'rune_update',
  runeName: 'OrdiRune',
  data: {
    name: 'OrdiRune',
    supply: 1000000,
    // ... outros dados
  }
});

console.log(result);
```

## Demonstração

Uma demonstração interativa está disponível para testar o sistema WebSocket:

1. Inicie um servidor local (ex: live-server ou node express)
2. Abra `websocket-demo.html` no navegador
3. Use a interface para iniciar o servidor, conectar clientes e enviar mensagens

```bash
npx live-server
# Acesse http://localhost:8080/websocket-demo.html
```

## Tipos de Mensagens Suportados

O sistema suporta diversos tipos de mensagens, cada um processado por um handler específico:

- `rune_update` - Atualizações de dados de um Rune específico
- `market_alert` - Alertas sobre eventos de mercado
- `network_stats` - Estatísticas da rede Bitcoin e Runes
- `transaction_notification` - Notificações sobre transações
- `wallet_analysis` - Análises de carteiras
- `chat` - Mensagens de chat entre usuários
- `data_request` - Solicitações de dados específicos

## Canais e Grupos

O sistema suporta agrupamento de clientes em canais e grupos para facilitar o envio de mensagens:

### Canais

Os canais são usados para inscrição em tópicos de interesse:

```javascript
// No cliente
client.send('subscribe', { channel: 'market-updates' });

// No servidor
server.sendToChannel('market-updates', { type: 'market_alert', data: { /* ... */ } });
```

### Grupos

Os grupos são usados para categorizar clientes:

```javascript
// No servidor
server.addToGroup('client-id-123', 'admin');
server.sendToGroup('admin', { type: 'system_message', data: { /* ... */ } });
```

## Referência da API

### Cliente WebSocket

#### Métodos

- `connect()` - Conecta ao servidor WebSocket
- `disconnect()` - Desconecta do servidor
- `send(type, data, target)` - Envia uma mensagem
- `on(event, callback)` - Registra um listener para um evento
- `isConnected()` - Verifica se está conectado
- `getClientId()` - Obtém o ID do cliente

#### Eventos

- `connect` - Quando a conexão é estabelecida
- `disconnect` - Quando a conexão é fechada
- `message` - Quando uma mensagem é recebida
- `error` - Quando ocorre um erro

### Servidor WebSocket

#### Métodos

- `start()` - Inicia o servidor
- `stop()` - Para o servidor
- `sendTo(clientId, message)` - Envia mensagem para um cliente
- `broadcast(message)` - Envia mensagem para todos os clientes
- `sendToGroup(groupName, message)` - Envia mensagem para um grupo
- `sendToChannel(channelName, message)` - Envia mensagem para um canal
- `sendToType(type, message)` - Envia mensagem para clientes de um tipo
- `addToGroup(clientId, groupName)` - Adiciona cliente a um grupo
- `removeFromGroup(clientId, groupName)` - Remove cliente de um grupo
- `addToChannel(clientId, channelName)` - Adiciona cliente a um canal
- `removeFromChannel(clientId, channelName)` - Remove cliente de um canal
- `getClientInfo(clientId)` - Obtém informações de um cliente
- `getAllClients()` - Obtém lista de todos os clientes
- `getStats()` - Obtém estatísticas do servidor

### Manipuladores de Dados

#### Métodos

- `registerHandler(messageType, handler)` - Registra handler para um tipo de mensagem
- `registerDataProcessor(entityType, processorName, processor)` - Registra processador de dados
- `processMessage(message, clientInfo)` - Processa uma mensagem
- `processData(entityType, processorName, data)` - Processa dados usando um processador

## Licença

Este projeto faz parte da plataforma RUNES Analytics e está disponível sob a licença definida para a plataforma como um todo. 