import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Printer, AlertTriangle, RotateCcw, Plus, Trash2, FileText, Eye, ExternalLink, LayoutTemplate, Save, Download, Share2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Input } from '../ui/Input'
import useHymnsStore from '../../store/hymnsStore'
import useAuthStore from '../../store/authStore'

const BLOCK_TYPES = {
  header: { label: 'Cabeçalho', icon: FileText },
  title: { label: 'Título', icon: LayoutTemplate },
  text: { label: 'Texto', icon: FileText },
  hymns_centered: { label: 'Hinos', icon: FileText },
  footer: { label: 'Rodapé', icon: FileText },
}

function Toolbar({ config, previewMode, onTogglePreview, onReset, onPrint, onOpenBrowser }) {
  return (
    <Card padding="medium" className="mb-6 print-hide border-none shadow-xl shadow-slate-900/5 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
            <FileText size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Layout de Impressão</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Personalize o documento A4</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant={previewMode ? 'primary' : 'outline'} 
            size="sm" 
            icon={Eye} 
            onClick={onTogglePreview}
          >
            {previewMode ? 'Editar' : 'Preview'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon={RotateCcw} 
            onClick={onReset}
          >
            Resetar
          </Button>
          <Button 
            size="sm" 
            icon={Printer} 
            onClick={onPrint}
          >
            Imprimir
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-200 dark:border-slate-700">
        {[
          ['showTitle', 'Título'],
          ['showKey', 'Tom'],
          ['showNumber', 'Nº'],
          ['showConductor', 'Regente'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={config[key]} 
              onChange={() => {}} 
              className="accent-blue-600 w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900" 
            /> 
            {label}
          </label>
        ))}
        <div className="border-l border-slate-300 dark:border-slate-600 pl-4">
          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            <input 
              type="checkbox" 
              checked={config.pastorVersion} 
              onChange={() => {}} 
              className="accent-blue-600 w-4 h-4" 
            />
            Versão Dirigente
          </label>
        </div>
      </div>
    </Card>
  )
}

function BlockControls({ blocks, block, index, onMove, onRemove, onChange, isPreview }) {
  if (isPreview) return null

  return (
    <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1 print-hide z-20">
      <button 
        onClick={() => onMove(index, -1)} 
        disabled={index === 0}
        className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
        title="Mover para cima"
      >
        <ChevronUp size={14} strokeWidth={3} />
      </button>
      <button 
        onClick={() => onMove(index, 1)} 
        disabled={index === blocks.length - 1}
        className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
        title="Mover para baixo"
      >
        <ChevronDown size={14} strokeWidth={3} />
      </button>
      {block.type !== 'header' && block.type !== 'hymns_centered' && (
        <button 
          onClick={() => onRemove(block.id)}
          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm"
          title="Remover"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

function BlockRenderer({ block, config, hymns, isPreview, onChange }) {
  const formatDateBR = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T12:00:00')
      return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    } catch { return dateStr }
  }

  switch (block.type) {
    case 'header':
      return (
        <div className="text-center pb-5 mb-5" style={{ borderBottom: '2px solid #1E2A78' }}>
          {isPreview ? (
            <>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1E2A78', letterSpacing: '1px', marginBottom: '4px' }}>
                {config.churchName}
              </h1>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E2A78', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>
                {config.mainTitle}
              </p>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{config.serviceType}</p>
              <p style={{ fontSize: '12px', color: '#64748B' }}>{formatDateBR(config.date)}</p>
            </>
          ) : (
            <div className="space-y-2">
              <input 
                value={config.churchName} 
                onChange={e => onChange('churchName', e.target.value)}
                className="text-lg font-extrabold text-blue-900 text-center bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors" 
                style={{ letterSpacing: '1px' }} 
              />
              <input 
                value={config.mainTitle} 
                onChange={e => onChange('mainTitle', e.target.value)}
                className="text-sm font-semibold text-blue-900 uppercase text-center bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors" 
                style={{ letterSpacing: '2px' }} 
              />
              <input 
                value={config.serviceType} 
                onChange={e => onChange('serviceType', e.target.value)}
                className="text-xs text-slate-500 font-semibold text-center bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors" 
              />
              <input 
                type="date" 
                value={config.date} 
                onChange={e => onChange('date', e.target.value)}
                className="text-xs text-slate-500 font-semibold text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors cursor-pointer" 
              />
            </div>
          )}
        </div>
      )

    case 'title':
      return (
        <div className="text-center my-3">
          {isPreview ? (
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#1E2A78', textTransform: 'uppercase', letterSpacing: '3px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
              {block.content}
            </h2>
          ) : (
            <input 
              value={block.content || ''} 
              onChange={e => onChange('content', e.target.value, block.id)}
              className="text-sm font-extrabold text-blue-900 bg-transparent w-full text-center uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors"
              style={{ letterSpacing: '3px' }} 
            />
          )}
        </div>
      )

    case 'text':
      return (
        <div className="text-center my-2">
          {isPreview ? (
            <div className={`text-xs leading-relaxed ${block.bold ? 'font-bold' : 'font-medium'}`} style={{ color: '#334155', whiteSpace: 'pre-line' }}>
              {block.content}
            </div>
          ) : (
            <textarea 
              value={block.content || ''} 
              onChange={e => onChange('content', e.target.value, block.id)}
              rows={Math.max(2, (block.content || '').split('\n').length)}
              className={`w-full text-center text-xs bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors leading-relaxed ${block.bold ? 'font-bold' : 'font-medium'}`} 
            />
          )}
        </div>
      )

    case 'hymns_centered':
      return (
        <div className="py-3 text-center">
          {hymns.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum hino selecionado</p>
          ) : (
            <div className="space-y-1.5">
              {hymns.map((h, i) => (
                <div key={h.id} style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                  <span className="uppercase">{h.titulo}</span>
                  <span className="text-slate-500"> — Nº {h.numero}</span>
                  {config.showConductor && <span className="text-slate-500 text-xs"> • {h.regente || h.tonalidade}</span>}
                  {h.solista && <span className="text-blue-600 text-xs"> • Solo: {h.solista}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )

    case 'footer':
      return (
        <div className="mt-8 pt-3 text-center" style={{ borderTop: '1px solid #E2E8F0' }}>
          {isPreview ? (
            <p style={{ fontSize: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>
              {config.footerText}
            </p>
          ) : (
            <input 
              value={config.footerText} 
              onChange={e => onChange('footerText', e.target.value)}
              className="text-[9px] font-bold text-slate-400 uppercase tracking-[3px] text-center bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-slate-50 transition-colors" 
            />
          )}
        </div>
      )

    default:
      return null
  }
}

function AddBlockButtons({ onAdd, isPreview }) {
  if (isPreview) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl">
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[1px] mr-1">Add:</span>
      {[
        { type: 'title', label: 'Título' },
        { type: 'text', label: 'Texto' },
      ].map(({ type, label }) => (
        <Button 
          key={type} 
          variant="outline" 
          size="sm" 
          icon={Plus} 
          onClick={() => onAdd(type)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export default function ImpressaoTab({ initialDate, initialServiceType }) {
  const hymns = useHymnsStore(s => s.hymns)
  const todayProgram = useHymnsStore(s => s.todayProgram)
  const programHistory = useHymnsStore(s => s.programHistory)
  const user = useAuthStore(s => s.user)

  const activeProgram = todayProgram.length > 0 ? todayProgram : (programHistory[0]?.hinos_json || [])
  const activeMeta = todayProgram.length > 0
    ? { date: initialDate || new Date().toISOString().split('T')[0], serviceType: initialServiceType || 'Culto Dominical Matutino' }
    : { date: programHistory[0]?.data || new Date().toISOString().split('T')[0], serviceType: programHistory[0]?.tipo_culto || 'Culto Dominical Matutino' }

  const [config, setConfig] = useState({
    churchName: user?.churchName || 'Igreja Evangélica Central',
    date: activeMeta.date,
    serviceType: activeMeta.serviceType,
    showTitle: true,
    showKey: true,
    showNumber: true,
    showNotes: true,
    pastorVersion: false,
    mainTitle: 'Programação Musical',
    footerText: 'Sacred Gallery • Gestão de Orquestra',
  })

  const [blocks, setBlocks] = useState([
    { id: 'header', type: 'header' },
    { id: 't1', type: 'title', content: 'HINÁRIO' },
    { id: 'h1', type: 'hymns_centered' },
    { id: 'footer', type: 'footer' },
  ])

  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const selectedHymns = useMemo(() => {
    return activeProgram.map(id => hymns.find(h => h.id === id)).filter(Boolean)
  }, [activeProgram, hymns])

  const handleConfigChange = (key, value) => {
    setConfig(c => ({ ...c, [key]: value }))
  }

  const handleBlockChange = (key, value, blockId) => {
    if (blockId) {
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, [key]: value } : b))
    }
  }

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    setBlocks(newBlocks)
  }

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  const addBlock = (type) => {
    const id = `custom_${Date.now()}`
    setBlocks([...blocks, { id, type, content: type === 'title' ? 'NOVO TÍTULO' : 'Novo texto...', bold: false }])
  }

  const handleReset = () => {
    setBlocks([
      { id: 'header', type: 'header' },
      { id: 't1', type: 'title', content: 'HINÁRIO' },
      { id: 'h1', type: 'hymns_centered' },
      { id: 'footer', type: 'footer' },
    ])
    setResetModalOpen(false)
  }

  const toggle = (key) => setConfig(c => ({ ...c, [key]: !c[key] }))

  return (
    <div className="animate-fade-in">
      <Toolbar 
        config={config}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode(!previewMode)}
        onReset={() => setResetModalOpen(true)}
        onPrint={() => window.print()}
        onOpenBrowser={() => window.open(window.location.href, '_blank')}
      />

      <AddBlockButtons onAdd={addBlock} isPreview={previewMode} />

      <Modal open={resetModalOpen} onOpenChange={setResetModalOpen} title="Resetar Layout">
        <p className="text-sm font-medium text-slate-500 mb-5">
          Tem certeza que deseja resetar o layout para a estrutura padrão? Todas as alterações serão perdidas.
        </p>
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancelar</Button>
          <Button variant="danger" icon={RotateCcw} onClick={handleReset}>Sim, Resetar</Button>
        </div>
      </Modal>

      <div className="flex justify-center mb-8 overflow-x-auto pb-4">
        <div 
          className="print-a4 bg-white shadow-2xl shadow-slate-900/10 border border-slate-200 relative shrink-0" 
          style={{ width: '595px', minHeight: '842px', padding: '48px 52px' }}
        >
          <div className="absolute top-0 left-0 w-20 h-1 bg-blue-900 print-show" />
          <div className="absolute top-0 left-0 w-1 h-20 bg-blue-900 print-show" />
          <div className="absolute top-0 right-0 w-20 h-1 bg-blue-900 print-show" />
          <div className="absolute top-0 right-0 w-1 h-20 bg-blue-900 print-show" />

          <div className="space-y-1 relative z-10">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative group">
                <BlockControls 
                  blocks={blocks}
                  block={block}
                  index={index}
                  onMove={moveBlock}
                  onRemove={removeBlock}
                  onChange={handleBlockChange}
                  isPreview={previewMode}
                />
                <BlockRenderer 
                  block={block}
                  config={config}
                  hymns={selectedHymns}
                  isPreview={previewMode}
                  onChange={handleConfigChange}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {!previewMode && (
        <div className="print-hide flex flex-col items-center gap-3 pb-10">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
            <AlertTriangle size={14} />
            <span>Clique nas setas ao lado de cada bloco para reordenar ou remover</span>
          </div>

          <Button icon={Printer} size="lg" className="w-full max-w-xs shadow-lg" onClick={() => window.print()}>
            Imprimir
          </Button>
        </div>
      )}
    </div>
  )
}