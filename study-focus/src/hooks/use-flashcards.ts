import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flashcardApi,
  type FlashCardPayload,
  type UpdateFlashcardPayload,
} from "@/lib/api";

export function useFlashcards(disciplinaId: string) {
  return useQuery({
    queryKey: ["flashcards", disciplinaId],
    queryFn: () => flashcardApi.listFlashcards(disciplinaId),
    enabled: !!disciplinaId,
  });
}

export function useCreateFlashcard(subjectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlashCardPayload) =>
      flashcardApi.create(subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", subjectId] });
    },
  });
}

export function useCreateFlashcardsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { flashcards: FlashCardPayload[] }) =>
      flashcardApi.createBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFlashcardPayload;
    }) => flashcardApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useFlashcardsToReview() {
  return useQuery({
    queryKey: ["flashcards", "review"],
    queryFn: () => flashcardApi.listToReview(),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, desempenho }: { id: string; desempenho: string }) =>
      flashcardApi.submitReview(id, desempenho),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", "review"] });

      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flashcardApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });

      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
