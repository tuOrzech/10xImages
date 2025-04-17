import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format adresu email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć minimum 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Hasło musi zawierać przynajmniej jeden znak specjalny"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

const errorMessages = {
  "User already registered": "Użytkownik o podanym adresie email już istnieje",
  "Server error": "Wystąpił błąd serwera. Spróbuj ponownie później",
  "Invalid email": "Nieprawidłowy format adresu email",
} as const;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: validation.error.errors[0].message,
        }),
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      const message = errorMessages[error.message as keyof typeof errorMessages] || error.message;
      return new Response(JSON.stringify({ error: message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        message: "Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: errorMessages["Server error"] }), { status: 500 });
  }
};
