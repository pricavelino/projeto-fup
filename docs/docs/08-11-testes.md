# 8. Plano de testes de software

## 8.1 Objetivo

Garantir que as funcionalidades implementadas funcionem corretamente, cobrindo os principais fluxos de uso, casos de borda e regras de negócio definidas na especificação.

## 8.2 Tipos de teste

| Tipo | Ferramenta | Foco |
|---|---|---|
| Teste de API (manual) | Insomnia / Postman | Rotas REST, status codes, payloads |
| Teste funcional (manual) | Navegador | Fluxos de uso completos |
| Teste de regra de negócio | Manual / console | Cálculos e consistência de dados |

## 8.3 Casos de teste — API

| ID | Rota | Cenário | Resultado esperado |
|---|---|---|---|
| CT-API-01 | GET /api/projetos | Banco com projetos cadastrados | HTTP 200, array de projetos |
| CT-API-02 | GET /api/projetos | Banco vazio | HTTP 200, array vazio |
| CT-API-03 | POST /api/projetos | Payload válido | HTTP 200, `{ id: N }` |
| CT-API-04 | POST /api/projetos | Payload sem campo obrigatório | HTTP 400, mensagem de erro |
| CT-API-05 | POST /api/lancamentos | Primeiro lançamento do analista no dia | HTTP 200, registro inserido |
| CT-API-06 | POST /api/lancamentos | Segundo lançamento no mesmo dia | HTTP 200, registro atualizado (upsert) |
| CT-API-07 | POST /api/lancamentos | Lançamento retroativo (data passada) | HTTP 200, aceito normalmente |
| CT-API-08 | PUT /api/analistas-ref/:id | Atualizar DU de 27 para 30 | HTTP 200, meta_dia recalculada |
| CT-API-09 | GET /api/lancamentos | Filtro por analista_ref_id | HTTP 200, somente lançamentos do analista |

## 8.4 Casos de teste — funcional

| ID | Funcionalidade | Cenário | Resultado esperado |
|---|---|---|---|
| CT-FE-01 | Sidebar | Projeto com % ≥ 80% | Badge verde com percentual |
| CT-FE-02 | Sidebar | Projeto com % entre 50–79% | Badge amarelo |
| CT-FE-03 | Sidebar | Projeto com % < 50% | Badge vermelho |
| CT-FE-04 | Cards de resumo | Alterar dia de tratamento | Todos os valores atualizam |
| CT-FE-05 | Tabela | Analista com todos os itens concluídos | Semáforo azul, chip "Concluído" |
| CT-FE-06 | Gaveta | Abrir gaveta de analista | Exibe histórico, estatísticas e tipos |
| CT-FE-07 | Gaveta | Editar dia passado vazio | Campo aceita valor, acumulado atualiza |
| CT-FE-08 | Gaveta | Tentar editar dia futuro | Campo bloqueado, exibe "—" |
| CT-FE-09 | Gaveta | Salvar lançamentos | Gaveta fecha, tabela atualiza |
| CT-FE-10 | Setup | Completar os 6 passos | Projeto criado e FUP aberto |
| CT-FE-11 | Setup | Adicionar analista no passo 2 | Nova linha aparece com meta calculada |
| CT-FE-12 | Setup | Alterar DU no passo 2 | Meta por dia recalcula em tempo real |
| CT-FE-13 | Setup | Adicionar feriado coletivo | Chip aparece na lista |
| CT-FE-14 | Setup | Adicionar férias individuais | Chip com nome do analista aparece |

## 8.5 Casos de teste — regras de negócio

| ID | Regra | Cenário | Resultado esperado |
|---|---|---|---|
| CT-RN-01 | RN-01 | Lançar duas vezes no mesmo dia | Segundo lançamento sobrescreve o primeiro |
| CT-RN-02 | RN-04 | Analista com 5 dias normais e 2 feriados | Média considera apenas os 5 dias normais |
| CT-RN-03 | RN-05 | Estender DU de 27 para 30 | Lançamentos dos 27 dias anteriores preservados |
| CT-RN-04 | RN-06 | Alterar posições de 300 para 350 | meta_dia atualizada automaticamente |
| CT-RN-05 | RN-08 | MAT no dia 20, EQP no dia 15 | Acumulados calculados independentemente |

---

# 9. Registro de testes de software

> Este documento deve ser preenchido durante a execução dos testes. Cada caso de teste deve ser executado e o resultado registrado.

## 9.1 Informações da execução

| Campo | Valor |
|---|---|
| Versão testada | — |
| Data de execução | — |
| Responsável | — |
| Ambiente | — |

## 9.2 Resultados

| ID | Resultado | Observações |
|---|---|---|
| CT-API-01 | ⬜ Não executado | |
| CT-API-02 | ⬜ Não executado | |
| CT-API-03 | ⬜ Não executado | |
| CT-API-04 | ⬜ Não executado | |
| CT-API-05 | ⬜ Não executado | |
| CT-API-06 | ⬜ Não executado | |
| CT-API-07 | ⬜ Não executado | |
| CT-API-08 | ⬜ Não executado | |
| CT-API-09 | ⬜ Não executado | |
| CT-FE-01 | ⬜ Não executado | |
| CT-FE-02 | ⬜ Não executado | |
| CT-FE-03 | ⬜ Não executado | |
| CT-FE-04 | ⬜ Não executado | |
| CT-FE-05 | ⬜ Não executado | |
| CT-FE-06 | ⬜ Não executado | |
| CT-FE-07 | ⬜ Não executado | |
| CT-FE-08 | ⬜ Não executado | |
| CT-FE-09 | ⬜ Não executado | |
| CT-FE-10 | ⬜ Não executado | |
| CT-FE-11 | ⬜ Não executado | |
| CT-FE-12 | ⬜ Não executado | |
| CT-FE-13 | ⬜ Não executado | |
| CT-FE-14 | ⬜ Não executado | |
| CT-RN-01 | ⬜ Não executado | |
| CT-RN-02 | ⬜ Não executado | |
| CT-RN-03 | ⬜ Não executado | |
| CT-RN-04 | ⬜ Não executado | |
| CT-RN-05 | ⬜ Não executado | |

**Legenda:** ✅ Passou · ❌ Falhou · ⬜ Não executado

---

# 10. Plano de testes de usabilidade

## 10.1 Objetivo

Avaliar se a interface do FUP é intuitiva e eficiente para os dois perfis de usuário: gestora e analistas.

## 10.2 Participantes

| Perfil | Quantidade | Recrutamento |
|---|---|---|
| Gestora de projetos | 1 | Usuária principal do sistema |
| Analistas | 2–3 | Membros da equipe que usarão o sistema diariamente |

## 10.3 Tarefas para teste

### Perfil: gestora

| ID | Tarefa | Critério de sucesso |
|---|---|---|
| TU-G-01 | Acessar o sistema e identificar qual projeto está mais atrasado | Identifica o projeto vermelho na sidebar em menos de 30 segundos |
| TU-G-02 | Navegar até o projeto X e verificar o status de cada analista | Lê o semáforo e os chips de status sem ajuda |
| TU-G-03 | Criar uma nova referência com 3 analistas MAT e 2 EQP | Completa os 6 passos sem erros e sem ajuda |
| TU-G-04 | Estender o DU de um analista de 27 para 30 dias | Encontra onde editar e salva sem ajuda |

### Perfil: analista

| ID | Tarefa | Critério de sucesso |
|---|---|---|
| TU-A-01 | Registrar a produção de hoje | Abre a gaveta, digita o valor, salva em menos de 1 minuto |
| TU-A-02 | Perceber que esqueceu de lançar ontem e corrigir | Encontra o dia anterior na gaveta e edita sem ajuda |
| TU-A-03 | Marcar um dia como feriado | Encontra o seletor de tipo e escolhe feriado |
| TU-A-04 | Verificar seu próprio status e saldo do dia | Lê os indicadores da sua linha na tabela |

## 10.4 Métricas coletadas

- Tempo para completar cada tarefa
- Número de erros ou cliques incorretos
- Necessidade de ajuda externa (sim/não)
- Escala de satisfação: 1 (muito difícil) a 5 (muito fácil)

## 10.5 Roteiro de observação

1. Apresentar o sistema sem explicar nada — observar a navegação espontânea
2. Pedir que o participante pense em voz alta enquanto executa as tarefas
3. Não intervir durante a execução, apenas registrar
4. Ao final, perguntar: "O que foi mais difícil? O que você mudaria?"

---

# 11. Registro de testes de usabilidade

> Este documento deve ser preenchido após a execução das sessões de teste com os usuários.

## 11.1 Informações das sessões

| Campo | Valor |
|---|---|
| Data das sessões | — |
| Versão do sistema | — |
| Moderador | — |

## 11.2 Resultados por participante

### Participante 1 — Gestora

| Tarefa | Concluiu? | Tempo | Erros | Satisfação | Observações |
|---|---|---|---|---|---|
| TU-G-01 | — | — | — | — | |
| TU-G-02 | — | — | — | — | |
| TU-G-03 | — | — | — | — | |
| TU-G-04 | — | — | — | — | |

### Participante 2 — Analista

| Tarefa | Concluiu? | Tempo | Erros | Satisfação | Observações |
|---|---|---|---|---|---|
| TU-A-01 | — | — | — | — | |
| TU-A-02 | — | — | — | — | |
| TU-A-03 | — | — | — | — | |
| TU-A-04 | — | — | — | — | |

## 11.3 Problemas identificados

| ID | Problema | Severidade | Tarefa relacionada | Sugestão de melhoria |
|---|---|---|---|---|
| — | — | — | — | — |

**Escala de severidade:** 1 = cosmético · 2 = menor · 3 = maior · 4 = crítico

## 11.4 Conclusões e ajustes planejados

> A preencher após análise dos resultados.
