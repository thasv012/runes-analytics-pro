# Solução para Imagens da Thread no Twitter

## Problema identificado
As imagens mencionadas na thread não foram geradas. O arquivo `thread-runes-analytics-english-exportable.md` contém referências a imagens como `runes-analytics-thread-evolution.png`, mas essas imagens não existem no diretório `media/thread-images`.

## Opções para resolver

### Opção 1: Gerar as imagens (Requer Node.js e Puppeteer)

Para gerar as imagens usando o script existente:

1. Instale as dependências necessárias:
```
npm install puppeteer
```

2. Execute o script de geração de imagens:
```
cd media/thread-images
node gerar-imagens-thread.js
```

3. Aguarde a conclusão do processo. O script abrirá várias janelas do navegador para gerar as imagens.

### Opção 2: Usar imagens suas ou encontradas na web

Se você tem imagens próprias ou quer usar alternativas:

1. Renomeie suas imagens para corresponder aos nomes referenciados:
   - `runes-analytics-thread-evolution.png`
   - `runes-analytics-thread-gpu-mesh.png`
   - `runes-analytics-thread-websocket.png`
   - `runes-analytics-thread-roadmap.png`
   - `runes-analytics-thread-ai-analysis.png`
   - `runes-analytics-thread-whales-tracking.png`
   - `runes-analytics-thread-comparison.png`
   - `runes-analytics-thread-next-evolution.png`

2. Coloque as imagens no diretório `media/thread-images`

### Opção 3: Criar as imagens manualmente com os templates

Você pode gerar as imagens manualmente usando o gerador de banner:

1. Abra o arquivo `media/thread-images/thread-banner-generator.html` em seu navegador
2. Selecione cada template na lista suspensa
3. Clique em "Gerar Banner"
4. Clique com o botão direito na imagem gerada e selecione "Salvar imagem como..."
5. Salve com o nome correspondente no diretório `media/thread-images`

### Opção 4: Postar sem imagens ou modificar referências

Alternativa mais simples:

1. Edite o arquivo `thread-runes-analytics-english-exportable.md`
2. Remova ou modifique as referências a imagens

## Como postar no Twitter após resolver o problema das imagens

1. Abra o [Typefully](https://typefully.com/) e faça login
2. Cole o conteúdo do arquivo `thread-runes-analytics-english-exportable.md`
3. Para cada tweet, adicione a imagem correspondente
4. Revise a thread e publique

## Dica para teste rápido

Se quiser testar rapidamente sem gerar todas as imagens, você pode:

1. Criar uma única imagem de teste (por exemplo, com uma mensagem "RUNES Analytics Pro")
2. Duplicá-la com os nomes necessários
3. Usar essas imagens temporárias para verificar se o processo de postagem funciona

Depois, você pode substituir as imagens temporárias pelas finais antes da publicação oficial. 

mkdir -p media/thread-images 