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
}
