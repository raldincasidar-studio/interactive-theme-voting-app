import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUp, ArrowRight } from "lucide-react";
import type { ThemeOption, Student } from "../data/mockData";
import StoryCard from "./StoryCard";

export default function VotingScreen({
  themes,
  student,
  onProceed,
  onLogout,
}: {
  themes: ThemeOption[];
  student: Student;
  onProceed: (theme: ThemeOption) => void;
  onLogout: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: [0.6] },
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [themes.length]);

  useEffect(() => {
    if (activeIndex > 0) setShowSwipeHint(false);
  }, [activeIndex]);

  const selectedTheme = themes.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <div
        ref={containerRef}
        className="snap-feed no-scrollbar h-full w-full overflow-y-scroll"
      >
        {themes.map((theme, i) => (
          <div
            key={theme.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            data-index={i}
          >
            <StoryCard
              theme={theme}
              student={student}
              index={i}
              total={themes.length}
              isActive={activeIndex === i}
              isSelected={selectedId === theme.id}
              onSelect={() => setSelectedId(theme.id)}
              onLogout={onLogout}
            />
          </div>
        ))}
      </div>

      {/* swipe up hint with gradient backdrop */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-20"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)",
            }}
          >
            <div className="flex flex-col items-center gap-2 px-4 py-6">
              <ChevronsUp className="h-5 w-5 animate-bounce text-white" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                Swipe up for more
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* progress dots */}
      <div className="pointer-events-none absolute right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1.5">
        {themes.map((_, i) => (
          <div
            key={i}
            className="h-6 w-1 rounded-full transition-all duration-300"
            style={{
              background:
                i === activeIndex ? "#e9d5ff" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>

      {/* continue bar */}
      <AnimatePresence>
        {selectedTheme && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="absolute inset-x-0 bottom-0 z-40 px-4 pb-5"
          >
            <button className="mx-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-5 py-4 shadow-2xl shadow-purple-950/60 active:scale-[0.98]">
              <span className="text-left text-sm text-white">
                <span className="block text-[11px] font-medium uppercase tracking-widest text-white/70">
                  Your pick
                </span>
                <span className="font-display font-bold">
                  {selectedTheme.name}
                </span>
              </span>
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-red-300 backdrop-blur-md hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => onProceed(selectedTheme)}
                className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
