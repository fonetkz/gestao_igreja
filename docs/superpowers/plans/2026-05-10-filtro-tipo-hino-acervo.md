# Filtro por Tipo de Hino no Acervo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar chips de filtro por tipo de hino abaixo da busca no painel "Acervo de Hinos" da tela de Programação, com suporte a múltipla seleção e filtragem AND com o texto de busca.

**Architecture:** Toda a mudança é localizada em `src/pages/ProgrammingPage.jsx`, no componente `ProgramacaoForm`. Adicionamos estado local `selectedTipos`, derivamos os tipos disponíveis via `useMemo` a partir de `hymns`, filtramos o array já retornado por `searchHymns` e renderizamos os chips entre o campo de busca e o botão "Novo Hino". Nenhum store, API ou outro arquivo é alterado.

**Tech Stack:** React (useState, useMemo, useEffect), Tailwind CSS, classes do design system existente (`btn-apple-primary`, `btn-apple-secondary`)

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/ProgrammingPage.jsx` | Único arquivo modificado: novo estado, nova memo, lógica de filtro atualizada, chips de UI |

---

### Task 1: Adicionar estado e lógica de filtro por tipo

**Files:**
- Modify: `src/pages/ProgrammingPage.jsx:484-529`

- [ ] **Step 1: Adicionar `selectedTipos` state e `tiposDisponiveis` memo**

Abra `src/pages/ProgrammingPage.jsx`. Localize o bloco de `useState` dentro de `ProgramacaoForm` (linha 484). Após a linha `const [confirmClear, setConfirmClear] = useState(false)` (linha 494), insira:

```jsx
  const [selectedTipos, setSelectedTipos] = useState([])
```

Em seguida, logo após o `useMemo` de `hymnsById` (que termina na linha ~520), insira:

```jsx
  const tiposDisponiveis = useMemo(
    () => [...new Set(hymns.map(h => h.tonalidade).filter(Boolean))].sort(),
    [hymns]
  )
```

- [ ] **Step 2: Atualizar a lógica de filtro para combinar busca de texto e tipo**

Localize a linha 524:
```jsx
  const allFiltered = useMemo(() => searchHymns(searchTerm), [searchHymns, searchTerm])
```

Substitua por:
```jsx
  const allFiltered = useMemo(() => {
    const byText = searchHymns(searchTerm)
    if (selectedTipos.length === 0) return byText
    return byText.filter(h => selectedTipos.includes(h.tonalidade))
  }, [searchHymns, searchTerm, selectedTipos])
```

- [ ] **Step 3: Resetar página quando o filtro de tipo mudar**

Localize onde `searchTerm` causa reset de página. Se não houver um `useEffect` explícito para isso, adicione logo abaixo do `allFiltered` memo:

```jsx
  useEffect(() => { setPage(1) }, [searchTerm, selectedTipos])
```

> Atenção: se já existir um `useEffect` que chama `setPage(1)` ao mudar `searchTerm`, apenas adicione `selectedTipos` ao array de dependências dele.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ProgrammingPage.jsx
git commit -m "feat: add selectedTipos state and filter logic in ProgramacaoForm"
```

---

### Task 2: Renderizar os chips de filtro na UI

**Files:**
- Modify: `src/pages/ProgrammingPage.jsx:668-674`

- [ ] **Step 1: Inserir chips abaixo do campo de busca e acima do botão "Novo Hino"**

Localize o bloco do campo de busca (termina na linha ~671):
```jsx
              <div className="relative mb-3 shrink-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por número ou título..." className="input-apple pl-10 w-full" />
              </div>
              <button onClick={() => { setEditingHymn(null); setHymnModalOpen(true); }} className="w-full mb-3 ...">
```

Insira o seguinte bloco **entre** o `</div>` do campo de busca e o `<button>` do "Novo Hino":

```jsx
              {tiposDisponiveis.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
                  {tiposDisponiveis.map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setSelectedTipos(prev =>
                        prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
                      )}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
                        selectedTipos.includes(tipo)
                          ? 'bg-[#007AFF] text-white shadow-sm shadow-blue-500/20'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tipo.toUpperCase()}
                    </button>
                  ))}
                  {selectedTipos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTipos([])}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-150"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              )}
```

- [ ] **Step 2: Verificar visualmente**

Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Abra a tela de Programação e verifique:
1. Os chips aparecem abaixo da busca e acima de "Novo Hino"
2. Clicar num chip o destaca em azul
3. Clicar novamente o desativa
4. Selecionar múltiplos chips filtra a lista mostrando hinos que pertençam a qualquer um dos tipos selecionados (AND com texto)
5. "Limpar" aparece só quando há chips ativos e ao clicar desseleciona tudo sem apagar o texto da busca
6. Sem chips ativos, todos os hinos aparecem normalmente

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProgrammingPage.jsx
git commit -m "feat: render tipo de hino filter chips in Acervo de Hinos panel"
```

---

## Critérios de aceitação (verificação final)

- [ ] Chips aparecem apenas para tipos presentes em ao menos um hino do acervo
- [ ] Múltiplos chips podem estar ativos simultaneamente
- [ ] Filtro de tipo combina com filtro de texto (AND)
- [ ] Desativar todos os chips restaura lista completa sem perder texto da busca
- [ ] Botão "Limpar" só aparece quando há chips ativos
- [ ] Campo `tonalidade` no store/API não foi renomeado
- [ ] Nenhuma outra tela ou funcionalidade foi alterada
