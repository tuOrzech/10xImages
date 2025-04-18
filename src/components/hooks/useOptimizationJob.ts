import type { OptimizationJobDTO } from "@/types";
import { useEffect, useState } from "react";

export function useOptimizationJob(jobId: string) {
  const [job, setJob] = useState<OptimizationJobDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/optimization-jobs/${jobId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch job: ${response.statusText}`);
        }

        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch optimization job");
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  return { job, isLoading, error };
}
