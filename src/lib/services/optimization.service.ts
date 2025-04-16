import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { OptimizationJobDTO } from "../../types";
import { ImageService } from "./image.service";
import { OpenRouterRateLimitError, OpenRouterService } from "./openrouter.service";

interface CreateOptimizationJobParams {
  userId: string;
  image: File;
  originalFilename: string;
  userContextSubject?: string;
  userContextKeywords?: string[];
}

// Extended DTO that includes storage path
interface OptimizationJobWithStorage extends OptimizationJobDTO {
  storage_path: string;
}

// Helper type for database operations
interface DatabaseOptimizationJob extends OptimizationJobDTO {
  storage_path: string;
}

export class OptimizationService {
  private imageService: ImageService;
  private openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient,
    storage: SupabaseClient["storage"]
  ) {
    this.imageService = new ImageService(storage);
    this.openRouter = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: "qwen/qwen2.5-vl-72b-instruct:free",
      modelParams: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      },
    });
  }

  private async generateImageDescription(params: {
    userContextSubject?: string;
    userContextKeywords?: string[];
    imageUrl: string;
  }): Promise<{ alt: string | null; filename: string | null; error?: Error }> {
    try {
      // Format the message to match our system prompt expectations
      const imageContext = [
        "Kontekst obrazu:",
        params.userContextSubject ? `Temat: ${params.userContextSubject}` : null,
        params.userContextKeywords?.length ? `Słowa kluczowe: ${params.userContextKeywords.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      // Ensure we have a full URL
      const imageUrl = params.imageUrl.startsWith("http")
        ? params.imageUrl
        : this.supabase.storage.from("optimization-images").getPublicUrl(params.imageUrl).data?.publicUrl;

      if (!imageUrl) {
        throw new Error("Failed to get public URL for image");
      }

      // Send request to OpenRouter with image URL
      const response = await this.openRouter.sendRequest(imageContext, imageUrl);

      if (!response.success) {
        throw new Error(response.message || "Failed to generate image description");
      }

      const content = response.data.content || "";
      const [altMatch, filenameMatch] = content
        .split("\n")
        .filter((line) => line.startsWith("Alt:") || line.startsWith("Nazwa:"));

      return {
        alt: altMatch ? altMatch.replace("Alt:", "").trim() : null,
        filename: filenameMatch ? filenameMatch.replace("Nazwa:", "").trim().replace(".webp", "") : null,
      };
    } catch (error) {
      console.error("Error generating image description:", error);
      return {
        alt: null,
        filename: null,
        error: error instanceof Error ? error : new Error("Failed to generate description"),
      };
    }
  }

  async createOptimizationJob({
    userId,
    image,
    originalFilename,
    userContextSubject,
    userContextKeywords,
  }: CreateOptimizationJobParams): Promise<{
    data?: OptimizationJobWithStorage;
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
          data: { ...existingJob, storage_path: storagePath },
          error: new Error("File has already been optimized"),
        };
      }

      // Upload image
      const { error: uploadError } = await this.imageService.uploadImage(image, storagePath);

      if (uploadError) {
        return { error: uploadError };
      }

      // Generate description using OpenRouter
      const {
        alt,
        filename,
        error: aiError,
      } = await this.generateImageDescription({
        userContextSubject,
        userContextKeywords,
        imageUrl: storagePath,
      });

      if (aiError) {
        console.error("[OptimizationService] AI Error:", {
          name: aiError.name,
          message: aiError.message,
          isRateLimit: aiError instanceof OpenRouterRateLimitError,
        });

        // Jeśli to błąd rate limit, nie tworzymy rekordu w bazie
        if (aiError instanceof OpenRouterRateLimitError) {
          console.warn("[OptimizationService] Rate limit exceeded, cleaning up...");
          // Usuń plik z storage, ponieważ nie będziemy tworzyć rekordu
          await this.imageService.deleteImage(storagePath);
          console.warn("[OptimizationService] File deleted from storage");
          return { error: aiError };
        }

        // Dla innych błędów tworzymy rekord failed
        console.warn("[OptimizationService] Creating failed job record for non-rate-limit error");
        const { data: job, error: dbError } = await this.supabase
          .from("optimization_jobs")
          .insert({
            user_id: userId,
            original_filename: originalFilename,
            file_hash: metadata.hash,
            storage_path: storagePath,
            user_context_subject: userContextSubject,
            user_context_keywords: userContextKeywords,
            status: "failed",
            error_message: aiError.message,
          })
          .select()
          .single();

        if (dbError) {
          console.error("[OptimizationService] Error creating failed job record:", dbError);
          return { error: new Error("Failed to create optimization job") };
        }

        console.warn("[OptimizationService] Failed job record created successfully");
        // Propagate the error to the frontend, but also return the job data
        return {
          error: aiError,
        };
      }

      // Create successful database record
      const { data: job, error: dbError } = await this.supabase
        .from("optimization_jobs")
        .insert({
          user_id: userId,
          original_filename: originalFilename,
          file_hash: metadata.hash,
          storage_path: storagePath,
          user_context_subject: userContextSubject,
          user_context_keywords: userContextKeywords,
          status: "completed",
          generated_alt_text: alt,
          generated_filename_suggestion: filename,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Error creating optimization job:", dbError);
        return { error: new Error("Failed to create optimization job") };
      }

      return { data: { ...job, storage_path: storagePath } };
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

      return { data: data as DatabaseOptimizationJob };
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

      // Generate new description using OpenRouter
      const {
        alt,
        filename,
        error: aiError,
      } = await this.generateImageDescription({
        userContextSubject: job.user_context_subject || undefined,
        userContextKeywords: job.user_context_keywords || undefined,
        imageUrl: job.storage_path,
      });

      if (aiError) {
        return await this.updateOptimizationJob(userId, jobId, {
          status: "failed",
          error_message: aiError.message,
        });
      }

      // Update the job with new AI response
      return await this.updateOptimizationJob(userId, jobId, {
        status: "completed",
        error_message: null,
        generated_alt_text: alt,
        generated_filename_suggestion: filename,
      });
    } catch (error) {
      console.error("Error in retryOptimizationJob:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }
}
