import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
// import { prisma } from '@/lib/prisma'; // Comentando o alias
import { prisma } from 'src/lib/prisma'; // Usando caminho relativo a partir de baseUrl = "."
// import { prisma } from '../src/lib/prisma'; // Comentando caminho relativo direto
// import { prisma } from '../src/lib/prisma.ts'; // Comentando COM .ts
import Layout from 'src/components/Layout';

interface HomeProps {
  tokenCount: number | null;
  connectionError: string | null;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  let tokenCount: number | null = null;
  let connectionError: string | null = null;

  try {
    // Tenta contar os tokens Rune no banco de dados
    tokenCount = await prisma.runeToken.count();
    console.log(`getServerSideProps: Successfully counted ${tokenCount} tokens.`);
  } catch (error: any) {
    // Log detalhado do erro no servidor
    console.error("Database connection/query error in getServerSideProps:", error);
    // Mensagem de erro mais amigável para o props
    connectionError = `Failed to connect or query database. Check server console logs for details. Error message: ${error?.message || 'Unknown error'}`;
  }

  return {
    props: {
      tokenCount,
      connectionError,
    },
  };
};

// Componente da página Home
export default function Home({ tokenCount, connectionError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Welcome to RUNES Analytics Pro (Pages Router)</h1>

      {/* Seção de teste de conexão com o Prisma */}
      <div className="mt-10 p-6 border border-gray-300 dark:border-neutral-700 rounded-lg bg-gray-100 dark:bg-zinc-800/50">
        <h2 className="text-xl font-semibold mb-2">Prisma Connection Test</h2>
        {connectionError ? (
          // Exibe mensagem de erro se a conexão falhou
          <p className="text-red-500">Error: {connectionError}</p>
        ) : (
          // Exibe mensagem de sucesso se a conexão funcionou
          <p className="text-green-500">Database connection successful!</p>
        )}
        {tokenCount !== null && !connectionError && (
           // Exibe a contagem de tokens se não houve erro e a contagem não é nula
          <p>Rune Tokens count in database: <span className="font-bold">{tokenCount}</span></p>
        )}
         {/* Indicação de que os dados vieram do SSR */}
        <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">(Data fetched via getServerSideProps)</p>
      </div>
    </Layout>
  );
} 