const express = require('express');

function createInstrutoresRouter(prisma) {
  const router = express.Router();
  const includeCursos = { cursos: { select: { id: true, titulo: true, descricao: true } } };

  router.post('/', async (req, res) => {
    const nome = req.body.nome?.trim();
    const email = req.body.email?.trim();
    if (!nome || !email) {
      return res.status(400).json({ erro: 'nome e email são obrigatórios.' });
    }

    const instrutor = await prisma.instrutor.create({
      data: { nome, email },
      include: includeCursos,
    });
    return res.status(201).json(instrutor);
  });

  router.get('/', async (_req, res) => {
    const instrutores = await prisma.instrutor.findMany({
      orderBy: { id: 'asc' },
      include: includeCursos,
    });
    return res.json(instrutores);
  });

  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });
    const instrutor = await prisma.instrutor.findUnique({
      where: { id },
      include: includeCursos,
    });
    if (!instrutor) return res.status(404).json({ erro: 'Instrutor não encontrado.' });
    return res.json(instrutor);
  });

  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });
    const nome = req.body.nome?.trim();
    const email = req.body.email?.trim();
    if (!nome || !email) {
      return res.status(400).json({ erro: 'nome e email são obrigatórios.' });
    }

    const existente = await prisma.instrutor.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ erro: 'Instrutor não encontrado.' });
    const instrutor = await prisma.instrutor.update({
      where: { id },
      data: { nome, email },
      include: includeCursos,
    });
    return res.json(instrutor);
  });

  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });
    const result = await prisma.instrutor.deleteMany({ where: { id } });
    if (result.count === 0) return res.status(404).json({ erro: 'Instrutor não encontrado.' });
    return res.status(204).end();
  });

  return router;
}

module.exports = { createInstrutoresRouter };