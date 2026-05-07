"use client";

import { useEffect, useState } from "react";

// Solari/split-flap display — letters cycle through random characters then
// settle on the target. Done with pure React + CSS, no animation library.
// During scramble each tile shows the accent color; on settle it flips to
// foreground/background. No audio for now (R1 keeps the dep tree lean).

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const FRAMES_PER_LETTER = 14;
const FRAME_MS = 55;
const STAGGER_MS = 75;

function pickRandom() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export function SplitFlapText({ text, className = "" }: { text: string; className?: string }) {
  const target = text.toUpperCase();
  const [frames, setFrames] = useState<string[]>(() => target.split("").map(() => pickRandom()));
  const [done, setDone] = useState<boolean[]>(() => target.split("").map(() => false));

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    target.split("").forEach((finalChar, i) => {
      const start = setTimeout(() => {
        let frame = 0;
        const tick = setInterval(() => {
          frame += 1;
          if (frame >= FRAMES_PER_LETTER) {
            clearInterval(tick);
            setFrames((prev) => {
              const next = [...prev];
              next[i] = finalChar;
              return next;
            });
            setDone((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            return;
          }
          setFrames((prev) => {
            const next = [...prev];
            next[i] = pickRandom();
            return next;
          });
        }, FRAME_MS);
        intervals.push(tick);
      }, i * STAGGER_MS);
      timeouts.push(start);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [target]);

  return (
    <div className={`inline-flex gap-1 sm:gap-1.5 ${className}`} aria-label={target}>
      {frames.map((c, i) => (
        <Tile key={i} char={c} done={done[i]} />
      ))}
    </div>
  );
}

function Tile({ char, done }: { char: string; done: boolean }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center w-9 h-12 sm:w-12 sm:h-16 md:w-14 md:h-20 rounded-sm transition-colors duration-150 ${
        done ? "bg-foreground text-background" : "bg-accent text-accent-foreground"
      }`}
      style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(1.75rem, 4vw, 3rem)",
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      <span className="absolute inset-x-0 top-1/2 h-px bg-background/30" aria-hidden="true" />
      <span className="relative">{char}</span>
    </span>
  );
}
