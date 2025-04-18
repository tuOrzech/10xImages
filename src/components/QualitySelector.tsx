import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  FORMAT_QUALITY_RANGES,
  getFormatWarnings,
  isQualitySettingAvailable,
  type SupportedFormat,
} from "@/lib/validation/formatValidation";
import type { OptimizationSettingsType } from "@/types";
import { AlertTriangle, Info } from "lucide-react";

interface QualitySelectorProps {
  format: string;
  quality: number;
  settings: OptimizationSettingsType;
  onChange: (value: number) => void;
  isDisabled?: boolean;
}

export default function QualitySelector({
  format,
  quality,
  settings,
  onChange,
  isDisabled = false,
}: QualitySelectorProps) {
  if (!isQualitySettingAvailable(format)) {
    return null;
  }

  const range = FORMAT_QUALITY_RANGES[format as SupportedFormat];
  const warnings = getFormatWarnings(format as SupportedFormat, settings);
  const hasWarnings = warnings.length > 0;

  const handleChange = (values: number[]) => {
    onChange(values[0]);
  };

  const getQualityDescription = (quality: number) => {
    if (quality >= 90) return "Very high quality, minimal compression artifacts, large file size";
    if (quality >= 75) return "High quality, good balance between quality and file size";
    if (quality >= 50) return "Medium quality, noticeable compression, smaller file size";
    return "Low quality, significant compression artifacts, smallest file size";
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="quality">Quality</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-2 max-w-xs">
                    <p>Adjust the quality level to balance between image quality and file size.</p>
                    <p className="text-sm text-muted-foreground">{getQualityDescription(quality)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-muted-foreground cursor-help">{quality}%</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current quality level: {getQualityDescription(quality)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Slider
          id="quality"
          min={range.min}
          max={range.max}
          step={1}
          value={[quality]}
          onValueChange={handleChange}
          disabled={isDisabled}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>Lower quality, smaller file</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Lower quality settings result in more aggressive compression and smaller file sizes, but may introduce
                  visible artifacts.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>Higher quality, larger file</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Higher quality settings preserve more image detail but result in larger file sizes. Values above 90%
                  often provide diminishing returns.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {hasWarnings && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside text-sm space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
