// Estado global
let projetos     = []
let projetoAtivo = null
let grupoAtivo   = null
let analistaDrawer = null

// Inicializa ao carregar a pagina
window.addEventListener('load', iniciar)

async function iniciar() {
  try {
    projetos = await API.projetos.listar()
    renderSidebar()
    if (projetos.length > 0) carregarProjeto(projetos[0].id)
  } catch (err) {
    console.error('Erro ao carregar projetos:', err)
  }
}

// ─── SIDEBAR ────────────────────────────────────────────────────────────────

function renderSidebar() {
  const lista = document.getElementById('proj-list')
  lista.innerHTML = ''

  if (projetos.length === 0) {
    lista.innerHTML = '<div style="padding:14px;font-size:11px;color:#aaa">Nenhum projeto cadastrado</div>'
    return
  }

  projetos.forEach(p => {
    const pct    = calcPctProjeto(p)
    const label  = p._dayAtual === 0 ? '—' : Math.round(pct * 100) + '%'
    const cls    = p._dayAtual === 0 ? 'badge-init' : badgeClass(pct)
    const div    = document.createElement('div')
    div.className = 'proj-item' + (projetoAtivo && projetoAtivo.id === p.id ? ' active' : '')
    div.innerHTML = `<span class="proj-name">${p.nome}</span><span class="proj-badge ${cls}">${label}</span>`
    div.onclick = () => carregarProjeto(p.id)
    lista.appendChild(div)
  })
}

function calcPctProjeto(p) {
  if (!p._grupos) return 0
  let real = 0, esp = 0
  p._grupos.forEach(g => {
    if (!g._analistas) return
    g._analistas.forEach(a => {
      const r = somarReal(a, p._dayAtual || 0)
      const e = Math.round((a.quantidade / a.du) * (p._dayAtual || 0))
      real += r; esp += e
    })
  })
  return esp > 0 ? real / esp : 0
}

function badgeClass(pct) {
  if (pct >= 1)   return 'badge-done'
  if (pct >= 0.8) return 'badge-ok'
  if (pct >= 0.5) return 'badge-warn'
  return 'badge-bad'
}

// ─── CARREGAR PROJETO ────────────────────────────────────────────────────────

async function carregarProjeto(id) {
  try {
    const p = await API.projetos.buscar(id)
    projetoAtivo = p

    // Busca analistas de cada grupo
    if (p.grupos && p.grupos.length > 0) {
      p._grupos = await Promise.all(
        p.grupos.map(async g => {
          const analistas = await API.analistas.porGrupo(g.id)
          // Banco retorna "posicoes" — normaliza para "quantidade"
          const normalizados = analistas.map(a => ({ ...a, quantidade: a.posicoes }))
          return { ...g, _analistas: normalizados }
        })
      )
    } else {
      p._grupos = []
    }

    // Define o dia atual como o maior DU do projeto
    const duMax = p._grupos.reduce((m, g) => {
      const duGrupo = g._analistas ? Math.max(...g._analistas.map(a => a.du), 0) : 0
      return Math.max(m, duGrupo)
    }, 1)
    p._dayAtual = duMax
    p._duMax    = duMax

    // Atualiza o projeto no array global (para sidebar)
    const idx = projetos.findIndex(x => x.id === id)
    if (idx >= 0) projetos[idx] = { ...projetos[idx], ...p }

    renderHeader(p)
    recalcular()
    renderSidebar()
  } catch (err) {
    console.error('Erro ao carregar projeto:', err)
  }
}

// ─── HEADER ─────────────────────────────────────────────────────────────────

function renderHeader(p) {
  document.getElementById('proj-titulo').textContent = p.nome
  document.getElementById('proj-ref').textContent    = p.referencia || ''
  document.getElementById('proj-fase').textContent   = p.periodicidade || ''

  const fmtData = d => {
    if (!d) return null
    const dt = new Date(d + 'T12:00:00')
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  const elInt = document.getElementById('proj-entrega-interna')
  const elCli = document.getElementById('proj-entrega-cliente')

  if (p.entrega_interna) {
    elInt.style.display = 'flex'
    elInt.className = 'fup-entrega interna'
    elInt.innerHTML = '<span class="fup-entrega-label">Entrega interna</span><span class="fup-entrega-data">' + fmtData(p.entrega_interna) + '</span>'
  } else {
    elInt.style.display = 'none'
  }

  if (p.entrega_cliente) {
    elCli.style.display = 'flex'
    elCli.className = 'fup-entrega cliente'
    elCli.innerHTML = '<span class="fup-entrega-label">Entrega cliente</span><span class="fup-entrega-data">' + fmtData(p.entrega_cliente) + '</span>'
  } else {
    elCli.style.display = 'none'
  }

  const inpDia = document.getElementById('inp-dia')
  inpDia.max   = p._duMax || 30
  inpDia.value = p._dayAtual || 1
  document.getElementById('total-du').textContent = '/ ' + (p._duMax || '—') + ' DU'
}

// ─── RECALCULAR ──────────────────────────────────────────────────────────────

function recalcular() {
  if (!projetoAtivo || !projetoAtivo._grupos) return

  const dia = parseInt(document.getElementById('inp-dia').value) || 1
  projetoAtivo._dayAtual = dia

  let tPos = 0, tReal = 0, tEsp = 0
  projetoAtivo._grupos.forEach(g => {
    if (!g._analistas) return
    g._analistas.forEach(a => {
      tPos += a.quantidade
      tReal += somarReal(a, dia)
      tEsp  += Math.round((a.quantidade / a.du) * dia)
    })
  })

  const duRest = Math.max(0, (projetoAtivo._duMax || 0) - dia)
  const saldo  = tReal - tEsp

  document.getElementById('c-total').textContent    = tPos.toLocaleString('pt-BR')
  document.getElementById('c-real').textContent     = tReal.toLocaleString('pt-BR')
  document.getElementById('c-pct-real').textContent = tPos > 0 ? (tReal/tPos*100).toFixed(1) + '%' : '—'
  document.getElementById('c-esp').textContent      = tEsp.toLocaleString('pt-BR')
  document.getElementById('c-pct-alc').textContent  = tEsp > 0 ? (tReal/tEsp*100).toFixed(1) + 'Desempenho' : '—'
  document.getElementById('c-du-rest').textContent  = duRest
  document.getElementById('c-saldo').textContent    = (saldo >= 0 ? '+' : '') + saldo.toLocaleString('pt-BR') + ' saldo'

  renderTabelas(dia)
  renderSidebar()
}

// ─── TABELAS ─────────────────────────────────────────────────────────────────

function renderTabelas(dia) {
  const container = document.getElementById('tbl-container')
  const vazio     = document.getElementById('estado-vazio')

  if (!projetoAtivo._grupos || projetoAtivo._grupos.length === 0) {
    vazio.style.display = 'flex'
    return
  }
  vazio.style.display = 'none'
  container.innerHTML = ''

  projetoAtivo._grupos.forEach(g => {
    const isMat    = g.sigla === 'MAT'
    const clsSec   = isMat ? 'sec-mat' : 'sec-eqp'
    const clsCard  = isMat ? 'card-mat' : 'card-eqp'
    // Cor harmonica da barra por equipe
    const corBarra = isMat
      ? { ok: '#668040', warn: '#A89050', bad: '#C47840' }  // tons oliva
      : { ok: '#2B8671', warn: '#4A9B88', bad: '#7ABFB4' }  // tons turquesa
    g._corBarra = corBarra
    const statsGrupo = calcStatsGrupo(g, dia)

    // Secao com cards internos
    const sec = document.createElement('div')

    // Status da equipe para o card semaforo
    const pctEquipe  = statsGrupo.totalEsp > 0 ? statsGrupo.totalReal / statsGrupo.totalEsp : 1
    const semStatus  = statsGrupo.falta <= 0 ? 'Concluido' : pctEquipe >= 0.8 ? 'No prazo' : pctEquipe >= 0.5 ? 'Atencao' : 'Atrasado'
    const semCls     = statsGrupo.falta <= 0 ? 'done' : pctEquipe >= 0.8 ? 'ok' : pctEquipe >= 0.5 ? 'warn' : 'bad'
    const semCorCard = { done:'#E6F1FB', ok:'#EAF3DE', warn:'#FAEEDA', bad:'#FCEBEB' }[semCls]
    const semCorTxt  = { done:'#0C447C', ok:'#27500A', warn:'#633806', bad:'#791F1F' }[semCls]
    const semCorBord = { done:'#008BC9', ok:'#639922', warn:'#EF9F27', bad:'#E24B4A' }[semCls]
    const semBolinha = { done:'#378ADD', ok:'#639922', warn:'#EF9F27', bad:'#E24B4A' }[semCls]

    sec.innerHTML = `
      <div class="sec-bar ${clsSec}">
        <span>${g.nome || g.sigla}</span>
        <div style="display:flex;gap:12px;align-items:center">
          <span class="sec-bar-info">
            Media de dias trabalhados: ${statsGrupo.mediaDias} de ${statsGrupo.disponiveis} DU (${statsGrupo.pctDias}% aproveitamento)
          </span>
          <span class="sec-bar-info">clique no analista para lancar dias</span>
        </div>
      </div>
      <div class="grupo-cards">
        <div class="grupo-card ${clsCard}">
          <div class="card-label">Total de itens</div>
          <div class="card-val">${statsGrupo.totalPos.toLocaleString('pt-BR')}</div>
          <div class="card-sub">${g.nome || g.sigla}</div>
        </div>
        <div class="grupo-card ${clsCard}">
          <div class="card-label">Realizado</div>
          <div class="card-val">${statsGrupo.totalReal.toLocaleString('pt-BR')}</div>
          <div class="card-sub">${statsGrupo.totalPos > 0 ? Math.round(statsGrupo.totalReal/statsGrupo.totalPos*100) + '%' : '—'}</div>
        </div>
        <div class="grupo-card ${clsCard}">
          <div class="card-label">Esperado hoje</div>
          <div class="card-val">${statsGrupo.totalEsp.toLocaleString('pt-BR')}</div>
          <div class="card-sub">${statsGrupo.totalEsp > 0 ? Math.round(statsGrupo.totalReal/statsGrupo.totalEsp*100) + '% desempenho' : '—'}</div>
        </div>
        <div class="grupo-card ${clsCard}">
          <div class="card-label">DU restantes</div>
          <div class="card-val">${statsGrupo.duRest}</div>
          <div class="card-sub">de ${statsGrupo.duMax} DU</div>
        </div>
        <div class="grupo-card" style="background:${semCorCard};border-left:3px solid ${semCorBord};color:${semCorTxt}">
          <div class="card-label" style="opacity:.8">Status da equipe</div>
          <div class="card-val" style="font-size:14px;display:flex;align-items:center;gap:6px">
            <span style="width:10px;height:10px;border-radius:50%;background:${semBolinha};display:inline-block;flex-shrink:0"></span>
            ${semStatus}
          </div>
          <div class="card-sub" style="opacity:.8">${Math.round(pctEquipe*100)}% do esperado</div>
        </div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="vertical-align:bottom">Analista</th>
              <th rowspan="2" style="vertical-align:bottom">Qtd.</th>
              <th rowspan="2" style="vertical-align:bottom;min-width:110px">Realizado</th>
              <th rowspan="2" style="vertical-align:bottom">Esperado</th>
              <th rowspan="2" style="vertical-align:bottom">Desempenho</th>
              <th colspan="5" style="font-size:9px;font-weight:600;color:#aaa;text-align:center;border-left:0.5px solid #e0ddd5;border-bottom:none;padding:3px 5px 0;text-transform:uppercase;letter-spacing:.04em">Producao diaria</th>
              <th rowspan="2" class="gsep" style="vertical-align:bottom">Status</th>
            </tr>
            <tr>
              <th class="gsep">Falta</th>
              <th>Min. esp.</th>
              <th>Media</th>
              <th>Max</th>
              <th>Dias trab.</th>
            </tr>
          </thead>
          <tbody id="tbody-${g.id}"></tbody>
        </table>
      </div>`
    container.appendChild(sec)
    renderLinhasGrupo(g, dia)
  })
}

function calcStatsGrupo(g, dia) {
  if (!g._analistas || g._analistas.length === 0) return { mediaDias: '—', disponiveis: 0, pctDias: 0, totalPos: 0, totalReal: 0, totalEsp: 0, duRest: 0, duMax: 0 }
  let totalTrab = 0, totalDisp = 0, totalPos = 0, totalReal = 0, totalEsp = 0, duMax = 0
  g._analistas.forEach(a => {
    const s = calcStats(a, dia)
    totalTrab += s.diasTrab
    totalDisp += s.disponiveis
    totalPos  += a.quantidade
    totalReal += s.real
    totalEsp  += s.acEsp
    if (a.du > duMax) duMax = a.du
  })
  const media  = g._analistas.length > 0 ? (totalTrab / g._analistas.length).toFixed(1) : '—'
  const pct    = totalDisp > 0 ? Math.round(totalTrab / totalDisp * 100) : 0
  const duRest = Math.max(0, duMax - dia)
  return { mediaDias: media, disponiveis: Math.round(totalDisp / g._analistas.length), pctDias: pct, totalPos, totalReal, totalEsp, duRest, duMax }
}

function renderLinhasGrupo(g, dia) {
  const tbody = document.getElementById('tbody-' + g.id)
  if (!tbody || !g._analistas) return
  tbody.innerHTML = ''

  let tPos = 0, tReal = 0, tEsp = 0

  g._analistas.forEach(a => {
    const s      = calcStats(a, dia)
    const cor    = semCor(s.pctAlc, s.falta)
    tPos += a.quantidade; tReal += s.real; tEsp += s.acEsp

    const pctReal100 = Math.min(100, Math.round(s.pctReal * 100))
    const pctDiasA   = s.disponiveis > 0 ? Math.round(s.diasTrab / s.disponiveis * 100) : 0
    const diasLabel  = s.diasTrab + '/' + s.disponiveis + ' (' + pctDiasA + '%)'
    // Cor da barra segue a equipe, com variacao por desempenho
    const corBarra = g._corBarra
      ? (s.pctAlc >= 0.8 ? g._corBarra.ok : s.pctAlc >= 0.5 ? g._corBarra.warn : g._corBarra.bad)
      : cor

    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>
        <button class="btn-analista" onclick="abrirDrawer('${g.id}','${a.id}')">
          <span class="bolinha" style="background:${cor}"></span>
          ${a.analista_nome}
        </button>
      </td>
      <td>${a.quantidade.toLocaleString('pt-BR')}</td>
      <td style="padding:4px 5px">
        <div class="barra-real">
          <div class="barra-real-fill" style="width:${pctReal100}%;background:${corBarra}"></div>
          <div class="barra-real-txt">${pctReal100}% &middot; ${s.real.toLocaleString('pt-BR')}</div>
        </div>
      </td>
      <td>${s.acEsp.toLocaleString('pt-BR')}</td>
      <td style="font-weight:700;color:${corTexto(s.pctAlc)}">${Math.round(s.pctAlc * 100)}%</td>
      <td class="gsep">${s.falta > 0 ? s.falta.toLocaleString('pt-BR') : '—'}</td>
      <td>${s.minEsp}</td>
      <td>${s.media > 0 ? s.media.toFixed(1) : '—'}</td>
      <td>${s.maximo > 0 ? s.maximo : '—'}</td>
      <td>${diasLabel}</td>
      <td class="gsep">${statusChip(s.pctAlc, s.falta)}</td>`
    tbody.appendChild(tr)
  })

  // Linha de total removida — informacao ja exibida nos cards de grupo
}

// ─── CALCULOS ────────────────────────────────────────────────────────────────

function somarReal(a, dia) {
  if (!a.lancamentos) return 0
  return a.lancamentos
    .filter(l => {
      const d = parseInt(l.data.split('-')[2]) || 0
      return d <= dia && (l.tipo === 'normal' || l.tipo === 'zero_real')
    })
    .reduce((s, l) => s + (l.quantidade || 0), 0)
}

function calcStats(a, dia) {
  const lans = (a.lancamentos || []).filter(l => {
    const d = parseInt(l.data.split('-')[2]) || 0
    return d <= dia
  })
  const normais     = lans.filter(l => l.tipo === 'normal' && l.quantidade > 0)
  const disponiveis = lans.filter(l => l.tipo === 'normal' || l.tipo === 'zero_real').length
  const real        = lans.filter(l => l.tipo === 'normal' || l.tipo === 'zero_real').reduce((s,l) => s + (l.quantidade||0), 0)
  const media       = normais.length > 0 ? normais.reduce((s,l) => s + l.quantidade, 0) / normais.length : 0
  const maximo      = normais.length > 0 ? Math.max(...normais.map(l => l.quantidade)) : 0
  const minimo      = normais.length > 0 ? Math.min(...normais.map(l => l.quantidade)) : 0
  const meta        = a.quantidade / a.du
  const acEsp       = Math.round(meta * dia)
  const pctAlc      = acEsp > 0 ? real / acEsp : (real >= a.quantidade ? 1 : 0)
  const pctReal     = a.quantidade > 0 ? real / a.quantidade : 0
  const falta       = Math.max(0, a.quantidade - real)
  const duRest      = Math.max(0, a.du - dia)
  const minEsp      = duRest > 0 && falta > 0 ? (falta / duRest).toFixed(1) : '—'
  return { real, media, maximo, minimo, acEsp, pctAlc, pctReal, falta, duRest, minEsp, diasTrab: normais.length, disponiveis }
}

function semCor(pctAlc, falta) {
  if (falta <= 0)    return '#378ADD'
  if (pctAlc >= 0.8) return '#639922'
  if (pctAlc >= 0.5) return '#EF9F27'
  return '#E24B4A'
}
function corTexto(pct) {
  if (pct >= 0.8) return '#27500A'
  if (pct >= 0.5) return '#633806'
  return '#791F1F'
}
function statusChip(pctAlc, falta) {
  if (falta <= 0)    return '<span class="chip chip-done">Concluido</span>'
  if (pctAlc >= 0.8) return '<span class="chip chip-ok">No prazo</span>'
  if (pctAlc >= 0.5) return '<span class="chip chip-warn">Atencao</span>'
  return '<span class="chip chip-bad">Atrasado</span>'
}

// ─── DRAWER ──────────────────────────────────────────────────────────────────

function abrirDrawer(grupoId, analistaRefId) {
  const grupo    = projetoAtivo._grupos.find(g => String(g.id) === String(grupoId))
  const analista = grupo && grupo._analistas ? grupo._analistas.find(a => String(a.id) === String(analistaRefId)) : null
  if (!analista) return

  analistaDrawer = { ...analista, _grupoNome: grupo.nome || grupo.sigla }

  const dia = parseInt(document.getElementById('inp-dia').value) || 1
  const s   = calcStats(analista, dia)

  document.getElementById('drawer-titulo').textContent = analista.analista_nome
  document.getElementById('drawer-sub').textContent    = (grupo.nome || grupo.sigla) + ' · ' + analista.quantidade + ' quantidade · ' + analista.du + ' DU'

  document.getElementById('drawer-stats').innerHTML = ''

  renderDrawerDias(analista, dia)

  document.getElementById('overlay').classList.add('open')
  document.getElementById('drawer').classList.add('open')
}

function renderDrawerDias(analista, diaAtual) {
  const body = document.getElementById('drawer-body')
  body.innerHTML = ''

  // Mapa de lancamentos por data
  const mapa = {}
  if (analista.lancamentos) {
    analista.lancamentos.forEach(l => { mapa[l.data] = l })
  }

  // Gerar dias com base no DU do analista
  for (let d = 1; d <= analista.du; d++) {
    const futuro = d > diaAtual
    const dataKey = 'dia-' + d  // simplificado — em prod seria a data real
    const lanc    = analista.lancamentos ? analista.lancamentos.find(l => {
      const dia = parseInt(l.data.split('-')[2])
      return dia === d
    }) : null

    const val  = lanc ? lanc.quantidade : ''
    const tipo = lanc ? lanc.tipo : 'normal'

    const clsInp = !lanc ? 'vazio' : (lanc.quantidade > 0 ? 'preenchido' : 'zero')
    const clsTipo = tipo === 'feriado' ? 'tipo-feriado' : tipo === 'ferias' ? 'tipo-ferias' : tipo === 'falta' ? 'tipo-falta' : ''

    const row = document.createElement('div')
    row.className = 'day-row'
    row.dataset.dia = d

    if (futuro) {
      row.innerHTML = `
        <div class="day-num">${d}</div>
        <div class="day-date" style="color:#ccc">Futuro</div>
        <div class="day-acum" style="color:#ccc">—</div>
        <div></div>
        <div style="font-size:11px;color:#ccc;text-align:center">—</div>`
    } else {
      row.innerHTML = `
        <div class="day-num">${d}</div>
        <div class="day-date" style="color:#888">Dia ${d}</div>
        <div class="day-acum" style="text-align:right;color:#888" id="acum-${d}">—</div>
        <div>
          <span class="bolinha" style="background:${!lanc ? '#ccc' : lanc.quantidade > 0 ? '#639922' : '#EF9F27'}"></span>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <input type="number" class="day-inp ${clsInp}" data-dia="${d}"
            min="0" value="${val}" placeholder="0"
            oninput="onDiaInput(this)">
          <select class="tipo-sel ${clsTipo}" data-dia="${d}" onchange="onTipoChange(this)">
            <option value="normal"   ${tipo==='normal'   ?'selected':''}>Normal</option>
            <option value="zero_real"${tipo==='zero_real'?'selected':''}>Zero real</option>
            <option value="feriado"  ${tipo==='feriado'  ?'selected':''}>Feriado</option>
            <option value="ferias"   ${tipo==='ferias'   ?'selected':''}>Ferias</option>
            <option value="falta"    ${tipo==='falta'    ?'selected':''}>Falta</option>
          </select>
        </div>`
    }
    body.appendChild(row)
  }

  atualizaresperados()
}

function onDiaInput(inp) {
  const val = parseInt(inp.value) || 0
  inp.classList.remove('preenchido','zero','vazio')
  inp.classList.add(val > 0 ? 'preenchido' : 'zero')
  const bolinha = inp.closest('.day-row').querySelector('.bolinha')
  if (bolinha) bolinha.style.background = val > 0 ? '#639922' : '#EF9F27'
  atualizaresperados()
}

function onTipoChange(sel) {
  sel.className = 'tipo-sel'
  if (sel.value === 'feriado') sel.classList.add('tipo-feriado')
  if (sel.value === 'ferias')  sel.classList.add('tipo-ferias')
  if (sel.value === 'falta')   sel.classList.add('tipo-falta')
}

function atualizaresperados() {
  let acum = 0
  document.querySelectorAll('.day-row[data-dia]').forEach(row => {
    const inp = row.querySelector('.day-inp')
    if (inp) acum += parseInt(inp.value) || 0
    const acumEl = row.querySelector('[id^="acum-"]')
    if (acumEl) acumEl.textContent = acum.toLocaleString('pt-BR')
  })
}

async function salvarDrawer() {
  if (!analistaDrawer) return

  const lancamentos = []
  document.querySelectorAll('.day-row[data-dia]').forEach(row => {
    const dia  = parseInt(row.dataset.dia)
    const inp  = row.querySelector('.day-inp')
    const sel  = row.querySelector('.tipo-sel')
    if (!inp) return

    // Constroi a data no formato YYYY-MM-DD
    // Usa o inicio do grupo como referencia (simplificado: usa ano/mes atual)
    const hoje  = new Date()
    const ano   = hoje.getFullYear()
    const mes   = String(hoje.getMonth() + 1).padStart(2, '0')
    const data  = ano + '-' + mes + '-' + String(dia).padStart(2, '0')

    lancamentos.push({
      analista_ref_id: analistaDrawer.id,
      data,
      quantidade: parseInt(inp.value) || 0,
      tipo: sel ? sel.value : 'normal'
    })
  })

  try {
    await API.lancamentos.lote(lancamentos)
    // Recarrega os lancamentos do analista
    const novos = await API.lancamentos.buscar(analistaDrawer.id)
    // Atualiza no estado local
    projetoAtivo._grupos.forEach(g => {
      if (!g._analistas) return
      const a = g._analistas.find(x => x.id === analistaDrawer.id)
      if (a) a.lancamentos = novos
    })
    fecharDrawer()
    recalcular()
  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert('Erro ao salvar lancamentos. Tente novamente.')
  }
}

function fecharDrawer() {
  document.getElementById('overlay').classList.remove('open')
  document.getElementById('drawer').classList.remove('open')
  analistaDrawer = null
}

// ─── TIMELINE BANNER ─────────────────────────────────────────────────────────

function renderTimeline(p) {
  const el = document.getElementById('timeline')
  if (!p || !p.grupos || p.grupos.length === 0) { el.classList.remove('visivel'); return }

  // Coleta todas as datas do projeto para definir intervalo
  const toDate = s => s ? new Date(s) : null
  const datas = []
  p.grupos.forEach(g => {
    if (g.inicio)        datas.push(new Date(g.inicio))
    if (g.fim_planejado) datas.push(new Date(g.fim_planejado))
  })
  if (p.marcos) p.marcos.forEach(m => {
    if (m.fim_planejado) datas.push(new Date(m.fim_planejado))
  })
  if (datas.length === 0) { el.classList.remove('visivel'); return }

  const dtMin = new Date(Math.min(...datas))
  const dtMax = new Date(Math.max(...datas))
  // Padding de 3 dias em cada lado
  dtMin.setDate(dtMin.getDate() - 3)
  dtMax.setDate(dtMax.getDate() + 3)
  const totalDias = (dtMax - dtMin) / 86400000

  const pct = dt => Math.max(0, Math.min(100, (new Date(dt) - dtMin) / 86400000 / totalDias * 100))

  // Formata periodo
  const fmtMes = d => new Date(d).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  document.getElementById('tl-titulo').textContent = p.nome + ' — ' + (p.referencia || '')
  document.getElementById('tl-periodo').textContent = fmtMes(dtMin) + ' → ' + fmtMes(dtMax)

  // Eixo de meses
  const eixo = document.getElementById('tl-eixo')
  eixo.innerHTML = ''
  const meses = []
  const cur = new Date(dtMin)
  cur.setDate(1)
  while (cur <= dtMax) {
    meses.push(new Date(cur))
    cur.setMonth(cur.getMonth() + 1)
  }
  meses.forEach(m => {
    const span = document.createElement('span')
    span.className = 'tl-mes'
    span.textContent = m.toLocaleDateString('pt-BR', { month: 'short' })
    eixo.appendChild(span)
  })

  // Fases
  const FASES = [
    { nome: 'Iniciacao',  cor: '#008BC9', txtCor: '#fff' },
    { nome: 'Trat. MAT',  cor: '#639922', txtCor: '#fff' },
    { nome: 'Trat. EQP',  cor: '#2B8671', txtCor: '#fff' },
    { nome: 'Finalizacao',cor: '#003A79', txtCor: '#73BFE8' },
  ]

  // Monta fases a partir dos grupos e deduz Iniciacao/Finalizacao
  const grupos = p.grupos || []
  const matGrupo = grupos.find(g => g.sigla === 'MAT')
  const eqpGrupo = grupos.find(g => g.sigla === 'EQP')

  // Iniciacao: do inicio do projeto ate o inicio do primeiro grupo
  const inicioProjeto = grupos.reduce((m, g) => g.inicio && new Date(g.inicio) < m ? new Date(g.inicio) : m, new Date(dtMax))
  const inicioDtMin   = new Date(dtMin.getTime() + 3 * 86400000) // remove padding
  
  const fasesData = []

  // Iniciacao estimada
  fasesData.push({
    nome: 'Iniciacao',
    inicio: inicioDtMin,
    fim: inicioProjeto,
    cor: '#008BC9', txtCor: '#fff'
  })

  // MAT
  if (matGrupo && matGrupo.inicio && matGrupo.fim_planejado) {
    fasesData.push({ nome: 'Trat. MAT', inicio: new Date(matGrupo.inicio), fim: new Date(matGrupo.fim_planejado), cor: '#639922', txtCor: '#fff' })
  }

  // EQP
  if (eqpGrupo && eqpGrupo.inicio && eqpGrupo.fim_planejado) {
    fasesData.push({ nome: 'Trat. EQP', inicio: new Date(eqpGrupo.inicio), fim: new Date(eqpGrupo.fim_planejado), cor: '#2B8671', txtCor: '#fff' })
  }

  // Finalizacao: do fim do ultimo grupo ate o fim do projeto
  const fimUltimoGrupo = grupos.reduce((m, g) => g.fim_planejado && new Date(g.fim_planejado) > m ? new Date(g.fim_planejado) : m, new Date(dtMin))
  const fimProjeto     = new Date(dtMax.getTime() - 3 * 86400000)
  if (fimUltimoGrupo < fimProjeto) {
    fasesData.push({ nome: 'Finalizacao', inicio: fimUltimoGrupo, fim: fimProjeto, cor: '#003A79', txtCor: '#73BFE8' })
  }

  // Linha de hoje
  const hoje     = new Date()
  const pctHoje  = pct(hoje)
  const linhas   = document.getElementById('tl-linhas')
  linhas.innerHTML = ''

  // Linha vertical de hoje
  const hojeEl = document.createElement('div')
  hojeEl.className = 'tl-hoje-line'
  hojeEl.style.left = pctHoje + '%'
  const hojeLabel = document.createElement('span')
  hojeLabel.className = 'tl-hoje-label'
  hojeLabel.style.left = pctHoje + '%'
  hojeLabel.textContent = 'Hoje'
  linhas.appendChild(hojeEl)
  linhas.appendChild(hojeLabel)

  // Renderiza cada fase
  fasesData.forEach(f => {
    const pIni = pct(f.inicio)
    const pFim = pct(f.fim)
    const larg = Math.max(pFim - pIni, 1)

    const row = document.createElement('div')
    row.className = 'tl-fase-row'
    row.innerHTML =
      '<div class="tl-fase-nome">' + f.nome + '</div>' +
      '<div class="tl-barra-area">' +
        '<div class="tl-barra" style="left:' + pIni + '%;width:' + larg + '%;background:' + f.cor + '">' +
          '<span class="tl-barra-txt" style="color:' + f.txtCor + '">' + f.nome + '</span>' +
        '</div>' +
      '</div>'
    linhas.appendChild(row)
  })

  // Marcos
  if (p.marcos && p.marcos.length > 0) {
    const rowMarcos = document.createElement('div')
    rowMarcos.className = 'tl-fase-row'
    rowMarcos.innerHTML = '<div class="tl-fase-nome" style="color:rgba(255,255,255,.35)">Marcos</div><div class="tl-barra-area" style="position:relative;height:18px"></div>'
    linhas.appendChild(rowMarcos)

    const area = rowMarcos.querySelector('.tl-barra-area')
    p.marcos.forEach(m => {
      if (!m.fim_planejado) return
      const p2 = pct(m.fim_planejado)
      const wrap = document.createElement('div')
      wrap.className = 'tl-marco-wrap'
      wrap.style.left = p2 + '%'
      const cor = m.concluido ? '#639922' : '#008BC9'
      wrap.innerHTML =
        '<div class="tl-marco-label">' + m.nome.substring(0, 12) + '</div>' +
        '<div class="tl-marco-dot" style="background:' + cor + ';border-color:#fff"></div>'
      area.appendChild(wrap)
    })
  }

  el.classList.add('visivel')
}
