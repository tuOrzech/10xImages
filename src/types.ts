// This file contains the DTO and Command Model definitions for the AltImageOptimizer API.
// These types are based on the database models defined in "src/db/database.types.ts"
// and adhere to the API plan specified in ".ai/api-plan.md".

// DTO representing an optimization job record.
export interface OptimizationJobDTO {
  // Unique identifier for the job.
  id: string;
  // Reference to the user who created the job.
  user_id: string;
  // Timestamp when the job was created.
  created_at: string;
  // Timestamp when the job was last updated.
  updated_at: string;
  // Original name of the uploaded file.
  original_filename: string;
  // Hash of the file content for deduplication.
  file_hash: string | null;
  // Full path to the file in Supabase Storage.
  storage_path: string;
  // Current status of the job.
  status: "pending" | "processing" | "completed" | "failed";
  // Optional subject context provided by the user.
  user_context_subject?: string | null;
  // Optional keywords provided by the user.
  user_context_keywords?: string[] | null;
  // AI-generated alt text for the image.
  generated_alt_text?: string | null;
  // AI-suggested SEO-friendly filename.
  generated_filename_suggestion?: string | null;
  // Reference ID for the AI service request.
  ai_request_id?: string | null;
  // Keywords detected by AI from the image.
  ai_detected_keywords?: string[] | null;
  // Error message if the job failed.
  error_message?: string | null;
}

// Command model for creating a new optimization job.
// Contains fields expected in the multipart/form-data request.
export interface CreateOptimizationJobCommandDTO {
  // Represents the uploaded image file. Typically a File object from the client.
  image: File;
  // Original file name, required if not inferred from the file metadata.
  original_filename: string;
  // Optional description of the image subject provided by the user.
  user_context_subject?: string;
  // Optional array of keywords provided by the user for context.
  user_context_keywords?: string[];
}

// Command model for updating an existing optimization job.
// All fields are optional to allow partial updates.
export interface UpdateOptimizationJobCommandDTO {
  // Optional AI-generated alternative text.
  generated_alt_text?: string | null;
  // Optional AI-generated SEO-friendly filename suggestion.
  generated_filename_suggestion?: string | null;
  // Optional user-provided subject context.
  user_context_subject?: string | null;
  // Optional user-provided keywords array.
  user_context_keywords?: string[] | null;
  // Optional status update. Must be one of "pending", "processing", "completed", or "failed".
  status?: OptimizationJobDTO["status"];
  // Optional error message if an error occurred during processing.
  error_message?: string | null;
}

// Command model for retrying a failed optimization job.
// The request body is empty since no additional data is needed for retry.
export type RetryOptimizationJobCommandDTO = Record<never, never>;

// DTO for the response of listing optimization jobs, including pagination metadata.
export interface ListOptimizationJobsResponseDTO {
  // Array of optimization job DTOs.
  data: OptimizationJobDTO[];
  // Current page number.
  page: number;
  // Limit (number of items per page).
  limit: number;
  // Total number of optimization jobs.
  total: number;
}

// Optional: DTO for query parameters when listing optimization jobs.
export interface ListOptimizationJobsQueryDTO {
  page?: number;
  limit?: number;
  // e.g., "created_at_desc" to denote sorting order.
  sort?: string;
}
