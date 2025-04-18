import { supabase } from "@/db/client";
import type { User } from "@/types";

export async function isAuthenticated(request: Request): Promise<User | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return null;
  }
}
