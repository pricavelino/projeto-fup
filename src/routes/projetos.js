const router = require('express').Router()
const db     = require('../db/database')

// GET /api/projetos
// Lista todos os projetos ativos com seus grupos
router.get('/', (req, res) => {
  const projetos = db.prepare(`
    SELECT p.*,
           COUNT(DISTINCT g.id) as total_grupos
    FROM   projeto p
    LEFT JOIN grupo_tratamento g ON g.projeto_id = p.id
    WHERE  p.ativo = 1
    GROUP  BY p.id
    ORDER  BY p.criado_em DESC
  `).all()
  res.json(projetos)
})

// GET /api/projetos/:id
// Retorna um projeto com seus grupos e limiares
router.get('/:id', (req, res) => {
  const projeto = db.prepare('SELECT * FROM projeto WHERE id = ?').get(req.params.id)
  if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' })

  const grupos = db.prepare(`
    SELECT * FROM grupo_tratamento WHERE projeto_id = ? ORDER BY sigla
  `).all(req.params.id)

  const limiares = db.prepare(`
    SELECT * FROM limiar_alerta WHERE projeto_id = ? ORDER BY pct_min DESC
  `).all(req.params.id)

  res.json({ ...projeto, grupos, limiares })
})

// POST /api/projetos
// Cria um novo projeto com grupos, marcos e limiares
router.post('/', (req, res) => {
  const { nome, referencia, periodicidade, observacoes, grupos, marcos, limiares } = req.body

  if (!nome || !referencia) {
    return res.status(400).json({ erro: 'Nome e referência são obrigatórios' })
  }

  // Usa transacao para garantir que tudo é criado junto ou nada
  const criar = db.transaction(() => {
    const { lastInsertRowid: projetoId } = db.prepare(`
      INSERT INTO projeto (nome, referencia, periodicidade, observacoes)
      VALUES (?, ?, ?, ?)
    `).run(nome, referencia, periodicidade || null, observacoes || null)

    // Limiares padrão se não forem enviados
    const limiaresFinal = limiares || [
      { status: 'ok',      pct_min: 0.8,  pct_max: null },
      { status: 'atencao', pct_min: 0.5,  pct_max: 0.8  },
      { status: 'atrasado',pct_min: null, pct_max: 0.5  },
    ]
    const insLimiar = db.prepare(`
      INSERT INTO limiar_alerta (projeto_id, status, pct_min, pct_max)
      VALUES (?, ?, ?, ?)
    `)
    limiaresFinal.forEach(l => insLimiar.run(projetoId, l.status, l.pct_min, l.pct_max))

    // Grupos (MAT, EQP etc.)
    if (grupos && grupos.length > 0) {
      const insGrupo = db.prepare(`
        INSERT INTO grupo_tratamento (projeto_id, sigla, nome, inicio, fim_planejado, du_padrao)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      const insAnalista = db.prepare(`
        INSERT OR IGNORE INTO analista (nome) VALUES (?)
      `)
      const insRef = db.prepare(`
        INSERT INTO analista_referencia (grupo_id, analista_id, posicoes, du)
        VALUES (?, ?, ?, ?)
      `)

      grupos.forEach(g => {
        const { lastInsertRowid: grupoId } = insGrupo.run(
          projetoId, g.sigla, g.nome, g.inicio, g.fim_planejado, g.du_padrao || null
        )
        if (g.analistas && g.analistas.length > 0) {
          g.analistas.forEach(a => {
            insAnalista.run(a.nome)
            const analistaRow = db.prepare('SELECT id FROM analista WHERE nome = ?').get(a.nome)
            insRef.run(grupoId, analistaRow.id, a.posicoes, a.du)
          })
        }
      })
    }

    // Marcos do cronograma
    if (marcos && marcos.length > 0) {
      const insMarco = db.prepare(`
        INSERT INTO marco (projeto_id, nome, inicio_planejado, fim_planejado, responsavel)
        VALUES (?, ?, ?, ?, ?)
      `)
      marcos.forEach(m => insMarco.run(projetoId, m.nome, m.inicio_planejado, m.fim_planejado, m.responsavel || null))
    }

    return projetoId
  })

  try {
    const id = criar()
    res.json({ id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao criar projeto', detalhe: err.message })
  }
})

// PUT /api/projetos/:id
// Atualiza dados do projeto
router.put('/:id', (req, res) => {
  const { nome, referencia, periodicidade, observacoes, ativo } = req.body
  db.prepare(`
    UPDATE projeto SET
      nome          = COALESCE(?, nome),
      referencia    = COALESCE(?, referencia),
      periodicidade = COALESCE(?, periodicidade),
      observacoes   = COALESCE(?, observacoes),
      ativo         = COALESCE(?, ativo)
    WHERE id = ?
  `).run(nome, referencia, periodicidade, observacoes, ativo, req.params.id)
  res.json({ ok: true })
})

module.exports = router
