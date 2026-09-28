const express = require('express');
const { createInstrutoresRouter } = require('./routes/instrutores');
const { createCursosRouter } = require('./routes/cursos');

function createApp(prisma) {
  const app = express();
  app.use(express.json());
  app.use('/instrutores', createInstrutoresRouter(prisma));
  app.use('/cursos', createCursosRouter(prisma));

  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use((error, _req, res, _next) => {
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe um instrutor com este email.' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ erro: 'instrutor_id não corresponde a um instrutor existente.' });
    }
    if (error.code === 'P2025') return res.status(404).json({ erro: 'Registro não encontrado.' });
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ erro: 'JSON inválido.' });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  });

  return app;
}

module.exports = { createApp };