const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    logger.db(`Query: ${e.query}`, `Duration: ${e.duration}ms`);
  });
}

// Log database errors
prisma.$on('error', (e) => {
  logger.error('Database Error', e);
});

// Log database info
prisma.$on('info', (e) => {
  logger.db(e.message);
});

// Log database warnings
prisma.$on('warn', (e) => {
  logger.warning('Database Warning', e.message);
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    logger.success('Database connected successfully', 'Prisma client initialized');
  })
  .catch((error) => {
    logger.error('Failed to connect to database', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

module.exports = prisma;
