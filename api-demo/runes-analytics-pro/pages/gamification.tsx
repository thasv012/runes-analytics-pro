import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { prisma } from 'src/lib/prisma';
import Layout from 'src/components/Layout';
import SkillTree, { SkillNode } from 'src/components/SkillTree';
import Achievements, { Achievement } from 'src/components/Achievements';

interface GamificationProps {
  tokenCount: number | null;
  userLevel: number;
  connectionError: string | null;
}

export const getServerSideProps: GetServerSideProps<GamificationProps> = async (context) => {
  let tokenCount: number | null = null;
  let connectionError: string | null = null;
  // Nível do usuário simulado - em produção viria do banco de dados
  const userLevel = 2;

  try {
    tokenCount = await prisma.runeToken.count();
  } catch (error: any) {
    console.error("Database connection/query error (getServerSideProps):", error);
    connectionError = `Falha ao conectar ou consultar banco de dados: ${error?.message || 'Erro desconhecido'}`;
  }

  return {
    props: {
      tokenCount,
      userLevel,
      connectionError,
    },
  };
};

export default function GamificationPage({ tokenCount, userLevel, connectionError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Árvore de habilidades simulada
  const skillTree: SkillNode[] = [
    {
      id: 'basic-analytics',
      title: 'Análise Básica',
      description: 'Desbloqueie a capacidade de visualizar dados básicos sobre os tokens Runes.',
      level: 1,
      unlocked: userLevel >= 1,
      children: [
        {
          id: 'supply-analysis',
          title: 'Análise de Fornecimento',
          description: 'Acesse detalhes sobre o fornecimento dos tokens.',
          level: 2,
          unlocked: userLevel >= 2,
          children: [
            {
              id: 'rarity-calculations',
              title: 'Cálculos de Raridade',
              description: 'Desbloqueie cálculos avançados de raridade para todos os tokens Runes.',
              level: 3,
              unlocked: userLevel >= 3,
              children: [],
              xPosition: 1
            }
          ],
          xPosition: 1
        },
        {
          id: 'holder-metrics',
          title: 'Métricas de Detentores',
          description: 'Visualize dados sobre os detentores de cada token.',
          level: 2,
          unlocked: userLevel >= 2,
          children: [
            {
              id: 'whale-detection',
              title: 'Detecção de Baleias',
              description: 'Identifique automaticamente os grandes detentores de tokens.',
              level: 3,
              unlocked: userLevel >= 3,
              children: [],
              xPosition: 3
            }
          ],
          xPosition: 3
        }
      ],
      xPosition: 2
    }
  ];

  // Lista de conquistas simulada
  const achievements: Achievement[] = [
    {
      id: 'first-login',
      title: 'Primeiro Login',
      description: 'Faça seu primeiro login na plataforma.',
      icon: '🎮',
      earned: true,
      earnedDate: new Date('2023-04-01'),
    },
    {
      id: 'analyze-10-tokens',
      title: 'Analista Iniciante',
      description: 'Analise 10 tokens Runes diferentes.',
      icon: '🔍',
      earned: true,
      earnedDate: new Date('2023-04-05'),
    },
    {
      id: 'consecutive-login',
      title: 'Usuário Fiel',
      description: 'Faça login na plataforma por 7 dias consecutivos.',
      icon: '📅',
      earned: false,
      progress: 3,
      maxProgress: 7,
    },
    {
      id: 'share-analysis',
      title: 'Compartilhador',
      description: 'Compartilhe uma análise com a comunidade.',
      icon: '📤',
      earned: false,
    },
    {
      id: 'discover-rare-token',
      title: 'Descobridor de Raridades',
      description: 'Descubra um token Rune com menos de 100 detentores.',
      icon: '💎',
      earned: false,
    }
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistema de Gamificação RUNES</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Desbloqueie novas habilidades e funcionalidades à medida que interage com a plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Seu Nível</h2>
            <span className="bg-blue-500 text-white px-2 py-1 rounded-md">{userLevel}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(userLevel/5)*100}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Progresso para o próximo nível: {userLevel}/5
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">Tokens Analisados</h2>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{tokenCount || 0}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">de {tokenCount || 0} disponíveis</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">Conquistas</h2>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">de {achievements.length} possíveis</span>
          </div>
        </div>
      </div>

      {/* Componente de árvore de habilidades */}
      <SkillTree userLevel={userLevel} initialSkillTree={skillTree} />

      {/* Componente de conquistas */}
      <Achievements achievements={achievements} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Como Subir de Nível?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Analise diferentes tokens Runes diariamente</li>
          <li>Complete desafios semanais na plataforma</li>
          <li>Compartilhe análises com a comunidade</li>
          <li>Descubra novos tokens antes da maioria</li>
          <li>Participe de eventos especiais da comunidade</li>
        </ul>
      </div>
    </Layout>
  );
} 