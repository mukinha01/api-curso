const Database = require('better-sqlite3');

function createDatabase(filename = 'api.sqlite') {
  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS instrutor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS curso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      instrutor_id INTEGER NOT NULL,
      FOREIGN KEY (instrutor_id) REFERENCES instrutor(id) ON DELETE CASCADE
    );
  `);
  return db;
}

module.exports = { createDatabase };