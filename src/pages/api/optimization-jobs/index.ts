import { OpenRouterRateLimitError } from "@/lib/services/openrouter.service";
import { OptimizationService } from "@/lib/services/optimization.service";
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Schema for validating form data
const createOptimizationJobSchema = z.object({
  original_filename: z.string(),
  user_context_subject: z.string().optional(),
  user_context_keywords: z
    .string()
    .transform((str) => {
      try {
        const parsed = JSON.parse(str);
        return z.array(z.string()).parse(parsed);
      } catch {
        return [];
      }
    })
    .optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.info("[API] Starting new optimization job request");
    const formData = await request.formData();

    // Get and validate file
    const file = formData.get("image") as File;
    if (!file || !(file instanceof File)) {
      console.warn("[API] No file uploaded");
      return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });
    }

    console.info("[API] File received", {
      type: file.type,
      size: Math.round(file.size / 1024) + "KB",
      name: file.name,
    });

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      console.warn("[API] Invalid file type", { type: file.type });
      return new Response(JSON.stringify({ message: "Invalid file type. Only JPG, PNG and WebP are allowed" }), {
        status: 400,
      });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.warn("[API] File too large", { size: Math.round(file.size / 1024 / 1024) + "MB" });
      return new Response(JSON.stringify({ message: "File too large. Maximum size is 10MB" }), { status: 400 });
    }

    // Extract and validate other form data
    const formDataObj = Object.fromEntries(formData.entries());
    console.info("[API] Form data received", {
      ...formDataObj,
      image: undefined, // Don't log the actual file
    });

    const validatedData = createOptimizationJobSchema.parse(formDataObj);

    // Generate unique file hash (you might want to use a more robust method)
    const fileHash = crypto.randomUUID();

    // Upload file to Supabase Storage
    const userId = "anonymous"; // TODO: Implement user authentication
    const storagePath = `${userId}/${fileHash}`;
    console.info("[API] Uploading file to storage", { storagePath });

    const { error: uploadError } = await locals.supabase.storage.from("optimization-images").upload(storagePath, file);

    if (uploadError) {
      console.error("[API] Error uploading file:", uploadError);
      return new Response(JSON.stringify({ message: "Failed to upload file" }), { status: 500 });
    }

    console.info("[API] File uploaded successfully");

    // Create optimization service
    const optimizationService = new OptimizationService(locals.supabase, locals.supabase.storage);

    console.info("[API] Creating optimization job");
    // Create optimization job
    const { data: job, error } = await optimizationService.createOptimizationJob({
      userId: "anonymous", // TODO: Implement user authentication
      image: file,
      originalFilename: validatedData.original_filename,
      userContextSubject: validatedData.user_context_subject,
      userContextKeywords: validatedData.user_context_keywords,
    });

    if (error) {
      console.error("[API] Job creation error:", {
        message: error.message,
        name: error.name,
        isRateLimit: error instanceof OpenRouterRateLimitError,
      });

      // Handle rate limit case
      if (error.message.includes("Rate limit exceeded") || error.message.includes("Przekroczono dzienny limit")) {
        console.warn("[API] Rate limit exceeded");
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle other errors
      console.error("[API] Other error occurred:", error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas przetwarzania zadania. Spróbuj ponownie później.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!job) {
      console.error("[API] No job data returned");
      return new Response(
        JSON.stringify({
          error: "Nie udało się utworzyć zadania optymalizacji",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.info("[API] Job created successfully", { jobId: job?.id });
    return new Response(JSON.stringify({ data: job }), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("[API] Validation error", { details: error.errors });
      return new Response(
        JSON.stringify({
          message: "Validation error",
          details: error.errors,
        }),
        { status: 400 }
      );
    }

    console.error("[API] Error processing upload:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
