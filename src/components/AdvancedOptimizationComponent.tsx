import { useCallback, useMemo, useState } from "react";
import type { ImageMetadataType, OptimizationSettingsType } from "../types";
import ActionButtons from "./ActionButtons";
import { ImagePreviewPanel } from "./advanced/ImagePreviewPanel";
import { OptimizationControlsPanel } from "./advanced/OptimizationControlsPanel";
import ErrorDisplay from "./ErrorDisplay";

const DEFAULT_SETTINGS: OptimizationSettingsType = {
  format: "webp",
  quality: 80,
  dimensions: {
    width: null,
    height: null,
    maintainAspectRatio: true,
  },
  compressionOptions: {
    method: "auto",
    level: 6,
    formatSpecificOptions: {},
  },
  metadataOptions: {
    keepExif: false,
    keepIptc: false,
    keepXmp: false,
    keepColorProfile: true,
    addCopyright: false,
    copyrightText: "",
  },
};

export function AdvancedOptimizationComponent() {
  const [settings, setSettings] = useState<OptimizationSettingsType>(DEFAULT_SETTINGS);
  const [isProcessing] = useState(false);
  const [error] = useState<string | null>(null);
  const [originalImageUrl] = useState<string>("");
  const [optimizedImageUrl] = useState<string>("");
  const [originalMetadata] = useState<ImageMetadataType | null>(null);
  const [isBeforeAfterActive, setIsBeforeAfterActive] = useState(false);

  // Memoize settings handlers
  const handleSettingsChange = useCallback((newSettings: OptimizationSettingsType) => {
    setSettings(newSettings);
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const handleSave = useCallback(async () => {
    // TODO: Implement save logic
  }, []);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleToggleBeforeAfter = useCallback(() => {
    setIsBeforeAfterActive((prev) => !prev);
  }, []);

  // Memoize metadata for OptimizationControlsPanel
  const originalMetadataForControls = useMemo(
    () => ({
      width: originalMetadata?.width ?? 0,
      height: originalMetadata?.height ?? 0,
      format: originalMetadata?.format ?? "webp",
    }),
    [originalMetadata]
  );

  // Memoize action button states
  const actionButtonStates = useMemo(
    () => ({
      canSave: true, // TODO: Add proper validation
      canRetry: true,
      isSaving: false,
      isRetrying: isProcessing,
    }),
    [isProcessing]
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {error && <ErrorDisplay message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImagePreviewPanel
          originalImageUrl={originalImageUrl}
          optimizedImageUrl={optimizedImageUrl}
          metadata={originalMetadata}
          isBeforeAfterActive={isBeforeAfterActive}
          onToggleBeforeAfter={handleToggleBeforeAfter}
          isProcessing={isProcessing}
        />

        <OptimizationControlsPanel
          settings={settings}
          onChange={handleSettingsChange}
          isProcessing={isProcessing}
          originalMetadata={originalMetadataForControls}
        />
      </div>

      <ActionButtons onSave={handleSave} onRetry={handleReset} onBack={handleBack} {...actionButtonStates} />
    </div>
  );
}
