# 6. Template padrão da aplicação

## 6.1 Identidade visual

O FUP não possui marca própria — segue um visual neutro e profissional adequado a um sistema de gestão interno.

## 6.2 Paleta de cores

As cores são definidas como variáveis CSS para garantir consistência e suporte automático a dark/light mode.

| Variável | Uso |
|---|---|
| `--color-background-primary` | Fundo de cards e painéis principais |
| `--color-background-secondary` | Fundo de seções, barras e superfícies secundárias |
| `--color-text-primary` | Texto principal |
| `--color-text-secondary` | Labels, subtítulos e textos de apoio |
| `--color-border-tertiary` | Bordas padrão (0.5px) |

### Cores semânticas do semáforo

| Status | Background | Texto | Uso |
|---|---|---|---|
| Concluído | `#E6F1FB` | `#0C447C` | Falta = 0 |
| No prazo | `#EAF3DE` | `#27500A` | % alcançado ≥ limiar ok |
| Atenção | `#FAEEDA` | `#633806` | % entre atenção e ok |
| Atrasado | `#FCEBEB` | `#791F1F` | % < limiar atenção |

### Cores de tipo de dia (gaveta)

| Tipo | Background | Borda |
|---|---|---|
| Com produção | `#E1F5EE` | `#1D9E75` |
| Zero real | `#FAEEDA` | `#EF9F27` |
| Vazio / não lançado | padrão | padrão |
| Feriado / férias / falta | `--color-background-secondary` | padrão |

## 6.3 Tipografia

| Uso | Tamanho | Peso |
|---|---|---|
| Título de página | 18px | 500 |
| Nome de projeto / seção | 14–15px | 500 |
| Corpo e células de tabela | 12–13px | 400 |
| Labels e badges | 10–11px | 500 |

Fonte: sans-serif do sistema (var(--font-sans)).

## 6.4 Componentes padrão

### Cards de resumo (topo do FUP)
- Background: `--color-background-secondary`
- Border-radius: `--border-radius-md`
- Label: 11px, cor secundária
- Valor: 18px, peso 500

### Tabelas
- Border-collapse: collapse
- Borda entre linhas: `0.5px solid var(--color-border-tertiary)`
- Cabeçalhos: 10–11px, peso 500, cor secundária
- Linha de total: background secundário, peso 500

### Barra de progresso por analista
- Altura: 4–5px
- Border-radius: 3px
- Cor: verde (≥80%), amarelo (50–80%), vermelho (<50%)

### Semáforo (bolinha)
- Tamanho: 9px, border-radius: 50%
- Posicionada antes do nome do analista na tabela

### Gaveta (drawer)
- Largura: 340–360px
- Animação: translateX, 200ms ease
- Overlay: rgba(0,0,0,0.15)

### Badges de status
- Border-radius: 20px (pill)
- Padding: 2px 7–9px
- Font-size: 10–11px, peso 500

## 6.5 Layout base

```
┌─────────────────────────────────────────────────────┐
│  sidebar (186px)  │  main (flex: 1)                 │
│                   │  ┌─────────────────────────────┐│
│  lista de         │  │ header (projeto + dia)       ││
│  projetos com     │  ├─────────────────────────────┤│
│  % e semáforo     │  │ cards de resumo (4 colunas) ││
│                   │  ├─────────────────────────────┤│
│                   │  │ sec-bar MAT                  ││
│                   │  │ tabela MAT                   ││
│                   │  ├─────────────────────────────┤│
│                   │  │ sec-bar EQP                  ││
│                   │  │ tabela EQP                   ││
│                   │  ├─────────────────────────────┤│
│                   │  │ footer (legenda)             ││
│                   │  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
                              │ drawer (sobre o main,
                              │ abre pela direita)
```
