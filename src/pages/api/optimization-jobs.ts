import type { APIRoute } from "astro";
import { z } from "zod";
import { DEFAULT_USER_ID, supabaseClient } from "../../db/supabase.client";
import { OptimizationService } from "../../lib/services/optimization.service";

// Schema for validating multipart/form-data request
const createOptimizationJobSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) => {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        return validTypes.includes(file.type);
      },
      {
        message: "Invalid file type. Only JPG, PNG and WEBP files are allowed.",
      }
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
      {
        message: "File size must be less than 10MB",
      }
    ),
  original_filename: z.string().min(1, "Original filename is required"),
  user_context_subject: z.string().optional(),
  user_context_keywords: z.array(z.string()).optional(),
});

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

// Create optimization job
export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate request content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Request must be multipart/form-data",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate form data
    const formData = await request.formData();
    const rawData = {
      image: formData.get("image"),
      original_filename: formData.get("original_filename"),
      user_context_subject: formData.get("user_context_subject"),
      user_context_keywords: formData.getAll("user_context_keywords"),
    };

    const validatedData = createOptimizationJobSchema.parse(rawData);

    // Create optimization service
    const optimizationService = new OptimizationService(supabaseClient, supabaseClient.storage);

    // Create optimization job
    const { data: job, error } = await optimizationService.createOptimizationJob({
      userId: DEFAULT_USER_ID,
      image: validatedData.image,
      originalFilename: validatedData.original_filename,
      userContextSubject: validatedData.user_context_subject,
      userContextKeywords: validatedData.user_context_keywords,
    });

    if (error) {
      // Handle duplicate file case
      if (error.message === "File has already been optimized") {
        return new Response(
          JSON.stringify({
            message: "File has already been optimized",
            data: job,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle other errors
      console.error("Error creating optimization job:", error);
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

    return new Response(
      JSON.stringify({
        message: "Optimization job created successfully",
        data: job,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
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

    console.error("Error processing optimization job:", error);
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

// List optimization jobs
export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          error: "Invalid pagination parameters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const optimizationService = new OptimizationService(supabaseClient, supabaseClient.storage);
    const { data, error } = await optimizationService.listOptimizationJobs(DEFAULT_USER_ID, page, limit);

    if (error) {
      console.error("Error listing optimization jobs:", error);
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
    console.error("Error processing list request:", error);
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

// Get single optimization job
export const getOptimizationJob: APIRoute = async ({ params }) => {
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

// Retry optimization job
export const retryOptimizationJob: APIRoute = async ({ params }) => {
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
