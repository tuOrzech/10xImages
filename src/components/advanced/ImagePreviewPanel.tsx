import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ImageMetadataType } from "@/types";
import { Info } from "lucide-react";
import { LoadingIndicator } from "../LoadingIndicator";

interface ImagePreviewPanelProps {
  originalImageUrl: string | null;
  optimizedImageUrl: string | null;
  metadata: ImageMetadataType | null;
  isBeforeAfterActive: boolean;
  onToggleBeforeAfter: () => void;
  isProcessing: boolean;
}

export function ImagePreviewPanel({
  originalImageUrl,
  optimizedImageUrl,
  metadata,
  isBeforeAfterActive,
  onToggleBeforeAfter,
  isProcessing,
}: ImagePreviewPanelProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingIndicator />
            </div>
          ) : (
            <div className={`flex ${isBeforeAfterActive ? "flex-row" : "flex-col"} gap-2`}>
              {/* Original Image */}
              <div className={`relative ${isBeforeAfterActive ? "w-1/2" : "w-full"}`}>
                {originalImageUrl ? (
                  <>
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      Original
                    </div>
                    <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain aspect-video" />
                  </>
                ) : (
                  <div className="aspect-video flex items-center justify-center text-gray-400">No image available</div>
                )}
              </div>

              {/* Optimized Image (shown only in side-by-side mode or when not in side-by-side but isBeforeAfterActive is true) */}
              {(isBeforeAfterActive || optimizedImageUrl) && (
                <div className={`relative ${isBeforeAfterActive ? "w-1/2" : "w-full"}`}>
                  {optimizedImageUrl ? (
                    <>
                      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        Optimized
                      </div>
                      <img
                        src={optimizedImageUrl}
                        alt="Optimized"
                        className="w-full h-full object-contain aspect-video"
                      />
                    </>
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-gray-400">Processing...</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {optimizedImageUrl && (
          <div className="flex items-center space-x-2">
            <Switch
              id="before-after-toggle"
              checked={isBeforeAfterActive}
              onCheckedChange={onToggleBeforeAfter}
              disabled={isProcessing}
            />
            <Label htmlFor="before-after-toggle">Side-by-side comparison</Label>
          </div>
        )}

        {metadata && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Dimensions:</span>
                <span>
                  {metadata.width} × {metadata.height}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Format:</span>
                <span>{metadata.format.toUpperCase()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Size:</span>
                <span>{(metadata.size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Metadata:</span>
                <div className="flex gap-1 flex-wrap">
                  {metadata.hasExif && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                            EXIF
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contains camera settings, date, location, and other technical information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {metadata.hasIptc && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                            IPTC
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contains professional metadata like copyright, credits, and keywords</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {metadata.hasXmp && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                            XMP
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contains Adobe's extensible metadata for professional editing</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {metadata.hasColorProfile && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                            ICC
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contains color profile information for accurate color reproduction</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
