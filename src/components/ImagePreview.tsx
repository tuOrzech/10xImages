import { cn } from "@/lib/utils";
import { useState } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

interface ImagePreviewProps {
  previewUrl: string;
  fileName: string;
}

export function ImagePreview({ previewUrl, fileName }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative h-40 w-40 overflow-hidden rounded-lg border bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <LoadingIndicator />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">Nie udało się załadować podglądu</p>
          </div>
        )}
        <img
          src={previewUrl}
          alt="Podgląd wybranego obrazu"
          className={cn("h-full w-full object-cover", isLoading && "opacity-0", error && "hidden")}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground truncate max-w-[160px]" title={fileName}>
        {fileName}
      </p>
    </div>
  );
}
