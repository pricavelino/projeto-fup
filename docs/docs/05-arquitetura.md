# 5. Arquitetura da solução

## 5.1 Visão geral

O FUP adota uma arquitetura cliente-servidor de duas camadas, operando em rede local:

```
┌─────────────────────────────────────────────────────┐
│                   Rede local / VPN                   │
│                                                     │
│  ┌──────────────┐   HTTP/REST   ┌─────────────────┐ │
│  │   Navegador  │ ◄────────────►│  Node.js/Express│ │
│  │  (Frontend)  │               │    (Backend)    │ │
│  │              │               │                 │ │
│  │ HTML/CSS/JS  │               │  src/server.js  │ │
│  │  public/     │               │  src/routes/    │ │
│  └──────────────┘               │  src/db/        │ │
│                                 └────────┬────────┘ │
│                                          │           │
│                                 ┌────────▼────────┐ │
│                                 │     SQLite      │ │
│                                 │    data/fup.db  │ │
│                                 └─────────────────┘ │
└─────────────────────────────────────────────────────┘
```

O servidor roda na máquina da gestora ou em um computador dedicado. Os analistas acessam pelo navegador, sem nenhuma instalação.

---

## 5.2 Camadas da aplicação

### Frontend (public/)

Responsável pela interface e pela lógica de apresentação. Sem frameworks — JavaScript puro organizado em módulos por responsabilidade.

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura HTML da tela principal do FUP |
| `setup.html` | Estrutura HTML do formulário de nova referência |
| `js/api.js` | Centraliza todas as chamadas fetch() para o backend |
| `js/fup.js` | Renderiza tabelas, calcula indicadores, controla gaveta |
| `js/setup.js` | Controla o fluxo do formulário de 6 passos |
| `css/main.css` | Estilos globais, variáveis e layout |

### Backend (src/)

API REST construída com Express. Cada rota cuida de um recurso. A conexão com o banco é compartilhada via singleton em `database.js`.

| Arquivo | Responsabilidade |
|---|---|
| `server.js` | Inicializa Express, registra rotas, sobe o servidor |
| `routes/projetos.js` | CRUD de projetos |
| `routes/analistas.js` | CRUD de analistas e alocações por referência |
| `routes/lancamentos.js` | Registro e consulta de produção diária |
| `routes/marcos.js` | CRUD de marcos do cronograma |
| `db/database.js` | Abre e exporta a conexão SQLite |
| `db/init.js` | Cria as tabelas (CREATE TABLE IF NOT EXISTS) |

### Banco de dados (data/)

SQLite — banco relacional em arquivo único. Adequado para o volume de dados (12 projetos, ~20 analistas, ~300 dias por referência) e para o número de usuários simultâneos esperado.

---

## 5.3 Modelo de dados

### Diagrama de entidades

```
projeto
  │
  ├── grupo_tratamento (MAT, EQP — períodos independentes)
  │       │
  │       └── analista_referencia (posições e DU por analista/referência)
  │               │
  │               ├── lancamento (produção diária — 1 por analista por dia)
  │               └── indisponibilidade (férias, faltas individuais)
  │
  ├── indisponibilidade (feriados coletivos)
  ├── marco (marcos do cronograma)
  └── limiar_alerta (configuração do semáforo)

analista (pool de pessoas — independente de projeto)
  └── analista_referencia (alocação em projetos)
```

### Tabelas

| Tabela | Registros esperados |
|---|---|
| `projeto` | ~12 ativos + histórico |
| `grupo_tratamento` | ~2–4 por projeto |
| `analista` | ~20 pessoas |
| `analista_referencia` | ~15 por referência × projetos |
| `lancamento` | ~15 analistas × ~300 dias × projetos |
| `indisponibilidade` | ~10–30 por projeto por referência |
| `marco` | ~15–20 por projeto |
| `limiar_alerta` | 3 por projeto (ok, atenção, atrasado) |

---

## 5.4 API REST — rotas principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/projetos` | Lista projetos ativos |
| POST | `/api/projetos` | Cria projeto |
| PUT | `/api/projetos/:id` | Atualiza projeto |
| GET | `/api/projetos/:id/grupos` | Lista grupos MAT/EQP do projeto |
| GET | `/api/grupos/:id/analistas` | Lista analistas alocados no grupo |
| PUT | `/api/analistas-ref/:id` | Atualiza posições ou DU de uma alocação |
| GET | `/api/lancamentos?analista_ref_id=&mes=` | Busca lançamentos por analista e período |
| POST | `/api/lancamentos` | Cria ou atualiza lançamento (upsert por data) |
| GET | `/api/projetos/:id/marcos` | Lista marcos do projeto |
| PUT | `/api/marcos/:id` | Atualiza datas reais e status de conclusão |

---

## 5.5 Decisões arquiteturais

| Decisão | Justificativa |
|---|---|
| SQLite em vez de SQL Server | Sem necessidade de instalação de servidor de banco; volume adequado; backup por cópia de arquivo |
| Node.js em vez de C# na Fase 1 | Mesmo idioma do frontend reduz a troca de contexto; configuração mais rápida |
| CSS puro em vez de Bootstrap | Controle total sobre o visual; sem dependência desnecessária para o volume de componentes do projeto |
| Frontend sem framework (React/Vue) | Projeto de escopo definido; JS puro é suficiente e elimina build step |
| Upsert no lançamento | Simplifica o frontend — sempre envia o dado, o banco decide se insere ou atualiza |
| `meta_dia` como coluna gerada | Sempre consistente com `posicoes` e `du`; sem risco de desatualização |
| Feriado coletivo com `analista_ref_id` NULL | Um único registro representa a indisponibilidade de toda a equipe |

---

## 5.6 Plano de migração — Fase 1 → Fase 2

A migração para C# + ASP.NET Core + SQL Server na Fase 2 não exige reescrever o frontend. O plano:

1. Recriar as tabelas no SQL Server com o mesmo schema
2. Migrar os dados do SQLite com script de exportação
3. Reescrever o backend em C# mantendo as mesmas rotas e contratos de resposta JSON
4. Adicionar autenticação JWT e perfis de usuário
5. O frontend em HTML/CSS/JS é reaproveitado integralmente, apontando para a nova URL da API
