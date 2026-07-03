import { useQuery } from "@tanstack/react-query";
import { aiApi, flashcardApi } from "@/lib/api";
import { getToken } from "@/lib/auth";

export function useAIHistory() {
  return useQuery({
    queryKey: ["historico", "ia"],
    queryFn: aiApi.listHistory,
    enabled: !!getToken(),
  });
}

export function useReviewHistory() {
  return useQuery({
    queryKey: ["historico", "revisoes"],
    queryFn: flashcardApi.listReviewHistory,
    enabled: !!getToken(),
  });
}
