import type { CreateOptimizationJobCommandDTO, OptimizationJobDTO } from "../../types";

/**
 * Creates a new optimization job by sending image and context data to the API
 *
 * @param data The optimization job command data including image and context
 * @param onProgress Optional callback function to track upload progress (0-100)
 * @returns The created optimization job data
 * @throws Error when the API request fails
 */
export async function createOptimizationJob(
  data: CreateOptimizationJobCommandDTO,
  onProgress?: (progress: number) => void
): Promise<OptimizationJobDTO> {
  try {
    // Simulate file upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }

    // Mock response data
    const mockResponses = [
      {
        alt: "A serene mountain landscape at sunset with snow-capped peaks reflecting golden light",
        filename: "mountain-sunset-landscape",
      },
      {
        alt: "Modern minimalist workspace with white desk, laptop and coffee cup",
        filename: "minimal-workspace-setup",
      },
      {
        alt: "Fresh organic vegetables arranged on rustic wooden table",
        filename: "fresh-organic-vegetables",
      },
    ];

    // Get random mock response
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return mock optimization job
    return {
      id: crypto.randomUUID(),
      user_id: "mock-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_filename: data.original_filename,
      file_hash: "mock-file-hash",
      status: "completed",
      user_context_subject: data.user_context_subject || null,
      user_context_keywords: data.user_context_keywords || null,
      generated_alt_text: mockResponse.alt,
      generated_filename_suggestion: mockResponse.filename,
      ai_detected_keywords: null,
      ai_request_id: null,
      error_message: null,
    };
  } catch (error) {
    console.error("Error creating optimization job:", error);
    throw error;
  }
}
