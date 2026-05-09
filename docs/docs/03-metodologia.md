# 3. Metodologia

## 3.1 Abordagem de desenvolvimento

O projeto adota uma abordagem **incremental e iterativa**, priorizando a entrega de valor em ciclos curtos. Cada iteração produz uma versão funcional do sistema, que é validada com a gestora de projetos antes de avançar para a próxima etapa.

A metodologia é inspirada nos princípios ágeis, adaptada ao contexto de um projeto desenvolvido por um desenvolvedor solo com validação contínua da usuária principal.

---

## 3.2 Fases do projeto

### Fase 1 — MVP local (foco atual)

**Objetivo:** sistema funcional em rede local, substituindo as planilhas Excel no dia a dia.

**Stack:** Node.js + Express + SQLite + HTML/CSS/JS puro  
**Acesso:** rede local (mesmo escritório ou VPN)  
**Autenticação:** não implementada — controle por rede  

Entregas:
- Modelo de dados completo (8 tabelas)
- API REST com rotas para projetos, analistas, lançamentos e marcos
- Interface do FUP com sidebar, tabelas, indicadores e gaveta de lançamento
- Formulário de setup de nova referência (6 passos)

### Fase 2 — Evolução (planejada)

**Objetivo:** sistema robusto, com autenticação, histórico entre referências e painel gerencial.

**Stack:** C# + ASP.NET Core + SQL Server + frontend existente reaproveitado  
**Acesso:** rede local ou internet (com autenticação)  

Entregas planejadas:
- Login por usuário com perfis (gestora / analista)
- Painel consolidado de todos os projetos com gráficos de evolução
- Histórico comparativo entre referências
- Exportação de relatórios

---

## 3.3 Processo de desenvolvimento

```
Levantamento de requisitos
        ↓
Prototipagem de interface (validação visual)
        ↓
Definição do modelo de dados
        ↓
Implementação do backend (API)
        ↓
Implementação do frontend (integração com API)
        ↓
Testes funcionais
        ↓
Deploy em rede local
        ↓
Feedback e ajustes
```

---

## 3.4 Ferramentas utilizadas

| Ferramenta | Finalidade |
|---|---|
| Visual Studio Code | Editor de código principal |
| Git + GitHub | Versionamento e repositório público |
| Node.js + npm | Runtime e gerenciador de pacotes |
| better-sqlite3 | Driver SQLite para Node.js |
| Express | Framework HTTP do backend |
| Insomnia / Postman | Testes manuais da API REST |
| Navegador (Chrome/Edge) | Teste da interface |

---

## 3.5 Controle de versão

O repositório segue a convenção de branches:

| Branch | Uso |
|---|---|
| `main` | Código estável, pronto para uso |
| `develop` | Integração das funcionalidades em desenvolvimento |
| `feature/nome` | Desenvolvimento de uma funcionalidade específica |

Convenção de commits (Conventional Commits):

```
feat: adiciona lançamento retroativo na gaveta do analista
fix: corrige cálculo de acumulado esperado em dias com feriado
docs: atualiza especificação com requisitos de indisponibilidade
refactor: extrai cálculo de estatísticas para função separada
```

---

## 3.6 Cronograma macro

| Etapa | Descrição | Status |
|---|---|---|
| Levantamento | Contexto, personas, requisitos e modelo de dados | Concluído |
| Prototipagem | Interface do FUP, setup e gaveta de lançamento | Concluído |
| Backend — base | server.js, database.js, init.js, rotas básicas | A fazer |
| Backend — lançamentos | Rota de lançamento com suporte retroativo e tipos de dia | A fazer |
| Frontend — FUP | Integração com API, cálculos automáticos | A fazer |
| Frontend — setup | Formulário de nova referência integrado com API | A fazer |
| Testes | Funcionais e de usabilidade | A fazer |
| Deploy local | Configuração em rede local para uso real | A fazer |
