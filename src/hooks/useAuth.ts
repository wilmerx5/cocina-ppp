import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";



export const useAuth = () => {
  const queryClient = useQueryClient(); 

  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await authService.getUser();
      return data;
    },

    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.isError) {
        console.log(query.error)
      queryClient.removeQueries({ queryKey: ["auth-user"] });
    }
  }, [query.isError, queryClient]);

  return query;
};
