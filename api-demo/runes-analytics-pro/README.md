# RUNES Analytics Pro

Uma plataforma de análise de dados de tokens Runes com gamificação integrada.

## Sobre o Projeto

RUNES Analytics Pro é uma plataforma especializada em análise de tokens Runes no ecossistema Bitcoin. Nossa missão é fornecer dados precisos, atualizados e intuitivos para investidores, desenvolvedores e entusiastas interessados neste inovador protocolo de tokens.

O diferencial da plataforma é a integração de elementos de gamificação, tornando a experiência de análise de dados mais envolvente e educativa.

## Funcionalidades

- **Dashboard de Tokens Runes**: Visualização e análise de dados sobre os tokens Runes.
- **Sistema de Gamificação**: Árvore de habilidades e conquistas para engajar os usuários.
- **Integração com APIs**: Busca de dados atualizados sobre tokens Runes.
- **Análise On-Chain**: Dados extraídos diretamente da blockchain do Bitcoin.

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **APIs**: Magic Eden Runes API

## Início Rápido

### Pré-requisitos

- Node.js 14.x ou superior
- Yarn ou NPM
- PostgreSQL

### Instalação

1. Clone o repositório
   ```
   git clone https://github.com/seu-usuario/runes-analytics-pro.git
   cd runes-analytics-pro
   ```

2. Instale as dependências
   ```
   yarn install
   ```

3. Configure as variáveis de ambiente
   ```
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```
   DATABASE_URL="postgresql://usuário:senha@localhost:5432/runes-analytics"
   MAGIC_EDEN_API_KEY="sua-chave-api"
   ```

4. Execute as migrações do banco de dados
   ```
   npx prisma migrate dev
   ```

5. Inicie o servidor de desenvolvimento
   ```
   yarn dev
   ```

6. Acesse a aplicação em `http://localhost:3000`

## Estrutura do Projeto

```
├── pages/              # Páginas do Next.js
│   ├── index.tsx       # Página inicial
│   ├── runes.tsx       # Lista de tokens
│   ├── gamification.tsx # Sistema de gamificação
│   └── about.tsx       # Página sobre o projeto
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   │   ├── Layout.tsx  # Layout principal
│   │   ├── SkillTree.tsx # Componente de árvore de habilidades
│   │   └── Achievements.tsx # Componente de conquistas
│   └── lib/
│       └── prisma.ts   # Cliente Prisma
├── prisma/
│   └── schema.prisma   # Schema do banco de dados
└── public/             # Arquivos estáticos
```

## Sistema de Gamificação

O sistema de gamificação da plataforma é composto por:

1. **Árvore de Habilidades**: Desbloqueie novas funcionalidades e recursos à medida que utiliza a plataforma.
2. **Conquistas**: Complete desafios específicos para ganhar reconhecimento e recompensas.
3. **Níveis de Usuário**: Evolua seu perfil conforme interage com a plataforma.

Acesse a página de gamificação (`/gamification`) para visualizar estes recursos.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Contato

- Email: contato@runesanalyticspro.com
- Twitter: @RunesAnalyticsPro
- Discord: discord.gg/runesanalyticspro 