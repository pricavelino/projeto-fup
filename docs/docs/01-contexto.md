# 1. Documentação de contexto

## 1.1 Introdução

O FUP (Follow Up de Produção) é um sistema web desenvolvido para substituir planilhas Excel utilizadas no acompanhamento diário da produção de equipes de análise em projetos de tratamento de preços referenciais. O sistema centraliza o controle de múltiplos projetos simultâneos, automatiza cálculos de metas e indicadores, e permite que analistas registrem sua produção diária de forma simples e acessível via navegador.

## 1.2 Problema

Equipes de analistas que executam projetos de tratamento de preços referenciais utilizam planilhas Excel individuais por projeto, compartilhadas via OneDrive, para registrar a produção diária. Esse modelo apresenta os seguintes problemas:

- **Cálculo manual do acumulado esperado:** a cada dia, é necessário contar quantos dias de tratamento já se passaram e multiplicar pela meta diária de cada analista, operação repetitiva e propensa a erros.
- **Retrabalho por referência:** ao final de cada ciclo de referência, é necessário criar uma nova versão limpa da planilha para o próximo ciclo, replicando a operação para cada um dos projetos simultâneos.
- **Ausência de visão consolidada:** com 12 projetos simultâneos cada um em sua própria planilha, não há uma visão unificada do status de todos os projetos em um único lugar.
- **Dependência de fórmulas frágeis:** as planilhas dependem de fórmulas que podem ser quebradas acidentalmente por qualquer usuário com acesso.
- **Dificuldade com lançamentos retroativos:** quando um analista esquece de registrar a produção de um dia anterior, o processo de correção é trabalhoso.

## 1.3 Objetivos

### Objetivo geral

Desenvolver uma aplicação web de acesso local em rede que automatize o acompanhamento diário da produção de equipes de análise, eliminando o trabalho manual de atualização de planilhas.

### Objetivos específicos

- Centralizar o acompanhamento de todos os projetos simultâneos em uma única interface
- Calcular automaticamente metas diárias, acumulados esperados, saldos e mínimos por dia restante
- Permitir lançamentos retroativos sem restrição de data, com diferenciação de tipos de dia
- Oferecer indicadores estatísticos por analista (média, máximo, mínimo, dias trabalhados)
- Fornecer semáforo visual de status baseado em limiares configuráveis por projeto
- Permitir que a gestora configure cada referência de forma independente, definindo analistas, posições e dias úteis

## 1.4 Justificativa

A automação desse processo reduz o esforço diário de todos os envolvidos, minimiza erros de cálculo e oferece uma visão consolidada em tempo real do andamento de todos os projetos. Por ser uma aplicação web acessível via rede local, não exige instalação em cada máquina dos usuários — basta um navegador.

## 1.5 Público-alvo

| Perfil | Papel no sistema |
|---|---|
| Gestora de projetos | Configura referências, define equipes, posições e DU; acompanha todos os projetos |
| Analistas MAT | Registram produção diária de itens de materiais |
| Analistas EQP | Registram produção diária de itens de equipamentos |

## 1.6 Glossário

| Termo | Definição |
|---|---|
| FUP | Follow Up de Produção — planilha/sistema de acompanhamento diário |
| Referência | Ciclo de execução de um projeto (ex: trimestral, mensal) |
| DU | Dias úteis disponíveis para tratamento no período |
| Tratamento | Processo de análise e classificação de itens de preços referenciais |
| MAT | Grupo de materiais — analistas que tratam itens de materiais |
| EQP | Grupo de equipamentos — analistas que tratam itens de equipamentos |
| Posições | Quantidade de itens alocados a um analista em uma referência |
| Meta por dia | Posições divididas pelos dias úteis do analista |
| Acumulado esperado | Meta por dia multiplicada pelo número de dias de tratamento decorridos |
| Saldo | Diferença entre realizado e acumulado esperado |
| Zero real | Dia em que o analista trabalhou mas não produziu itens tratados |
