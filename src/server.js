const { createApp } = require('./app');
const { createPrismaClient } = require('./database');

const port = Number(process.env.PORT) || 3000;
const prisma = createPrismaClient();
const server = createApp(prisma).listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});

function encerrar() {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);