import { useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useStudy } from "@/context/StudyContext";
import { agendaApi } from "@/lib/api";
import { alphaColor, normalizeHexColor } from "@/lib/color";
import { localDateTimeToISOString, toLocalDateKey } from "@/lib/date";
import { getSessionStatusView } from "@/lib/session-status";
import { toast } from "sonner";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const PRIORITY_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const StudyPlan = () => {
  const { sessions, subjects, addSession, deleteSession, isLoading } =
    useStudy();
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [desc, setDesc] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [assuntoId, setAssuntoId] = useState("");
  const [priority, setPriority] = useState("media");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const today = toLocalDateKey();

  const daySessions = sessions
    .filter((s) => toLocalDateKey(s.data) === selectedDate)
    .sort((a, b) => a.data.localeCompare(b.data));

  const hasEvents = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return sessions.some((e) => toLocalDateKey(e.data) === dateStr);
  };

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Adicione um título");
      return;
    }

    if (!disciplineId) {
      toast.error("Selecione uma disciplina");
      return;
    }

    if (!assuntoId) {
      toast.error("Selecione um assunto dessa disciplina");
      return;
    }

    setIsSaving(true);

    const dateTimeISO = localDateTimeToISOString(selectedDate, time);
    const payload = {
      titulo: title,
      descricao: desc,
      data: dateTimeISO,
      prioridade: priority,
      assunto_id: parseInt(assuntoId, 10),
    };

    try {
      try {
        await agendaApi.validate(payload);
      } catch {
        toast.error("já existe uma sessão nesse periodo");
        return;
      }

      if (!window.confirm("Deseja salvar a sessão?")) {
        return;
      }

      await addSession(payload);

      setTitle("");
      setTime("08:00");
      setDesc("");
      setPriority("media");
      setDisciplineId("");
      setAssuntoId("");
      setShowForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao criar sessão na agenda: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getDisciplineAndAssunto = (assuntoId: number) => {
    for (const d of subjects) {
      const assunto = d.assuntos?.find((a) => Number(a.ID) === assuntoId);
      if (assunto) return { discipline: d, assunto };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
          Agenda
        </h1>
        <p className="text-foreground/60 font-body mt-1 text-sm sm:text-base">
          Planeje suas sessões de estudo por dia, disciplina e assunto.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Calendar */}
        <div className="col-span-12 lg:col-span-7 p-4 sm:p-6 bg-card rounded-2xl soft-shadow border border-surface-100">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <h2 className="font-heading text-xl font-medium">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-xs font-medium text-foreground/40 py-2"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative py-2 rounded-lg text-sm font-body transition-colors ${
                    isSelected
                      ? "bg-brand-600 text-primary-foreground"
                      : isToday
                        ? "bg-brand-100 text-foreground font-medium"
                        : "hover:bg-surface-100"
                  }`}
                >
                  {day}
                  {hasEvents(day) && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-brand-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day summary */}
          <div className="mt-6 pt-6 border-t border-surface-100 flex justify-center gap-10 text-center">
            <div>
              <div className="text-2xl font-heading font-medium">
                {daySessions.length}
              </div>
              <div className="text-xs text-foreground/40 uppercase tracking-wider mt-1">
                Sessões de hoje
              </div>
            </div>
          </div>
        </div>

        {/* Day events */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-body font-medium">
              {new Date(selectedDate + "T12:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-brand-600 text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-brand-600/90 transition-colors"
            >
              <Plus className="size-3.5" />
              Nova Sessão
            </button>
          </div>

          {showForm && (
            <div className="p-5 bg-card rounded-2xl soft-shadow border border-surface-100 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do sessão"
                className="w-full px-3 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
              <select
                value={disciplineId}
                onChange={(e) => {
                  setDisciplineId(e.target.value);
                  setAssuntoId("");
                }}
                className="w-full px-3 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              >
                <option value="">Selecione uma disciplina</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {disciplineId && (
                <select
                  value={assuntoId}
                  onChange={(e) => setAssuntoId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                >
                  <option value="">Selecione um assunto</option>
                  {subjects
                    .find((s) => s.id === disciplineId)
                    ?.assuntos?.map((a) => (
                      <option key={a.ID} value={a.ID}>
                        {a.nome}
                      </option>
                    ))}
                </select>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-3 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-3 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                >
                  <option value="alta">Prioridade Alta</option>
                  <option value="media">Prioridade Média</option>
                  <option value="baixa">Prioridade Baixa</option>
                </select>
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={2}
                className="w-full px-3 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={submit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-brand-600 text-primary-foreground rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                  Salvar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-surface-100 text-foreground/60 rounded-full text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {daySessions.length === 0 && !showForm && (
            <div className="p-6 bg-surface-100 rounded-2xl text-center text-foreground/40 text-sm border border-dashed border-surface-200">
              Nenhum sessão agendado neste dia.
            </div>
          )}

          {daySessions.map((s) => {
            const data = getDisciplineAndAssunto(s.assunto_id);
            const disciplineColor = normalizeHexColor(data?.discipline.color);
            const statusView = getSessionStatusView(s);
            const timeStr = new Date(s.data).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={s.ID}
                className="p-4 bg-card rounded-2xl soft-shadow border border-surface-100 space-y-3"
                style={{
                  borderLeftColor: disciplineColor,
                  borderLeftWidth: 4,
                }}
              >
                <div className="flex gap-3 items-start">
                  <div className="text-xs font-medium text-foreground/40 pt-1 w-12 font-body text-center">
                    {timeStr}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {data?.discipline && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider"
                          style={{
                            backgroundColor: alphaColor(disciplineColor, 0.1),
                            borderColor: alphaColor(disciplineColor, 0.22),
                            color: disciplineColor,
                          }}
                        >
                          {data.discipline.name}
                        </span>
                      )}
                      {data?.assunto && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                          style={{
                            backgroundColor: alphaColor(disciplineColor, 0.06),
                            color: disciplineColor,
                          }}
                        >
                          {data.assunto.nome}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          s.prioridade === "alta"
                            ? "bg-destructive/10 text-destructive"
                            : s.prioridade === "baixa"
                              ? "bg-surface-200 text-foreground/60"
                              : "bg-brand-50 text-brand-600"
                        }`}
                      >
                        {PRIORITY_LABEL[s.prioridade] || "Normal"}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${statusView.className}`}
                      >
                        {statusView.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium font-body">{s.titulo}</p>
                    {s.descricao && (
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {s.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => deleteSession(s.ID)}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg text-foreground/30 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;
