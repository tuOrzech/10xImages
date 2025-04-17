import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Rate limiting implementation
const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_ATTEMPTS = 3;
const RESET_TIME = 15 * 60 * 1000; // 15 minutes

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Sprawdź rate limiting przed walidacją danych
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const currentAttempt = loginAttempts.get(ipAddress);

    if (currentAttempt) {
      const timeSinceLastAttempt = Date.now() - currentAttempt.timestamp;
      if (currentAttempt.count >= MAX_ATTEMPTS && timeSinceLastAttempt < RESET_TIME) {
        const remainingTime = Math.ceil((RESET_TIME - timeSinceLastAttempt) / 1000 / 60);
        return new Response(
          JSON.stringify({
            error: `Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za ${remainingTime} minut.`,
            code: "RATE_LIMIT_EXCEEDED",
          }),
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((RESET_TIME - timeSinceLastAttempt) / 1000)),
            },
          }
        );
      }

      // Reset licznika jeśli minął czas blokady
      if (timeSinceLastAttempt >= RESET_TIME) {
        loginAttempts.delete(ipAddress);
      }
    }

    // Parsowanie i walidacja danych
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Błąd walidacji",
          details: result.error.errors,
          code: "VALIDATION_ERROR",
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Próba logowania
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Aktualizacja licznika prób logowania
      const attempt = loginAttempts.get(ipAddress) || { count: 0, timestamp: Date.now() };
      const newCount = attempt.count + 1;
      loginAttempts.set(ipAddress, {
        count: newCount,
        timestamp: Date.now(),
      });

      // Informacja o pozostałych próbach
      const remainingAttempts = MAX_ATTEMPTS - newCount;
      const errorMessage =
        error.message === "Invalid login credentials"
          ? `Nieprawidłowy email lub hasło. Pozostało prób: ${Math.max(remainingAttempts, 0)}`
          : "Wystąpił błąd podczas logowania. Spróbuj ponownie później.";

      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: error.status,
          remainingAttempts: Math.max(remainingAttempts, 0),
        }),
        { status: error.status || 400 }
      );
    }

    // Reset licznika prób po udanym logowaniu
    loginAttempts.delete(ipAddress);

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Błąd logowania:", err);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
        code: "INTERNAL_SERVER_ERROR",
      }),
      { status: 500 }
    );
  }
};
