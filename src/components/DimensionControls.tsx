import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  calculateMaintainedAspectRatio,
  dimensionConstraints,
  validateDimensions,
} from "@/lib/validation/imageValidation";
import type { DimensionsType } from "@/types";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

interface DimensionControlsProps {
  dimensions: DimensionsType;
  originalDimensions: { width: number; height: number };
  onChange: (dimensions: DimensionsType) => void;
  isDisabled?: boolean;
}

export default function DimensionControls({
  dimensions,
  originalDimensions,
  onChange,
  isDisabled = false,
}: DimensionControlsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingAspectRatio, setIsUpdatingAspectRatio] = useState(false);

  // Handle width change
  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = event.target.value === "" ? null : parseInt(event.target.value, 10);

    if (dimensions.maintainAspectRatio && newWidth !== null && !isUpdatingAspectRatio) {
      setIsUpdatingAspectRatio(true);
      const { height } = calculateMaintainedAspectRatio(
        originalDimensions.width,
        originalDimensions.height,
        newWidth,
        null
      );
      onChange({ ...dimensions, width: newWidth, height });
      setIsUpdatingAspectRatio(false);
    } else {
      onChange({ ...dimensions, width: newWidth });
    }
  };

  // Handle height change
  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = event.target.value === "" ? null : parseInt(event.target.value, 10);

    if (dimensions.maintainAspectRatio && newHeight !== null && !isUpdatingAspectRatio) {
      setIsUpdatingAspectRatio(true);
      const { width } = calculateMaintainedAspectRatio(
        originalDimensions.width,
        originalDimensions.height,
        null,
        newHeight
      );
      onChange({ ...dimensions, width, height: newHeight });
      setIsUpdatingAspectRatio(false);
    } else {
      onChange({ ...dimensions, height: newHeight });
    }
  };

  // Handle aspect ratio toggle
  const handleAspectRatioToggle = (checked: boolean) => {
    if (checked && dimensions.width !== null) {
      const { height } = calculateMaintainedAspectRatio(
        originalDimensions.width,
        originalDimensions.height,
        dimensions.width,
        null
      );
      onChange({ ...dimensions, maintainAspectRatio: checked, height });
    } else {
      onChange({ ...dimensions, maintainAspectRatio: checked });
    }
  };

  // Validate dimensions when they change
  useEffect(() => {
    const validationError = validateDimensions(dimensions, originalDimensions.width, originalDimensions.height);
    setError(validationError);
  }, [dimensions, originalDimensions.width, originalDimensions.height]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="maintainAspectRatio" className="flex items-center gap-2">
          Maintain Aspect Ratio
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  When enabled, changing one dimension will automatically adjust the other to maintain the original
                  aspect ratio
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Switch
          id="maintainAspectRatio"
          checked={dimensions.maintainAspectRatio}
          onCheckedChange={handleAspectRatioToggle}
          disabled={isDisabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            min={dimensionConstraints.min}
            max={dimensionConstraints.max}
            value={dimensions.width ?? ""}
            onChange={handleWidthChange}
            disabled={isDisabled}
            placeholder={originalDimensions.width.toString()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            min={dimensionConstraints.min}
            max={dimensionConstraints.max}
            value={dimensions.height ?? ""}
            onChange={handleHeightChange}
            disabled={isDisabled}
            placeholder={originalDimensions.height.toString()}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
