const db = require('./database')

db.exec(`

  -- 1. Projetos
  CREATE TABLE IF NOT EXISTS projeto (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT    NOT NULL,
    referencia    TEXT    NOT NULL,
    periodicidade TEXT,
    observacoes   TEXT,
    criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP,
    entrega_interna DATE,
    entrega_cliente DATE,
    ativo         INTEGER  DEFAULT 1
  );

  -- 2. Grupos de tratamento (MAT, EQP) com periodos independentes
  CREATE TABLE IF NOT EXISTS grupo_tratamento (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    projeto_id    INTEGER NOT NULL,
    sigla         TEXT    NOT NULL,
    nome          TEXT,
    inicio        DATE    NOT NULL,
    fim_planejado DATE    NOT NULL,
    du_padrao     INTEGER,
    FOREIGN KEY (projeto_id) REFERENCES projeto(id)
  );

  -- 3. Pool de analistas da organizacao
  CREATE TABLE IF NOT EXISTS analista (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL,
    login TEXT UNIQUE,
    ativo INTEGER DEFAULT 1
  );

  -- 4. Alocacao de analista em grupo por referencia
  --    Posicoes e DU definidos pela gestora a cada ciclo
  CREATE TABLE IF NOT EXISTS analista_referencia (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo_id    INTEGER NOT NULL,
    analista_id INTEGER NOT NULL,
    posicoes    INTEGER NOT NULL,
    du          INTEGER NOT NULL,
    FOREIGN KEY (grupo_id)    REFERENCES grupo_tratamento(id),
    FOREIGN KEY (analista_id) REFERENCES analista(id),
    UNIQUE (grupo_id, analista_id)
  );

  -- 5. Producao diaria registrada por analista
  --    UNIQUE garante 1 lancamento por analista por dia
  --    ON CONFLICT permite upsert (lanc. retroativo e correcao)
  CREATE TABLE IF NOT EXISTS lancamento (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    analista_ref_id INTEGER  NOT NULL,
    data            DATE     NOT NULL,
    quantidade      INTEGER  NOT NULL DEFAULT 0,
    tipo            TEXT     NOT NULL DEFAULT 'normal',
    lancado_em      DATETIME DEFAULT CURRENT_TIMESTAMP,
    lancado_por     INTEGER,
    FOREIGN KEY (analista_ref_id) REFERENCES analista_referencia(id),
    FOREIGN KEY (lancado_por)     REFERENCES analista(id),
    UNIQUE (analista_ref_id, data)
  );

  -- 6. Feriados coletivos e ausencias individuais
  --    analista_ref_id NULL = feriado coletivo (todos os analistas)
  --    analista_ref_id preenchido = ausencia individual
  CREATE TABLE IF NOT EXISTS indisponibilidade (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    projeto_id      INTEGER NOT NULL,
    analista_ref_id INTEGER,
    data            DATE    NOT NULL,
    tipo            TEXT    NOT NULL,
    observacao      TEXT,
    FOREIGN KEY (projeto_id)      REFERENCES projeto(id),
    FOREIGN KEY (analista_ref_id) REFERENCES analista_referencia(id)
  );

  -- 7. Marcos do cronograma
  CREATE TABLE IF NOT EXISTS marco (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    projeto_id       INTEGER NOT NULL,
    nome             TEXT    NOT NULL,
    inicio_planejado DATE,
    fim_planejado    DATE,
    inicio_real      DATE,
    fim_real         DATE,
    responsavel      TEXT,
    concluido        INTEGER DEFAULT 0,
    FOREIGN KEY (projeto_id) REFERENCES projeto(id)
  );

  -- 8. Limiares de alerta configurados por projeto
  CREATE TABLE IF NOT EXISTS limiar_alerta (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    projeto_id INTEGER NOT NULL,
    status     TEXT    NOT NULL,
    pct_min    REAL,
    pct_max    REAL,
    FOREIGN KEY (projeto_id) REFERENCES projeto(id)
  );

`)

// Adiciona colunas de entrega se ainda nao existem (banco ja criado)
try { db.exec('ALTER TABLE projeto ADD COLUMN entrega_interna DATE') } catch(e) {}
try { db.exec('ALTER TABLE projeto ADD COLUMN entrega_cliente DATE') } catch(e) {}

console.log('Banco de dados inicializado com sucesso.')
console.log('Tabelas criadas: projeto, grupo_tratamento, analista,')
console.log('                 analista_referencia, lancamento,')
console.log('                 indisponibilidade, marco, limiar_alerta')

module.exports = db
