# Como Compartilhar o Projeto RUNES Analytics Pro

Para permitir que outras pessoas visualizem seu projeto de desenvolvimento, existem várias opções disponíveis. Abaixo estão as instruções para os métodos mais comuns:

## 1. Compartilhamento na Rede Local

Se a pessoa estiver na mesma rede Wi-Fi ou rede local que você:

1. Inicie o servidor com: `cd novo-design && http-server -c-1 -p 8081`
2. Anote o endereço IP local que aparece na saída (por exemplo, `http://192.168.1.12:8081`)
3. A pessoa poderá acessar usando esse endereço IP completo com a porta 8081

## 2. Compartilhamento via Internet (Usando Ngrok)

Para compartilhar com qualquer pessoa na internet:

1. Instale o Ngrok:
   ```
   npm install -g ngrok
   ```

2. Inicie o servidor como normal:
   ```
   cd novo-design && http-server -c-1 -p 8081
   ```

3. Em uma nova janela do terminal, execute:
   ```
   ngrok http 8081
   ```

4. O Ngrok gerará um URL público (algo como `https://a1b2c3d4.ngrok.io`)
5. Compartilhe esse URL com qualquer pessoa para que possam acessar seu projeto

## 3. Usando Cloudflare Tunnel (Alternativa ao Ngrok)

1. Instale o Cloudflared:
   - Windows: Baixe do [site oficial](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation)
   
2. Execute o comando:
   ```
   cloudflared tunnel --url http://localhost:8081
   ```

3. Você receberá um URL temporário para compartilhar

## 4. Hospedagem Temporária na Vercel/Netlify

Para uma solução mais permanente:

1. Faça upload dos arquivos para um repositório GitHub
2. Conecte esse repositório a um serviço como Vercel ou Netlify
3. Configure a implantação automática

## Observações Importantes

- Os métodos de túnel como Ngrok e Cloudflare Tunnel são temporários e o URL mudará a cada execução
- Para demonstrações mais duradouras, considere hospedagem real
- Lembre-se que o projeto está usando dados mockados para desenvolvimento, então algumas funcionalidades serão simuladas

## Solução de Problemas Comuns

- **Firewall Bloqueando**: Verifique se o Firewall do Windows não está bloqueando a conexão
- **Erro de Permissão**: Alguns antivírus podem bloquear a criação de túneis
- **Porta Já em Uso**: Se a porta 8081 já estiver sendo usada, mude para outra porta (ex: 8082) 

📅 Última atualização: 05/04/2025 às 00:40