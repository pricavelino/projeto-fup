const router = require("express").Router()
const db     = require("../db/database")

router.get("/projetos/:projetoId/marcos", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM marco WHERE projeto_id = ? ORDER BY inicio_planejado"
  ).all(req.params.projetoId)
  res.json(rows)
})

router.put("/marcos/:id", (req, res) => {
  const { inicio_real, fim_real, concluido, responsavel } = req.body
  db.prepare(
    "UPDATE marco SET inicio_real = COALESCE(?, inicio_real), fim_real = COALESCE(?, fim_real), concluido = COALESCE(?, concluido), responsavel = COALESCE(?, responsavel) WHERE id = ?"
  ).run(inicio_real||null, fim_real||null, concluido!=null?concluido:null, responsavel||null, req.params.id)
  res.json({ ok: true })
})

module.exports = router
