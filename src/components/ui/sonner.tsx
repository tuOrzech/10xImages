"use client";

import { Toaster as Sonner } from "sonner";

interface ToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  duration?: number;
  closeButton?: boolean;
  className?: string;
  expanded?: boolean;
  visibleToasts?: number;
  style?: React.CSSProperties;
  richColors?: boolean;
  toastOptions?: Record<string, unknown>;
  theme?: "light" | "dark" | "system";
}

const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  // Wykorzystujemy preferencję systemową, gdy theme jest ustawiony na "system"
  const systemPrefersDark =
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;

  const resolvedTheme = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  return (
    <Sonner
      theme={resolvedTheme as "light" | "dark"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
