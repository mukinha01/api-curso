const express = require('express');

function createInstrutoresRouter(db) {
  const router = express.Router();

  router.post('/', (req, res) => {
    const nome = req.body.nome?.trim();
    const email = req.body.email?.trim();
    if (!nome || !email) {
      return res.status(400).json({ erro: 'nome e email são obrigatórios.' });
    }

    const result = db.prepare('INSERT INTO instrutor (nome, email) VALUES (?, ?)').run(nome, email);
    const instrutor = db.prepare('SELECT id, nome, email FROM instrutor WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ ...instrutor, cursos: [] });
  });

  router.get('/', (_req, res) => {
    const instrutores = db.prepare('SELECT id, nome, email FROM instrutor ORDER BY id').all();
    const cursos = db.prepare('SELECT id, titulo, descricao, instrutor_id FROM curso ORDER BY id').all();
    const cursosPorInstrutor = new Map();
    for (const curso of cursos) {
      const { instrutor_id, ...dadosCurso } = curso;
      if (!cursosPorInstrutor.has(instrutor_id)) cursosPorInstrutor.set(instrutor_id, []);
      cursosPorInstrutor.get(instrutor_id).push(dadosCurso);
    }
    return res.json(instrutores.map((instrutor) => ({
      ...instrutor,
      cursos: cursosPorInstrutor.get(instrutor.id) || [],
    })));
  });

  router.get('/:id', (req, res) => {
    const instrutor = db.prepare('SELECT id, nome, email FROM instrutor WHERE id = ?').get(req.params.id);
    if (!instrutor) return res.status(404).json({ erro: 'Instrutor não encontrado.' });
    const cursos = db.prepare('SELECT id, titulo, descricao FROM curso WHERE instrutor_id = ? ORDER BY id').all(instrutor.id);
    return res.json({ ...instrutor, cursos });
  });

  router.put('/:id', (req, res) => {
    const nome = req.body.nome?.trim();
    const email = req.body.email?.trim();
    if (!nome || !email) {
      return res.status(400).json({ erro: 'nome e email são obrigatórios.' });
    }

    const result = db.prepare('UPDATE instrutor SET nome = ?, email = ? WHERE id = ?').run(nome, email, req.params.id);
    if (result.changes === 0) return res.status(404).json({ erro: 'Instrutor não encontrado.' });
    const instrutor = db.prepare('SELECT id, nome, email FROM instrutor WHERE id = ?').get(req.params.id);
    const cursos = db.prepare('SELECT id, titulo, descricao FROM curso WHERE instrutor_id = ? ORDER BY id').all(instrutor.id);
    return res.json({ ...instrutor, cursos });
  });

  router.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM instrutor WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ erro: 'Instrutor não encontrado.' });
    return res.status(204).end();
  });

  return router;
}

module.exports = { createInstrutoresRouter };