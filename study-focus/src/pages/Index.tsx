import { Bot, BookOpen, CalendarDays, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useStudy } from "@/context/StudyContext";
import { toLocalDateKey } from "@/lib/date";
import { getSessionStatusView } from "@/lib/session-status";
import { usePomodoroTimer } from "@/context/PomodoroContext";

const Inicio = () => {
  const { sessions, subjects, isLoading } = useStudy();
  const { presets } = usePomodoroTimer();

  const today = toLocalDateKey();
  const todaysSessions = sessions
    .filter((s) => toLocalDateKey(s.data) === today)
    .sort((a, b) => a.data.localeCompare(b.data));

  const getDisciplineName = (assuntoId: number) => {
    const discipline = subjects.find((subject) =>
      subject.assuntos?.some((assunto) => Number(assunto.ID) === assuntoId),
    );

    return discipline?.name || "Geral";
  };

  let presetsFocus = presets?.focus ? presets.focus : 0;
  const focus = String(Math.floor(presetsFocus / 60)).padStart(2, "0");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">
          Sincronizando seus dados...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="max-w-[65ch]">
          <h1 className="text-3xl sm:text-4xl font-heading font-light mb-2 tracking-tight text-gradient">
            Bem-vindo de volta.
          </h1>
          <p className="text-foreground/50 text-sm sm:text-base">
            Você tem {todaysSessions.length} sessões planejadas para hoje.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">
            Status de Hoje
          </p>
          <p className="font-medium font-body">
            {todaysSessions.length} compromissos
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Pomodoro Card */}
        <Link
          to="/pomodoro"
          className="col-span-12 lg:col-span-8 relative h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden flex items-center justify-center bg-surface-100 group hover:shadow-lg transition-shadow"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-100/50 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-card/40 to-transparent skew-x-12" />
          <div className="relative z-10 text-center px-4">
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-brand-600 mb-3 sm:mb-4 block">
              Bloco de Foco Profundo
            </span>
            <div className="text-6xl sm:text-7xl md:text-8xl font-heading font-light tabular-nums mb-4 sm:mb-6">
              {focus}:00
            </div>
            <div className="flex justify-center gap-3">
              <span className="px-6 py-2.5 bg-brand-600 text-primary-foreground rounded-full text-sm font-medium group-hover:bg-brand-600/90 transition-colors soft-shadow">
                Iniciar Timer
              </span>
            </div>
          </div>
        </Link>

        {/* Today's plan */}
        <div className="col-span-12 lg:col-span-4 p-6 bg-card rounded-2xl soft-shadow border border-surface-100 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-body font-medium tracking-tight">
              Sessões de Hoje
            </h3>
            <Link
              to="/Sessoes"
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              Ver tudo
            </Link>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {todaysSessions.length === 0 && (
              <p className="text-sm text-foreground/50 text-center py-10">
                Nenhuma sessão planejada.
              </p>
            )}
            {todaysSessions.slice(0, 5).map((ev) => {
              const statusView = getSessionStatusView(ev);
              const timeStr = new Date(ev.data).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={ev.ID} className="flex gap-4">
                  <div className="text-xs font-medium text-foreground/30 pt-1 w-10 font-body">
                    {timeStr}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium font-body truncate">
                      {ev.titulo}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-foreground/50">
                        {getDisciplineName(ev.assunto_id)} · {ev.prioridade}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${statusView.className}`}
                      >
                        {statusView.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subjects */}
        <Link
          to="/disciplinas"
          className="col-span-12 md:col-span-6 p-6 bg-card rounded-2xl soft-shadow border border-surface-100 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-brand-600" />
              <h3 className="text-lg font-body font-medium tracking-tight">
                Disciplinas
              </h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-brand-50 text-brand-600 rounded">
              {subjects.length} ativos
            </span>
          </div>
          <div className="p-4 border border-surface-100 rounded-xl bg-surface-50/30">
            <p className="text-sm text-foreground/40 mb-1">
              Acesse seus flashcards
            </p>
            <p className="text-base font-medium font-body">
              Cada disciplina tem seu próprio deck de revisão ativa.
            </p>
          </div>
          <p className="mt-4 text-sm font-medium text-brand-600 text-center">
            Abrir Disciplinas →
          </p>
        </Link>

        {/* AI Assistant */}
        <Link
          to="/assistente"
          className="col-span-12 md:col-span-6 p-6 bg-brand-600 text-primary-foreground rounded-2xl soft-shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot className="size-4" />
            <h3 className="text-lg font-body font-medium tracking-tight">
              Assistente IA
            </h3>
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed mb-4">
            Estou aqui para ajudar nos seus estudos! Posso resumir conteúdos,
            explicar conceitos e responder às suas perguntas.
          </p>
          <div className="flex gap-2">
            <span className="flex-1 py-2 bg-primary-foreground/10 rounded-xl text-xs font-medium text-center">
              Explicar Conceito
            </span>
            <span className="flex-1 py-2 bg-primary-foreground/10 rounded-xl text-xs font-medium text-center">
              Tirar Dúvida
            </span>
          </div>
        </Link>

        {/* Plan shortcut */}
        <Link
          to="/sessoes"
          className="col-span-12 p-6 bg-surface-100 rounded-2xl border border-surface-200 hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-brand-600 flex items-center justify-center">
              <CalendarDays className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-body font-medium tracking-tight">
                Agenda de Estudos
              </h3>
              <p className="text-sm text-foreground/60">
                Agende sessões e organize seu cronograma semanal.
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-brand-600">Abrir →</span>
        </Link>
      </div>
    </div>
  );
};

export default Inicio;
