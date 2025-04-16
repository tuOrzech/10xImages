import { Card } from "@/components/ui/card";
import { ImageOff } from "lucide-react";
import { useState } from "react";

interface ImageDisplayProps {
  imageUrl: string | null;
}

export default function ImageDisplay({ imageUrl }: ImageDisplayProps) {
  const [isError, setIsError] = useState(false);

  if (!imageUrl) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[250px] bg-muted">
        <div className="text-center text-muted-foreground">
          <ImageOff className="mx-auto h-12 w-12 mb-2" />
          <p>No image available</p>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[250px] bg-muted">
        <div className="text-center text-muted-foreground">
          <ImageOff className="mx-auto h-12 w-12 mb-2" />
          <p>Failed to load image</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex items-center justify-center">
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-auto object-contain max-h-[400px]"
        onError={() => setIsError(true)}
      />
    </Card>
  );
}
