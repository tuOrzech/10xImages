import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface ImagePreviewProps {
  previewUrl: string;
}

function ImagePreviewComponent({ previewUrl }: ImagePreviewProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Podgląd obrazu</h3>
          <div className="w-full max-h-80 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
            <img src={previewUrl} alt="Podgląd przesłanego obrazu" className="w-full h-auto object-contain" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Eksportujemy komponent z użyciem React.memo dla optymalizacji
export const ImagePreview = React.memo(ImagePreviewComponent);
