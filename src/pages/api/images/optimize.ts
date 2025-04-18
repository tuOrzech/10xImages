import { isAuthenticated } from "@/lib/auth";
import { optimizeImage } from "@/lib/services/imageOptimizationService";
import type { APIRoute } from "astro";
import { z } from "zod";

// Walidacja payloadu żądania
const optimizeRequestSchema = z.object({
  job_id: z.string().uuid(),
  settings: z.object({
    format: z.string(),
    quality: z.number().min(1).max(100),
    dimensions: z.object({
      width: z.number().nullable(),
      height: z.number().nullable(),
      maintainAspectRatio: z.boolean(),
    }),
    compressionOptions: z.object({
      method: z.string(),
      level: z.number(),
      formatSpecificOptions: z.record(z.unknown()),
    }),
    metadataOptions: z.object({
      keepExif: z.boolean(),
      keepIptc: z.boolean(),
      keepXmp: z.boolean(),
      keepColorProfile: z.boolean(),
      addCopyright: z.boolean(),
      copyrightText: z.string(),
    }),
  }),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Sprawdzenie autentykacji
    const user = await isAuthenticated(request);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parsowanie i walidacja danych wejściowych
    const requestData = await request.json();
    const validatedData = optimizeRequestSchema.parse(requestData);

    // Wywołanie serwisu optymalizacji
    const result = await optimizeImage(validatedData.job_id, validatedData.settings, user.id);

    // Zwrócenie wyniku
    return new Response(
      JSON.stringify({
        optimized_image_url: result.url,
        metadata: result.metadata,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error during image optimization:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
