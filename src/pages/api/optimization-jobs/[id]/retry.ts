import type { OptimizationJobDTO } from "@/types";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    // Return a mock response for the retried job
    const retriedJob: OptimizationJobDTO = {
      id,
      user_id: "mock-user-id",
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date().toISOString(),
      original_filename: "retried-image.jpg",
      file_hash: `mock-file-hash-${id.substring(0, 8)}`,
      status: "processing", // Changed to processing since it was just retried
      user_context_subject: "Retried Subject",
      user_context_keywords: ["retried", "keywords"],
      generated_alt_text: null, // Reset on retry
      generated_filename_suggestion: null, // Reset on retry
      ai_detected_keywords: null,
      ai_request_id: null,
      error_message: null, // Error cleared on retry
    };

    return new Response(JSON.stringify(retriedJob));
  } catch (error) {
    console.error("Error processing retry request:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
