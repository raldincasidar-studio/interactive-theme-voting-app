import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Spinner from "./Spinner";

export default function ThemesLoading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 flex flex-col items-center gap-3 text-center"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 shadow-lg shadow-purple-900/40">
          <Sparkles className="h-7 w-7 text-white" />
          <span className="absolute inset-0 rounded-2xl animate-ring-pulse" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-purple-100">
          <Spinner size={16} /> Loading candidate themes…
        </div>
        <p className="max-w-[220px] text-xs text-purple-300/60">
          Fetching this year's party themes from the CCS voting server.
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-64 w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5"
          >
            <div className="shimmer h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
