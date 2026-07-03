import React, { useState, useEffect } from "react";
import { X, Plus, Save, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Disciplina } from "@/lib/api";
import { InputAssunto, Assunto } from "@/components/InputAssunto";
import { useUpdateDisciplina } from "@/hooks/use-disciplinas";

const PRESET_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#475569",
];

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Disciplina | null;
}

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cor, setCor] = useState("#4f46e5");
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: updateDisciplina } = useUpdateDisciplina();

  useEffect(() => {
    if (subject && isOpen) {
      setNomeDisciplina(subject.name);
      setDescricao(subject.description || "");
      setCor(subject.color || "#4f46e5");

      if (subject.assuntos && subject.assuntos.length > 0) {
        setAssuntos(
          subject.assuntos.map((a) => ({
            id: a.ID || "",
            nome: a.nome,
          })),
        );
      } else {
        // Renderiza 3 cards de exemplo solicitados
        setAssuntos([
          {
            id: "",
            nome: "Assunto exemplo",
          },
        ]);
      }
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const handleAddAssunto = () => {
    const novoAssunto: Assunto = {
      id: "",
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

    setIsLoading(true);
    try {
      console.log(assuntos);
      await updateDisciplina({
        id: subject.id,
        payload: {
          name: nomeDisciplina,
          description: descricao,
          color: cor,
          assuntos: assuntos.map((a) => ({
            id: String(a.id),
            nome: a.nome,
          })),
        },
      });

      toast.success("Alterações salvas com sucesso!");
      onClose();
    } catch (error: any) {
      const msg = error.message || "Erro ao salvar alterações.";
      toast.error(`Falha ao salvar: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl soft-shadow border border-surface-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-heading font-medium flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-xl">
                <BookOpen className="size-6 text-brand-600" />
              </div>
              Editar Disciplina
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-foreground/40 hover:text-foreground hover:bg-surface-100 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium font-body text-foreground/80">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  value={nomeDisciplina}
                  onChange={(e) => setNomeDisciplina(e.target.value)}
                  placeholder="Ex: Engenharia de Software"
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
                {/* Cor personalizada */}
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
                    <span className="text-xs text-foreground/40 font-bold">
                      +
                    </span>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="size-3 rounded-full border-2 border-white bg-white/30" />
                    </span>
                  )}
                </label>
                {/* Preview */}
                <div
                  className="ml-2 px-3 py-1 rounded-full text-xs font-medium text-white font-body shadow-sm"
                  style={{ backgroundColor: cor }}
                >
                  {nomeDisciplina || "Prévia"}
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-surface-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-medium">
                  Assuntos Relacionados
                </h3>
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

            <div className="pt-4 flex justify-end gap-3 border-t border-surface-100 pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 bg-surface-100 text-foreground hover:bg-surface-200 rounded-full text-sm font-medium transition-colors disabled:opacity-70"
              >
                Cancelar
              </button>
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
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
