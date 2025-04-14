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

export const prerender = false;

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
