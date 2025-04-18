import type { ImageMetadataType, OptimizationSettingsType } from "@/types";
import { useState } from "react";

interface OptimizationResult {
  optimizedImageUrl: string;
  metadata: ImageMetadataType;
}

export function useOptimizationProcess(jobId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  async function optimizeImage(settings: OptimizationSettingsType): Promise<void> {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch("/api/images/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: jobId,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image optimization failed");
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }

  async function saveOptimizedImage(settings: OptimizationSettingsType): Promise<void> {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/optimization-jobs/${jobId}/save-optimized`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save optimized image: ${response.statusText}`);
      }

      // Optionally handle the response if needed
      await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save optimized image");
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    optimizeImage,
    saveOptimizedImage,
    isProcessing,
    error,
    result,
  };
}
