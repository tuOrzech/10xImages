import DimensionControls from "@/components/DimensionControls";
import FormatSelector from "@/components/FormatSelector";
import QualitySelector from "@/components/QualitySelector";
import { Skeleton } from "@/components/ui/skeleton";
import type { OptimizationSettingsType } from "@/types";
import { Suspense } from "react";
import { LazyCompressionOptionsPanel, LazyMetadataControlsPanel } from "./LazyLoadedComponents";

interface OptimizationControlsPanelProps {
  settings: OptimizationSettingsType;
  originalMetadata: { width: number; height: number; format: string };
  onChange: (settings: OptimizationSettingsType) => void;
  isProcessing: boolean;
}

const ControlsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[200px] w-full rounded-lg" />
  </div>
);

export function OptimizationControlsPanel({
  settings,
  originalMetadata,
  onChange,
  isProcessing,
}: OptimizationControlsPanelProps) {
  const handleFormatChange = (format: string) => {
    onChange({
      ...settings,
      format,
    });
  };

  const handleQualityChange = (quality: number) => {
    onChange({
      ...settings,
      quality,
    });
  };

  const handleDimensionsChange = (dimensions: typeof settings.dimensions) => {
    onChange({
      ...settings,
      dimensions,
    });
  };

  const handleMetadataOptionsChange = (metadataOptions: typeof settings.metadataOptions) => {
    onChange({
      ...settings,
      metadataOptions,
    });
  };

  const handleCompressionOptionsChange = (compressionOptions: typeof settings.compressionOptions) => {
    onChange({
      ...settings,
      compressionOptions,
    });
  };

  return (
    <div className="space-y-6">
      <FormatSelector
        value={settings.format}
        onChange={handleFormatChange}
        originalFormat={originalMetadata.format}
        isDisabled={isProcessing}
      />

      <QualitySelector
        format={settings.format}
        quality={settings.quality}
        settings={settings}
        onChange={handleQualityChange}
        isDisabled={isProcessing}
      />

      <DimensionControls
        dimensions={settings.dimensions}
        originalDimensions={{
          width: originalMetadata.width,
          height: originalMetadata.height,
        }}
        onChange={handleDimensionsChange}
        isDisabled={isProcessing}
      />

      <Suspense fallback={<ControlsSkeleton />}>
        <LazyCompressionOptionsPanel
          options={settings.compressionOptions}
          format={settings.format}
          onChange={handleCompressionOptionsChange}
          isDisabled={isProcessing}
        />
      </Suspense>

      <Suspense fallback={<ControlsSkeleton />}>
        <LazyMetadataControlsPanel
          options={settings.metadataOptions}
          onChange={handleMetadataOptionsChange}
          isDisabled={isProcessing}
        />
      </Suspense>
    </div>
  );
}
