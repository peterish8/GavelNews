"use client";

// Adapted from Gavelogy_trail:
// src/components/judgment/student-view/hooks/use-note-tts.ts
// Click a paragraph → browser TTS from that sentence onward.

import { useEffect, type RefObject } from "react";
import { startTTS, stopTTS } from "@/lib/tts-manager";

export function useStoryTTS(
  articleRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const container = articleRef.current;
    if (!container) return;

    function handleTTSClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Don't steal clicks from buttons / links
      if (target.closest("a, button, input, [data-no-tts]")) return;

      const block = target.closest("p, li, h1, h2, h3") as HTMLElement | null;
      if (!block || !container!.contains(block)) return;

      const fullText = block.innerText?.trim();
      if (!fullText) return;

      if (block.classList.contains("speaking")) {
        stopTTS("story");
        block.classList.remove("speaking");
        return;
      }

      document
        .querySelectorAll(".speaking")
        .forEach((el) => el.classList.remove("speaking"));
      block.classList.add("speaking");

      let clickCharOffset = 0;
      try {
        // caretRangeFromPoint is Chromium; optional
        const cr = (
          document as Document & {
            caretRangeFromPoint?: (x: number, y: number) => Range | null;
          }
        ).caretRangeFromPoint?.(e.clientX, e.clientY);
        if (cr && block.contains(cr.startContainer)) {
          const r = document.createRange();
          r.setStart(block, 0);
          r.setEnd(cr.startContainer, cr.startOffset);
          clickCharOffset = r.toString().length;
        }
      } catch {
        /* ignore */
      }

      const sentences = fullText.split(/(?<=[.!?])\s+/).filter(Boolean);
      let charCount = 0;
      let startIdx = 0;
      for (let i = 0; i < sentences.length; i++) {
        charCount += sentences[i].length + 1;
        if (charCount > clickCharOffset) {
          startIdx = i;
          break;
        }
      }

      const textToRead = sentences.slice(startIdx).join(" ") || fullText;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      utterance.onend = () => block.classList.remove("speaking");
      utterance.onerror = () => block.classList.remove("speaking");
      startTTS("story", utterance);
    }

    container.addEventListener("click", handleTTSClick);
    return () => {
      container.removeEventListener("click", handleTTSClick);
      stopTTS("story");
      document
        .querySelectorAll(".speaking")
        .forEach((el) => el.classList.remove("speaking"));
    };
  }, [articleRef, enabled]);
}
