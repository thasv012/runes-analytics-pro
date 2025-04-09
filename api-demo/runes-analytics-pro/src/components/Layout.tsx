import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  
  // Determina qual link está ativo com base na rota atual
  const isActive = (pathname: string) => {
    return router.pathname === pathname ? 'bg-gray-200 dark:bg-gray-700' : '';
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      {/* Navegação */}
      <nav className="mb-4">
        <Link href="/" className={`mr-2 p-1 border border-transparent hover:border-gray-300 ${isActive('/')}`}>
          Home
        </Link> |
        <Link href="/runes" className={`ml-2 mr-2 p-1 border border-transparent hover:border-gray-300 ${isActive('/runes')}`}>
          Runes List
        </Link> |
        <Link href="/gamification" className={`ml-2 mr-2 p-1 border border-transparent hover:border-gray-300 ${isActive('/gamification')}`}>
          Gamificação
        </Link> |
        <Link href="/about" className={`ml-2 mr-2 p-1 border border-transparent hover:border-gray-300 ${isActive('/about')}`}>
          About
        </Link> |
        <Link href="/api/users" className={`ml-2 p-1 border border-transparent hover:border-gray-300 ${isActive('/api/users')}`}>
          Users API
        </Link>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Rodapé */}
      <footer className="mt-8 pt-4 border-t text-center text-gray-500 dark:text-gray-400">
        <p>RUNES Analytics Pro - Plataforma de Análise para Tokens Runes</p>
        <p className="text-sm mt-1">© {new Date().getFullYear()} - Desenvolvido com ♥</p>
      </footer>
    </div>
  );
};

export default Layout; 