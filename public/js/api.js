const API = {

  async get(rota) {
    const res = await fetch(rota)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async post(rota, dados) {
    const res = await fetch(rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async put(rota, dados) {
    const res = await fetch(rota, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  projetos: {
    listar:     ()        => API.get('/api/projetos'),
    buscar:     (id)      => API.get('/api/projetos/' + id),
    criar:      (dados)   => API.post('/api/projetos', dados),
    atualizar:  (id, d)   => API.put('/api/projetos/' + id, d)
  },

  analistas: {
    porGrupo:     (gid)    => API.get('/api/grupos/' + gid + '/analistas'),
    atualizarRef: (id, d)  => API.put('/api/analistas-ref/' + id, d)
  },

  lancamentos: {
    salvar: (dados) => API.post('/api/lancamentos', dados),
    lote:   (lista) => API.post('/api/lancamentos/lote', { lancamentos: lista }),
    buscar: (refId) => API.get('/api/lancamentos?analista_ref_id=' + refId)
  },

  marcos: {
    porProjeto: (pid)    => API.get('/api/projetos/' + pid + '/marcos'),
    atualizar:  (id, d)  => API.put('/api/marcos/' + id, d)
  }

}
