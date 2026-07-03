import { dashboardApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useDashboard() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
  });
}
