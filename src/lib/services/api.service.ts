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
    console.log("[API Service] Starting to create optimization job", {
      filename: data.original_filename,
      hasSubject: !!data.user_context_subject,
      keywordsCount: data.user_context_keywords?.length || 0,
    });

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

    console.log("[API Service] Sending request to API");

    // Send request to API
    const response = await fetch("/api/optimization-jobs", {
      method: "POST",
      body: formData,
    });

    console.log("[API Service] Received API response", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[API Service] Error response from API", error);
      throw new Error(error.error || "Failed to create optimization job");
    }

    const result = await response.json();
    console.log("[API Service] Parsed API response", {
      hasData: !!result.data,
      id: result.data?.id,
    });

    if (onProgress) {
      onProgress(100);
    }

    return result.data;
  } catch (error) {
    console.error("[API Service] Error creating optimization job:", error);
    throw error;
  }
}
