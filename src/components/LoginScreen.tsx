import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { IdCard, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Info } from "lucide-react";
import Spinner from "./Spinner";
import type { Student } from "../data/mockData";
import { apiLogin } from "../lib/api";

const ID_PATTERN = /^\d{2}-[A-Z]-\d{5}$/i;

export default function LoginScreen({ onSuccess }: { onSuccess: (student: Student) => void }) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatIdInput(value: string) {
    // auto-format as NN-LL-NNNNN while typing
    const clean = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    let out = "";
    for (let i = 0; i < clean.length && i < 9; i++) {
      const ch = clean[i];
      if (i === 2 || i === 3) out += "-";
      out += ch;
    }
    return out.slice(0, 11);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ID_PATTERN.test(studentId)) {
      setError("Student ID must follow the format NN-LL-NNNNN (e.g. 26-A-12345).");
      return;
    }
    if (password.length < 4) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiLogin(studentId, password);
      if (!result.success || !result.student) {
        setError(result.message ?? "Unable to sign in. Please try again.");
        setLoading(false);
        return;
      }
      onSuccess(result.student);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-sm"
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 shadow-lg shadow-purple-900/50"
          >
            <img src="/favicon.png" alt="CCS Logo" className="h-8 w-8" />
          </motion.div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/80">
            CCS Presents
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-white">
            Acquaintance Party
          </h1>
          <p className="font-display bg-gradient-to-r from-fuchsia-300 via-purple-200 to-indigo-300 bg-clip-text text-lg font-semibold text-transparent">
            Theme Voting 2026
          </p>
          <p className="mt-3 text-sm leading-relaxed text-purple-200/70">
            Sign in with your student credentials to browse this year's candidate themes and cast
            your one and only vote.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-purple-200/70">
              Student ID
            </label>
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-300/70" />
              <input
                value={studentId}
                onChange={(e) => setStudentId(formatIdInput(e.target.value))}
                placeholder="26-A-12345"
                inputMode="text"
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 font-mono text-sm tracking-wider text-white placeholder-purple-300/40 outline-none transition focus:border-fuchsia-400/60 focus:bg-white/10 focus:ring-2 focus:ring-fuchsia-400/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-purple-200/70">
              Password (LAST NAME)
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-300/70" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-purple-300/40 outline-none transition focus:border-fuchsia-400/60 focus:bg-white/10 focus:ring-2 focus:ring-fuchsia-400/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/70 transition hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Spinner size={18} /> Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-[14px] leading-relaxed text-purple-200/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Use your approved SSAAM student ID and <u><b>password: (Last Name)</b></u></span>
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] text-purple-300/40">
          College of Computer Studies · One vote per student · Results verified electronically
        </p>
      </motion.div>
    </div>
  );
}
