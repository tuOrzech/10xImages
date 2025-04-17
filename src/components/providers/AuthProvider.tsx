import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse, User } from "../../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/auth/me", {
          headers: {
            Accept: "application/json",
          },
        });

        // Validate that we got JSON response
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response from server");
        }

        const data: AuthResponse = await response.json();
        setUser(data.user);

        if (data.error) {
          setError(data.error);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        // Don't reset user state on error to avoid flickering
      } finally {
        setIsLoading(false);
      }
    };

    // Check auth only if we don't have initialUser
    if (!initialUser) {
      checkAuth();
    }

    // Check auth when window regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [initialUser]);

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setError(error instanceof Error ? error.message : "Error during logout");
    } finally {
      setIsLoading(false);
    }
  };

  return <AuthContext.Provider value={{ user, isLoading, error, logout }}>{children}</AuthContext.Provider>;
}
