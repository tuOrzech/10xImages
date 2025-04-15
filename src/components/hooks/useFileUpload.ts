import { useCallback, useState } from "react";
import { toast } from "sonner";

interface FileValidationConfig {
  allowedTypes: string[];
  maxFileSize: number;
}

interface UseFileUploadResult {
  file: File | null;
  previewUrl: string | null;
  fileError: string | null;
  isValid: boolean;
  handleFileChange: (file: File | null) => void;
  validateFile: (file: File) => boolean;
  resetFile: () => void;
}

export function useFileUpload(config: FileValidationConfig): UseFileUploadResult {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Validate file type
      if (!config.allowedTypes.includes(file.type)) {
        const errorMsg = "Nieprawidłowy format pliku. Akceptowane formaty: JPG, PNG, WEBP";
        setFileError(errorMsg);
        toast.error(errorMsg);
        setIsValid(false);
        return false;
      }

      // Validate file size
      if (file.size > config.maxFileSize) {
        const maxSizeMB = config.maxFileSize / (1024 * 1024);
        const errorMsg = `Plik jest za duży. Maksymalny rozmiar to ${maxSizeMB}MB`;
        setFileError(errorMsg);
        toast.error(errorMsg);
        setIsValid(false);
        return false;
      }

      // File passed validation
      setFileError(null);
      setIsValid(true);
      return true;
    },
    [config.allowedTypes, config.maxFileSize]
  );

  const handleFileChange = useCallback(
    (newFile: File | null) => {
      // Clear previous preview URL to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (!newFile) {
        setFile(null);
        setPreviewUrl(null);
        setIsValid(false);
        setFileError(null);
        return;
      }

      if (validateFile(newFile)) {
        // Create preview URL
        const newPreviewUrl = URL.createObjectURL(newFile);
        setFile(newFile);
        setPreviewUrl(newPreviewUrl);
      } else {
        setFile(null);
        setPreviewUrl(null);
      }
    },
    [previewUrl, validateFile]
  );

  const resetFile = useCallback(() => {
    // Clear preview URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setIsValid(false);
  }, [previewUrl]);

  return {
    file,
    previewUrl,
    fileError,
    isValid,
    handleFileChange,
    validateFile,
    resetFile,
  };
}
