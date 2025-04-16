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
    // Create FormData
    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("original_filename", data.original_filename);

    if (data.user_context_subject) {
      formData.append("user_context_subject", data.user_context_subject);
    }

    if (data.user_context_keywords?.length) {
      data.user_context_keywords.forEach((keyword) => {
        formData.append("user_context_keywords", keyword);
      });
    }

    // Handle upload progress
    if (onProgress) {
      onProgress(0);
    }

    // Send request to API
    const response = await fetch("/api/optimization-jobs", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create optimization job");
    }

    const result = await response.json();

    if (onProgress) {
      onProgress(100);
    }

    return result.data;
  } catch (error) {
    console.error("Error creating optimization job:", error);
    throw error;
  }
}
