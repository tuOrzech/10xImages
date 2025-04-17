import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const formId = useId();
  const emailId = useId();
  const passwordId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Obsługa różnych kodów błędów
        if (response.status === 429) {
          toast.error("Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.", {
            duration: 5000,
          });
        } else if (response.status === 400) {
          if (result.details) {
            // Błędy walidacji
            result.details.forEach((error: { message: string }) => {
              toast.error(error.message);
            });
          } else {
            toast.error(result.error);
          }
        } else {
          toast.error(result.error || "Wystąpił błąd podczas logowania");
        }
        return;
      }

      // Sukces
      toast.success("Logowanie udane! Przekierowuję do panelu...", {
        duration: 2000,
      });

      // Krótkie opóźnienie przed przekierowaniem, aby toast był widoczny
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Card className="p-6">
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            {...register("email")}
            placeholder="twoj@email.com"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
          />
          {errors.email && (
            <p id={`${emailId}-error`} className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={passwordId}>Hasło</Label>
          <Input
            id={passwordId}
            type="password"
            {...register("password")}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          />
          {errors.password && (
            <p id={`${passwordId}-error`} className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </Button>
          <div className="text-center text-sm">
            <a href="/auth/password-recovery" className="text-blue-600 hover:underline">
              Zapomniałeś hasła?
            </a>
          </div>
          <div className="text-center text-sm">
            Nie masz konta?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Zarejestruj się
            </a>
          </div>
        </div>
      </form>
    </Card>
  );
}
