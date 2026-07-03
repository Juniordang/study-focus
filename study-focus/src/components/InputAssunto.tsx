import React from "react";
import { Trash2 } from "lucide-react";

export interface Assunto {
  id: string;
  nome: string;
}

interface InputAssuntoProps {
  assunto: Assunto;
  onChange: (id: string, field: keyof Assunto, value: string) => void;
  onRemove: (id: string) => void;
}

export const InputAssunto: React.FC<InputAssuntoProps> = ({
  assunto,
  onChange,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200 transition-colors hover:border-brand-600/30">
      <input
        type="text"
        value={assunto.nome}
        onChange={(e) => onChange(assunto.id, "nome", e.target.value)}
        placeholder="Nome do assunto (Ex: Álgebra Linear)"
        className="flex-1 px-4 py-2 bg-white rounded-lg border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
      />

      <button
        type="button"
        onClick={() => onRemove(assunto.id)}
        className="p-2 text-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        title="Remover assunto"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};
