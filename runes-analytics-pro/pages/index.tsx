import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { prisma } from '../src/lib/prisma'; // Usando caminho relativo direto
import Link from 'next/link';

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
    <div className="container mx-auto p-4">
      {/* Navegação simples */}
      <nav className='mb-4'>
        <Link href="/" className="mr-2 p-1 border border-transparent hover:border-gray-300">Home</Link> |
        <Link href="/about" className="ml-2 mr-2 p-1 border border-transparent hover:border-gray-300">About</Link> |
        <Link href="/users" className="ml-2 mr-2 p-1 border border-transparent hover:border-gray-300">Users List</Link> |
        <Link href="/api/users" className="ml-2 p-1 border border-transparent hover:border-gray-300">Users API</Link>
      </nav>

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

      {/* Rodapé */}
      <footer className="mt-8 pt-4 border-t">
        I'm here to stay (Footer)
      </footer>
    </div>
  );
}