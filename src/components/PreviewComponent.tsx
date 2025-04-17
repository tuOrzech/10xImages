import type { OptimizationJobDTO, UpdateOptimizationJobCommandDTO } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ActionButtons from "./ActionButtons";
import ImageDisplay from "./ImageDisplay";
import { LoadingIndicator } from "./LoadingIndicator";
import SuggestionPanel from "./SuggestionPanel";

interface PreviewComponentProps {
  jobId: string;
}

interface PreviewViewModel {
  job: OptimizationJobDTO | null;
  isLoading: boolean;
  isSaving: boolean;
  isRetrying: boolean;
  error: string | null;
  editedAltText: string | null;
  editedFilename: string | null;
  isEditingAlt: boolean;
  isEditingFilename: boolean;
  imageUrl: string | null;
}

export default function PreviewComponent({ jobId }: PreviewComponentProps) {
  const [viewModel, setViewModel] = useState<PreviewViewModel>({
    job: null,
    isLoading: true,
    isSaving: false,
    isRetrying: false,
    error: null,
    editedAltText: null,
    editedFilename: null,
    isEditingAlt: false,
    isEditingFilename: false,
    imageUrl: null,
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handleAltTextChange = useCallback((value: string) => {
    setViewModel((prev) => ({ ...prev, editedAltText: value }));
  }, []);

  const handleFilenameChange = useCallback((value: string) => {
    setViewModel((prev) => ({ ...prev, editedFilename: value }));
  }, []);

  const handleSetEditingAlt = useCallback((value: boolean) => {
    setViewModel((prev) => ({ ...prev, isEditingAlt: value }));
  }, []);

  const handleSetEditingFilename = useCallback((value: boolean) => {
    setViewModel((prev) => ({ ...prev, isEditingFilename: value }));
  }, []);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  // Memoize save handler
  const handleSave = useCallback(async () => {
    if (!viewModel.job) return;

    setViewModel((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const updateData: UpdateOptimizationJobCommandDTO = {
        generated_alt_text: viewModel.editedAltText,
        generated_filename_suggestion: viewModel.editedFilename,
      };

      const response = await fetch(`/api/optimization-jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || response.status === 404
            ? "Optimization job not found"
            : response.status === 401
              ? "Unauthorized access"
              : response.status === 403
                ? "Access forbidden"
                : "Failed to save changes"
        );
      }

      const updatedJob: OptimizationJobDTO = await response.json();
      setViewModel((prev) => ({
        ...prev,
        job: updatedJob,
        isSaving: false,
        isEditingAlt: false,
        isEditingFilename: false,
      }));

      toast.success("Changes saved successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save changes";
      setViewModel((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [jobId, viewModel.job, viewModel.editedAltText, viewModel.editedFilename]);

  // Memoize retry handler
  const handleRetry = useCallback(async () => {
    if (!viewModel.job) return;

    setViewModel((prev) => ({ ...prev, isRetrying: true, error: null }));

    try {
      const response = await fetch(`/api/optimization-jobs/${jobId}/retry`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || response.status === 404
            ? "Optimization job not found"
            : response.status === 401
              ? "Unauthorized access"
              : response.status === 403
                ? "Access forbidden"
                : "Failed to retry job"
        );
      }

      const updatedJob: OptimizationJobDTO = await response.json();
      setViewModel((prev) => ({
        ...prev,
        job: updatedJob,
        isRetrying: false,
      }));

      toast.success("Job reprocessing started");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retry job";
      setViewModel((prev) => ({
        ...prev,
        isRetrying: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [jobId, viewModel.job]);

  // Memoize canSave calculation
  const canSave = useMemo(() => {
    return Boolean(
      viewModel.job &&
        (viewModel.editedAltText !== viewModel.job.generated_alt_text ||
          viewModel.editedFilename !== viewModel.job.generated_filename_suggestion)
    );
  }, [viewModel.job, viewModel.editedAltText, viewModel.editedFilename]);

  // Fetch job data on component mount
  const fetchJob = useCallback(async () => {
    try {
      setViewModel((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/optimization-jobs/${jobId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Nie znaleziono zadania optymalizacji o podanym ID.");
        }
        throw new Error("Wystąpił błąd podczas pobierania danych zadania.");
      }

      const data = await response.json();
      console.log("[PreviewComponent] Received job data:", data);

      // Check if the job is still processing or failed
      if (data.status === "processing" || data.status === "pending") {
        setViewModel((prev) => ({
          ...prev,
          job: data,
          isLoading: false,
          error: "Zadanie jest w trakcie przetwarzania. Odśwież stronę za chwilę, aby sprawdzić wyniki.",
        }));
        return;
      }

      if (data.status === "failed") {
        setViewModel((prev) => ({
          ...prev,
          job: data,
          isLoading: false,
          error: data.error_message || "Wystąpił błąd podczas generowania sugestii. Spróbuj ponownie później.",
        }));
        return;
      }

      // Check if we have AI-generated content
      if (!data.generated_alt_text && !data.generated_filename_suggestion) {
        console.warn("[PreviewComponent] Job completed but missing AI suggestions");

        // Zainicjuj puste wartości
        setViewModel((prev) => ({
          ...prev,
          job: data,
          isLoading: false,
          editedAltText:
            "Brak sugerowanego tekstu alternatywnego. Użyj przycisk 'Ponów', aby spróbować wygenerować nowe sugestie.",
          editedFilename: "brak-sugerowanej-nazwy",
          error:
            "Nie udało się wygenerować sugestii przez AI. Możesz samodzielnie wprowadzić tekst alternatywny lub ponowić próbę.",
          imageUrl: data.storage_path
            ? `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/optimization-images/${data.storage_path}`
            : null,
        }));
        return;
      }

      setViewModel((prev) => ({
        ...prev,
        job: data,
        isLoading: false,
        editedAltText: data.generated_alt_text,
        editedFilename: data.generated_filename_suggestion,
        imageUrl: data.storage_path
          ? `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/optimization-images/${data.storage_path}`
          : null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast.error(message);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (viewModel.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingIndicator />
      </div>
    );
  }

  if (viewModel.error) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive">
        <p>{viewModel.error}</p>
      </div>
    );
  }

  if (!viewModel.job) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Podgląd i edycja optymalizacji obrazu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ImageDisplay imageUrl={viewModel.imageUrl} />
        </div>

        <div className="space-y-6">
          <SuggestionPanel
            job={viewModel.job}
            editedAltText={viewModel.editedAltText}
            editedFilename={viewModel.editedFilename}
            onAltTextChange={handleAltTextChange}
            onFilenameChange={handleFilenameChange}
            isEditingAlt={viewModel.isEditingAlt}
            setIsEditingAlt={handleSetEditingAlt}
            isEditingFilename={viewModel.isEditingFilename}
            setIsEditingFilename={handleSetEditingFilename}
          />
        </div>
      </div>

      <ActionButtons
        onSave={handleSave}
        onRetry={handleRetry}
        onBack={handleBack}
        canSave={canSave}
        canRetry={viewModel.job?.status === "failed"}
        isSaving={viewModel.isSaving}
        isRetrying={viewModel.isRetrying}
      />
    </div>
  );
}
