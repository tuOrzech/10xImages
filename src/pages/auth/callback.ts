import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return redirect("/auth/login?error=invalid_callback");
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Error exchanging code for session:", error);
    return redirect("/auth/login?error=auth_callback_error");
  }

  // Przekieruj do dashboardu po udanym potwierdzeniu email
  return redirect("/dashboard");
};
