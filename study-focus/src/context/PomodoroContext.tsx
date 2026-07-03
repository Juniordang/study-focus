import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useCiclosPomodoro,
  usePomodoro as usePomodoroMutation,
  useTempos,
} from "@/hooks/use-pomodoro";
import { useStudy } from "@/context/StudyContext";
import { playPomodoroAlarm, unlockPomodoroAlarm } from "@/lib/pomodoro-alarm";
import { markSessionAsCompleted } from "@/lib/session-status";

export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type PomodoroPresets = Record<PomodoroPhase, number>;

export const POMODORO_PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: "Foco",
  shortBreak: "Pausa Curta",
  longBreak: "Pausa Longa",
};

const POMODORO_PHASE_API_VALUES: Record<
  PomodoroPhase,
  "foco" | "pausa_curta" | "pausa_longa"
> = {
  focus: "foco",
  shortBreak: "pausa_curta",
  longBreak: "pausa_longa",
};

const POMODORO_STORAGE_KEY = "studyFocusPomodoroState";
const POMODORO_PHASES: PomodoroPhase[] = ["focus", "shortBreak", "longBreak"];
const TIMER_STATUSES: TimerStatus[] = [
  "idle",
  "running",
  "paused",
  "completed",
];

interface StoredPomodoroState {
  phase: PomodoroPhase;
  timeLeft: number;
  timerStatus: TimerStatus;
  activeSessionId: string | null;
}

interface PomodoroContextValue {
  presets: PomodoroPresets | null;
  isLoadingPresets: boolean;
  phase: PomodoroPhase;
  timeLeft: number;
  timerStatus: TimerStatus;
  isRunning: boolean;
  isPaused: boolean;
  switchPhase: (phase: PomodoroPhase) => void;
  reset: () => void;
  toggleTimer: () => void;
  advancePhase: () => void;
  completeSessionEarly: () => void;
  ciclosConcluidos: number;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { activeSessionId, setActiveSession } = useStudy();
  const { salvarPomodoro } = usePomodoroMutation();
  const { data: tempos, isLoading: isLoadingTempos } = useTempos();

  const presets = tempos
    ? {
        focus: tempos.tempo_foco * 60,
        shortBreak: tempos?.tempo_pausa_curta * 60,
        longBreak: tempos?.tempo_pausa_longa * 60,
      }
    : null;

  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const didLoadStoredState = useRef(false);
  const [canPersistState, setCanPersistState] = useState(false);

  useEffect(() => {
    if (!presets) return;
    if (!canPersistState) return;
    if (timerStatus !== "idle") return;

    setTimeLeft(presets[phase]);
  }, [canPersistState, presets, phase, timerStatus]);

  useEffect(() => {
    if (!presets || didLoadStoredState.current) return;

    didLoadStoredState.current = true;

    if (typeof window === "undefined") {
      setCanPersistState(true);
      return;
    }

    try {
      const saved = window.localStorage.getItem(POMODORO_STORAGE_KEY);
      if (!saved) {
        setCanPersistState(true);
        return;
      }

      const parsed = JSON.parse(saved) as Partial<StoredPomodoroState>;
      const savedPhase = parsed.phase;
      const savedStatus = parsed.timerStatus;
      const savedTimeLeft = Number(parsed.timeLeft);

      if (
        !POMODORO_PHASES.includes(savedPhase as PomodoroPhase) ||
        !TIMER_STATUSES.includes(savedStatus as TimerStatus) ||
        !Number.isFinite(savedTimeLeft) ||
        savedTimeLeft < 0
      ) {
        window.localStorage.removeItem(POMODORO_STORAGE_KEY);
        setCanPersistState(true);
        return;
      }

      const restoredPhase = savedPhase as PomodoroPhase;
      const restoredStatus = savedStatus as TimerStatus;
      const restoredActiveSessionId =
        typeof parsed.activeSessionId === "string"
          ? parsed.activeSessionId
          : null;

      setPhase(restoredPhase);
      setTimeLeft(Math.floor(savedTimeLeft));
      setTimerStatus(restoredStatus === "running" ? "paused" : restoredStatus);
      setActiveSession(restoredActiveSessionId);
    } catch {
      window.localStorage.removeItem(POMODORO_STORAGE_KEY);
    } finally {
      setCanPersistState(true);
    }
  }, [presets, setActiveSession]);

  useEffect(() => {
    if (!presets || !canPersistState || typeof window === "undefined") return;
    if (timerStatus === "idle" && timeLeft === 0) return;

    const stateToStore: StoredPomodoroState = {
      phase,
      timeLeft,
      timerStatus,
      activeSessionId,
    };

    window.localStorage.setItem(
      POMODORO_STORAGE_KEY,
      JSON.stringify(stateToStore),
    );
  }, [activeSessionId, canPersistState, phase, presets, timeLeft, timerStatus]);

  const sessionId = activeSessionId ? Number(activeSessionId) : undefined;
  const { data: ciclosConcluidos = 0 } = useCiclosPomodoro(sessionId);

  useEffect(() => {
    if (!sessionId || ciclosConcluidos <= 0) return;

    markSessionAsCompleted(sessionId);
  }, [ciclosConcluidos, sessionId]);

  const getNextPhase = (currentPhase: PomodoroPhase): PomodoroPhase => {
    if (currentPhase !== "focus") {
      return "focus";
    }

    const ciclosDepoisDeste = ciclosConcluidos + 1;
    return ciclosDepoisDeste % 4 === 0 ? "longBreak" : "shortBreak";
  };

  const isRunning = timerStatus === "running";
  const isPaused = timerStatus === "paused";

  const finishSession = useCallback(
    (reason: "natural" | "early", elapsedSeconds: number) => {
      if (!presets) return;

      const normalizedElapsedSeconds = Math.max(0, elapsedSeconds);
      setTimerStatus("completed");

      if (reason === "natural") {
        void playPomodoroAlarm();
        switchPhase(getNextPhase(phase));
      }

      if (activeSessionId && normalizedElapsedSeconds > 0) {
        const sessionId = Number(activeSessionId);
        const elapsedMinutes = Math.max(
          1,
          Math.ceil(normalizedElapsedSeconds / 60),
        );

        const fase = POMODORO_PHASE_API_VALUES[phase];
        salvarPomodoro(sessionId, elapsedMinutes, fase, 1, () => {
          if (phase === "focus") {
            markSessionAsCompleted(sessionId);
          }
        });
      }

      if (reason !== "natural") {
        setTimeLeft(presets[phase]);
      }
    },
    [activeSessionId, phase, presets, salvarPomodoro],
  );

  const completeSessionEarly = useCallback(() => {
    if (!presets) return;
    finishSession("early", presets[phase] - timeLeft);
  }, [finishSession, phase, presets, timeLeft]);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
      console.log("segundos: ", timeLeft);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (!presets) return;
    if (isRunning && timeLeft === 0) {
      console.log("fim do pomodoro natural: ", phase);
      finishSession("natural", presets[phase]);
    }
  }, [finishSession, isRunning, phase, presets, timeLeft]);

  const reset = useCallback(() => {
    if (!presets) return;
    console.log("fase pomodoro parado", phase, presets[phase]);
    setTimerStatus("idle");
    setTimeLeft(presets[phase]);
  }, [phase, presets]);

  const switchPhase = useCallback(
    (nextPhase: PomodoroPhase) => {
      if (!presets) return;
      setPhase(nextPhase);
      setTimeLeft(presets[nextPhase]);
      setTimerStatus("idle");
    },
    [presets],
  );

  const toggleTimer = useCallback(() => {
    if (!presets) return;
    if (isRunning) {
      setTimerStatus("paused");
      return;
    }

    void unlockPomodoroAlarm();

    if (timerStatus === "completed" && timeLeft === 0) {
      setTimeLeft(presets[phase]);
    }

    setTimerStatus("running");
  }, [isRunning, phase, presets, timeLeft, timerStatus]);

  const advancePhase = useCallback(() => {
    switchPhase(phase === "focus" ? "shortBreak" : "focus");
  }, [phase, switchPhase]);

  return (
    <PomodoroContext.Provider
      value={{
        presets,
        isLoadingPresets: isLoadingTempos,
        phase,
        timeLeft,
        timerStatus,
        isRunning,
        isPaused,
        switchPhase,
        reset,
        toggleTimer,
        advancePhase,
        completeSessionEarly,
        ciclosConcluidos,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroTimer = () => {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error("usePomodoroTimer must be used inside PomodoroProvider");
  }
  return ctx;
};
