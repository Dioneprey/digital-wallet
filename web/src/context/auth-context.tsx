"use client";

import { useUser } from "@/common/hooks/use-user";
import { User } from "@/services/user/type";
import { createContext, useContext } from "react";

type AuthContextType = {
  authenticated: boolean;
  loading: boolean;
  user: User | null;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  loading: true,
  user: null,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: response, isLoading, refetch } = useUser();

  const authenticated = !!response?.user;
  const loading = isLoading;

  return (
    <AuthContext.Provider
      value={{ authenticated, loading, user: response?.user || null, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
