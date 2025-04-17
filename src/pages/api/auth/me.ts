import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request }) => {
  // Set common headers for all responses
  const commonHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
    Expires: "0",
    Pragma: "no-cache",
  };

  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Always return 200 with user data or null
    return new Response(
      JSON.stringify({
        user: session
          ? {
              id: session.user.id,
              email: session.user.email,
            }
          : null,
      }),
      {
        status: 200,
        headers: {
          ...commonHeaders,
          // Add cache control for authenticated users
          ...(session && {
            "Cache-Control": `private, max-age=${session.expires_in ?? 3600}`,
          }),
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return new Response(
      JSON.stringify({
        user: null,
        error: "Internal server error",
      }),
      {
        status: 200, // Still return 200 to avoid redirect
        headers: commonHeaders,
      }
    );
  }
};
