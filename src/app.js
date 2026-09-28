const express = require('express');
const { createInstrutoresRouter } = require('./routes/instrutores');
const { createCursosRouter } = require('./routes/cursos');

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use('/instrutores', createInstrutoresRouter(db));
  app.use('/cursos', createCursosRouter(db));

  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use((error, _req, res, _next) => {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ erro: 'Já existe um instrutor com este email.' });
    }
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ erro: 'instrutor_id não corresponde a um instrutor existente.' });
    }
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ erro: 'JSON inválido.' });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  });

  return app;
}

module.exports = { createApp };