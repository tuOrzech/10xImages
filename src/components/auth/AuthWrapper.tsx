import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import type { User } from "../../types";
import Navigation from "../Navigation";
import { AuthProvider } from "../providers/AuthProvider";

interface AuthWrapperProps {
  initialUser?: User | null;
  children: ReactNode;
}

export default function AuthWrapper({ initialUser, children }: AuthWrapperProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      <Navigation />
      {children}
      <Toaster richColors position="bottom-right" duration={3000} closeButton visibleToasts={3} theme="system" />
    </AuthProvider>
  );
}
