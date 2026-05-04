# HymnPrint Redesign Visual — Blocos Elegantes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the print document and editor UI in `src/pages/HymnPrintPage.jsx` to an Apple-style aesthetic with "Blocos Elegantes" print layout.

**Architecture:** All changes are pure styling — no logic, state, or behavior changes. Seven components in a single file each get isolated style updates. Each task is self-contained.

**Tech Stack:** React, Tailwind CSS, Google Fonts (Playfair Display + Inter), inline styles for values not expressible in Tailwind.

> **Testing note:** This file has no unit tests. Each task ends with a browser verification step — run `npm run dev` once at the start and keep it open.

---

### Pre-requisite: Start Dev Server

- [ ] Run `npm run dev` and keep it open at the HymnPrint page for visual verification throughout all tasks.

---

### Task 1: `buildPrintHTML` — Layout Blocos Elegantes

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx:47-105`

Replace the entire `buildPrintHTML` function with the version below. Key changes:
- Remove Lora; use only Playfair Display + Inter
- Header: centered blue separator line (60px, `#007AFF`) instead of dark border
- Section dividers: `──── NAME ────` via flex + `::before`/`::after` CSS
- Hymn cards: `#FAFCFF` bg, `2px solid rgba(0,122,255,0.25)` border-left, `border-radius: 4px`
- Regent line uses Inter, not Lora

- [ ] **Step 1: Replace `buildPrintHTML`** (lines 47–105) with:

```jsx
function buildPrintHTML(canvasSections, headerConfig, sectionFontSize = 11) {
  const sectionsHTML = canvasSections
    .filter(s => s.hymns.length > 0)
    .map(section => {
      const hymnsHTML = section.hymns.map(hymn => `
        <div class="hymn-card">
          ${hymn.showNumber ? `<span class="hymn-num">Nº ${hymn.numero}</span>` : ''}
          <span class="hymn-title">${(hymn.titulo || '').toUpperCase()}</span>
          ${hymn.showType && hymn.tonalidade ? `<span class="hymn-key">${hymn.tonalidade}</span>` : ''}
          ${hymn.showRegente && hymn.regente ? `<span class="hymn-regent">Reg: ${hymn.regente}</span>` : ''}
        </div>`).join('')
      return `
        <div class="section">
          <div class="section-title"><span>${section.name}</span></div>
          <div class="section-hymns">${hymnsHTML}</div>
        </div>`
    }).join('')

  const logoH = headerConfig.logoHeight || 64
  const headerHTML = `
    <div class="doc-header">
      ${headerConfig.imageUrl ? `<img src="${headerConfig.imageUrl}" class="header-logo" style="max-height:${logoH}px" alt="Logo" />` : ''}
      <h1 class="header-title">${headerConfig.title || ''}</h1>
      ${headerConfig.subtitle ? `<p class="header-subtitle">${headerConfig.subtitle}</p>` : ''}
      ${headerConfig.date ? `<p class="header-meta">${headerConfig.date}</p>` : ''}
      ${headerConfig.location ? `<p class="header-meta">${headerConfig.location}</p>` : ''}
      <div class="header-sep"></div>
    </div>`

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <title>Programação de Hinos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 15mm; color: #111827; }
    .doc-header { text-align: center; padding-bottom: 20px; margin-bottom: 24px; }
    .header-logo { max-width: 280px; object-fit: contain; margin: 0 auto 12px; display: block; }
    .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #1C1C1E; letter-spacing: 0.3px; margin-bottom: 4px; }
    .header-subtitle { font-family: 'Inter', sans-serif; font-size: 11px; color: #6B7280; font-weight: 500; margin-bottom: 2px; }
    .header-meta { font-family: 'Inter', sans-serif; font-size: 10px; color: #6B7280; margin-top: 2px; }
    .header-sep { width: 60px; height: 1.5px; background: #007AFF; margin: 10px auto 0; }
    .section { margin-bottom: 20px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Inter', sans-serif; font-size: ${sectionFontSize}px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em;
      color: #9CA3AF; margin: 14px 0 8px;
    }
    .section-title::before, .section-title::after {
      content: ''; flex: 1; border-top: 1px solid #E5E7EB;
    }
    .section-title span { white-space: nowrap; }
    .hymn-card {
      display: flex; align-items: center; gap: 8px;
      background: #FAFCFF; border-left: 2px solid rgba(0,122,255,0.25);
      border-radius: 4px; padding: 5px 8px; margin-bottom: 4px;
    }
    .hymn-num { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #007AFF; min-width: 40px; white-space: nowrap; }
    .hymn-title { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; color: #1C1C1E; flex: 1; text-transform: uppercase; letter-spacing: 0.3px; }
    .hymn-key { font-family: 'Inter', sans-serif; font-size: 8px; color: #9CA3AF; font-weight: 500; white-space: nowrap; }
    .hymn-regent { font-family: 'Inter', sans-serif; font-size: 8px; color: #9CA3AF; white-space: nowrap; }
    @media print { @page { margin: 0; } body { padding: 15mm; } }
  </style>
</head>
<body>
  ${headerHTML}
  ${sectionsHTML}
</body>
</html>`
}
```

- [ ] **Step 2: Verify in browser** — click "Imprimir", check the print preview window shows: Playfair title, blue 60px separator line, `──── SEÇÃO ────` dividers, hymn cards with blue left border on `#FAFCFF` background.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: redesign print layout to Blocos Elegantes style"
```

---

### Task 2: `PrintHeader` — separador azul centralizado

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `PrintHeader` component (lines 259–336)

Remove the dark `borderBottom: '2px solid #1a2b42'` from the header wrapper and add a centered 60px blue line below the last input, matching the print output.

- [ ] **Step 1: Update `PrintHeader`** — change the opening `<div>` style and add separator:

Find:
```jsx
<div className="text-center pb-5 mb-6" style={{ borderBottom: '2px solid #1a2b42' }}>
```

Replace with:
```jsx
<div className="text-center pb-5 mb-6">
```

Then find the closing `</div>` that wraps all the inputs (after the last `<input ... location .../>`) and add the separator before it:

Find (the last input in PrintHeader):
```jsx
      <input
        type="text"
        value={headerConfig.location}
        onChange={e => onChange('location', e.target.value)}
        placeholder="Localização"
        className="text-xs text-gray-400 text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-[#007AFF]/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />
    </div>
```

Replace with:
```jsx
      <input
        type="text"
        value={headerConfig.location}
        onChange={e => onChange('location', e.target.value)}
        placeholder="Localização"
        className="text-xs text-gray-400 text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-[#007AFF]/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />
      <div className="w-[60px] h-[1.5px] bg-[#007AFF] mx-auto mt-3" />
    </div>
```

- [ ] **Step 2: Verify in browser** — canvas header now shows a short centered blue line below the date/location fields. No dark border visible.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: update PrintHeader with centered blue separator"
```

---

### Task 3: `PrintSection` — divisor `──── NOME ────` no canvas

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `PrintSection` component (lines 420–455)

Replace the section name display (the non-editing button) to visually render as `──── NAME ────` using flex lines on both sides. The editing input keeps its current behavior.

- [ ] **Step 1: Replace the section header row** in `PrintSection`.

Find (the entire `<div className="flex items-center justify-center gap-2 mb-1.5 group/header relative">` block):
```jsx
      <div className="flex items-center justify-center gap-2 mb-1.5 group/header relative">
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setName(section.name); setEditing(false) }
            }}
            className="bg-transparent border-b border-[#007AFF] focus:outline-none text-center pb-0.5"
            style={{ fontSize: `${fontSize}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#374860' }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover:text-[#007AFF] transition-colors flex items-center gap-1.5"
            style={{ fontSize: `${fontSize}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#4B5563' }}
          >
            {section.name}
            <span className="text-[9px] normal-case tracking-normal font-normal text-gray-300 opacity-0 group-hover/header:opacity-100 transition-opacity" style={{ fontSize: '9px' }}>editar</span>
          </button>
        )}
        {canvasSections.length > 1 && (
          <button
            onClick={() => onRemoveSection(section.id)}
            className="absolute right-0 opacity-0 group-hover/header:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
          >
            <X size={11} />
          </button>
        )}
      </div>
```

Replace with:
```jsx
      <div className="flex items-center gap-2 mb-1.5 group/header relative">
        <div className="flex-1 h-px bg-gray-200" />
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setName(section.name); setEditing(false) }
            }}
            className="bg-transparent border-b border-[#007AFF] focus:outline-none text-center pb-0.5 min-w-0"
            style={{ fontSize: `${fontSize}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover:text-[#007AFF] transition-colors whitespace-nowrap flex items-center gap-1"
            style={{ fontSize: `${fontSize}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}
          >
            {section.name}
            <span className="text-[9px] normal-case tracking-normal font-normal text-gray-300 opacity-0 group-hover/header:opacity-100 transition-opacity">editar</span>
          </button>
        )}
        <div className="flex-1 h-px bg-gray-200" />
        {canvasSections.length > 1 && (
          <button
            onClick={() => onRemoveSection(section.id)}
            className="opacity-0 group-hover/header:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
          >
            <X size={11} />
          </button>
        )}
      </div>
```

- [ ] **Step 2: Verify in browser** — section headers on canvas now show as `─── ABERTURA ───` style with gray lines on both sides. Clicking the name still opens the edit input. The delete X still appears on hover.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: redesign PrintSection header to Blocos Elegantes divider style"
```

---

### Task 4: `PrintHymnCard` — card com border-left azul no canvas

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `PrintHymnCard` component (lines 339–395)

Change the card from plain white `rounded-xl border border-gray-100` to `#FAFCFF` with a blue left border, matching the print output.

- [ ] **Step 1: Update card wrapper className and style** in `PrintHymnCard`.

Find:
```jsx
      className="group flex items-start gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm hover:border-[#007AFF]/20 transition-all cursor-grab active:cursor-grabbing select-none"
```

Replace with:
```jsx
      className="group flex items-start gap-2 p-2.5 bg-[#FAFCFF] rounded transition-all cursor-grab active:cursor-grabbing select-none"
      style={{ borderLeft: '2px solid rgba(0,122,255,0.25)', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}
```

- [ ] **Step 2: Verify in browser** — hymn cards in sections show `#FAFCFF` background with a subtle blue left border. No outer box border.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: update PrintHymnCard to border-left blue card style"
```

---

### Task 5: `PrintSidebar` — cards redesenhados

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `PrintSidebar` component (lines 110–176)

Changes:
- Sidebar background: `#FAFAFA` (currently `#F5F5F7`)
- Hymn cards: título `font-semibold` on its own line; `Nº XX · Tom X` below in `text-xs text-gray-400`
- Hover: `#F0F4FF` background
- Drag handle visible only on hover

- [ ] **Step 1: Update sidebar `<aside>` background**

Find:
```jsx
    <aside className="w-80 shrink-0 fixed left-0 top-16 bottom-0 flex flex-col bg-[#F5F5F7] dark:bg-[#1C1C1E] border-r border-gray-200/80 dark:border-gray-700/80 z-30">
```

Replace with:
```jsx
    <aside className="w-80 shrink-0 fixed left-0 top-16 bottom-0 flex flex-col bg-[#FAFAFA] dark:bg-[#1C1C1E] border-r border-[#E5E7EB] dark:border-gray-700/80 z-30">
```

- [ ] **Step 2: Redesign hymn card layout** — replace the entire `.map(hymn => { ... })` block inside `PrintSidebar`:

Find:
```jsx
        {sidebarHymns.map(hymn => {
          const inCanvas = hymnIdsInCanvas.includes(hymn.id)
          return (
            <div
              key={hymn.id}
              draggable
              onDragStart={e => onDragStart(e, { type: 'sidebar', hymnId: hymn.id })}
              className={`group flex items-center gap-2.5 p-3 bg-white dark:bg-[#2C2C2E] rounded-xl border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#007AFF]/30 transition-all select-none ${inCanvas ? 'opacity-50' : ''}`}
            >
              <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  <span className="text-[#007AFF]">Nº {hymn.numero}</span>
                  {' '}{hymn.titulo}
                </p>
                {hymn.tonalidade && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hymn.tonalidade}</p>
                )}
              </div>
              {inCanvas && (
                <Check size={12} className="text-[#007AFF] shrink-0" />
              )}
            </div>
          )
        })}
```

Replace with:
```jsx
        {sidebarHymns.map(hymn => {
          const inCanvas = hymnIdsInCanvas.includes(hymn.id)
          const meta = [hymn.numero ? `Nº ${hymn.numero}` : null, hymn.tonalidade || null].filter(Boolean).join(' · ')
          return (
            <div
              key={hymn.id}
              draggable
              onDragStart={e => onDragStart(e, { type: 'sidebar', hymnId: hymn.id })}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-[#F0F4FF] dark:hover:bg-blue-900/20 transition-colors select-none ${inCanvas ? 'opacity-40' : ''}`}
            >
              <GripVertical size={13} className="text-gray-200 dark:text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{hymn.titulo}</p>
                {meta && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{meta}</p>}
              </div>
              {inCanvas && <Check size={12} className="text-[#007AFF] shrink-0" />}
            </div>
          )
        })}
```

- [ ] **Step 3: Verify in browser** — sidebar shows: titles on top line (semibold, dark), `Nº XX · Tom X` below in gray. Drag handle appears on hover. Hover highlights in light blue `#F0F4FF`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: redesign PrintSidebar hymn cards to Apple-style layout"
```

---

### Task 6: `PrintToolbar` — estilo Apple-style

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `PrintToolbar` component (lines 178–256)

Wrap toolbar items in a styled container: `bg-[#F5F5F7]`, `border-b border-[#E5E7EB]`, `rounded-2xl px-4 py-3`. Template button and Save button use `rounded-lg` with clear labels.

- [ ] **Step 1: Update the toolbar container `<div>`**

Find:
```jsx
    <div className="flex items-center gap-3 mb-6 flex-wrap">
```

Replace with:
```jsx
    <div className="flex items-center gap-2 mb-6 flex-wrap bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E7EB] dark:border-gray-700 rounded-2xl px-4 py-2.5">
```

- [ ] **Step 2: Update template button style**

Find:
```jsx
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
```

Replace with:
```jsx
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
```

- [ ] **Step 3: Update Save Template button style**

Find:
```jsx
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm"
```

Replace with:
```jsx
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
```

- [ ] **Step 4: Update font size control style**

Find:
```jsx
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
```

Replace with:
```jsx
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-lg">
```

- [ ] **Step 5: Verify in browser** — toolbar appears as a unified pill/card with light gray background. Buttons are `rounded-lg`. Print button remains blue and prominent.

- [ ] **Step 6: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: redesign PrintToolbar to Apple-style unified bar"
```

---

### Task 7: `HymnPrintPage` — canvas wrapper "papel branco"

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `HymnPrintPage` component, canvas wrapper (lines 776–815)

The `#printable-canvas` div should look like a piece of paper floating on a gray surface: white bg, `shadow-xl`, `rounded-2xl`, `max-width: 680px`, centered. The outer `<main>` area uses `#F5F5F7`.

- [ ] **Step 1: Update `#printable-canvas` wrapper**

Find:
```jsx
          <div
            id="printable-canvas"
            className="bg-white dark:bg-white shadow-2xl shadow-gray-900/10 border border-gray-200"
            style={{ width: '595px', minHeight: '842px', padding: '48px 52px' }}
          >
```

Replace with:
```jsx
          <div
            id="printable-canvas"
            className="bg-white shadow-xl rounded-2xl"
            style={{ width: '680px', minHeight: '842px', padding: '48px 56px' }}
          >
```

- [ ] **Step 2: Verify the page heading area** — update the `<h1>` page title to match Apple style if needed. The existing `text-2xl font-semibold` is fine — no change needed.

- [ ] **Step 3: Verify in browser** — canvas appears as a white rounded "paper" card floating on the gray `#F5F5F7` background. Width is 680px. All sections and hymns render correctly inside.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: update canvas wrapper to floating paper style (680px, rounded-2xl, shadow-xl)"
```

---

### Task 8: Font loading — remover Lora, manter Inter + Playfair

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — `useEffect` for Google Fonts (lines 547–553)

The canvas preview loads Playfair Display for the header title. Remove Lora from the URL to match the print output.

- [ ] **Step 1: Update Google Fonts `useEffect`**

Find:
```jsx
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Lora:wght@400;500;600&display=swap'
```

Replace with:
```jsx
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap'
```

- [ ] **Step 2: Verify in browser** — header title in canvas uses Playfair Display. No console errors about missing fonts.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "chore: remove Lora font, load Inter alongside Playfair Display"
```

---

### Task 9: Verificação final

- [ ] Open the page in browser and perform end-to-end check:
  1. Sidebar: título semibold / Nº·Tom below, hover `#F0F4FF`, drag handle on hover
  2. Toolbar: unified gray bar, `rounded-lg` buttons, blue Imprimir button
  3. Canvas: white paper on gray bg, `rounded-2xl`, centered
  4. Section dividers: `─── NOME ───` lines on both sides
  5. Hymn cards: `#FAFCFF`, blue left border, no outer box
  6. Header: no dark border, short centered blue line separator
  7. Click "Imprimir": print preview shows Playfair title, blue separator, `──── SEÇÃO ────` dividers, hymn cards with blue left border

- [ ] Delete the temporary mockup file (created during brainstorming):

```bash
git rm mockup-impressao.html
git commit -m "chore: remove brainstorming mockup file"
```
