const Database = require('better-sqlite3')
const path     = require('path')

const db = new Database(
  path.join(__dirname, '../../data/fup.db'),
  { verbose: process.env.NODE_ENV === 'development' ? console.log : null }
)

// Ativa suporte a chaves estrangeiras (desativado por padrao no SQLite)
db.pragma('foreign_keys = ON')

// Melhora performance de escrita
db.pragma('journal_mode = WAL')

module.exports = db
