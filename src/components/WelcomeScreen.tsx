import { motion } from "framer-motion";
import {
  PartyPopper,
  ImagePlay,
  ChevronsUp,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  LogOut,
} from "lucide-react";
import type { Student } from "../data/mockData";

const steps = [
  {
    icon: ImagePlay,
    title: "Browse like a story",
    desc: "Tap the left / right edge of each theme's photo to flip through its gallery, just like IG stories.",
  },
  {
    icon: ChevronsUp,
    title: "Swipe up for the next theme",
    desc: "Scroll or swipe up / down to move between all the candidate themes, TikTok-style.",
  },
  {
    icon: CheckCircle2,
    title: "Pick your favorite",
    desc: "Found the one you like? Tap “Vote for this theme” to lock in your choice.",
  },
];

export default function WelcomeScreen({
  student,
  onContinue,
}: {
  student: Student;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.15 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-900/40"
          >
            <PartyPopper className="h-8 w-8 text-white" />
          </motion.div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/80">
            You're in!
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-white">
            Welcome, {student.fullName.split(" ")[0]}!
          </h1>
          <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-purple-200/80">
            <GraduationCap className="h-3.5 w-3.5" />
            {student.course} · {student.yearLevel}
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-purple-300/70">
            How voting works
          </p>
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className="flex items-start gap-3 rounded-2xl bg-white/5 p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 text-fuchsia-200">
                <step.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-purple-200/60">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition active:scale-[0.98]"
        >
          Let's Get Started
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-purple-100 transition hover:bg-white/10 active:scale-[0.98]"
        >
          Logout
          <LogOut className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
