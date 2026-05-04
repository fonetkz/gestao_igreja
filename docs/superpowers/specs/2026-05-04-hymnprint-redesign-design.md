---
title: HymnPrint — Redesign Visual (Blocos Elegantes)
date: 2026-05-04
status: approved
---

## Objetivo

Redesenhar a interface do editor e o layout do documento impresso em `src/pages/HymnPrintPage.jsx` com estética Apple-style (limpa, espaçosa, profissional) e estilo de impressão "Blocos Elegantes".

## Escopo

Um único arquivo: `src/pages/HymnPrintPage.jsx`. Sem novos arquivos. Sem mudanças em backend ou roteamento.

## Print Layout — Blocos Elegantes

### Cabeçalho
- Logo à esquerda (tamanho controlável via slider existente)
- Título centralizado: **Playfair Display Bold**, ~22px
- Subtítulo: Playfair Display regular, ~14px
- Data / local / contexto: Inter, ~10px, cor `#6B7280`
- Separador: linha `border-top: 1.5px solid #007AFF`, largura 60px centralizada, margem vertical

### Divisores de seção
- Formato visual: `──── NOME DA SEÇÃO ────`
- Implementação: pseudo-elementos `::before`/`::after` com `border-top` + `content: ''`, ou texto com `overflow: hidden` + flex
- Fonte: Inter 9px, uppercase, `letter-spacing: 0.15em`, cor `#9CA3AF`
- Margem: 14px top, 8px bottom

### Cards de hino
- Fundo: `#FAFCFF`
- Borda esquerda: `2px solid rgba(0,122,255,0.25)`
- Border-radius: `4px`
- Padding: `5px 8px`
- Layout: `Nº XX` em azul bold (Inter 9px) | título uppercase (Inter 9px, `#1C1C1E`) | Tom à direita (`#9CA3AF`)
- Sem sombra — apenas a borda esquerda distingue o card

### Tipografia do impresso
- Título do cabeçalho: `Playfair Display`, peso 700
- Todo o resto: `Inter` (sem Lora)
- Carregado via Google Fonts no `buildPrintHTML`

## Editor UI — Apple-style

### PrintToolbar
- Fundo `#F5F5F7`, border-bottom `1px solid #E5E7EB`
- Botões com `rounded-lg`, padding generoso, label + ícone
- "Imprimir" = botão azul `#007AFF` à direita, peso semibold
- Controle de tamanho de fonte: `− 11 +` compacto, fundo branco, borda sutil

### PrintSidebar
- Fundo `#FAFAFA`, border-right `1px solid #E5E7EB`
- Cards de hino: título em `font-semibold` numa linha, `Nº XX · Tom X` abaixo em `text-xs text-gray-400`
- Drag handle `⠿` visível ao hover, cor `#D1D5DB`
- Hover do card: fundo `#F0F4FF`

### Canvas (área de edição)
- Fundo `#F5F5F7` (cinza Apple)
- "Papel" interno: fundo branco, `shadow-xl`, `rounded-2xl`, padding `40px`
- Largura máxima: `680px`, centralizado
- Seções no canvas usam o mesmo estilo visual dos divisores do impresso
- Cards de hino no canvas espelham o estilo do impresso (border-left azul)

### PrintHeader (painel de edição do cabeçalho)
- Mantém estrutura atual
- Atualizar visual dos inputs para `input-apple` (já existente no projeto)
- Slider do logo: estilo atualizado com `accent-[#007AFF]`

## Componentes afetados

| Componente | Mudança |
|---|---|
| `PrintToolbar` | Redesign completo de estilos |
| `PrintSidebar` | Cards redesenhados |
| `PrintSection` | Divisor `────` style |
| `PrintHymnCard` (canvas) | Border-left azul, layout atualizado |
| `buildPrintHTML` | Layout B completo com Playfair + Inter |
| `HymnPrintPage` (canvas wrapper) | Fundo cinza, papel branco centralizado |

## Não incluído

- Mudanças de lógica/comportamento (drag-drop, templates, localStorage)
- Novos campos ou funcionalidades
- Outros arquivos além de `HymnPrintPage.jsx`
