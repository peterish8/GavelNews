import { useEffect, type RefObject } from 'react'
import { startTTS, stopTTS } from '@/lib/tts-manager'

export function useNoteTTS(notesRef: RefObject<HTMLDivElement | null>, activeTab: string) {
  useEffect(() => {
    const container = notesRef.current
    if (!container) return

    function handleTTSClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('[data-link-id]')) return
      const block = target.closest('p, li, h1, h2, h3') as HTMLElement | null
      if (!block) return

      const fullText = block.innerText?.trim()
      if (!fullText) return

      if (block.classList.contains('speaking')) {
        stopTTS('notes')
        block.classList.remove('speaking')
        return
      }

      document.querySelectorAll('.speaking').forEach(el => el.classList.remove('speaking'))
      block.classList.add('speaking')

      let clickCharOffset = 0
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cr = (document as any).caretRangeFromPoint?.(e.clientX, e.clientY) as Range | null
        if (cr && block.contains(cr.startContainer)) {
          const r = document.createRange()
          r.setStart(block, 0)
          r.setEnd(cr.startContainer, cr.startOffset)
          clickCharOffset = r.toString().length
        }
      } catch {}

      const sentences = fullText.split(/(?<=[.!?])\s+/).filter(Boolean)
      let charCount = 0
      let startIdx = 0
      for (let i = 0; i < sentences.length; i++) {
        charCount += sentences[i].length + 1
        if (charCount > clickCharOffset) {
          startIdx = i
          break
        }
      }

      const textToRead = sentences.slice(startIdx).join(' ') || fullText
      const utterance = new SpeechSynthesisUtterance(textToRead)
      utterance.lang = 'en-IN'
      utterance.rate = 0.9
      utterance.onend = () => block.classList.remove('speaking')
      utterance.onerror = () => block.classList.remove('speaking')
      startTTS('notes', utterance)
    }

    container.addEventListener('click', handleTTSClick)
    return () => container.removeEventListener('click', handleTTSClick)
  }, [activeTab, notesRef])
}
