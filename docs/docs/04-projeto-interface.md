# 4. Projeto de interface

## 4.1 Fluxo de navegação

```
Acesso via navegador (http://IP:3000)
        │
        ├── index.html ──────────────────────────────────────────┐
        │   Tela principal do FUP                                 │
        │   ├── Sidebar com lista de projetos e semáforo          │
        │   ├── Cards de resumo (total, realizado, esperado, DU)  │
        │   ├── Tabela MAT com indicadores por analista           │
        │   ├── Tabela EQP com indicadores por analista           │
        │   └── Gaveta de lançamento (abre ao clicar no analista) │
        │       ├── Estatísticas (média, máx, mín, meta)          │
        │       └── Lista de dias com campo de quantidade e tipo  │
        │                                                         │
        └── setup.html                                           │
            Formulário de nova referência                        │
            ├── Passo 1: Identificação                           │
            ├── Passo 2: Equipe (MAT e EQP)                      │
            ├── Passo 3: Cronograma (marcos)                     │
            ├── Passo 4: Feriados e indisponibilidades           │
            ├── Passo 5: Limiares de alerta                      │
            └── Passo 6: Revisão e confirmação ──────────────────┘
                                                  (cria projeto e
                                                   abre o FUP)
```

---

## 4.2 Wireframes e protótipos

Os protótipos interativos foram desenvolvidos em HTML/CSS/JS durante a fase de levantamento de requisitos e estão disponíveis na pasta `docs/prototipos/`.

### Tela principal — FUP

Componentes principais:

| Componente | Descrição |
|---|---|
| Sidebar | Lista de projetos com nome e % alcançado em badge colorido |
| Header | Nome do projeto, referência, fase e seletor de dia de tratamento |
| Cards de resumo | Total de itens, realizado, acumulado esperado e DU restantes |
| Tabela MAT | Analistas MAT com indicadores completos e semáforo |
| Tabela EQP | Analistas EQP com indicadores completos e semáforo |
| Gaveta | Painel lateral deslizante com histórico diário do analista |

### Colunas da tabela de analistas

| Coluna | Cálculo |
|---|---|
| Posições | Configurado no setup da referência |
| Realizado | Soma de todos os lançamentos `tipo = 'normal'` ou `'zero_real'` |
| % realizado | Realizado / Posições |
| Ac. esperado | (Posições / DU) × dia atual de tratamento |
| % alcançado | Realizado / Acumulado esperado |
| Média/dia | Média dos dias com quantidade > 0 e tipo = 'normal' |
| Máximo | Maior valor entre os dias com quantidade > 0 |
| Mínimo | Menor valor entre os dias com quantidade > 0 |
| Dias trabalhados | Contagem de dias com quantidade > 0 e tipo = 'normal' |
| Falta total | Posições − Realizado |
| Mínimo/dia restante | Falta total / DU restantes |
| Status | Semáforo baseado no % alcançado |

### Semáforo de status

| Cor | Critério padrão | Chip |
|---|---|---|
| Azul | Concluído (falta = 0) | Concluído |
| Verde | % alcançado ≥ 80% | No prazo |
| Amarelo | % alcançado entre 50% e 79% | Atenção |
| Vermelho | % alcançado < 50% | Atrasado |

Os limiares são configuráveis por projeto no setup.

### Gaveta de lançamento

Abre ao clicar no nome de qualquer analista. Exibe:
- Estatísticas no topo: média, máximo, mínimo e meta por dia
- Lista de todos os dias do período com: número do dia, data, acumulado até aquele dia, semáforo do dia e campo de quantidade/tipo
- Dias futuros aparecem bloqueados
- Dias com lançamento aparecem em verde; dias vazios em vermelho
- Seletor de tipo por dia: normal, zero real, feriado, férias, falta

---

## 4.3 Formulário de setup — 6 passos

| Passo | Campos |
|---|---|
| 1. Identificação | Nome do projeto, referência, periodicidade, início do tratamento, entrega ao cliente, observações |
| 2. Equipe | Tabela de analistas MAT (nome, posições, DU, meta calculada) + tabela EQP — adição e remoção dinâmica |
| 3. Cronograma | Lista de marcos com nome, início planejado e término planejado — adição e remoção dinâmica |
| 4. Feriados | Tipo (feriado coletivo / férias / falta), data e analista (quando individual) |
| 5. Alertas | Limiares de % para status: no prazo, atenção e atrasado |
| 6. Revisão | Resumo de tudo antes de confirmar |

---

## 4.4 Princípios de design

- **Sem frameworks CSS:** interface construída com CSS puro e variáveis, sem Bootstrap ou similares
- **Densidade de informação:** tabelas compactas com tipografia pequena (11–13px) para caber mais dados sem scroll
- **Semáforo como guia visual principal:** o usuário identifica problemas pela cor antes de ler os números
- **Gaveta em vez de página nova:** lançamentos acontecem sem trocar de tela, preservando o contexto da tabela
- **Formulário em passos:** reduz a carga cognitiva ao abrir uma referência — o usuário foca em uma seção por vez
- **Compatibilidade dark/light mode:** todas as cores usam variáveis CSS que se adaptam automaticamente
