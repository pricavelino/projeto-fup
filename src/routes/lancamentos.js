const router = require('express').Router()
const db     = require('../db/database')

// POST /api/lancamentos
router.post('/', (req, res) => {
  const { analista_ref_id, data, quantidade, tipo, lancado_por } = req.body

  if (!analista_ref_id || !data) {
    return res.status(400).json({ erro: 'analista_ref_id e data sao obrigatorios' })
  }

  const tiposValidos = ['normal', 'zero_real', 'feriado', 'ferias', 'falta']
  if (tipo && !tiposValidos.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo invalido. Use: ' + tiposValidos.join(', ') })
  }

  db.prepare(
    'INSERT INTO lancamento (analista_ref_id, data, quantidade, tipo, lancado_por) ' +
    'VALUES (?, ?, ?, ?, ?) ' +
    'ON CONFLICT (analista_ref_id, data) ' +
    'DO UPDATE SET ' +
    '  quantidade  = excluded.quantidade, ' +
    '  tipo        = excluded.tipo, ' +
    '  lancado_em  = CURRENT_TIMESTAMP, ' +
    '  lancado_por = excluded.lancado_por'
  ).run(analista_ref_id, data, quantidade != null ? quantidade : 0, tipo || 'normal', lancado_por || null)

  res.json({ ok: true })
})

// POST /api/lancamentos/lote
// Salva multiplos lancamentos de uma vez (botao Salvar da gaveta)
router.post('/lote', (req, res) => {
  const { lancamentos } = req.body

  if (!Array.isArray(lancamentos) || lancamentos.length === 0) {
    return res.status(400).json({ erro: 'Envie um array de lancamentos' })
  }

  const upsert = db.prepare(
    'INSERT INTO lancamento (analista_ref_id, data, quantidade, tipo, lancado_por) ' +
    'VALUES (?, ?, ?, ?, ?) ' +
    'ON CONFLICT (analista_ref_id, data) ' +
    'DO UPDATE SET ' +
    '  quantidade  = excluded.quantidade, ' +
    '  tipo        = excluded.tipo, ' +
    '  lancado_em  = CURRENT_TIMESTAMP, ' +
    '  lancado_por = excluded.lancado_por'
  )

  const salvarTodos = db.transaction(function(items) {
    items.forEach(function(l) {
      upsert.run(
        l.analista_ref_id,
        l.data,
        l.quantidade != null ? l.quantidade : 0,
        l.tipo || 'normal',
        l.lancado_por || null
      )
    })
  })

  try {
    salvarTodos(lancamentos)
    res.json({ ok: true, total: lancamentos.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao salvar lancamentos', detalhe: err.message })
  }
})

// GET /api/lancamentos?analista_ref_id=N
router.get('/', (req, res) => {
  const { analista_ref_id } = req.query
  if (!analista_ref_id) {
    return res.status(400).json({ erro: 'Informe analista_ref_id' })
  }
  const rows = db.prepare(
    'SELECT data, quantidade, tipo, lancado_em ' +
    'FROM lancamento ' +
    'WHERE analista_ref_id = ? ' +
    'ORDER BY data'
  ).all(analista_ref_id)
  res.json(rows)
})

module.exports = router
