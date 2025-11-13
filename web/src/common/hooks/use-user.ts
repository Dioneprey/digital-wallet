import { getMe } from "@/services/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getMe(),
  });
}

export function useInvalidateUser() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };
}
