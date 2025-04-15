import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { OptimizationJobDTO } from "../../types";
import { ImageService } from "./image.service";

interface CreateOptimizationJobParams {
  userId: string;
  image: File;
  originalFilename: string;
  userContextSubject?: string;
  userContextKeywords?: string[];
}

// Mock AI responses for development
const mockAiResponses = [
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

export class OptimizationService {
  private imageService: ImageService;

  constructor(
    private readonly supabase: SupabaseClient,
    storage: SupabaseClient["storage"]
  ) {
    this.imageService = new ImageService(storage);
  }

  private getMockAiResponse() {
    const randomIndex = Math.floor(Math.random() * mockAiResponses.length);
    return mockAiResponses[randomIndex];
  }

  async createOptimizationJob({
    userId,
    image,
    originalFilename,
    userContextSubject,
    userContextKeywords,
  }: CreateOptimizationJobParams): Promise<{
    data?: OptimizationJobDTO;
    error?: Error;
  }> {
    try {
      // Get image metadata
      const metadata = await this.imageService.getImageMetadata(image);
      const storagePath = `${userId}/${metadata.hash}.${metadata.extension}`;

      // Check if file already exists
      const { data: existingJob } = await this.supabase
        .from("optimization_jobs")
        .select()
        .match({ user_id: userId, file_hash: metadata.hash })
        .single();

      if (existingJob) {
        return {
          data: existingJob,
          error: new Error("File has already been optimized"),
        };
      }

      // Upload image
      const { error: uploadError } = await this.imageService.uploadImage(image, storagePath);

      if (uploadError) {
        return { error: uploadError };
      }

      // Get mock AI response
      const mockAi = this.getMockAiResponse();

      // Create database record
      const { data: job, error: dbError } = await this.supabase
        .from("optimization_jobs")
        .insert({
          user_id: userId,
          original_filename: originalFilename,
          storage_path: storagePath,
          file_hash: metadata.hash,
          user_context_subject: userContextSubject,
          user_context_keywords: userContextKeywords,
          status: "completed",
          generated_alt_text: mockAi.alt,
          generated_filename_suggestion: mockAi.filename,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Error creating optimization job:", dbError);
        return { error: new Error("Failed to create optimization job") };
      }

      return { data: job };
    } catch (error) {
      console.error("Error in createOptimizationJob:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  async listOptimizationJobs(userId: string, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { count } = await this.supabase
        .from("optimization_jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get paginated data
      const { data, error } = await this.supabase
        .from("optimization_jobs")
        .select()
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error listing optimization jobs:", error);
        return { error: new Error("Failed to list optimization jobs") };
      }

      return {
        data: {
          jobs: data,
          pagination: {
            total: count || 0,
            page,
            limit,
          },
        },
      };
    } catch (error) {
      console.error("Error in listOptimizationJobs:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  async getOptimizationJob(userId: string, jobId: string) {
    try {
      const { data, error } = await this.supabase
        .from("optimization_jobs")
        .select()
        .match({ user_id: userId, id: jobId })
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { error: new Error("Optimization job not found") };
        }
        console.error("Error getting optimization job:", error);
        return { error: new Error("Failed to get optimization job") };
      }

      return { data };
    } catch (error) {
      console.error("Error in getOptimizationJob:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  async updateOptimizationJob(
    userId: string,
    jobId: string,
    updates: {
      generated_alt_text?: string | null;
      generated_filename_suggestion?: string | null;
      user_context_subject?: string | null;
      user_context_keywords?: string[] | null;
      status?: Database["public"]["Enums"]["optimization_job_status"];
      error_message?: string | null;
    }
  ) {
    try {
      // First check if job exists and belongs to user
      const { error: checkError } = await this.getOptimizationJob(userId, jobId);
      if (checkError) {
        return { error: checkError };
      }

      const { data, error } = await this.supabase
        .from("optimization_jobs")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .match({ user_id: userId, id: jobId })
        .select()
        .single();

      if (error) {
        console.error("Error updating optimization job:", error);
        return { error: new Error("Failed to update optimization job") };
      }

      return { data };
    } catch (error) {
      console.error("Error in updateOptimizationJob:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  async deleteOptimizationJob(userId: string, jobId: string) {
    try {
      // First get the job to check if it exists and get the storage path
      const { data: job, error: getError } = await this.getOptimizationJob(userId, jobId);
      if (getError) {
        return { error: getError };
      }

      // Delete the file from storage if we have a storage path
      if (job && job.storage_path) {
        const { error: storageError } = await this.imageService.deleteImage(job.storage_path);
        if (storageError) {
          console.error("Error deleting image from storage:", storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete the database record
      const { error } = await this.supabase.from("optimization_jobs").delete().match({ user_id: userId, id: jobId });

      if (error) {
        console.error("Error deleting optimization job:", error);
        return { error: new Error("Failed to delete optimization job") };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteOptimizationJob:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  async retryOptimizationJob(userId: string, jobId: string) {
    try {
      // First check if job exists and belongs to user
      const { data: job, error: checkError } = await this.getOptimizationJob(userId, jobId);
      if (checkError) {
        return { error: checkError };
      }

      // Only allow retry if job is in failed state
      if (job.status !== "failed") {
        return { error: new Error("Only failed jobs can be retried") };
      }

      // Get new mock AI response
      const mockAi = this.getMockAiResponse();

      // Update the job
      return await this.updateOptimizationJob(userId, jobId, {
        status: "completed",
        error_message: null,
        generated_alt_text: mockAi.alt,
        generated_filename_suggestion: mockAi.filename,
      });
    } catch (error) {
      console.error("Error in retryOptimizationJob:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }
}
