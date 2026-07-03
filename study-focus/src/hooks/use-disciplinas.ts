import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disciplinasApi,
  type CreateDisciplinaPayload,
  type UpdateDisciplinaPayload,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

const DISCIPLINAS_KEY = ["disciplinas"] as const;

export function useDisciplinas() {
  return useQuery({
    queryKey: DISCIPLINAS_KEY,
    queryFn: disciplinasApi.list,
    staleTime: 1000 * 60,
    retry: 2,
    enabled: !!getToken(),
  });
}

export function useCreateDisciplina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDisciplinaPayload) =>
      disciplinasApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCIPLINAS_KEY });
    },
  });
}

export function useUpdateDisciplina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDisciplinaPayload;
    }) => disciplinasApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCIPLINAS_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteDisciplina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disciplinasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCIPLINAS_KEY });
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["flashcards", "review"] });
      queryClient.invalidateQueries({ queryKey: ["historico", "revisoes"] });
    },
  });
}
