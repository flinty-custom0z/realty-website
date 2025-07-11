// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Connection pool configuration for better performance
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Ensure single instance across hot reloads in development
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Middleware to log slow queries in production
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  // Log queries taking more than 1 second
  if (after - before > 1000) {
    console.warn(`Slow query (${after - before}ms):`, {
      model: params.model,
      action: params.action,
    });
  }
  
  return result;
});

export default prisma;
