import { motion } from "framer-motion";
import { PartyPopper, RotateCcw, Sparkle } from "lucide-react";
import type { ThemeOption } from "../data/mockData";
import FacebookIcon from "./FacebookIcon";

const FACEBOOK_PAGE_URL = "https://facebook.com/";

export default function ThankYouScreen({
  theme,
  studentName,
  onRestart,
}: {
  theme: ThemeOption;
  studentName: string;
  onRestart: () => void;
}) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
      {/* confetti-ish sparkles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-10, -120 - Math.random() * 80],
            x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 90),
            rotate: 360,
          }}
          transition={{
            duration: 2.4 + Math.random(),
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeOut",
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0"
        >
          <Sparkle className="h-4 w-4 text-fuchsia-300" />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 shadow-2xl shadow-purple-900/50"
      >
        <PartyPopper className="h-12 w-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300/80">
          Vote submitted
        </p>
        <h1 className="font-display mt-2 text-3xl font-extrabold text-white">Thank You!</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-purple-200/70">
          {studentName.split(" ")[0]}, your vote for
        </p>

        <div className="mx-auto mt-4 flex max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <img src={theme.images[0]} alt={theme.name} className="h-14 w-14 rounded-xl object-cover" />
          <div className="text-left">
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: theme.accent }}
            >
              {theme.tagline}
            </p>
            <p className="font-display text-lg font-bold text-white">{theme.name}</p>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-purple-200/70">
          has been recorded. Results will be announced by the CCS Student Council soon. Stay
          tuned!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 mt-8 flex w-full max-w-xs flex-col gap-3"
      >
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition active:scale-[0.98]"
        >
          <FacebookIcon className="h-4.5 w-4.5" /> Follow us on Facebook
        </a>
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" /> Back to Home
        </button>
      </motion.div>
    </div>
  );
}
