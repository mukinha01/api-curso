const express = require('express');

function createCursosRouter(prisma) {
  const router = express.Router();
  const includeInstrutor = { instrutor: { select: { id: true, nome: true, email: true } } };

  function formatarCurso(curso) {
    return {
      id: curso.id,
      titulo: curso.titulo,
      descricao: curso.descricao,
      instrutor_id: curso.instrutorId,
      instrutor: curso.instrutor,
    };
  }

  router.post('/', async (req, res) => {
    const titulo = req.body.titulo?.trim();
    const descricao = req.body.descricao?.trim();
    const instrutorId = Number(req.body.instrutor_id);
    if (!titulo || !descricao || !Number.isInteger(instrutorId) || instrutorId < 1) {
      return res.status(400).json({ erro: 'titulo, descricao e instrutor_id válido são obrigatórios.' });
    }

    const instrutor = await prisma.instrutor.findUnique({ where: { id: instrutorId } });
    if (!instrutor) return res.status(400).json({ erro: 'instrutor_id não corresponde a um instrutor existente.' });
    const curso = await prisma.curso.create({
      data: { titulo, descricao, instrutor: { connect: { id: instrutorId } } },
      include: includeInstrutor,
    });
    return res.status(201).json(formatarCurso(curso));
  });

  router.get('/', async (_req, res) => {
    const cursos = await prisma.curso.findMany({
      orderBy: { id: 'asc' },
      include: includeInstrutor,
    });
    return res.json(cursos.map(formatarCurso));
  });

  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });
    const curso = await prisma.curso.findUnique({
      where: { id },
      include: includeInstrutor,
    });
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado.' });
    return res.json(formatarCurso(curso));
  });

  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });
    const titulo = req.body.titulo?.trim();
    const descricao = req.body.descricao?.trim();
    const instrutorId = Number(req.body.instrutor_id);
    if (!titulo || !descricao || !Number.isInteger(instrutorId) || instrutorId < 1) {
      return res.status(400).json({ erro: 'titulo, descricao e instrutor_id válido são obrigatórios.' });
    }

    const existente = await prisma.curso.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ erro: 'Curso não encontrado.' });
    const instrutor = await prisma.instrutor.findUnique({ where: { id: instrutorId } });
    if (!instrutor) return res.status(400).json({ erro: 'instrutor_id não corresponde a um instrutor existente.' });
    const curso = await prisma.curso.update({
      where: { id },
      data: { titulo, descricao, instrutor: { connect: { id: instrutorId } } },
      include: includeInstrutor,
    });
    return res.json(formatarCurso(curso));
  });

  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });
    const result = await prisma.curso.deleteMany({ where: { id } });
    if (result.count === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
    return res.status(204).end();
  });

  return router;
}

module.exports = { createCursosRouter };