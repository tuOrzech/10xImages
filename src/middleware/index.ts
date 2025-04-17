import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Ścieżki publiczne - endpointy API Auth i strony Astro renderowane po stronie serwera
const PUBLIC_PATHS = [
  // Strony Astro renderowane po stronie serwera
  "/auth/login",
  "/auth/register",
  "/auth/password-recovery",
  // Endpointy API Auth
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/password-recovery",
  "/api/auth/me",
  // Strona główna i przesyłanie pojedynczych obrazów
  "/",
  "/upload",
  "/preview",
];

// Prefiksy ścieżek publicznych - wszystkie ścieżki zaczynające się od tych prefiksów będą publiczne
const PUBLIC_PATH_PREFIXES = [
  "/api/optimization-jobs",
  "/preview/", // Dodajemy prefiks dla stron podglądu, np. /preview/123
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Inicjalizacja klienta Supabase
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Dodaj klienta Supabase do locals
  locals.supabase = supabase;

  // Pobierz dane użytkownika
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dodaj dane użytkownika do locals jeśli jest zalogowany
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email as string,
    };
  }

  // Sprawdź czy ścieżka jest publiczna (dokładne dopasowanie lub prefiks)
  const isPublicPath =
    PUBLIC_PATHS.includes(url.pathname) || PUBLIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  // Pomiń sprawdzanie autoryzacji dla ścieżek publicznych
  if (isPublicPath) {
    return next();
  }

  // Przekieruj do strony logowania dla chronionych ścieżek jeśli użytkownik nie jest zalogowany
  if (!user) {
    return redirect("/auth/login");
  }

  return next();
});
