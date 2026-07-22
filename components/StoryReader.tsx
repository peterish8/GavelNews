"use client";

import { useCallback, useRef } from "react";
import { NewsReaderPill } from "./NewsReaderPill";
import { useStoryTTS } from "@/hooks/use-story-tts";

type StoryReaderProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Client shell around story body:
 * - floating NewsReaderPill (Gavelogy JudgmentReaderPill TTS)
 * - click-a-paragraph to start TTS from that sentence (useNoteTTS port)
 */
export function StoryReader({ title, children }: StoryReaderProps) {
  const articleRef = useRef<HTMLDivElement>(null);
  useStoryTTS(articleRef, true);

  const getContent = useCallback(() => {
    return articleRef.current?.innerText?.trim() ?? "";
  }, []);

  return (
    <>
      <div
        ref={articleRef}
        className="story-tts-root"
        data-tts-root
      >
        {children}
      </div>
      <NewsReaderPill getContent={getContent} title={title} />
    </>
  );
}
