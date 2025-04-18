import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createOptimizationJob } from "../lib/services/api.service";
import type { CreateOptimizationJobCommandDTO } from "../types";
import { ContextForm } from "./ContextForm";
import { FileInput } from "./FileInput";
import { ImagePreview } from "./ImagePreview";
import { LoadingIndicator } from "./LoadingIndicator";
import { useFileUpload } from "./hooks/useFileUpload";

interface ContextState {
  subject: string;
  keywords: string[];
}

export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [context, setContext] = useState<ContextState>({
    subject: "",
    keywords: [],
  });

  const { file, previewUrl, isValid, handleFileChange, resetFile } = useFileUpload({
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  const handleContextChange = useCallback((subject?: string, keywords?: string[]) => {
    setContext((prev) => ({
      subject: subject ?? prev.subject,
      keywords: keywords ?? prev.keywords,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Validate form data
      if (!file || !isValid) {
        toast.error("Proszę wybrać prawidłowy plik obrazu");
        return;
      }

      try {
        setIsSubmitting(true);
        setShowProgress(true);
        setUploadProgress(0);

        // Prepare data for API
        const jobData: CreateOptimizationJobCommandDTO = {
          image: file,
          original_filename: file.name,
          user_context_subject: context.subject || undefined,
          user_context_keywords: context.keywords.length > 0 ? context.keywords : undefined,
        };

        // Track upload progress
        const handleProgress = (progress: number) => {
          setUploadProgress(progress);
        };

        // Send to API using the service
        const result = await createOptimizationJob(jobData, handleProgress);

        // On success, show success message and redirect
        toast.success("Obraz został przesłany pomyślnie!");

        // Redirect to the preview page
        window.location.href = `/preview/${result.id}`;
      } catch (error) {
        // Handle errors
        const errorMessage =
          error instanceof Error ? error.message : "Wystąpił nieznany błąd podczas przesyłania pliku";

        console.error("Error submitting form:", error);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
        setShowProgress(false);
      }
    },
    [file, isValid, context]
  );

  // Obsługa klawiszy skrótów
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter do wysłania formularza
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (file && isValid && !isSubmitting) {
          handleSubmit();
        }
      }

      // Escape do resetowania formularza
      if (e.key === "Escape") {
        if (file) {
          resetFile();
          setContext({
            subject: "",
            keywords: [],
          });
          toast.info("Formularz został zresetowany");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [file, isValid, isSubmitting, handleSubmit, resetFile]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="upload-form-title">
      <h2 id="upload-form-title" className="sr-only">
        Formularz przesyłania obrazu
      </h2>

      <div className="space-y-2">
        <FileInput onFileChange={handleFileChange} />

        <div className="text-xs text-muted-foreground">
          <p>Obsługiwane formaty: JPG, PNG, WEBP. Maksymalny rozmiar: 10MB.</p>
          <p>Skróty klawiszowe: Ctrl+Enter (wyślij), Esc (wyczyść)</p>
        </div>
      </div>

      {previewUrl && file && <ImagePreview previewUrl={previewUrl} fileName={file.name} />}

      <ContextForm subject={context.subject} keywords={context.keywords} onChange={handleContextChange} />

      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Przesyłanie pliku</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} max={100} />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!file || !isValid || isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingIndicator size="sm" />
            <span>Przetwarzanie...</span>
          </div>
        ) : (
          "Prześlij obraz"
        )}
      </Button>
    </form>
  );
}
