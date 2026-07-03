import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  BookOpen,
  Loader2,
  Settings,
  X,
  Check,
} from "lucide-react";
import { useStudy } from "@/context/StudyContext";
import {
  POMODORO_PHASE_LABELS,
  PomodoroPhase,
  usePomodoroTimer,
} from "@/context/PomodoroContext";
import { toLocalDateKey } from "@/lib/date";
import { getSessionStatusView } from "@/lib/session-status";
import { useUpdateTempos } from "@/hooks/use-pomodoro";
import { toast } from "sonner";

const Pomodoro = () => {
  const { sessions, subjects, activeSessionId, setActiveSession, isLoading } =
    useStudy();
  const {
    presets,
    phase,
    timeLeft,
    isRunning,
    isPaused,
    switchPhase,
    isLoadingPresets,
    reset,
    toggleTimer,
    advancePhase,
    completeSessionEarly,
    ciclosConcluidos,
  } = usePomodoroTimer();

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    focus: 0,
    shortBreak: 0,
    longBreak: 0,
  });

  const { mutate: updateTempos } = useUpdateTempos();

  if (isLoading || isLoadingPresets || !presets) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">
          Carregando dados do timer...
        </p>
      </div>
    );
  }

  const today = toLocalDateKey();

  const todaysSessions = sessions.filter(
    (s) => toLocalDateKey(s.data) === today,
  );

  const activeSession =
    sessions.find((s) => String(s.ID) === activeSessionId) ?? null;

  const activeSubject = activeSession
    ? subjects.find((s) =>
        s.assuntos?.some(
          (assunto) => Number(assunto.ID) === activeSession.assunto_id,
        ),
      )
    : null;
  const activeSessionStatusView = activeSession
    ? getSessionStatusView(activeSession)
    : null;
  const isActiveSessionCompleted =
    activeSessionStatusView?.label === "Concluída" || ciclosConcluidos > 0;

  const handleRightControl = () => {
    if (isPaused) {
      completeSessionEarly();
      return;
    }

    advancePhase();
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const progress = 1 - timeLeft / presets[phase];

  const primaryControlLabel = isRunning
    ? "Pausar"
    : isPaused
      ? "Retomar"
      : "Iniciar";

  const handleTempos = ({
    focus,
    longBreak,
    shortBreak,
  }: Record<PomodoroPhase, number>) => {
    if (focus < longBreak) {
      toast.error("Tempo foco não pode ser menor que a Pausa Longa");
      return;
    }
    if (focus < shortBreak) {
      toast.error("Tempo foco não pode ser menor que a Pausa Curta");
      return;
    }

    if (longBreak < shortBreak) {
      toast.error("Pausa Longa não pode ser menor que a Pausa Curta");
      return;
    }

    updateTempos(
      {
        tempo_foco: focus,
        tempo_pausa_curta: shortBreak,
        tempo_pausa_longa: longBreak,
      },
      {
        onSuccess: () => {
          toast.success("Tempos atualizados com sucesso");
          setIsEditing(false);
        },
      },
    );
  };
  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
          Pomodoro
        </h1>

        {/* Active session selector */}
        <div className="p-5 bg-card rounded-2xl soft-shadow border border-surface-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/40 uppercase tracking-wider font-medium">
              Sessão Ativa
            </p>
            {todaysSessions.length === 0 && (
              <Link
                to="/sessoes"
                className="text-xs text-brand-600 font-medium hover:underline"
              >
                Planejar dia →
              </Link>
            )}
          </div>
          {todaysSessions.length === 0 && (
            <p className="text-sm text-foreground/60">
              Nenhuma sessão planejada para hoje.
            </p>
          )}
          <select
            value={activeSessionId ?? ""}
            onChange={(e) => setActiveSession(e.target.value || null)}
            className="w-full px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          >
            <option value="">Estudo livre (sem sessão)</option>
            {todaysSessions.map((s) => {
              const subj = subjects.find((x) =>
                x.assuntos?.some(
                  (assunto) => Number(assunto.ID) === s.assunto_id,
                ),
              );
              const statusView = getSessionStatusView(s);
              const timeStr = new Date(s.data).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <option key={s.ID} value={String(s.ID)}>
                  {timeStr} — {subj?.name ?? "Geral"} · {s.titulo}
                  {statusView.label != "Concluída" && " ." + statusView.label}
                </option>
              );
            })}
          </select>

          {activeSession && (
            <div className="flex items-center gap-3 pt-2">
              <div
                className={`size-10 rounded-xl bg-brand-100 flex items-center justify-center`}
              >
                <BookOpen className={`size-4 text-brand-600`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium font-body">
                  {activeSession.titulo}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-foreground/50">
                    {activeSubject?.name ?? "Geral"}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                      isActiveSessionCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : activeSessionStatusView?.className
                    }`}
                  >
                    {isActiveSessionCompleted
                      ? `${ciclosConcluidos} Pomodoros Realizados`
                      : activeSessionStatusView?.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phase selector & Settings */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["focus", "shortBreak", "longBreak"] as PomodoroPhase[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => switchPhase(p)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    phase === p
                      ? "bg-brand-600 text-primary-foreground"
                      : "bg-surface-100 text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {POMODORO_PHASE_LABELS[p]}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => {
              setEditValues({
                focus: presets.focus / 60,
                shortBreak: presets.shortBreak / 60,
                longBreak: presets.longBreak / 60,
              });
              setIsEditing(true);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-surface-100 text-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5"
            title="Configurar Tempos"
          >
            <Settings className="size-4" />
            <span className="text-xs font-medium hidden sm:inline">Tempos</span>
          </button>
        </div>

        {/* Timer */}
        <div className="relative h-64 sm:h-72 md:h-80 rounded-2xl bg-surface-100 flex items-center justify-center overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-brand-200/50 transition-all duration-1000"
            style={{ height: `${progress * 100}%` }}
          />
          <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-card/40 to-transparent skew-x-12" />
          <div className="relative z-10 text-center px-4">
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-brand-600 mb-3 sm:mb-4 block">
              {POMODORO_PHASE_LABELS[phase]}
            </span>
            <div className="text-6xl sm:text-7xl md:text-8xl font-heading font-light tabular-nums">
              {mins}:{secs}
            </div>
            {activeSession && (
              <p className="text-xs text-foreground/50 mt-3 font-body">
                {activeSubject?.name} · {activeSession.titulo}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="p-3 rounded-full bg-surface-100 text-foreground/60 hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-5" />
          </button>
          <button
            onClick={toggleTimer}
            className="px-8 py-3 bg-brand-600 text-primary-foreground rounded-full font-medium soft-shadow hover:bg-brand-600/90 transition-colors flex items-center gap-2"
          >
            {isRunning ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {primaryControlLabel}
          </button>
          <button
            onClick={handleRightControl}
            className="p-3 rounded-full bg-surface-100 text-foreground/60 hover:text-foreground transition-colors"
            title={isPaused ? "Concluir sessão" : "Avançar fase"}
          >
            {isPaused ? (
              <Check className="size-5" />
            ) : (
              <SkipForward className="size-5" />
            )}
          </button>
        </div>

        {isRunning && (
          <button
            type="button"
            onClick={completeSessionEarly}
            className="mx-auto block text-xs text-foreground/45 hover:text-brand-600 hover:underline transition-colors"
          >
            Concluir sessão antecipadamente
          </button>
        )}

        {/* Stats Cards (Resumo Simples) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
          <div className="p-3 sm:p-4 bg-card rounded-2xl soft-shadow border border-surface-100">
            <div className="text-xl sm:text-2xl font-heading font-medium">
              {todaysSessions.length}
            </div>
            <div className="text-[10px] sm:text-xs text-foreground/40 uppercase tracking-wider mt-1">
              Sessões Hoje
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-card rounded-2xl soft-shadow border border-surface-100">
            <div className="text-xl sm:text-2xl font-heading font-medium">
              {subjects.length}
            </div>
            <div className="text-[10px] sm:text-xs text-foreground/40 uppercase tracking-wider mt-1">
              Disciplinas Ativos
            </div>
          </div>
        </div>
      </div>

      {isEditing &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-card w-full max-w-sm rounded-2xl p-6 soft-shadow border border-surface-100 relative">
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
              <h2 className="text-xl font-heading font-medium mb-5 text-foreground">
                Configurar Tempos
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    Foco (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editValues.focus}
                    onChange={(e) => {
                      setEditValues({
                        ...editValues,
                        focus: Number(e.target.value),
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-600/30 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    Pausa Curta (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editValues.shortBreak}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        shortBreak: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-600/30 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    Pausa Longa (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editValues.longBreak}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        longBreak: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-600/30 text-foreground"
                  />
                </div>

                <button
                  onClick={() => {
                    const newPresets = {
                      focus: Math.max(1, editValues.focus || 25),
                      shortBreak: Math.max(1, editValues.shortBreak || 5),
                      longBreak: Math.max(1, editValues.longBreak || 15),
                    };

                    handleTempos(newPresets);
                  }}
                  className="w-full py-3 bg-brand-600 text-primary-foreground rounded-xl font-medium soft-shadow hover:bg-brand-600/90 transition-colors mt-6"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Pomodoro;
