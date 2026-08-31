---
name: Gestão Igreja
description: Sistema desktop para igrejas — programação de hinos e materiais impressos do culto
colors:
  primary: "#1E2A78"
  primary-light: "#2E3E9A"
  primary-dark: "#151D5A"
  surface: "#F4F5F8"
  card: "#FFFFFF"
  text-muted: "#6B7280"
  success: "#10B981"
  warning: "#F59E0B"
  danger: "#EF4444"
typography:
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "1.5px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  input:
    backgroundColor: "#F9FAFB"
    textColor: "#111827"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Gestão Igreja

## Overview

**Creative North Star: "A Partitura Mestra"**

O sistema visual é uma partitura bem preparada: cada elemento está no seu lugar antes do ensaio começar. A interface transmite a calma de quem confia na própria organização — nada pisca à toa, nada pede atenção que não merece. O clima é sóbrio e confiável, como um hinário de capa dura aberto sobre a mesa da secretaria.

A densidade é confortável, nunca compacta: a usuária (secretaria da igreja, não técnica) lê listas de hinos e membros por longos períodos. O produto é um app desktop offline (Electron); a estética é de aplicativo nativo de trabalho, não de landing page consumer. O entregável final — o material impresso do culto — compartilha o mesmo índigo da tela: o que se vê na impressora é a mesma marca que se vê no monitor.

**Key Characteristics:**
- Um único tom de ação: Índigo Vespertino (#1E2A78)
- Cartões brancos flutuando sobre superfície cinza-claríssima (#F4F5F8)
- Sombras ambientes suaves; profundidade acolhedora, nunca dramática
- Tipografia Plus Jakarta Sans em corpo 14px, rótulos versalete espaçados
- Bordas generosas (12–16px); pílulas para badges e filtros

## Colors

Paleta fria e contida: um índigo profundo comanda as ações, os neutros cinza fazem toda a estrutura, e verde/âmbar/vermelho aparecem só como semântica de estado.

### Primary
- **Índigo Vespertino** (#1E2A78): a cor de ação única — botões primários, links, estados ativos de conteúdo, focos, gráficos e os detalhes do material impresso. Derivações: `primary-light` #2E3E9A (hover de texto) e `primary-dark` #151D5A (hover de botão preenchido).
- **Rampa Índigo** (blue-50…900 no tema Tailwind): a escala utilitária `blue-*` renderiza tints e shades desta família (50 #EEF1FB … 300 #93A5EC … 800 #1E2A78). Tints (blue-50/blue-100) servem de fundo para itens selecionados; blue-300/blue-400 são o acento legível em fundos escuros.
- **Modo escuro:** acentos em índigo claro (#93A5EC), superfícies #1A1A1A / cartões #2D2D2E.

### Neutral
- **Superfície** (#F4F5F8): fundo das páginas, modo claro.
- **Cartão** (#FFFFFF): fundo de cards e modais.
- **Texto principal** (gray-900 #111827) e **texto secundário** (#6B7280).
- **Bordas** (gray-100…gray-300): divisores discretos; bordas tracejadas sinalizam affordance de adicionar.

### Semantic
- **Sucesso** (#10B981), **Atenção** (#F59E0B), **Perigo** (#EF4444 / red-500): exclusivos para estado (badges, toasts, botões destrutivos). Nunca decorativos.

### Print Role Colors (material impresso apenas)
Cores semânticas específicas do layout impresso para diferenciar funções dos músicos a olho. Não são concorrentes da marca — são códigos de leitura rápida no A4.
- **Solista** (#2E3E9A / primary-light): nome do solista no card do hino.
- **Piano** (#059669 / emerald-600): indicação de piano no hino.
- **Violão** (#D97706 / amber-600): indicação de violão no hino.
- **Rótulo personalizado** (#9A3412 on #FFEDD5 / amber-800/50): tags customizadas do regente.
- **Cinza de impressão** (#4B5563 / gray-600): texto secundário no impresso (observações, metadados).

### Named Rules
**A Regra de Uma Voz.** Existe uma única cor de interação: o Índigo Vespertino. Azuis de sistema (#007AFF e derivados) estão aposentados; nenhuma segunda cor compete pelo gesto primário.

**O Impresso Herda a Marca.** O material impresso usa o mesmo índigo da interface — número do hino, separadores e cabeçalhos saem da impressora na cor da marca.

**Cinza Estrutura, Índigo Age.** Navegação ativa e seleção estrutural usam neutro (bg-gray-100). O índigo marca ação e conteúdo vivo, não localização na sidebar.

## Typography

**Display Font:** Plus Jakarta Sans (fallback -apple-system, Segoe UI)
**Body Font:** Plus Jakarta Sans (mesma família; hierarquia por peso e tamanho)
**Print Headings:** Playfair Display (serif — títulos de hino e cabeçalho do documento impresso)
**Print Body:** Inter (sans-serif — corpo, numeração de hino, metadados no material impresso)

**Character:** geométrico-humanista, moderna sem frieza; peso 700–800 dá autoridade aos títulos sem cerimônia.

### Hierarchy
- **Headline** (bold, 32px, tracking-tight -0.025em): título da página.
- **Title** (semibold, 20px): títulos de seção e de cartão.
- **Body** (regular, 14px, line-height 1.5): padrão de todo conteúdo; tabelas e listas em 13–14px.
- **Label** (bold, 10px, letter-spacing 1.5px, UPPERCASE): rótulos de formulário e legendas de métricas (`label-uppercase`).

### Named Rules
**A Regra do Versalete.** Todo rótulo de campo usa `label-uppercase`: 10px, bold, caixa alta, espaçamento 1.5px. Sem exceção.

## Layout

Shell fixo de aplicativo: sidebar à esquerda (desktop) ou barra inferior (mobile) + topbar com busca global. Conteúdo em coluna única com largura máxima confortável (~1280px), grades de cartões responsivas (1→2→3 colunas).

Ritmo de espaçamento: cartões respiram com padding interno de 20px (`p-5`) e gaps de 16–24px entre blocos. Páginas começam com heading + ações alinhadas à direita. Densidade constante entre telas — a usuária nunca reaprende onde as coisas estão.

## Elevation & Depth

Profundidade calma e confiável: sombras ambientes suaves, difusas, quase imperceptíveis no repouso. Nada de sombras pretas duras nem elevações dramáticas. No hover, o cartão sobe 2px com a sombra crescendo um passo — feedback tátil discreto. No modo escuro, profundidade vem de camadas tonais (superfícies mais claras quanto mais "altas"), não de sombras.

### Shadow Vocabulary
- **Ambiente baixo** (`box-shadow: 0 2px 10px rgba(0,0,0,0.04)`): cartões em repouso.
- **Ambiente médio** (`box-shadow: 0 4px 20px rgba(0,0,0,0.06)`): hover de cartão, popovers, dropdowns.
- **Ambiente alto** (`box-shadow: 0 10px 40px rgba(0,0,0,0.08)`): modais e gavetas.

### Named Rules
**A Regra do Flutuar Suave.** Sombra é ambiente, nunca estrutura: ela sugere altura com discrição; contornos e tons fazem o resto do trabalho.

## Shapes

Linguagem arredondada e amigável: controles (botões, inputs, selects) em 12px; cartões e modais em 16px; elementos pequenos (thumbnails, toggles internos) em 8px; badges, chips e avatares circulares (pill). **Material impresso:** rádios menores (2–3px) em mini-cards e observações de hino — é uso intencional de alta densidade em A4, não drift do design system. Bordas finas gray-100/gray-200 delimitam cartões; affordances de "adicionar" usam borda tracejada no tint do índigo (`border-dashed border-primary/30`). Inputs sem borda dura — o fundo cinza-claro define o campo, e o anel de foco assume ao interagir.

## Components

### Buttons
- **Shape:** retângulo arredondado (12px), padding 10px×20px, texto semibold 14px.
- **Primary:** fundo Índigo Vespertino (#1E2A78), texto branco, sombra `shadow-primary/25`; hover escurece para #151D5A; active comprime (scale 0.98).
- **Secondary:** fundo gray-100, texto gray-900; hover gray-200.
- **Outline:** fundo branco, borda gray-200; hover bg-gray-50.
- **Danger:** vermelho #EF4444, mesmo comportamento do primary.
- **Ghost:** texto gray-600, hover bg-gray-100, sem sombra.
- **Focus:** anel translúcido do índigo (ring-primary/25), nunca contorno duro.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** branco (modo escuro: #2C2C2E).
- **Border:** gray-100 (dark: gray-700/50).
- **Shadow Strategy:** ambiente baixo em repouso; hover sobe 2px com ambiente médio.
- **Internal Padding:** 20px (`p-5`).

### Inputs / Fields
- **Style:** fundo gray-50 sem borda (variante `input-base` com borda gray-200), radius 12px, padding 12px×16px, texto 14px.
- **Focus:** fundo clareia para branco + anel ring-primary/25.
- **Label:** sempre `label-uppercase` acima do campo.
- **Error:** mensagem textual em vermelho abaixo do campo; o campo ganha anel/borda vermelha.

### Badges & Chips
- **Style:** pílula (radius full), px-3 py-1, texto semibold 12px.
- **Semantic:** verde/âmbar/vermelho para estado; variante info usa tint do índigo.
- **Seleção/filtro:** fundo blue-50 com texto índigo quando ativo.

### Navigation
- **Sidebar/topbar items:** linha arredondada 12px, texto gray-500; hover bg-gray-100; ativo bg-gray-100 + texto gray-900 (neutro — ver Cinza Estrutura, Índigo Age).
- **Tabs:** sublinhado inferior azul-600 (rampa da marca) no item ativo.

### Toasts
Topo central, deslizando de cima; success verde, error vermelho, ícone à esquerda; desaparecem sozinhos após poucos segundos. Nunca `alert()`.

### Componente Assinatura: Programação Impressa
O editor de impressão é a tela-assinatura: folhas A4 simuladas em cartões brancos com campos inline editáveis, acentos em Índigo Vespertino (número do hino, separadores de 40px). O que se vê aqui é exatamente o que sai na impressora.

## Do's and Don'ts

### Do:
- **Do** usar os tokens (`primary`, `primary-light`, `primary-dark`, rampa `blue-*` remapeada) — nunca hex hardcoded.
- **Do** aplicar o índigo em ≤10% de qualquer tela: ações, links, estados vivos.
- **Do** usar borda tracejada + tint de índigo para affordances de adicionar (`border-dashed border-primary/30`).
- **Do** confirmar ações destrutivas com modal próprio (Radix), não `confirm()`.

### Don't:
- **Don't** usar azuis de sistema (#007AFF, #0062CC, #0051D4) ou qualquer segunda cor de ação concorrente.
- **Don't** introduzir roxo/violeta como acento paralelo (exceção histórica: faixa decorativa do login).
- **Don't** usar `alert()`/`confirm()` nativos ou jargão técnico ("falhou o endpoint") nas mensagens.
- **Don't** aplicar sombras duras ou elevações dramáticas; profundidade é ambiente suave.
- **Don't** colorir navegação ativa com o primário — localização é neutra, ação é índigo.
