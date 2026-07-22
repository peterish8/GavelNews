'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { customToHtml } from '@/lib/content-converter'
import { applyHighlightsToHtml } from '@/lib/highlight-storage'
import { HighlightToolbar } from '@/components/learning/highlight-toolbar'
import { JudgmentPanel } from './JudgmentPanel'
import { BezierConnector } from './BezierConnector'
import { JudgmentReaderPill } from './JudgmentReaderPill'
import type { NotePdfLink } from '@/types'
import type { ConvexAttachedQuiz, Flashcard } from '@/types/domain/judgment'
import { cn } from '@/lib/utils'
import { sanitizeRichHtml } from '@/lib/security/rich-html'
import { BookOpen, HelpCircle, Layers, ChevronDown, Link2 } from 'lucide-react'
import { parseLinkMeta } from './student-view/utils/link-meta'
import { QuizTab } from './student-view/tabs/quiz-tab'
import { FlashcardsTab } from './student-view/tabs/flashcards-tab'
import { useNoteTTS } from './student-view/hooks/use-note-tts'
import { useLinkConnection } from './student-view/hooks/use-link-connection'

interface StudentJudgmentViewProps {
  itemId: string
  content: string
  links: NotePdfLink[]
  pdfUrl: string | null
  quizzes?: ConvexAttachedQuiz[]
  flashcards?: Flashcard[]
  title?: string
}

type Tab = 'notes' | 'quiz' | 'flashcards'

export function StudentJudgmentView({ itemId, content, links, pdfUrl, quizzes = [], flashcards = [], title }: StudentJudgmentViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [quizFullscreen, setQuizFullscreen] = useState(false)
  const [leftPct, setLeftPct] = useState(55)
  const [connectionsOpen, setConnectionsOpen] = useState(true)
  const [isEditMode, setIsEditMode] = useState(true)
  const [badgePositions, setBadgePositions] = useState<{ linkId: string; color: string; top: number; index: number }[]>([])
  const [displayHtml, setDisplayHtml] = useState('')
  const isDragging = useRef(false)
  const notesRef = useRef<HTMLDivElement>(null)

  const { activeLinkId, fromRect, toRect, activeColor, activateLink, handleHighlightReady } = useLinkConnection(notesRef, links, activeTab)
  useNoteTTS(notesRef, activeTab)

  const noteHtml = useMemo(() => customToHtml(content || ''), [content])

  useEffect(() => {
    setDisplayHtml(applyHighlightsToHtml(noteHtml, 'judgment', itemId))
  }, [noteHtml, itemId])

  const handleHighlightApplied = useCallback(() => {
    setDisplayHtml(applyHighlightsToHtml(noteHtml, 'judgment', itemId))
  }, [noteHtml, itemId])

  const linkSpanTexts = useMemo<Record<string, string>>(() => {
    if (typeof window === 'undefined' || !noteHtml) return {}
    const map: Record<string, string> = {}
    const doc = new DOMParser().parseFromString(noteHtml, 'text/html')
    doc.querySelectorAll<HTMLElement>('[data-link-id]').forEach(span => {
      const id = span.getAttribute('data-link-id')!
      if (!map[id]) map[id] = span.textContent?.trim() ?? ''
    })
    return map
  }, [noteHtml])

  useEffect(() => {
    const container = notesRef.current
    if (!container || links.length === 0) return
    const spans = container.querySelectorAll<HTMLElement>('[data-link-id]')
    spans.forEach(span => {
      const linkId = span.getAttribute('data-link-id')
      const link = links.find(l => l.link_id === linkId)
      if (link) {
        const { color } = parseLinkMeta(link.label)
        span.style.color = color
        span.style.borderBottomColor = color
      }
    })
  }, [noteHtml, links])

  const recalcBadgePositions = useCallback(() => {
    const container = notesRef.current
    if (!container || !links.length) { setBadgePositions([]); return }
    const containerRect = container.getBoundingClientRect()
    const scrollTop = container.scrollTop
    const seenLinkIds = new Set<string>()
    const positions: { linkId: string; color: string; top: number; index: number }[] = []

    container.querySelectorAll<HTMLElement>('span[data-link-id]').forEach(span => {
      if (span.closest('h1,h2,h3')) return
      const linkId = span.getAttribute('data-link-id')!
      if (seenLinkIds.has(linkId)) return
      seenLinkIds.add(linkId)
      const para = span.closest('p,li') as HTMLElement | null
      if (!para) return
      const paraRect = para.getBoundingClientRect()
      const link = links.find(l => l.link_id === linkId)
      const { color } = parseLinkMeta(link?.label)
      const top = (paraRect.bottom - containerRect.top) + scrollTop - 10
      positions.push({ linkId, color, top, index: positions.length })
    })
    setBadgePositions(positions)
  }, [links])

  useEffect(() => {
    if (!links.length) { setBadgePositions([]); return }
    const timer = setTimeout(recalcBadgePositions, 300)
    return () => clearTimeout(timer)
  }, [noteHtml, links, recalcBadgePositions])

  const handleDividerDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return
      const pct = (ev.clientX / window.innerWidth) * 100
      setLeftPct(Math.max(30, Math.min(70, pct)))
    }
    function onUp() {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = useMemo(() => ([
    { id: 'notes', label: 'Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-3.5 h-3.5" /> },
  ]), [])

  const quizCount = useMemo(() => quizzes.reduce((count, quiz) => count + quiz.questions.length, 0), [quizzes])
  const tabMeta: Record<Tab, number | null> = { notes: content.trim() ? null : 0, quiz: quizCount, flashcards: flashcards.length }
  const activeTabIndex = TABS.findIndex(tab => tab.id === activeTab)
  const canPrevTab = activeTabIndex > 0
  const canNextTab = activeTabIndex < TABS.length - 1

  const handleToolbarPrev = useCallback(() => { if (canPrevTab) setActiveTab(TABS[activeTabIndex - 1].id) }, [TABS, activeTabIndex, canPrevTab])
  const handleToolbarNext = useCallback(() => { if (canNextTab) setActiveTab(TABS[activeTabIndex + 1].id) }, [TABS, activeTabIndex, canNextTab])

  return (
    <div className="relative flex h-full w-full overflow-hidden" style={{ userSelect: isDragging.current ? 'none' : undefined }}>
      <JudgmentReaderPill getContent={() => notesRef.current?.innerText?.trim() ?? ''} onBack={() => router.back()} canPrev={canPrevTab} canNext={canNextTab} onPrev={handleToolbarPrev} onNext={handleToolbarNext} isEditMode={isEditMode} onToggleEdit={() => setIsEditMode(v => !v)} onToggleExpand={() => setConnectionsOpen(v => !v)} pdfUrl={pdfUrl} />
      <div className="flex flex-col h-full overflow-hidden border-r border-border bg-background pt-24" style={{ width: `${leftPct}%` }}>
        <div className="px-4 py-3 border-b border-border bg-card/80 shrink-0"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/80">Judgment Mode</p><p className="mt-1 text-sm font-semibold text-foreground truncate">{title || itemId}</p></div>
        <div className="flex items-center gap-0.5 px-3 pt-2.5 pb-0 shrink-0 border-b border-border bg-card">{TABS.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors', activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50')}>{tab.icon}{tab.label}{tabMeta[tab.id] !== null && <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', activeTab === tab.id ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{tabMeta[tab.id]}</span>}</button>)}</div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'notes' && (
            <div ref={notesRef} className="judgment-note-panel gavelogy-notes-shell flex-1 overflow-y-auto relative">
              {displayHtml ? (
                <>
                  <div id="judgment-note-content" className="gavelogy-notes gavelogy-notes-preview lesson-content prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(displayHtml) }} />
                  {badgePositions.length > 0 && <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>{badgePositions.map((b) => <button key={b.linkId} className="citation-badge pointer-events-auto absolute" style={{ top: b.top, right: 8, background: b.color }} title={`Jump to judgment (link ${b.index + 1})`} onClick={() => { const span = notesRef.current?.querySelector<HTMLElement>(`[data-link-id="${b.linkId}"]`); activateLink(b.linkId, b.color, span) }}>{b.index + 1}</button>)}</div>}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center"><BookOpen className="w-10 h-10 text-muted-foreground/30" /><p className="text-sm font-medium text-foreground">Notes not available yet.</p><p className="text-xs text-muted-foreground">This judgment does not have notes attached right now.</p></div>
              )}
              {isEditMode && <HighlightToolbar courseId="judgment" itemId={itemId} contentContainerId="judgment-note-content" onHighlightApplied={handleHighlightApplied} />}
            </div>
          )}
          {activeTab === 'quiz' && (
            <QuizTab
              quizzes={quizzes}
              fullscreen={quizFullscreen}
              onToggleFullscreen={() => setQuizFullscreen(v => !v)}
            />
          )}
          {activeTab === 'flashcards' && <FlashcardsTab flashcards={flashcards} />}
        </div>
      </div>
      <div onMouseDown={handleDividerDown} className="w-1 h-full bg-border hover:bg-primary/40 cursor-col-resize shrink-0 transition-colors group relative"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-0.5 h-5 bg-primary rounded-full" /></div></div>
      <div className="flex flex-col h-full overflow-hidden flex-1 bg-muted/20 pt-24">
        <div className="flex-1 overflow-hidden min-h-0">{pdfUrl ? <JudgmentPanel pdfUrl={pdfUrl} linkMappings={links} activeLinkId={activeLinkId} onHighlightReady={handleHighlightReady} /> : <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6"><BookOpen className="w-10 h-10 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No judgment PDF attached to this note.</p></div>}</div>
        {links.length > 0 && <div className="shrink-0 border-t border-border bg-background"><button onClick={() => setConnectionsOpen(o => !o)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/40 transition-colors"><Link2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /><span className="text-xs font-semibold text-foreground flex-1 text-left">Connections</span><span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">{links.length}</span><ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', connectionsOpen && 'rotate-180')} /></button>{connectionsOpen && <div className="max-h-52 overflow-y-auto divide-y divide-border">{links.map((link, i) => { const { text: labelText, color } = parseLinkMeta(link.label); const spanText = linkSpanTexts[link.link_id] ?? ''; const isActive = activeLinkId === link.link_id; return <button key={link.link_id} onClick={() => { const span = notesRef.current?.querySelector<HTMLElement>(`[data-link-id="${link.link_id}"]`); if (span) span.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => activateLink(link.link_id, color, span), 120) }} className={cn('w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors', isActive ? 'bg-muted/60' : 'hover:bg-muted/30')}><span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: color }} /><div className="flex-1 min-w-0"><p className="text-xs font-medium leading-snug truncate" style={{ color }}>{spanText ? `"${spanText}"` : `Link ${i + 1}`}<span className="text-muted-foreground font-normal ml-1.5">? p.{link.pdf_page}</span></p>{labelText && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{labelText}</p>}</div></button> })}</div>}</div>}
      </div>
      <BezierConnector fromRect={fromRect} toRect={toRect} visible={!!activeLinkId && !!fromRect && !!toRect} color={activeColor} />
    </div>
  )
}
