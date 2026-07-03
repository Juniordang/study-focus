import { useState, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { aiApi } from "@/lib/api";
import { useAIHistory } from "@/hooks/use-historico";

interface Mesbrand {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const initialMesbrand: Mesbrand = {
  id: "initial-assistant",
  role: "assistant",
  content:
    "Olá! Sou seu Assistente Global. Posso tirar dúvidas gerais ou simplificar textos para você. Como posso ajudar hoje? 🌐",
};

const AIAssistant = () => {
  const queryClient = useQueryClient();
  const { data: history } = useAIHistory();
  const [mesbrands, setMesbrands] = useState<Mesbrand[]>([initialMesbrand]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const didHydrateHistory = useRef(false);

  const historyMesbrands = useMemo(() => {
    if (!history) return [];

    return history
      .filter((item) => !item.disciplina_id)
      .sort((a, b) => {
        const aDate = new Date(a.CreatedAt).getTime();
        const bDate = new Date(b.CreatedAt).getTime();

        if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
          return aDate - bDate;
        }

        return a.ID - b.ID;
      })
      .flatMap<Mesbrand>((item) => [
        {
          id: `history-${item.ID}-user`,
          role: "user",
          content: item.pergunta,
        },
        {
          id: `history-${item.ID}-assistant`,
          role: "assistant",
          content: item.resposta,
        },
      ]);
  }, [history]);

  useEffect(() => {
    if (!history || didHydrateHistory.current) return;

    setMesbrands((prev) => {
      const localMesbrands = prev.filter(
        (msg) =>
          msg.id !== initialMesbrand.id && !msg.id.startsWith("history-"),
      );

      return [initialMesbrand, ...historyMesbrands, ...localMesbrands];
    });
    didHydrateHistory.current = true;
  }, [history, historyMesbrands]);

  // Auto-scroll para o final das mensagens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mesbrands]);

  const sendMesbrand = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Mesbrand = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMesbrands((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const typingId = (Date.now() + 1).toString();
    setMesbrands((prev) => [
      ...prev,
      { id: typingId, role: "assistant", content: "..." },
    ]);

    try {
      const response = await aiApi.ask({
        pergunta: input,
      });

      setMesbrands((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, content: response.resposta } : msg,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["historico", "ia"] });
    } catch (err: any) {
      setError(
        err.message || "Erro ao consultar a IA. Verifique suas chaves de API.",
      );
      setMesbrands((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                ...msg,
                role: "system",
                content:
                  "Ops! Algo deu errado. Verifique se você configurou sua chave de API nas Configurações.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
          Assistente IA
        </h1>
        <p className="text-foreground/60 text-sm font-body">
          Pesquisas gerais e suporte aos seus estudos.
        </p>
      </div>

      {/* Mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar scroll-smooth"
      >
        {mesbrands.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                <Bot className="size-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-primary-foreground rounded-br-sm"
                  : msg.role === "system"
                    ? "bg-red-50 border border-red-100 text-red-600 rounded-bl-sm"
                    : "bg-card border border-surface-100 soft-shadow rounded-bl-sm text-foreground"
              }`}
            >
              {msg.content === "..." ? (
                <div className="flex gap-1 py-1">
                  <div className="size-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="size-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="size-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="size-8 rounded-full bg-surface-200 flex items-center justify-center shrink-0">
                <User className="size-4 text-foreground/60" />
              </div>
            )}
          </div>
        ))}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="size-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className={`flex gap-3 p-4 bg-card rounded-2xl soft-shadow border transition-all duration-200 ${isLoading ? "border-brand-200 ring-4 ring-brand-50" : "border-surface-100"}`}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMesbrand()}
          placeholder="Tire sua dúvida ou cole um texto..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm font-body focus:outline-none placeholder:text-foreground/30 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMesbrand}
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-brand-600 text-primary-foreground rounded-xl disabled:opacity-40 hover:bg-brand-600/90 transition-all active:scale-95 flex items-center justify-center min-w-[44px]"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
