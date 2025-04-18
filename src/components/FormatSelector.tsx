import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FORMAT_FEATURES, SUPPORTED_FORMATS, type SupportedFormat } from "@/lib/validation/formatValidation";
import { AlertCircle, Info } from "lucide-react";

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
  originalFormat: string;
  isDisabled?: boolean;
}

export default function FormatSelector({ value, onChange, originalFormat, isDisabled = false }: FormatSelectorProps) {
  const currentFormat = value as SupportedFormat;
  const features = FORMAT_FEATURES[currentFormat];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="format">Output Format</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Choose the output format for your image. Each format has different characteristics and use cases.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={value} onValueChange={onChange} disabled={isDisabled}>
          <SelectTrigger id="format">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_FORMATS.map((format) => (
              <SelectItem key={format} value={format}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-2">
                        {format.toUpperCase()}
                        {format === originalFormat && " (original)"}
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <p>
                          <strong>{format.toUpperCase()}</strong>
                        </p>
                        <ul className="list-disc list-inside text-sm">
                          {FORMAT_FEATURES[format].supportsTransparency && <li>Supports transparency</li>}
                          {FORMAT_FEATURES[format].supportsAnimation && <li>Supports animation</li>}
                          {FORMAT_FEATURES[format].supportsLossless && <li>Supports lossless compression</li>}
                        </ul>
                        <p className="text-sm">
                          <strong>Best for: </strong>
                          {FORMAT_FEATURES[format].recommendedFor.join(", ")}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {features && (
        <div className="space-y-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>
                  <strong>Format features:</strong>
                </p>
                <ul className="list-disc list-inside text-sm">
                  {features.supportsTransparency && <li>Supports transparency</li>}
                  {features.supportsAnimation && <li>Supports animation</li>}
                  {features.supportsLossless && <li>Supports lossless compression</li>}
                </ul>
                <p className="text-sm">
                  <strong>Recommended for: </strong>
                  {features.recommendedFor.join(", ")}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
