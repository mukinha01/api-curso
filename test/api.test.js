const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createApp } = require('../src/app');
const { createDatabase } = require('../src/database');

test('gerencia instrutores e cursos com vínculo relacional', async (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'api-cursos-'));
  const db = createDatabase(path.join(directory, 'test.sqlite'));
  const server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = async (url, options) => {
    const response = await fetch(`${baseUrl}${url}`, options);
    return { response, body: response.status === 204 ? null : await response.json() };
  };

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  });

  const json = (method, body) => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const criadoInstrutor = await request('/instrutores', json('POST', { nome: 'Ana Silva', email: 'ana@example.com' }));
  assert.equal(criadoInstrutor.response.status, 201);
  const instrutorId = criadoInstrutor.body.id;

  const criadoCurso = await request('/cursos', json('POST', {
    titulo: 'Node.js do Zero',
    descricao: 'Curso introdutório de back-end com Node.js',
    instrutor_id: instrutorId,
  }));
  assert.equal(criadoCurso.response.status, 201);
  assert.equal(criadoCurso.body.instrutor.id, instrutorId);

  const atualizadoCurso = await request(`/cursos/${criadoCurso.body.id}`, json('PUT', {
    titulo: 'Node.js Avançado',
    descricao: 'Curso de back-end com Node.js',
    instrutor_id: instrutorId,
  }));
  assert.equal(atualizadoCurso.response.status, 200);
  assert.equal(atualizadoCurso.body.titulo, 'Node.js Avançado');

  const atualizadoInstrutor = await request(`/instrutores/${instrutorId}`, json('PUT', {
    nome: 'Ana Souza', email: 'ana.souza@example.com',
  }));
  assert.equal(atualizadoInstrutor.response.status, 200);
  assert.equal(atualizadoInstrutor.body.nome, 'Ana Souza');

  const buscaInstrutor = await request(`/instrutores/${instrutorId}`);
  assert.equal(buscaInstrutor.body.cursos.length, 1);
  assert.equal(buscaInstrutor.body.cursos[0].titulo, 'Node.js Avançado');

  const buscaCursos = await request('/cursos');
  assert.equal(buscaCursos.body.length, 1);
  const emailDuplicado = await request('/instrutores', json('POST', { nome: 'Outra Ana', email: 'ana.souza@example.com' }));
  assert.equal(emailDuplicado.response.status, 409);

  const cursoOrfao = await request('/cursos', json('POST', {
    titulo: 'Inválido', descricao: 'Instrutor inexistente', instrutor_id: 999,
  }));
  assert.equal(cursoOrfao.response.status, 400);

  const excluido = await request(`/instrutores/${instrutorId}`, { method: 'DELETE' });
  assert.equal(excluido.response.status, 204);
  assert.deepEqual((await request('/cursos')).body, []);
});