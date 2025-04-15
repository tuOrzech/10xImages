import type { APIRoute } from "astro";
import { DEFAULT_USER_ID, supabaseClient } from "../../../../db/supabase.client";
import { OptimizationService } from "../../../../lib/services/optimization.service";

export const prerender = false;

// Retry optimization job
export const POST: APIRoute = async ({ params }) => {
  try {
    const jobId = params.id;
    if (!jobId) {
      return new Response(
        JSON.stringify({
          error: "Job ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const optimizationService = new OptimizationService(supabaseClient, supabaseClient.storage);
    const { data, error } = await optimizationService.retryOptimizationJob(DEFAULT_USER_ID, jobId);

    if (error) {
      if (error.message === "Optimization job not found") {
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error.message === "Only failed jobs can be retried") {
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.error("Error retrying optimization job:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing retry request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
