# Filtro por Tipo de Hino no Acervo — Design Spec

**Data:** 2026-05-10  
**Escopo:** Painel "Acervo de Hinos" na tela de Programação (`ProgrammingPage.jsx`)

---

## Objetivo

Adicionar um filtro visual por tipo de hino (campo `tonalidade`) no painel esquerdo do acervo, usando chips clicáveis com suporte a múltipla seleção.

---

## O que NÃO muda

- Nome do campo no banco de dados: `tonalidade` (inalterado)
- Nome do campo no store (`hymnsStore.js`): `tonalidade` (inalterado)
- Contrato da API (backend): inalterado
- Lógica de filtro já existente no `HistoricoTab` (independente)
- Qualquer outra tela ou componente fora do escopo abaixo

---

## Mudanças de exibição (display only)

O texto `tonalidade` exibido ao usuário passa a ser **"Tipo de Hino"** nas seguintes superfícies:

- Label do campo no modal de criar/editar hino (`HymnModal`)
- Badge/etiqueta exibida no card do acervo (`HymnResultItem`)
- Qualquer outro texto visível que hoje diga "tonalidade"

Atenção: apenas labels e placeholders — nenhuma prop, variável ou chave de objeto é renomeada.

---

## Novo componente: chips de filtro

### Localização

Abaixo do campo de busca por texto no painel "Acervo de Hinos" em `ProgrammingPage.jsx`.

### Comportamento

- Renderiza um chip por tipo de hino que existe em **ao menos um hino** do acervo carregado. Tipos sem hinos não aparecem.
- Os chips são ordenados alfabeticamente.
- Chip inativo: estilo neutro (`btn-apple-secondary` ou equivalente compacto).
- Chip ativo: estilo azul (`btn-apple-primary` compacto).
- Clicar num chip inativo o ativa; clicar num chip ativo o desativa.
- Múltiplos chips podem estar ativos simultaneamente.
- Um botão "Limpar" aparece somente quando há ao menos um chip ativo, permitindo desselecionar todos de uma vez.

### Estado

Novo estado local em `ProgrammingPage.jsx`:

```js
const [selectedTipos, setSelectedTipos] = useState([])
```

### Lógica de filtro

Os filtros de texto e de tipo operam com AND:

```js
const filtered = hymns.filter(h => {
  const matchesText = /* lógica existente de busca por texto */
  const matchesTipo = selectedTipos.length === 0 || selectedTipos.includes(h.tonalidade)
  return matchesText && matchesTipo
})
```

Quando `selectedTipos` está vazio, o filtro de tipo é ignorado (mostra tudo).

### Derivação dos tipos disponíveis

```js
const tiposDisponiveis = [...new Set(hymns.map(h => h.tonalidade).filter(Boolean))].sort()
```

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/ProgrammingPage.jsx` | Adicionar estado `selectedTipos`, derivar `tiposDisponiveis`, renderizar chips abaixo da busca, aplicar filtro AND na lista |
| `src/components/programming/HymnModal.jsx` (ou onde estiver o modal) | Renomear label "tonalidade" → "Tipo de Hino" |
| `src/components/programming/HymnResultItem.jsx` (ou equivalente) | Renomear exibição de "tonalidade" → "Tipo de Hino" |

---

## Critérios de sucesso

1. Chips aparecem apenas para tipos presentes no acervo atual.
2. Selecionar um ou mais chips filtra a lista, combinando com o texto de busca.
3. Desselecionar todos os chips restaura a lista completa (sem perder o texto digitado).
4. Botão "Limpar" limpa apenas os chips (não o campo de texto).
5. Nenhum teste ou funcionalidade existente quebra.
6. O campo `tonalidade` no banco/store permanece inalterado.
