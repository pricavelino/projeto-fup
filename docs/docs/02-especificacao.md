# 2. Especificação do projeto

## 2.1 Personas

### Persona 1 — Gestora de projetos

**Nome fictício:** Ana  
**Perfil:** Coordenadora de equipe com 12 projetos simultâneos em andamento. Responsável por definir o planejamento de cada referência, alocar analistas, definir metas e acompanhar o progresso geral.  
**Dores:** Gasta tempo excessivo calculando manualmente acumulados e criando novas versões de planilhas a cada ciclo. Não tem visão consolidada de todos os projetos em um lugar.  
**Necessidades:** Configurar rapidamente uma nova referência, visualizar o status de todos os projetos de uma vez, identificar analistas em atraso sem precisar abrir planilha por planilha.

### Persona 2 — Analista de materiais

**Nome fictício:** Carlos  
**Perfil:** Analista sênior responsável por tratar entre 300 e 1.500 itens por referência, dependendo do projeto.  
**Dores:** Precisa abrir o Excel todos os dias para lançar a produção. Às vezes esquece de lançar e não sabe como corrigir dias anteriores sem atrapalhar as fórmulas.  
**Necessidades:** Interface simples para lançar a produção do dia em poucos cliques, com possibilidade de corrigir dias anteriores sem complicação.

---

## 2.2 Histórias de usuário

| ID | Como... | Quero... | Para... |
|---|---|---|---|
| US-01 | Gestora | Criar uma nova referência em um formulário guiado | Configurar o FUP do próximo ciclo sem precisar copiar planilha |
| US-02 | Gestora | Definir analistas, posições e DU por grupo (MAT/EQP) em cada referência | Personalizar metas por ciclo sem alterar dados de outros projetos |
| US-03 | Gestora | Registrar feriados coletivos e ausências individuais | O sistema descontar esses dias do cálculo de acumulado esperado |
| US-04 | Gestora | Ver todos os projetos em uma sidebar com semáforo de status | Identificar rapidamente quais projetos estão em risco |
| US-05 | Gestora | Estender o DU de um analista quando o tratamento atrasa | O sistema recalcular metas sem perder o histórico de lançamentos |
| US-06 | Gestora | Definir limiares de alerta (ex: ≥80% = no prazo) por projeto | Adaptar o critério de status a projetos com diferentes níveis de exigência |
| US-07 | Analista | Registrar minha produção do dia em um campo simples | Manter o FUP atualizado sem precisar abrir Excel |
| US-08 | Analista | Lançar produção de dias anteriores que esqueci | Corrigir o histórico sem depender da gestora |
| US-09 | Analista | Marcar um dia como feriado, falta ou zero real | O sistema interpretar corretamente dias sem produção |
| US-10 | Analista | Ver meu acumulado esperado e saldo do dia | Saber se estou no prazo sem precisar calcular manualmente |
| US-11 | Gestora | Ver média, máximo e mínimo de produção por analista | Identificar inconsistências e dias não registrados |

---

## 2.3 Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O sistema deve permitir cadastrar projetos com nome, referência, periodicidade e observações | Alta |
| RF-02 | Cada projeto deve suportar múltiplos grupos de tratamento (MAT, EQP) com períodos independentes | Alta |
| RF-03 | A gestora deve poder alocar analistas em cada grupo, definindo posições e DU individualmente | Alta |
| RF-04 | O sistema deve calcular automaticamente meta por dia, acumulado esperado e mínimo por dia restante | Alta |
| RF-05 | Analistas devem poder registrar produção de qualquer dia passado (lançamento retroativo) | Alta |
| RF-06 | O sistema deve suportar tipos de dia: normal, zero real, feriado, férias e falta | Alta |
| RF-07 | Feriados coletivos devem ser aplicáveis a todos os analistas de um projeto | Alta |
| RF-08 | Ausências individuais (férias, falta) devem ser registráveis por analista específico | Alta |
| RF-09 | O sistema deve exibir semáforo de status baseado em limiares configuráveis | Alta |
| RF-10 | A gestora deve poder estender o DU de um analista sem perder o histórico | Alta |
| RF-11 | O sistema deve exibir indicadores estatísticos por analista: média, máximo, mínimo e dias trabalhados | Média |
| RF-12 | Dias marcados como feriado, férias ou falta não devem entrar no cálculo de média e dias trabalhados | Média |
| RF-13 | O sistema deve exibir marcos do cronograma por projeto, com datas planejadas e reais | Média |
| RF-14 | A gestora deve poder configurar os limiares de alerta por projeto | Média |
| RF-15 | O sistema deve permitir navegar entre projetos por uma sidebar com status visual | Alta |

---

## 2.4 Requisitos não funcionais

| ID | Requisito | Categoria |
|---|---|---|
| RNF-01 | O sistema deve ser acessível via navegador na rede local sem instalação | Usabilidade |
| RNF-02 | O tempo de resposta das operações de lançamento deve ser inferior a 1 segundo | Desempenho |
| RNF-03 | O banco de dados não deve ser versionado no repositório | Segurança |
| RNF-04 | O sistema deve funcionar em Chrome, Edge e Firefox atualizados | Compatibilidade |
| RNF-05 | O código deve ser organizado de forma que a migração para C# + SQL Server seja possível sem reescrever o frontend | Manutenibilidade |
| RNF-06 | Dados reais de clientes e analistas não devem aparecer no repositório público | Confidencialidade |

---

## 2.5 Restrições

- O sistema opera exclusivamente em rede local (sem exposição à internet na Fase 1)
- O banco de dados utilizado na Fase 1 é SQLite — adequado para o volume de dados e número de usuários simultâneos esperado
- Não há autenticação de usuários na Fase 1 — controle de acesso é feito pela rede
