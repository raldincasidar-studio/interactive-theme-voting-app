import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Ghost,
  Gamepad2,
  Drama,
  Palmtree,
  Disc3,
  Heart,
  Check,
  Users,
  Share2,
  LogOut,
  ChevronsUp,
  MousePointerClick,
} from "lucide-react";
import type { ThemeOption, Student } from "../data/mockData";
import { cn } from "../utils/cn";

const ICONS = { Sparkles, Ghost, Gamepad2, Drama, Palmtree, Disc3 };

const SLIDE_DURATION = 4200;

export default function StoryCard({
  theme,
  student,
  index,
  total,
  isActive,
  isSelected,
  onSelect,
  onLogout,
}: {
  theme: ThemeOption;
  student: Student;
  index: number;
  total: number;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onLogout: () => void;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showProductTour, setShowProductTour] = useState(!student.voted && index === 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const Icon = ICONS[theme.iconName as keyof typeof ICONS] || Sparkles;

  useEffect(() => {
    if (!isActive) {
      setImgIndex(0);
      setProgress(0);
      setImageLoaded(false);
      elapsedRef.current = 0;
      return;
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || paused || showProductTour || !imageLoaded) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startRef.current = performance.now() - elapsedRef.current;
    function tick(now: number) {
      const elapsed = now - startRef.current;
      elapsedRef.current = elapsed;
      const pct = Math.min(1, elapsed / SLIDE_DURATION);
      setProgress(pct);
      if (pct >= 1) {
        elapsedRef.current = 0;
        setImgIndex((i) => (i + 1 < theme.images.length ? i + 1 : 0));
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, paused, imgIndex, theme.images.length, showProductTour, imageLoaded]);

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(theme.images.length - 1, next));
    elapsedRef.current = 0;
    setProgress(0);
    setImageLoaded(false);
    setImgIndex(clamped);
  }

  return (
    <section className="relative flex h-[100dvh] w-full snap-start items-center justify-center">
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {/* image layer */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={theme.images[imgIndex]}
              src={theme.images[imgIndex]}
              alt={`${theme.name} preview ${imgIndex + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="h-full w-full object-cover"
              draggable={false}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </AnimatePresence>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 22%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ background: `linear-gradient(160deg, ${theme.from}, ${theme.to})` }}
          />
        </div>

        {/* tap zones for story navigation */}
        <div className="absolute inset-0 z-10 flex">
          <button
            aria-label="Previous image"
            className="h-full w-1/2"
            onClick={() => goTo(imgIndex - 1)}
          />
          <button
            aria-label="Next image"
            className="h-full w-1/2"
            onClick={() => goTo(imgIndex + 1)}
          />
        </div>

        {/* progress bars */}
        <div className="relative z-20 flex gap-1.5 px-4 pt-4">
          {theme.images.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: i < imgIndex ? "100%" : i === imgIndex ? `${progress * 100}%` : "0%",
                  transition: i === imgIndex ? "none" : "width 0.2s",
                }}
              />
            </div>
          ))}
        </div>

        {/* header */}
        <div className="relative z-20 mt-3 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-md">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
            >
              <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-xs font-semibold text-white">Theme {index + 1}/{total}</span>
          </div>
          <div className="flex items-center gap-2">
            {student.voted && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/80 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Already Voted
              </div>
            )}
            <div className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-md">
              <Users className="h-3.5 w-3.5" />
              {theme.votes}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-red-600 active:scale-95"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* spacer to push content down */}
        <div className="flex-1" />

        {/* content */}
        <div className="relative z-20 space-y-3 px-5 pb-6">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: theme.accent }}
            >
              {theme.tagline}
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
              {theme.name}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-white/80">{theme.description}</p>

          {student.voted ? (
            <button
              onClick={() => {
                const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com';
                window.open(facebookUrl, '_blank');
              }}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/30 transition hover:bg-blue-700 active:scale-[0.97]"
            >
              <Share2 className="h-4.5 w-4.5" /> Follow us on Facebook
            </button>
          ) : (
            <button
              onClick={onSelect}
              className={cn(
                "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-bold transition active:scale-[0.97]",
                isSelected
                  ? "bg-white text-purple-700 shadow-lg shadow-black/30"
                  : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              )}
            >
              {isSelected ? (
                <>
                  <Check className="h-4.5 w-4.5" strokeWidth={3} /> Selected
                </>
              ) : (
                <>
                  <Heart className="h-4.5 w-4.5" /> Vote for this theme
                </>
              )}
            </button>
          )}
        </div>

        {/* Product Tour Overlay for First-time Voters */}
        <AnimatePresence>
          {showProductTour && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-black/40 backdrop-blur-sm"
              onClick={() => setShowProductTour(false)}
            >
              {/* Top instruction */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-20 flex flex-col items-center gap-3 rounded-2xl bg-black/60 px-6 py-4 backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <ChevronsUp className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-sm font-semibold text-white">Scroll or swipe up to see more themes</span>
                </div>
              </motion.div>

              {/* Right side instruction */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute right-6 top-1/2 flex flex-col items-center gap-3 rounded-2xl bg-black/60 px-4 py-4 backdrop-blur-md -translate-y-1/2"
              >
                <MousePointerClick className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Click here to advance</span>
              </motion.div>

              {/* Close hint at bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-20 text-center text-xs text-white/60"
              >
                <p>Tap anywhere to close this guide</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
