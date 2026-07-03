import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Save, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { InputAssunto, Assunto } from "@/components/InputAssunto";
import { useCreateDisciplina } from "@/hooks/use-disciplinas";

const PRESET_COLORS = [
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#db2777", // pink
  "#dc2626", // red
  "#ea580c", // orange
  "#ca8a04", // yellow
  "#16a34a", // green
  "#0891b2", // cyan
  "#2563eb", // blue
  "#475569", // slate
];

const CadastroDisciplina: React.FC = () => {
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cor, setCor] = useState("#4f46e5");
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const { mutateAsync: createDisciplina, isPending: isLoading } =
    useCreateDisciplina();

  const handleAddAssunto = () => {
    const novoAssunto: Assunto = {
      id: crypto.randomUUID(),
      nome: "",
    };
    setAssuntos([...assuntos, novoAssunto]);
  };

  const handleAssuntoChange = (
    id: string,
    field: keyof Assunto,
    value: string,
  ) => {
    setAssuntos(
      assuntos.map((assunto) =>
        assunto.id === id ? { ...assunto, [field]: value } : assunto,
      ),
    );
  };

  const handleRemoveAssunto = (id: string) => {
    setAssuntos(assuntos.filter((assunto) => assunto.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeDisciplina.trim()) {
      toast.error("O nome da disciplina é obrigatório.");
      return;
    }

    if (assuntos.length === 0) {
      toast.error("Adicione pelo menos um assunto à disciplina.");
      return;
    }

    const assuntosInvalidos = assuntos.some((a) => !a.nome.trim());
    if (assuntosInvalidos) {
      toast.error("Todos os assuntos devem ter um nome.");
      return;
    }

    try {
      await createDisciplina({
        name: nomeDisciplina,
        description: descricao,
        color: cor,
        assuntos: assuntos.map((a) => ({ nome: a.nome })),
      });

      toast.success("Disciplina e assuntos salvos com sucesso!");

      // Resetar formulário
      setNomeDisciplina("");
      setDescricao("");
      setCor("#4f46e5");
      setAssuntos([]);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Erro ao salvar a disciplina.";
      toast.error(`Falha ao salvar: ${msg}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <Link
        to="/disciplinas"
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="size-4" />
        Voltar para disciplinas
      </Link>

      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-brand-100 rounded-2xl">
            <BookOpen className="size-8 text-brand-600" />
          </div>
          Nova Disciplina
        </h1>
        <p className="text-foreground/60 font-body mt-2 text-sm sm:text-base">
          Cadastre uma nova disciplina e vincule múltiplos assuntos de uma só
          vez.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 bg-card rounded-2xl soft-shadow border border-surface-100 space-y-8"
      >
        {/* Dados da Disciplina */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium font-body text-foreground/80">
              Nome da Disciplina
            </label>
            <input
              type="text"
              value={nomeDisciplina}
              onChange={(e) => setNomeDisciplina(e.target.value)}
              placeholder="Ex: Matemática Aplicada"
              className="w-full px-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-shadow"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium font-body text-foreground/80">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição da disciplina"
              rows={1}
              className="w-full px-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-shadow resize-none"
            />
          </div>
        </div>

        {/* Cor da Disciplina */}
        <div className="space-y-3">
          <label className="block text-sm font-medium font-body text-foreground/80">
            Cor da Disciplina
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                title={c}
                className="relative size-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{ backgroundColor: c }}
              >
                {cor === c && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="size-3 rounded-full border-2 border-white bg-white/30" />
                  </span>
                )}
              </button>
            ))}
            {/* Cor personalizada via input nativo */}
            <label
              title="Cor personalizada"
              className="relative size-8 rounded-full cursor-pointer overflow-hidden border-2 border-dashed border-surface-300 hover:border-brand-400 transition-colors flex items-center justify-center"
              style={
                !PRESET_COLORS.includes(cor)
                  ? {
                      backgroundColor: cor,
                      borderStyle: "solid",
                      borderColor: cor,
                    }
                  : {}
              }
            >
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="absolute opacity-0 w-0 h-0"
              />
              {PRESET_COLORS.includes(cor) ? (
                <span className="text-xs text-foreground/40 font-bold">+</span>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="size-3 rounded-full border-2 border-white bg-white/30" />
                </span>
              )}
            </label>
            {/* Preview do nome com a cor escolhida */}
            <div
              className="ml-2 px-3 py-1 rounded-full text-xs font-medium text-white font-body shadow-sm"
              style={{ backgroundColor: cor }}
            >
              {nomeDisciplina || "Prévia"}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-surface-100" />

        {/* Lista Dinâmica de Assuntos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium">
              Assuntos Relacionados
            </h2>
            <button
              type="button"
              onClick={handleAddAssunto}
              className="px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="size-4" />
              Adicionar Assunto
            </button>
          </div>

          {assuntos.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50/50">
              <BookOpen className="size-10 text-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-foreground/50 font-body">
                Nenhum assunto adicionado.
                <br />
                Clique em{" "}
                <strong className="text-brand-600 font-medium">
                  Adicionar Assunto
                </strong>{" "}
                para começar a organizar sua disciplina.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assuntos.map((assunto) => (
                <InputAssunto
                  key={assunto.id}
                  assunto={assunto}
                  onChange={handleAssuntoChange}
                  onRemove={handleRemoveAssunto}
                />
              ))}
            </div>
          )}
        </div>

        {/* Botão de Salvar */}
        <div className="pt-4 flex justify-end border-t border-surface-100 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-brand-600 text-primary-foreground rounded-full text-sm font-medium hover:bg-brand-600/90 transition-colors flex items-center gap-2 disabled:opacity-70 soft-shadow"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isLoading ? "Salvando..." : "Salvar Tudo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroDisciplina;
