const router = require('express').Router()
const db     = require('../db/database')

// GET /api/grupos/:grupoId/analistas
// Lista analistas de um grupo com todos os lancamentos do periodo
router.get('/grupos/:grupoId/analistas', (req, res) => {
  const analistas = db.prepare(`
    SELECT ar.id, ar.posicoes, ar.du,
           CAST(ar.posicoes AS REAL) / ar.du AS meta_dia,
           a.id   AS analista_id,
           a.nome AS analista_nome
    FROM   analista_referencia ar
    JOIN   analista a ON a.id = ar.analista_id
    WHERE  ar.grupo_id = ?
    ORDER  BY a.nome
  `).all(req.params.grupoId)

  // Para cada analista busca os lancamentos
  const buscarLancamentos = db.prepare(`
    SELECT data, quantidade, tipo, lancado_em
    FROM   lancamento
    WHERE  analista_ref_id = ?
    ORDER  BY data
  `)

  const resultado = analistas.map(a => ({
    ...a,
    lancamentos: buscarLancamentos.all(a.id)
  }))

  res.json(resultado)
})

// PUT /api/analistas-ref/:id
// Atualiza posicoes ou DU de uma alocacao (ex: estender prazo)
router.put('/analistas-ref/:id', (req, res) => {
  const { posicoes, du } = req.body
  db.prepare(`
    UPDATE analista_referencia SET
      posicoes = COALESCE(?, posicoes),
      du       = COALESCE(?, du)
    WHERE id = ?
  `).run(posicoes || null, du || null, req.params.id)
  res.json({ ok: true })
})

// GET /api/analistas
// Lista todos os analistas do pool
router.get('/analistas', (req, res) => {
  const rows = db.prepare('SELECT * FROM analista WHERE ativo = 1 ORDER BY nome').all()
  res.json(rows)
})

module.exports = router
