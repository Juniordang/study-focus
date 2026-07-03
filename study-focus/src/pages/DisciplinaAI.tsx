import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { AIFlashcardSuggestion, Assunto } from "@/lib/api";
import { useStudy } from "@/context/StudyContext";
import { useAskDisciplinaAI } from "@/hooks/use-ai";
import { useCreateFlashcardsBatch } from "@/hooks/use-flashcards";
import { useAIHistory } from "@/hooks/use-historico";
import { alphaColor, normalizeHexColor, readableTextColor } from "@/lib/color";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  flashcards?: AIFlashcardSuggestion[];
}

const SubjectAI = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { subjects, isLoading: subjectsLoading } = useStudy();
  const { data: history } = useAIHistory();
  const subjectIdStr = id ?? "";
  const subjectId = parseInt(subjectIdStr, 10);

  const currentSubject = subjects.find((s) => String(s.id) === subjectIdStr);
  const subjectName = currentSubject?.name ?? "Disciplina";
  const subjectColor = normalizeHexColor(currentSubject?.color);
  const subjectTextColor = readableTextColor(subjectColor);
  const assuntos = (currentSubject?.assuntos ?? []) as Assunto[];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedAssunto, setSelectedAssunto] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [savedMessages, setSavedMessages] = useState<string[]>([]);

  const { mutateAsync: askDisciplina, isPending: isAsking } =
    useAskDisciplinaAI();
  const { mutateAsync: saveBatch, isPending: isSavingBatch } =
    useCreateFlashcardsBatch();

  const scrollRef = useRef<HTMLDivElement>(null);
  const didHydrateHistory = useRef(false);

  const historyMessages = useMemo(() => {
    if (!history || !subjectId) return [];

    return history
      .filter((item) => item.disciplina_id === subjectId)
      .sort((a, b) => {
        const aDate = new Date(a.CreatedAt).getTime();
        const bDate = new Date(b.CreatedAt).getTime();

        if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
          return aDate - bDate;
        }

        return a.ID - b.ID;
      })
      .flatMap<ChatMessage>((item) => [
        {
          id: `history-${item.ID}-user`,
          role: "user",
          content: item.pergunta,
        },
        {
          id: `history-${item.ID}-ai`,
          role: "ai",
          content: item.resposta,
        },
      ]);
  }, [history, subjectId]);

  useEffect(() => {
    if (!history || didHydrateHistory.current) return;

    setMessages((prev) => {
      const localMessages = prev.filter(
        (msg) => !msg.id.startsWith("history-"),
      );

      return [...historyMessages, ...localMessages];
    });
    didHydrateHistory.current = true;
  }, [history, historyMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAsking]);

  const handleAskAI = async () => {
    if (!input.trim() || !subjectId || isAsking) return;

    if (!selectedAssunto) {
      toast.error("selecione um assunto para pesquisar");
      return;
    }

    const question = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: question },
    ]);

    try {
      const response = await askDisciplina({
        disciplina_id: subjectId,
        assunto_id: parseInt(selectedAssunto, 10),
        pergunta: question,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: response.resposta,
          flashcards: response.flashcards,
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["historico", "ia"] });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: `Erro ao comunicar com o Assistente: ${message}`,
        },
      ]);
    }
  };

  const handleToggleCard = (msgId: string, idx: number) => {
    const key = `${msgId}-${idx}`;
    const newSet = new Set(selectedCards);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setSelectedCards(newSet);
  };

  const handleSaveSelectedFlashcards = async (
    msgId: string,
    flashcards: AIFlashcardSuggestion[],
  ) => {
    const cardsToSave = flashcards
      .filter((_, idx) => selectedCards.has(`${msgId}-${idx}`))
      .map((card) => ({
        pergunta: card.question,
        resposta: card.answer,
        assuntoId: selectedAssunto,
      }));

    if (cardsToSave.length === 0) return;

    try {
      await saveBatch({ flashcards: cardsToSave });
      setSavedMessages((prev) => [...prev, msgId]);
      toast.success("Flashcards salvos com sucesso!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao salvar flashcards: ${message}`);
    }
  };

  if (subjectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">Carregando contexto...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <Link
        to={`/disciplinas/${subjectIdStr}`}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Voltar para {subjectName}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="size-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: alphaColor(subjectColor, 0.14) }}
        >
          <Sparkles className="size-6" style={{ color: subjectColor }} />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-light tracking-tight">
              Assistente IA: {subjectName}
            </h1>
            <p className="text-foreground/60 text-sm font-body">
              Tire dúvidas específicas e gere cards sobre esta matéria.
            </p>
          </div>
          <div>
            <select
              value={selectedAssunto}
              onChange={(e) => setSelectedAssunto(e.target.value)}
              className="px-4 py-2 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            >
              <option value="">Selecione um assunto</option>
              {assuntos.map((a) => (
                <option key={a.ID ?? a.nome} value={a.ID ?? ""}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-2xl soft-shadow border border-surface-100 overflow-hidden flex flex-col mb-4">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
              <Bot className="size-12" />
              <p className="max-w-xs text-sm">
                Olá! Faça uma pergunta sobre **{subjectName}** para começarmos.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div
                    className="size-8 sm:size-10 rounded-full flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: alphaColor(subjectColor, 0.12),
                      borderColor: alphaColor(subjectColor, 0.24),
                    }}
                  >
                    <Bot className="size-5" style={{ color: subjectColor }} />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-none"
                      : "bg-surface-50 border border-surface-100 rounded-bl-none text-foreground"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: subjectColor,
                          color: subjectTextColor,
                        }
                      : undefined
                  }
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.flashcards && msg.flashcards.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-brand-200/20 space-y-3">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: subjectColor }}
                      >
                        Flashcards Sugeridos
                      </p>
                      <div className="grid gap-2">
                        {msg.flashcards.map((card, idx) => (
                          <label
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-white rounded-xl border border-surface-200 cursor-pointer hover:border-brand-300 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCards.has(`${msg.id}-${idx}`)}
                              onChange={() => handleToggleCard(msg.id, idx)}
                              disabled={savedMessages.includes(msg.id)}
                              className="mt-1 shrink-0 rounded text-brand-600 focus:ring-brand-600"
                            />
                            <div className="text-sm">
                              <p className="font-medium text-foreground">
                                {card.question}
                              </p>
                              <p className="text-foreground/60 mt-1">
                                {card.answer}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          handleSaveSelectedFlashcards(msg.id, msg.flashcards!)
                        }
                        disabled={
                          savedMessages.includes(msg.id) ||
                          isSavingBatch ||
                          !msg.flashcards.some((_, i) =>
                            selectedCards.has(`${msg.id}-${i}`),
                          )
                        }
                        className={`mt-2 w-full px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                          savedMessages.includes(msg.id)
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-brand-100 text-brand-700 hover:bg-brand-200 active:scale-95 disabled:opacity-50"
                        }`}
                        style={
                          savedMessages.includes(msg.id)
                            ? undefined
                            : {
                                backgroundColor: alphaColor(subjectColor, 0.12),
                                color: subjectColor,
                              }
                        }
                      >
                        {isSavingBatch ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : savedMessages.includes(msg.id) ? (
                          <>Salvos no Banco de Dados</>
                        ) : (
                          <>
                            <Plus className="size-4" /> Adicionar Selecionados
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="size-8 sm:size-10 rounded-full bg-surface-200 flex items-center justify-center shrink-0 border border-surface-300">
                    <User className="size-5 text-foreground/60" />
                  </div>
                )}
              </div>
            ))
          )}
          {isAsking && (
            <div className="flex justify-start gap-4">
              <div
                className="size-8 sm:size-10 rounded-full flex items-center justify-center shrink-0 animate-pulse"
                style={{ backgroundColor: alphaColor(subjectColor, 0.12) }}
              >
                <Loader2
                  className="size-5 animate-spin"
                  style={{ color: subjectColor }}
                />
              </div>
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100 rounded-bl-none">
                <div className="flex gap-1">
                  <div
                    className="size-1.5 rounded-full animate-bounce [animation-delay:-0.3s]"
                    style={{ backgroundColor: subjectColor }}
                  ></div>
                  <div
                    className="size-1.5 rounded-full animate-bounce [animation-delay:-0.15s]"
                    style={{ backgroundColor: subjectColor }}
                  ></div>
                  <div
                    className="size-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: subjectColor }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-surface-50 border-t border-surface-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
              placeholder="Ex: Resuma os principais tópicos desta matéria..."
              className="flex-1 bg-white border border-surface-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all shadow-inner"
            />
            <button
              onClick={handleAskAI}
              disabled={isAsking || !input.trim()}
              className="size-12 rounded-xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all shadow-md shrink-0"
              style={{
                backgroundColor: subjectColor,
                color: subjectTextColor,
              }}
              title={
                !selectedAssunto
                  ? "Selecione um assunto primeiro"
                  : "Enviar pergunta"
              }
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectAI;
