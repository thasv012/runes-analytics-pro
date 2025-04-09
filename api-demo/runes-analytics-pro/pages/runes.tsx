import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { PrismaClient, RuneToken } from '@prisma/client';
import { prisma } from 'src/lib/prisma'; // Usando caminho relativo de baseUrl
import Layout from 'src/components/Layout';

// Tipagem para os dados que virão do getServerSideProps
interface RunesPageProps {
  runes: RuneToken[];
  error?: string | null;
}

// Tipagem esperada da resposta da API da Magic Eden (baseado na documentação)
interface MagicEdenRune {
  id: string;
  name: string;
  spacedName: string;
  block: number;
  timestamp: number;
  txid: string;
  number: number;
  symbol: string;
  decimals: number;
  totalSupply: string; // A API retorna como string, o que é bom para nós
}

interface MagicEdenApiResponse {
  runes: MagicEdenRune[];
  total: number; // Total de runes encontrados (para paginação futura)
}

export const getServerSideProps: GetServerSideProps<RunesPageProps> = async (context) => {
  let fetchedRunes: RuneToken[] = [];
  let errorMessage: string | undefined;
  const apiKey = process.env.MAGIC_EDEN_API_KEY;

  if (!apiKey) {
    console.error("MAGIC_EDEN_API_KEY not found in environment variables.");
    errorMessage = "API Key for Magic Eden is missing. Please configure it in .env";
    return {
      props: { runes: [], error: errorMessage ?? null },
    };
  }

  try {
    // 1. Buscar dados da API da Magic Eden
    console.log("Fetching data from Magic Eden API...");
    const apiUrl = 'https://api-mainnet.magiceden.dev/v2/ord/runes?limit=50'; // Buscar 50 inicialmente
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Magic Eden: ${response.status} ${response.statusText}`);
    }

    const apiData: MagicEdenApiResponse = await response.json();
    console.log(`Received ${apiData.runes.length} runes from API (total: ${apiData.total}).`);

    // 2. Salvar/atualizar no DB usando os dados da API
    console.log("Upserting data from API into database...");
    for (const apiRune of apiData.runes) {
      // Mapeamento cuidadoso dos campos da API para o nosso schema
      await prisma.runeToken.upsert({
        where: { ticker: apiRune.symbol }, // Usar o 'symbol' da API como nosso 'ticker'
        update: { 
          name: apiRune.name,
          decimals: apiRune.decimals,
          block: apiRune.block,
          supply: apiRune.totalSupply, // API já fornece como string
          etchTxId: apiRune.txid,
          // Campos não fornecidos pela API ficam como estão (ou null se era create)
        },
        create: { 
          ticker: apiRune.symbol,
          name: apiRune.name,
          decimals: apiRune.decimals,
          block: apiRune.block,
          supply: apiRune.totalSupply,
          etchTxId: apiRune.txid,
          // Campos não fornecidos pela API serão null por padrão (pois são opcionais no schema)
          limitPerMint: null,
          remaining: null,
          holders: null,
          txCount: null,
        },
      });
    }
    console.log("Upsert complete.");

    // 3. Buscar todos os Runes do banco de dados para exibir
    fetchedRunes = await prisma.runeToken.findMany({
      orderBy: {
        ticker: 'asc', // Ordenar por ticker
      },
      take: 50, // Limitar a exibição aos 50 buscados da API por enquanto
    });
    console.log(`Fetched ${fetchedRunes.length} runes from database to display.`);

  } catch (error: any) {
    console.error("Error in getServerSideProps for /runes:", error);
    errorMessage = `Failed to process rune data. Check server logs. Error: ${error?.message || 'Unknown error'}`;
  }

  return {
    props: {
      runes: JSON.parse(JSON.stringify(fetchedRunes)), 
      error: errorMessage ?? null, 
    },
  };
};

// Componente da página
export default function RunesPage({ runes, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Runes List (from Magic Eden API)</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {runes.length === 0 && !error && (
        <p>No Rune data found in the database or fetched from API.</p>
      )}

      {runes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticker</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Decimals</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Block</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supply</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holders</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">TX Count</th>
                {/* Adicione mais cabeçalhos conforme necessário */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
              {runes.map((rune) => (
                <tr key={rune.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rune.ticker}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rune.decimals}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rune.block ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rune.supply ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rune.holders ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rune.txCount ?? 'N/A'}</td>
                  {/* Adicione mais células conforme necessário */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
} 