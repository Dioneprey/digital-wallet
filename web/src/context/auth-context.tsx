"use client";

import { useInvalidateUser, useUser } from "@/common/hooks/use-user";
import { User } from "@/services/user/type";
import { logout as LogOutAction } from "@/actions/auth";
import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  authenticated: boolean;
  loading: boolean;
  user: User | null;
  refetch: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  loading: true,
  user: null,
  refetch: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: response, isLoading, refetch } = useUser();
  const router = useRouter();
  const invalidateUser = useInvalidateUser();
  const authenticated = !!response?.user;
  const loading = isLoading;

  async function logout() {
    try {
      await LogOutAction();
      invalidateUser();
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  }
  console.log(response?.user);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        loading,
        user: response?.user || null,
        refetch,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
