const express = require('express');

function createCursosRouter(db) {
  const router = express.Router();
  const cursoSelect = `
    SELECT curso.id, curso.titulo, curso.descricao, curso.instrutor_id,
           instrutor.id AS instrutor_detalhe_id,
           instrutor.nome AS instrutor_nome,
           instrutor.email AS instrutor_email
    FROM curso
    JOIN instrutor ON instrutor.id = curso.instrutor_id
  `;

  function formatarCurso(curso) {
    return {
      id: curso.id,
      titulo: curso.titulo,
      descricao: curso.descricao,
      instrutor_id: curso.instrutor_id,
      instrutor: {
        id: curso.instrutor_detalhe_id,
        nome: curso.instrutor_nome,
        email: curso.instrutor_email,
      },
    };
  }

  router.post('/', (req, res) => {
    const titulo = req.body.titulo?.trim();
    const descricao = req.body.descricao?.trim();
    const instrutorId = Number(req.body.instrutor_id);
    if (!titulo || !descricao || !Number.isInteger(instrutorId) || instrutorId < 1) {
      return res.status(400).json({ erro: 'titulo, descricao e instrutor_id válido são obrigatórios.' });
    }

    const result = db.prepare('INSERT INTO curso (titulo, descricao, instrutor_id) VALUES (?, ?, ?)')
      .run(titulo, descricao, instrutorId);
    const curso = db.prepare(`${cursoSelect} WHERE curso.id = ?`).get(result.lastInsertRowid);
    return res.status(201).json(formatarCurso(curso));
  });

  router.get('/', (_req, res) => {
    const cursos = db.prepare(`${cursoSelect} ORDER BY curso.id`).all();
    return res.json(cursos.map(formatarCurso));
  });

  router.get('/:id', (req, res) => {
    const curso = db.prepare(`${cursoSelect} WHERE curso.id = ?`).get(req.params.id);
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado.' });
    return res.json(formatarCurso(curso));
  });

  router.put('/:id', (req, res) => {
    const titulo = req.body.titulo?.trim();
    const descricao = req.body.descricao?.trim();
    const instrutorId = Number(req.body.instrutor_id);
    if (!titulo || !descricao || !Number.isInteger(instrutorId) || instrutorId < 1) {
      return res.status(400).json({ erro: 'titulo, descricao e instrutor_id válido são obrigatórios.' });
    }

    const result = db.prepare('UPDATE curso SET titulo = ?, descricao = ?, instrutor_id = ? WHERE id = ?')
      .run(titulo, descricao, instrutorId, req.params.id);
    if (result.changes === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
    const curso = db.prepare(`${cursoSelect} WHERE curso.id = ?`).get(req.params.id);
    return res.json(formatarCurso(curso));
  });

  router.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM curso WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
    return res.status(204).end();
  });

  return router;
}

module.exports = { createCursosRouter };