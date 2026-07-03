import { useMutation } from "@tanstack/react-query";
import { aiApi, type AIDisciplinaPayload } from "@/lib/api";

export function useAskDisciplinaAI() {
  return useMutation({
    mutationFn: (payload: AIDisciplinaPayload) =>
      aiApi.askDisciplina(payload),
  });
}
