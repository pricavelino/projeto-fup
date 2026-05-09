# 7. Programação de funcionalidades

## 7.1 Backlog de funcionalidades

| ID | Funcionalidade | Arquivo(s) envolvido(s) | Status |
|---|---|---|---|
| F-01 | Inicialização do banco de dados com as 8 tabelas | `src/db/init.js` | A fazer |
| F-02 | Servidor Express com rotas registradas | `src/server.js` | A fazer |
| F-03 | Rota GET /api/projetos | `src/routes/projetos.js` | A fazer |
| F-04 | Rota POST /api/projetos (criar referência) | `src/routes/projetos.js` | A fazer |
| F-05 | Rota GET /api/grupos/:id/analistas com lançamentos do dia | `src/routes/analistas.js` | A fazer |
| F-06 | Rota PUT /api/analistas-ref/:id (estender DU) | `src/routes/analistas.js` | A fazer |
| F-07 | Rota POST /api/lancamentos (upsert por data) | `src/routes/lancamentos.js` | A fazer |
| F-08 | Rota GET /api/lancamentos (histórico por analista) | `src/routes/lancamentos.js` | A fazer |
| F-09 | Rota CRUD /api/marcos | `src/routes/marcos.js` | A fazer |
| F-10 | Cálculo de indicadores no frontend (meta, acumulado, saldo, mín) | `public/js/fup.js` | A fazer |
| F-11 | Renderização da tabela MAT e EQP com semáforo e stats | `public/js/fup.js` | A fazer |
| F-12 | Sidebar com projetos e % em tempo real | `public/js/fup.js` | A fazer |
| F-13 | Gaveta de lançamento com histórico diário e tipos | `public/js/fup.js` | A fazer |
| F-14 | Lançamento retroativo — salva ao clicar em salvar | `public/js/fup.js` + F-07 | A fazer |
| F-15 | Formulário de setup — passo 1 (identificação) | `public/js/setup.js` | A fazer |
| F-16 | Formulário de setup — passo 2 (equipe MAT/EQP) | `public/js/setup.js` | A fazer |
| F-17 | Formulário de setup — passo 3 (marcos) | `public/js/setup.js` | A fazer |
| F-18 | Formulário de setup — passo 4 (feriados/ausências) | `public/js/setup.js` | A fazer |
| F-19 | Formulário de setup — passo 5 (limiares) | `public/js/setup.js` | A fazer |
| F-20 | Formulário de setup — passo 6 (revisão e criação) | `public/js/setup.js` | A fazer |

## 7.2 Cálculos principais

### Meta por dia

```
meta_dia = posicoes / du
```

Calculado como coluna gerada no banco (`GENERATED ALWAYS AS`). Recalculado automaticamente ao atualizar `du`.

### Acumulado esperado

```
acumulado_esperado = meta_dia × dia_atual_de_tratamento
```

Calculado no frontend com base no dia de tratamento selecionado no cabeçalho.

### % alcançado

```
pct_alcancado = realizado / acumulado_esperado
```

Base do semáforo. Se `acumulado_esperado = 0`, considera 100% (sem dias decorridos ainda).

### Saldo do dia

```
saldo = realizado - acumulado_esperado
```

Positivo = à frente do esperado. Negativo = atrás do esperado.

### Mínimo por dia restante

```
minimo_dia_restante = (posicoes - realizado) / du_restantes
```

Quantidade mínima que o analista precisa fazer por dia para terminar no prazo.

### Dias trabalhados

```
dias_trabalhados = COUNT(lancamentos onde quantidade > 0 AND tipo = 'normal')
```

Exclui feriados, férias, faltas e zero real.

### Média de produção diária

```
media = SUM(quantidade) / dias_trabalhados
```

Considera apenas dias com `quantidade > 0` e `tipo = 'normal'`.

## 7.3 Regras de negócio

| Regra | Descrição |
|---|---|
| RN-01 | Um analista só pode ter um lançamento por dia por projeto — conflito resolvido por upsert |
| RN-02 | Dias futuros (após o dia de tratamento atual) ficam bloqueados na gaveta |
| RN-03 | Feriados coletivos (`analista_ref_id IS NULL`) se aplicam a todos os analistas do projeto |
| RN-04 | Dias marcados como feriado, férias ou falta não entram na média nem nos dias trabalhados |
| RN-05 | Ao estender o DU, o histórico de lançamentos anteriores é preservado |
| RN-06 | `meta_dia` é sempre recalculada automaticamente — nunca editada diretamente |
| RN-07 | O semáforo usa os limiares configurados no setup do projeto, não valores fixos |
| RN-08 | MAT e EQP têm períodos de tratamento independentes — dia atual pode ser diferente entre grupos |
