import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ConfigTempos,
  pomodoroApi,
  PomodoroPayload,
  userTempos,
} from "@/lib/api";
import { toast } from "sonner";

interface ApiError {
  response?: {
    status?: number;
  };
}

export function useTempos() {
  return useQuery({
    queryKey: ["usuario", "me"],
    queryFn: userTempos.getTempos,
  });
}

export function useUpdateTempos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfigTempos) => userTempos.updateTempos(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuario", "me"] });
      console.log("testando");
    },
  });
}

export function useCiclosPomodoro(sessaoEstudoId?: number) {
  return useQuery({
    queryKey: ["pomodoro", "ciclos", sessaoEstudoId],
    queryFn: () => pomodoroApi.getCiclosConcluidos(sessaoEstudoId!),
    enabled: Boolean(sessaoEstudoId),
    select: (data) => data.ciclos_concluidos,
  });
}

export function usePomodoro() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: PomodoroPayload) => pomodoroApi.create(payload),
    onSuccess: (_data, variables) => {
      toast.success("Pomodoro salvo com sucesso!");
      // Futuramente: invalidar queries do dashboard ou sessão para atualizar estatísticas
      queryClient.invalidateQueries({
        queryKey: ["pomodoro", "ciclos", variables.sessao_estudo_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error: unknown) => {
      const status = (error as ApiError).response?.status;

      if (status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
      } else if (status === 400) {
        toast.error(
          "Dados de envio inválidos. Verifique a sessão do pomodoro.",
        );
      } else if (status !== undefined && status >= 500) {
        toast.error(
          "Erro interno no servidor ao salvar. Tente novamente mais tarde.",
        );
      } else {
        toast.error("Erro inesperado ao salvar o Pomodoro.");
      }
    },
  });

  const salvarPomodoro = useCallback(
    (
      sessao_estudo_id: number,
      duracao_minutos: number,
      fase: PomodoroPayload["fase"] = "foco",
      ciclos: number = 1,
      onSuccess?: () => void,
    ) => {
      mutate(
        { sessao_estudo_id, duracao_minutos, fase, ciclos },
        { onSuccess },
      );
    },
    [mutate],
  );

  return {
    salvarPomodoro,
    isSaving: isPending,
  };
}
