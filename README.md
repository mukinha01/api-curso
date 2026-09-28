# API de Instrutores e Cursos

API REST construída com Node.js, Express e SQLite. Os cursos pertencem a um instrutor; ao excluir um instrutor, seus cursos também são excluídos.

## Requisitos

- Node.js 20 ou superior
- npm

## Executar

```bash
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`. Para escolher outra porta ou arquivo SQLite, configure `PORT` ou `DATABASE_FILE` antes de iniciar.

## Rotas

| Método | Caminho | Descrição |
| --- | --- | --- |
| POST | `/instrutores` | Cadastra um instrutor |
| GET | `/instrutores` | Lista instrutores com seus cursos |
| GET | `/instrutores/:id` | Busca instrutor e cursos pelo ID |
| PUT | `/instrutores/:id` | Atualiza nome e email |
| DELETE | `/instrutores/:id` | Remove instrutor e cursos vinculados |
| POST | `/cursos` | Cadastra curso vinculado a um instrutor |
| GET | `/cursos` | Lista cursos com dados do instrutor |
| GET | `/cursos/:id` | Busca curso pelo ID |
| PUT | `/cursos/:id` | Atualiza curso e vínculo |
| DELETE | `/cursos/:id` | Remove curso |

Envie e receba JSON. Exemplo para cadastrar instrutor:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com"
}
```

Exemplo para cadastrar curso:

```json
{
  "titulo": "Node.js do Zero",
  "descricao": "Curso introdutório de back-end com Node.js",
  "instrutor_id": 1
}
```

Instrutores precisam ter email único. Campos obrigatórios ausentes retornam `400`, email duplicado retorna `409` e registros inexistentes retornam `404`.

## Testes

```bash
npm test
```