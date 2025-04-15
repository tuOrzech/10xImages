import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface FileInputProps {
  onFileChange: (file: File | null) => void;
}

function FileInputComponent({ onFileChange }: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // List of allowed file types
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  // Maximum file size in bytes (10MB)
  const maxFileSize = 10 * 1024 * 1024;

  const validateFile = useCallback((file: File): boolean => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setFileError("Nieprawidłowy format pliku. Akceptowane formaty: JPG, PNG, WEBP");
      toast.error("Nieprawidłowy format pliku. Akceptowane formaty: JPG, PNG, WEBP");
      return false;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setFileError("Plik jest za duży. Maksymalny rozmiar to 10MB");
      toast.error("Plik jest za duży. Maksymalny rozmiar to 10MB");
      return false;
    }

    // File passed validation
    setFileError(null);
    return true;
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError(null);
      const files = e.target.files;

      if (!files || files.length === 0) {
        setFileName(null);
        onFileChange(null);
        return;
      }

      const file = files[0];
      setFileName(file.name);

      if (validateFile(file)) {
        onFileChange(file);
      } else {
        // Reset file input if validation fails
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onFileChange(null);
      }
    },
    [onFileChange, validateFile]
  );

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;

      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      setFileName(file.name);

      if (validateFile(file)) {
        onFileChange(file);
      } else {
        onFileChange(null);
      }
    },
    [onFileChange, validateFile]
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          className={`flex flex-col items-center p-6 border-2 border-dashed rounded-lg
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4 text-center">
            <h3 className="text-lg font-medium">Wybierz obraz do optymalizacji</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Przeciągnij i upuść plik JPG, PNG lub WEBP lub kliknij przycisk poniżej
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex flex-col items-center">
            <Button type="button" variant="outline" onClick={handleBrowseClick} className="mb-2">
              Przeglądaj pliki
            </Button>

            {fileName && (
              <div className="text-sm text-center mt-2">
                <span className="font-medium">Wybrany plik:</span> {fileName}
              </div>
            )}

            {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Eksportujemy komponent z użyciem React.memo dla optymalizacji
export const FileInput = React.memo(FileInputComponent);
