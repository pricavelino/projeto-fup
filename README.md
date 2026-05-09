# FUP — Follow Up de Produção

Sistema web para acompanhamento diário da produção de equipes de análise em projetos de referência de preços.

## Sobre o projeto

O FUP substitui planilhas Excel compartilhadas por uma aplicação web acessível em rede local, eliminando o trabalho manual de calcular metas, acumulados e indicadores de desempenho diariamente.

## Funcionalidades

- Acompanhamento de múltiplos projetos simultâneos com sidebar de navegação
- Cálculo automático de meta por dia, acumulado esperado, saldo e mínimo por dia restante
- Lançamento de produção diária por analista, com suporte a lançamentos retroativos
- Tipos de dia: produção normal, zero real, feriado, férias e falta
- Indicadores estatísticos por analista: média, máximo, mínimo e dias trabalhados
- Semáforo visual de status (verde ≥ 80%, amarelo 50–80%, vermelho < 50%)
- Grupos MAT e EQP com períodos de tratamento independentes
- Setup de referência em 6 passos: identificação, equipe, cronograma, feriados, alertas e revisão
- Extensão de dias úteis sem perda do histórico de lançamentos
- Modelo de dados relacional em SQLite

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML, CSS e JavaScript puro |
| Backend | Node.js + Express |
| Banco de dados | SQLite (better-sqlite3) |
| Acesso em rede | HTTP local (mesmo escritório ou VPN) |

## Como executar

```bash
# Pré-requisitos: Node.js 18+

# Instalar dependências
npm install

# Inicializar o banco de dados
node src/db/init.js

# Rodar em desenvolvimento
npm run dev

# Rodar em produção
npm start
```

Acesse `http://localhost:3000` no navegador.
Colegas na mesma rede acessam pelo IP da máquina: `http://192.168.x.x:3000`.

## Estrutura do projeto

```
fup-app/
├── src/
│   ├── server.js          # Ponto de entrada do servidor
│   ├── routes/
│   │   ├── projetos.js
│   │   ├── analistas.js
│   │   ├── lancamentos.js
│   │   └── marcos.js
│   └── db/
│       ├── database.js    # Conexão SQLite
│       └── init.js        # Criação das tabelas
├── public/
│   ├── index.html         # FUP principal
│   ├── setup.html         # Formulário de nova referência
│   ├── js/
│   │   ├── api.js
│   │   ├── fup.js
│   │   └── setup.js
│   └── css/
│       └── main.css
├── data/                  # Banco SQLite — não versionado
├── docs/                  # Documentação completa
├── .env.example
├── .gitignore
└── package.json
```

## Documentação

A documentação completa está na pasta [`docs/`](./docs/).

## Licença

MIT
