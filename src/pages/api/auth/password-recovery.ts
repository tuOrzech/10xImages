import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

const passwordRecoverySchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

const errorMessages = {
  "Email not found": "Nie znaleziono użytkownika o podanym adresie email",
  "Server error": "Wystąpił błąd serwera. Spróbuj ponownie później",
  "Rate limit exceeded": "Przekroczono limit prób. Spróbuj ponownie później",
} as const;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validation = passwordRecoverySchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: validation.error.errors[0].message,
        }),
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      const message = errorMessages[error.message as keyof typeof errorMessages] || error.message;
      return new Response(JSON.stringify({ error: message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        message: "Link do resetowania hasła został wysłany na podany adres email",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Password recovery error:", err);
    return new Response(JSON.stringify({ error: errorMessages["Server error"] }), { status: 500 });
  }
};
