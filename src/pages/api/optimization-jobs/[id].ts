import type { APIRoute } from "astro";
import { z } from "zod";
import { DEFAULT_USER_ID, supabaseClient } from "../../../db/supabase.client";
import { OptimizationService } from "../../../lib/services/optimization.service";

// Schema for validating update request
const updateOptimizationJobSchema = z.object({
  generated_alt_text: z.string().nullable().optional(),
  generated_filename_suggestion: z.string().nullable().optional(),
  user_context_subject: z.string().nullable().optional(),
  user_context_keywords: z.array(z.string()).nullable().optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  error_message: z.string().nullable().optional(),
});

export const prerender = false;

// Get single optimization job
export const GET: APIRoute = async ({ params }) => {
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
    const { data, error } = await optimizationService.getOptimizationJob(DEFAULT_USER_ID, jobId);

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

      console.error("Error getting optimization job:", error);
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
    console.error("Error processing get request:", error);
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

// Update optimization job
export const PATCH: APIRoute = async ({ request, params }) => {
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

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          error: "Content-Type must be application/json",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const rawData = await request.json();
    const validatedData = updateOptimizationJobSchema.parse(rawData);

    const optimizationService = new OptimizationService(supabaseClient, supabaseClient.storage);
    const { data, error } = await optimizationService.updateOptimizationJob(DEFAULT_USER_ID, jobId, validatedData);

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

      console.error("Error updating optimization job:", error);
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
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error processing update request:", error);
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

// Delete optimization job
export const DELETE: APIRoute = async ({ params }) => {
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
    const { error } = await optimizationService.deleteOptimizationJob(DEFAULT_USER_ID, jobId);

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

      console.error("Error deleting optimization job:", error);
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

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error processing delete request:", error);
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
