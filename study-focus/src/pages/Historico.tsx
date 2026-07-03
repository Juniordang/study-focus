import { useMemo, useState } from "react";
import {
  Bot,
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  MessageSquareText,
  SearchX,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDisciplinas } from "@/hooks/use-disciplinas";
import { useAIHistory, useReviewHistory } from "@/hooks/use-historico";
import type { AIHistoryItem, ReviewHistoryItem } from "@/lib/api";

type AIHistoryFilter = "todos" | "geral" | "disciplina";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date);
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function desempenhoClasses(desempenho: string) {
  switch (desempenho) {
    case "Facil":
      return "bg-green-50 text-green-700 border-green-200";
    case "Medio":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Dificil":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-surface-100 text-foreground/70 border-surface-200";
  }
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center gap-3 text-center border border-dashed border-surface-200 rounded-lg bg-card/60">
      <SearchX className="size-9 text-foreground/35" />
      <p className="text-sm text-foreground/60">{title}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center gap-3">
      <Loader2 className="size-7 animate-spin text-brand-600" />
      <p className="text-sm text-foreground/60">Carregando histórico...</p>
    </div>
  );
}

function ReviewHistoryList({ items }: { items: ReviewHistoryItem[] }) {
  items = items ?? [];
  if (items.length === 0) {
    return <EmptyState title="Nenhuma revisão registrada ainda." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="bg-card border border-surface-100 rounded-lg p-4 sm:p-5 soft-shadow"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={desempenhoClasses(item.desempenho)}
                >
                  {item.desempenho}
                </Badge>
                <span className="text-xs text-foreground/50">
                  {item.disciplina_nome} / {item.assunto_nome}
                </span>
              </div>
              <h3 className="text-base font-medium leading-snug">
                {item.pergunta}
              </h3>
              <p className="text-sm text-foreground/60 line-clamp-2">
                {item.resposta}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-foreground/60 sm:min-w-56">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatDateTime(item.data_revisao)}
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                {formatDate(item.data_proxima_revisao)}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function AIHistoryList({ items }: { items: AIHistoryItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="Nenhuma conversa encontrada para esse filtro." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isGeneral = !item.disciplina_id;

        return (
          <article
            key={item.ID}
            className="bg-card border border-surface-100 rounded-lg p-4 sm:p-5 soft-shadow"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      isGeneral
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : "bg-violet-50 text-violet-700 border-violet-200"
                    }
                  >
                    {isGeneral ? "Geral" : "Por disciplina"}
                  </Badge>
                  <span className="text-xs text-foreground/50">
                    {formatDateTime(item.CreatedAt)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <MessageSquareText className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    <p className="text-sm font-medium leading-relaxed">
                      {item.pergunta}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Bot className="mt-0.5 size-4 shrink-0 text-foreground/45" />
                    <p className="text-sm text-foreground/60 leading-relaxed line-clamp-4">
                      {item.resposta}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const Historico = () => {
  const [aiFilter, setAiFilter] = useState<AIHistoryFilter>("todos");
  const [selectedDisciplina, setSelectedDisciplina] = useState("todas");

  const {
    data: reviewHistory = [],
    isLoading: isLoadingReviews,
    isError: isReviewError,
  } = useReviewHistory();
  const {
    data: aiHistory = [],
    isLoading: isLoadingAI,
    isError: isAIError,
  } = useAIHistory();
  const { data: disciplinas = [] } = useDisciplinas();

  const filteredAIHistory = useMemo(() => {
    return aiHistory.filter((item) => {
      if (aiFilter === "geral" && item.disciplina_id) return false;
      if (aiFilter === "disciplina" && !item.disciplina_id) return false;
      if (
        aiFilter === "disciplina" &&
        selectedDisciplina !== "todas" &&
        String(item.disciplina_id) !== selectedDisciplina
      ) {
        return false;
      }

      return true;
    });
  }, [aiFilter, aiHistory, selectedDisciplina]);

  const generalAIEntries = aiHistory.filter((item) => !item.disciplina_id);
  const disciplineAIEntries = aiHistory.length - generalAIEntries.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
          Histórico
        </h1>
        <p className="text-sm text-foreground/60">
          Consultas anteriores da IA e revisões concluídas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-surface-100 rounded-lg p-4 soft-shadow">
          <div className="flex items-center gap-2 text-sm text-foreground/55">
            <CheckCircle2 className="size-4 text-green-600" />
            Revisões
          </div>
          <p className="mt-2 text-3xl font-heading font-medium">
            {reviewHistory?.length ?? 0}
          </p>
        </div>
        <div className="bg-card border border-surface-100 rounded-lg p-4 soft-shadow">
          <div className="flex items-center gap-2 text-sm text-foreground/55">
            <Bot className="size-4 text-cyan-600" />
            IA Geral
          </div>
          <p className="mt-2 text-3xl font-heading font-medium">
            {generalAIEntries.length}
          </p>
        </div>
        <div className="bg-card border border-surface-100 rounded-lg p-4 soft-shadow">
          <div className="flex items-center gap-2 text-sm text-foreground/55">
            <Brain className="size-4 text-violet-600" />
            IA por Disciplina
          </div>
          <p className="mt-2 text-3xl font-heading font-medium">
            {disciplineAIEntries}
          </p>
        </div>
      </div>

      <Tabs defaultValue="revisoes" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="revisoes">Revisões</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
        </TabsList>

        <TabsContent value="revisoes" className="space-y-4">
          {isLoadingReviews ? (
            <LoadingState />
          ) : isReviewError ? (
            <EmptyState title="Não foi possível carregar o histórico de revisões." />
          ) : (
            <ReviewHistoryList items={reviewHistory} />
          )}
        </TabsContent>

        <TabsContent value="ia" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Filter className="size-4" />
              Filtros
            </div>
            <Select
              value={aiFilter}
              onValueChange={(value) => setAiFilter(value as AIHistoryFilter)}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="disciplina">Por disciplina</SelectItem>
              </SelectContent>
            </Select>

            {aiFilter === "disciplina" && (
              <Select
                value={selectedDisciplina}
                onValueChange={setSelectedDisciplina}
              >
                <SelectTrigger className="sm:w-64">
                  <SelectValue placeholder="Disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as disciplinas</SelectItem>
                  {disciplinas.map((disciplina) => (
                    <SelectItem
                      key={disciplina.id}
                      value={String(disciplina.id)}
                    >
                      {disciplina.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {isLoadingAI ? (
            <LoadingState />
          ) : isAIError ? (
            <EmptyState title="Não foi possível carregar o histórico da IA." />
          ) : (
            <AIHistoryList items={filteredAIHistory} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Historico;
