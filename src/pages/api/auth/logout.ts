import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), { status: 400 });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Logout error:", err);
    return new Response(JSON.stringify({ error: "Wystąpił błąd serwera" }), { status: 500 });
  }
};
