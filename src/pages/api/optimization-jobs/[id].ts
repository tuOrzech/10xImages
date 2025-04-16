import type { APIRoute } from "astro";
import { z } from "zod";

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
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: "Missing job ID" }), { status: 400 });
    }

    const { data: job, error } = await locals.supabase.from("optimization_jobs").select().eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ message: "Optimization job not found" }), { status: 404 });
      }
      throw error;
    }

    return new Response(JSON.stringify(job));
  } catch (error) {
    console.error("Error fetching optimization job:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};

// Update optimization job
export const PATCH: APIRoute = async ({ request, params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response(JSON.stringify({ message: "Content-Type must be application/json" }), { status: 400 });
    }

    const rawData = await request.json();
    const validatedData = updateOptimizationJobSchema.parse(rawData);

    // Update the job in Supabase
    const { data: job, error: updateError } = await locals.supabase
      .from("optimization_jobs")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return new Response(JSON.stringify({ message: "Optimization job not found" }), { status: 404 });
      }
      throw updateError;
    }

    return new Response(JSON.stringify(job));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: "Validation error",
          details: error.errors,
        }),
        { status: 400 }
      );
    }

    console.error("Error processing update request:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};

// Delete optimization job
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    // First get the job to check if it exists and get the storage path
    const { data: job, error: getError } = await locals.supabase
      .from("optimization_jobs")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (getError) {
      if (getError.code === "PGRST116") {
        return new Response(JSON.stringify({ message: "Optimization job not found" }), { status: 404 });
      }
      throw getError;
    }

    // Delete the file from storage if we have a storage path
    if (job?.storage_path) {
      const { error: storageError } = await locals.supabase.storage
        .from("optimization-images")
        .remove([job.storage_path]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the database record
    const { error: deleteError } = await locals.supabase.from("optimization_jobs").delete().eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error processing delete request:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
