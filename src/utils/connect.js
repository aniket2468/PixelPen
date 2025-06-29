import { PrismaClient } from '@prisma/client'

// Optimized Prisma configuration for 10k+ users
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configure connection pooling for high concurrency
    __internal: {
      engine: {
        connection_limit: process.env.NODE_ENV === 'production' ? 25 : 5,
        pool_timeout: 10,
      },
    },
  });
};

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, create a single instance
  prisma = createPrismaClient();
} else {
  // In development, use globalThis to avoid creating multiple instances during HMR
  if (!globalThis.prisma) {
    globalThis.prisma = createPrismaClient();
  }
  prisma = globalThis.prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('Closing database connection...');
  await prisma.$disconnect();
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;