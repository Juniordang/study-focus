import { useState } from "react";
import {
  Plus,
  BookOpen,
  Trash2,
  Brain,
  ChevronRight,
  Loader2,
  WifiOff,
  Pencil,
} from "lucide-react";
import { useDisciplinas, useDeleteDisciplina } from "@/hooks/use-disciplinas";
import { Link } from "react-router-dom";
import { EditSubjectModal } from "@/components/EditDisciplinaModal";
import { Disciplina } from "@/lib/api";
import { alphaColor, normalizeHexColor } from "@/lib/color";

// useCreateSubject,
const Subjects = () => {
  const { data: subjects = [], isLoading, isError, error } = useDisciplinas();
  // const createSubject = useCreateSubject();
  const deleteSubject = useDeleteDisciplina();
  const [editingSubject, setEditingSubject] = useState<Disciplina | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">Carregando disciplinas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <WifiOff className="size-10 text-destructive/60" />
        <p className="text-foreground/60 text-sm">
          Não foi possível carregar as disciplinas.
        </p>
        <p className="text-xs text-foreground/40">{(error as Error).message}</p>
      </div>
    );
  }

  // ─── Render principal ────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
            Disciplinas
          </h1>
          <p className="text-foreground/60 font-body mt-1 text-sm sm:text-base">
            Organize seus estudos por disciplinas e assuntos
          </p>
        </div>
        <Link
          to="/cadastro-disciplina"
          className="self-start px-5 py-2.5 bg-brand-600 text-primary-foreground rounded-full text-sm font-medium soft-shadow hover:bg-brand-600/90 transition-colors flex items-center gap-2"
        >
          <Plus className="size-4" />
          Nova Disciplina
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          const subjectColor = normalizeHexColor(subject.color);

          return (
            <div
              key={subject.id}
              className="group p-6 bg-card rounded-2xl soft-shadow border border-surface-100 transition-colors"
              style={{
                borderLeftColor: subjectColor,
                borderLeftWidth: 4,
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="size-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: alphaColor(subjectColor, 0.14) }}
                >
                  <BookOpen
                    className="size-5"
                    style={{ color: subjectColor }}
                  />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => setEditingSubject(subject)}
                    className="p-1.5 rounded-lg hover:bg-surface-200 text-foreground/40 hover:text-brand-600 transition-all"
                    title="Editar Disciplina"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => deleteSubject.mutate(subject.id)}
                    disabled={
                      deleteSubject.isPending &&
                      deleteSubject.variables === subject.id
                    }
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-foreground/40 hover:text-destructive transition-all disabled:opacity-30"
                    title="Excluir Disciplina"
                  >
                    {deleteSubject.isPending &&
                    deleteSubject.variables === subject.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-heading font-medium mb-1">
                {subject.name}
              </h3>
              <p className="text-sm text-foreground/60 mb-4">
                {subject.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Brain className="size-3.5" />
                  <span>{subject.cardCount} flashcards</span>
                </div>
                <Link
                  to={`/disciplinas/${subject.id}`}
                  className="text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: subjectColor }}
                >
                  Abrir
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="size-12 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/60">Nenhuma disciplina ainda</p>
        </div>
      )}

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
    </div>
  );
};

export default Subjects;
