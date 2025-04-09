import React from 'react';
import Layout from 'src/components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">Sobre o RUNES Analytics Pro</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">O que são Runes?</h2>
          <p className="mb-4">
            Runes são um protocolo nativo de Bitcoin que permite a criação de tokens fungíveis diretamente na blockchain
            do Bitcoin. Diferente de outros tokens como BRC-20, os Runes são processados de forma mais eficiente e com
            menor custo de transação.
          </p>
          <p>
            O protocolo Runes foi proposto por Casey Rodarmor, também criador do protocolo Ordinals, e representa uma
            evolução significativa na capacidade do Bitcoin de suportar tokens sem comprometer sua estrutura fundamental.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Nossa Plataforma</h2>
          <p className="mb-4">
            RUNES Analytics Pro é uma plataforma especializada em análise de tokens Runes no ecossistema Bitcoin. 
            Nossa missão é fornecer dados precisos, atualizados e intuitivos para investidores, desenvolvedores e 
            entusiastas interessados neste inovador protocolo de tokens.
          </p>
          <p>
            Combinamos dados em tempo real da blockchain do Bitcoin, análises avançadas e uma interface gamificada 
            para proporcionar uma experiência envolvente e educativa.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recursos da Plataforma</h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Monitoramento em tempo real de tokens Runes</li>
            <li>Análise detalhada de dados on-chain</li>
            <li>Sistema de gamificação para engajamento dos usuários</li>
            <li>Ferramentas de visualização de dados</li>
            <li>Alertas personalizados para movimentações significativas</li>
            <li>Recursos educativos sobre o ecossistema Runes</li>
          </ul>
          <p>
            Nossa plataforma está em constante evolução, com novos recursos sendo adicionados regularmente 
            com base no feedback da comunidade e nas mudanças do protocolo Runes.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Gamificação</h2>
          <p className="mb-4">
            Um diferencial exclusivo da nossa plataforma é o sistema de gamificação que torna a experiência 
            de análise de dados mais envolvente e divertida.
          </p>
          <p className="mb-4">
            Através de conquistas, desafios e uma árvore de habilidades, os usuários são incentivados a 
            explorar mais profundamente os dados, entender o ecossistema Runes e se tornar analistas 
            cada vez mais capacitados.
          </p>
          <p>
            Visite nossa <a href="/gamification" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              página de gamificação</a> para conhecer este recurso exclusivo.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Contato</h2>
          <p className="mb-4">
            Estamos sempre abertos a feedback, sugestões e parcerias. Entre em contato conosco pelos 
            canais abaixo:
          </p>
          <ul className="list-none space-y-2">
            <li>
              <span className="font-semibold">Email:</span> contato@runesanalyticspro.com
            </li>
            <li>
              <span className="font-semibold">Twitter:</span> @RunesAnalyticsPro
            </li>
            <li>
              <span className="font-semibold">Discord:</span> discord.gg/runesanalyticspro
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 