import type { OptimizationJobDTO } from "@/types";
import type { APIRoute } from "astro";
import { z } from "zod";

// Mock data for development
const mockJobs = new Map<string, OptimizationJobDTO>([
  [
    "mock-job-1",
    {
      id: "mock-job-1",
      user_id: "mock-user-id",
      created_at: "2023-01-01T12:00:00Z",
      updated_at: "2023-01-01T12:00:00Z",
      original_filename: "mountain.jpg",
      file_hash: "mock-file-hash-1",
      status: "completed",
      user_context_subject: "Landscape",
      user_context_keywords: ["mountains", "sunset", "nature"],
      generated_alt_text: "A serene mountain landscape at sunset with snow-capped peaks reflecting golden light",
      generated_filename_suggestion: "mountain-sunset-landscape",
      ai_detected_keywords: ["mountains", "sunset", "snow", "peaks", "landscape"],
      ai_request_id: null,
      error_message: null,
    },
  ],
]);

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

// Helper function to create a mock job
function createMockJob(id: string): OptimizationJobDTO {
  return {
    id,
    user_id: "mock-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    original_filename: "sample-image.jpg",
    file_hash: `mock-file-hash-${id.substring(0, 8)}`,
    status: "completed",
    user_context_subject: "Sample Subject",
    user_context_keywords: ["sample", "keywords"],
    generated_alt_text: "A sample image showing the product in use",
    generated_filename_suggestion: "sample-product-usage",
    ai_detected_keywords: ["sample", "product", "usage"],
    ai_request_id: null,
    error_message: null,
  };
}

// Get single optimization job
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: "Missing job ID" }), { status: 400 });
    }

    // For any non-mocked ID, create a dynamic mock job
    if (!mockJobs.has(id)) {
      mockJobs.set(id, createMockJob(id));
    }

    const job = mockJobs.get(id);

    return new Response(JSON.stringify(job));
  } catch (error) {
    console.error("Error fetching optimization job:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};

// Update optimization job
export const PATCH: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response(JSON.stringify({ message: "Content-Type must be application/json" }), { status: 400 });
    }

    // Check if job exists
    if (!mockJobs.has(id)) {
      return new Response(JSON.stringify({ message: "Optimization job not found" }), { status: 404 });
    }

    const rawData = await request.json();
    const validatedData = updateOptimizationJobSchema.parse(rawData);

    // Update the mock job
    const job = mockJobs.get(id);
    if (!job) {
      return new Response(JSON.stringify({ message: "Optimization job not found" }), { status: 404 });
    }

    const updatedJob: OptimizationJobDTO = {
      ...job,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };
    mockJobs.set(id, updatedJob);

    return new Response(JSON.stringify(updatedJob));
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
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    if (!mockJobs.has(id)) {
      return new Response(JSON.stringify({ message: "Optimization job not found" }), { status: 404 });
    }

    // Remove the job from mock data
    mockJobs.delete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error processing delete request:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
