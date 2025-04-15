import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useCallback, useRef, useState } from "react";

interface FileInputProps {
  onFileChange: (file: File | null) => void;
}

export function FileInput({ onFileChange }: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileChange(files[0]);
      }
    },
    [onFileChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileChange(files[0]);
      }
    },
    [onFileChange]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Wybierz plik obrazu"
      />
      <div className="text-center">
        <div className="mb-2">
          <Button type="button" variant="secondary" onClick={handleButtonClick} className="font-medium">
            Wybierz plik
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">lub przeciągnij i upuść plik tutaj</p>
      </div>
    </div>
  );
}
