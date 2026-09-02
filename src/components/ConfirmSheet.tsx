import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";
import type { ThemeOption } from "../data/mockData";
import Spinner from "./Spinner";

export default function ConfirmSheet({
  theme,
  submitting,
  onCancel,
  onConfirm,
}: {
  theme: ThemeOption;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
        onClick={submitting ? undefined : onCancel}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm overflow-hidden rounded-t-[2rem] border-t border-white/10 bg-[#170a2e] pb-8 pt-3 shadow-2xl"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

          <div className="flex items-center justify-between px-6">
            <h3 className="font-display text-lg font-bold text-white">Confirm your vote</h3>
            <button
              onClick={onCancel}
              disabled={submitting}
              className="rounded-full bg-white/10 p-1.5 text-white/70 transition hover:bg-white/20 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-6 mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <img
              src={theme.images[0]}
              alt={theme.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: theme.accent }}
              >
                {theme.tagline}
              </p>
              <p className="font-display text-lg font-bold text-white">{theme.name}</p>
            </div>
          </div>

          <div className="mx-6 mt-4 flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-[11px] leading-relaxed text-amber-100/90">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              You can only vote once. Please make sure this is the theme you want before
              confirming.
            </span>
          </div>

          <div className="mx-6 mt-5 flex gap-3">
            <button
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-40"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition active:scale-[0.98] disabled:opacity-80"
            >
              {submitting ? (
                <>
                  <Spinner size={16} /> Casting…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Confirm Vote
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
