import * as crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";

export interface ImageMetadata {
  hash: string;
  extension: string;
  mimeType: string;
  size: number;
}

export class ImageService {
  constructor(private readonly storage: SupabaseClient["storage"]) {}

  async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    return crypto.createHash("md5").update(Buffer.from(buffer)).digest("hex");
  }

  async getImageMetadata(file: File): Promise<ImageMetadata> {
    const hash = await this.generateFileHash(file);
    const extension = file.type.split("/")[1];

    return {
      hash,
      extension,
      mimeType: file.type,
      size: file.size,
    };
  }

  async uploadImage(file: File, storagePath: string): Promise<{ error?: Error }> {
    try {
      const { error } = await this.storage.from("optimization-images").upload(storagePath, file);

      if (error) {
        throw error;
      }

      return {};
    } catch (error) {
      console.error("Error uploading image:", error);
      return { error: error instanceof Error ? error : new Error("Unknown error during upload") };
    }
  }

  async deleteImage(storagePath: string): Promise<{ error?: Error }> {
    try {
      const { error } = await this.storage.from("optimization-images").remove([storagePath]);

      if (error) {
        throw error;
      }

      return {};
    } catch (error) {
      console.error("Error deleting image:", error);
      return { error: error instanceof Error ? error : new Error("Unknown error during deletion") };
    }
  }
}
