import { OptimizationService } from "@/lib/services/optimization.service";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    const optimizationService = new OptimizationService(locals.supabase, locals.supabase.storage);
    const result = await optimizationService.retryOptimizationJob("anonymous", id);

    if (result.error) {
      if (result.error.message === "Optimization job not found") {
        return new Response(JSON.stringify({ message: result.error.message }), { status: 404 });
      }
      if (result.error.message === "Only failed jobs can be retried") {
        return new Response(JSON.stringify({ message: result.error.message }), { status: 400 });
      }
      throw result.error;
    }

    return new Response(JSON.stringify(result.data));
  } catch (error) {
    console.error("Error processing retry request:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
