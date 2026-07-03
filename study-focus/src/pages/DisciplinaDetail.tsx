import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Loader2,
  Sparkles,
  Pencil,
} from "lucide-react";
import { useStudy } from "@/context/StudyContext";
import {
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcards,
  useUpdateFlashcard,
} from "@/hooks/use-flashcards";
import { alphaColor, normalizeHexColor, readableTextColor } from "@/lib/color";

const SubjectDetail = () => {
  const { id } = useParams();
  const { subjects, isLoading: subjectsLoading } = useStudy();
  const disciplinaIdStr = id ?? "";

  const currentSubject = subjects.find((s) => String(s.id) === disciplinaIdStr);

  const subjectName = currentSubject?.name ?? "Disciplina";
  const subjectColor = normalizeHexColor(currentSubject?.color);
  const subjectTextColor = readableTextColor(subjectColor);

  const { data: cards = [], isLoading } = useFlashcards(disciplinaIdStr);
  const createFlashcard = useCreateFlashcard(disciplinaIdStr);
  const updateFlashcard = useUpdateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();

  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [assuntoId, setAssuntoId] = useState<string | null>(
    currentSubject?.assuntos ? String(currentSubject.assuntos[0].ID) : null,
  );

  const assuntosMap = new Map<string, string>();

  if (currentSubject?.assuntos && currentSubject.assuntos.length > 0) {
    currentSubject.assuntos.forEach((assunto) => {
      if (assunto.ID && assunto.nome) {
        assuntosMap.set(String(assunto.ID), assunto.nome);
      }
    });
  }

  const defaultAssuntoId = currentSubject?.assuntos?.[0]?.ID
    ? String(currentSubject.assuntos[0].ID)
    : null;
  const selectedAssuntoId = assuntoId ?? defaultAssuntoId;

  const resetForm = () => {
    setFront("");
    setBack("");
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setFront("");
    setBack("");
    setEditingId(null);
    setAssuntoId(defaultAssuntoId);
    setShowForm(true);
  };

  const startEdit = (card: (typeof cards)[number]) => {
    setFront(card.pergunta);
    setBack(card.resposta);
    setAssuntoId(String(card.assunto_id));
    setEditingId(String(card.ID));
    setShowForm(true);
  };

  const handleSubmitFlashcard = () => {
    if (!front.trim() || !back.trim() || !selectedAssuntoId) return;

    const payload = {
      pergunta: front.trim(),
      resposta: back.trim(),
      assuntoId: selectedAssuntoId,
    };

    if (editingId) {
      updateFlashcard.mutate(
        { id: editingId, payload },
        {
          onSuccess: resetForm,
        },
      );
      return;
    }

    createFlashcard.mutate(payload, {
      onSuccess: resetForm,
    });
  };

  const isSaving = createFlashcard.isPending || updateFlashcard.isPending;

  if (subjectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">Carregando detalhes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <Link
        to="/disciplinas"
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar para disciplinas
      </Link>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className="size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: alphaColor(subjectColor, 0.14) }}
          >
            <BookOpen
              className="size-5 sm:size-6"
              style={{ color: subjectColor }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight break-words">
              {subjectName}
            </h1>
            <p className="text-foreground/60 font-body mt-1 text-sm sm:text-base">
              {cards.length} flashcards nesta disciplina
            </p>

            {/* Lista de Assuntos Vinculados */}
            <div className="flex flex-wrap gap-2 mt-3">
              {currentSubject?.assuntos &&
              currentSubject.assuntos.length > 0 ? (
                currentSubject.assuntos.map((assunto, index) => {
                  return (
                    <span
                      key={index}
                      className="px-2.5 py-1 border rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: alphaColor(subjectColor, 0.08),
                        borderColor: alphaColor(subjectColor, 0.22),
                        color: subjectColor,
                      }}
                      title={"Sem descrição"}
                    >
                      {assunto.nome}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-foreground/40 italic">
                  Nenhum assunto vinculado retornado pela API.
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/disciplinas/${disciplinaIdStr}/ai`}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: alphaColor(subjectColor, 0.1),
              color: subjectColor,
            }}
          >
            <Sparkles className="size-4" />
            Consultar IA
          </Link>
          <button
            onClick={() => (showForm ? resetForm() : startCreate())}
            className="px-5 py-2.5 rounded-full text-sm font-medium soft-shadow transition-colors flex items-center gap-2"
            style={{
              backgroundColor: subjectColor,
              color: subjectTextColor,
            }}
          >
            <Plus className="size-4" />
            Criar FlashCard
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-6 bg-card rounded-2xl soft-shadow border border-surface-100 space-y-4">
          <h2 className="text-lg font-heading font-medium">
            {editingId ? "Editar flashcard" : "Criar flashcard"}
          </h2>
          <input
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Pergunta (Frente)"
            className="w-full px-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          />
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Resposta (Verso)"
            rows={3}
            className="w-full px-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30 resize-none"
          />

          {assuntosMap.size === 0 ? (
            <p className="text-sm text-foreground/60">
              Nenhum assunto vinculado.
            </p>
          ) : (
            <select
              value={selectedAssuntoId ?? ""}
              onChange={(e) => setAssuntoId(e.target.value || null)}
              className="w-full px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            >
              {Array.from(assuntosMap.entries()).map(([id, nome]) => {
                return (
                  <option key={id} value={String(id)}>
                    {nome}
                  </option>
                );
              })}
            </select>
          )}

          <div className="flex gap-2">
            <button
              disabled={
                assuntosMap.size === 0 ||
                isSaving ||
                !selectedAssuntoId ||
                !front.trim() ||
                !back.trim()
              }
              onClick={handleSubmitFlashcard}
              className="px-5 py-2 rounded-full text-sm font-medium disabled:opacity-60"
              style={{
                backgroundColor: subjectColor,
                color: subjectTextColor,
              }}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 bg-surface-100 text-foreground/60 rounded-full text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="size-8 text-brand-600 animate-spin" />
          <p className="text-sm text-foreground/60">Carregando flashcards...</p>
        </div>
      )}
      <div className="space-y-4">
        {cards.map((card, index) => (
          <div
            key={card.ID ?? index}
            className="p-5 bg-card rounded-2xl soft-shadow border border-surface-100"
            style={{
              borderLeftColor: subjectColor,
              borderLeftWidth: 4,
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: alphaColor(subjectColor, 0.1),
                  color: subjectColor,
                }}
              >
                {assuntosMap.get(String(card.assunto_id)) ?? "Sem assunto"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(card)}
                  className="p-1.5 rounded-lg hover:bg-surface-100 text-foreground/40 hover:text-foreground transition-colors"
                  title="Editar flashcard"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() =>
                    setRevealedId(revealedId === card.ID ? null : card.ID)
                  }
                  className="p-1.5 rounded-lg hover:bg-surface-100 text-foreground/40 hover:text-foreground transition-colors"
                  title={
                    revealedId === card.ID ? "Ocultar resposta" : "Ver resposta"
                  }
                >
                  {revealedId === card.ID ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    deleteFlashcard.mutate(String(card.ID));
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-foreground/40 hover:text-destructive transition-colors"
                  title="Excluir flashcard"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-base font-medium font-body">{card.pergunta}</p>
            {revealedId === card.ID && (
              <div className="mt-3 pt-3 border-t border-surface-100">
                <p className="text-sm text-foreground/70">{card.resposta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectDetail;
