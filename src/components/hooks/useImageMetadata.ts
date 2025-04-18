import type { ImageMetadataType } from "@/types";
import { useEffect, useState } from "react";

export function useImageMetadata(imageUrl: string | null) {
  const [metadata, setMetadata] = useState<ImageMetadataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
      if (!imageUrl) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/images/metadata?url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch image metadata");
        setMetadata(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetadata();
  }, [imageUrl]);

  return { metadata, isLoading, error };
}
