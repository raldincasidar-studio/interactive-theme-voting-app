import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BackgroundFX from "./components/BackgroundFX";
import LoginScreen from "./components/LoginScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import ThemesLoading from "./components/ThemesLoading";
import VotingScreen from "./components/VotingScreen";
import ConfirmSheet from "./components/ConfirmSheet";
import ThankYouScreen from "./components/ThankYouScreen";
import type { Student, ThemeOption } from "./data/mockData";
import { apiFetchThemes, apiSubmitVote, clearStudentToken } from "./lib/api";
import AdminPanel from "./components/AdminPanel";

type Stage = "login" | "welcome" | "loading-themes" | "voting" | "submitting" | "thanks";

export default function App() {
  const [stage, setStage] = useState<Stage>("login");
  const [student, setStudent] = useState<Student | null>(null);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [pendingTheme, setPendingTheme] = useState<ThemeOption | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [votedTheme, setVotedTheme] = useState<ThemeOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = useCallback((s: Student) => {
    setStudent(s);
    setStage("welcome");
  }, []);

  const handleStartVoting = useCallback(async () => {
    setStage("loading-themes");
    try {
      const data = await apiFetchThemes();
      setThemes(data);
      setStage("voting");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load themes.");
      setStage("welcome");
    }
  }, []);

  const handleProceedToConfirm = useCallback((theme: ThemeOption) => {
    setPendingTheme(theme);
    setConfirmOpen(true);
  }, []);

  const handleConfirmVote = useCallback(async () => {
    if (!pendingTheme || !student) return;
    setStage("submitting");
    try {
      const result = await apiSubmitVote(pendingTheme.id);
      setConfirmOpen(false);
      if (result.success) {
      setVotedTheme(pendingTheme);
      setStage("thanks");
      } else {
        setError(result.message ?? "Unable to record vote.");
        setStage("voting");
      }
    } catch (e) {
      setConfirmOpen(false);
      setError(e instanceof Error ? e.message : "Unable to record vote.");
      setStage("voting");
    }
  }, [pendingTheme, student]);

  const handleRestart = useCallback(() => {
    clearStudentToken();
    setStudent(null);
    setThemes([]);
    setPendingTheme(null);
    setVotedTheme(null);
    setConfirmOpen(false);
    setStage("login");
  }, []);

  if (window.location.pathname === "/admin") return <AdminPanel />;

  return (
    <div className="relative min-h-[100dvh] w-full text-white">
      <BackgroundFX />

      <div className="relative z-10">
        {error && <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-4 py-3 text-sm text-white shadow-xl">{error}<button className="ml-3" onClick={() => setError(null)}>×</button></div>}
        <AnimatePresence mode="wait">
          {stage === "login" && (
            <motion.div key="login" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <LoginScreen onSuccess={handleLoginSuccess} />
            </motion.div>
          )}

          {stage === "welcome" && student && (
            <motion.div key="welcome" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <WelcomeScreen student={student} onContinue={handleStartVoting} />
            </motion.div>
          )}

          {stage === "loading-themes" && (
            <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <ThemesLoading />
            </motion.div>
          )}

          {(stage === "voting" || stage === "submitting") && themes.length > 0 && student && (
            <motion.div
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <VotingScreen themes={themes} student={student} onProceed={handleProceedToConfirm} onLogout={handleRestart} />
            </motion.div>
          )}

          {stage === "thanks" && votedTheme && student && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ThankYouScreen
                theme={votedTheme}
                studentName={student.fullName}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmOpen && pendingTheme && (
          <ConfirmSheet
            theme={pendingTheme}
            submitting={stage === "submitting"}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmVote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
