import { PrismaClient } from '@prisma/client';

// Adiciona Prisma ao objeto global do NodeJS para evitar múltiplas instâncias em dev
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 