const { createApp } = require('./app');
const { createDatabase } = require('./database');

const port = Number(process.env.PORT) || 3000;
const db = createDatabase(process.env.DATABASE_FILE || 'api.sqlite');
const server = createApp(db).listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});

function encerrar() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);