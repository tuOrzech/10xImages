import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Hasło musi zawierać przynajmniej jeden znak specjalny"),
});

const errorMessages = {
  "Auth session missing": "Sesja wygasła lub jest nieprawidłowa. Spróbuj ponownie zresetować hasło.",
  "Server error": "Wystąpił błąd serwera. Spróbuj ponownie później",
  "Invalid password": "Hasło nie spełnia wymagań bezpieczeństwa",
} as const;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: validation.error.errors[0].message,
        }),
        { status: 400 }
      );
    }

    const { password } = validation.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      const message = errorMessages[error.message as keyof typeof errorMessages] || error.message;
      return new Response(JSON.stringify({ error: message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zmienione",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Password reset error:", err);
    return new Response(JSON.stringify({ error: errorMessages["Server error"] }), { status: 500 });
  }
};
