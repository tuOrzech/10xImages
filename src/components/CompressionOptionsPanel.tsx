import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CompressionOptionsType } from "@/types";
import { AlertTriangle, Info } from "lucide-react";

interface CompressionOptionsPanelProps {
  options: CompressionOptionsType;
  format: string;
  onChange: (options: CompressionOptionsType) => void;
  isDisabled?: boolean;
}

const COMPRESSION_METHODS = {
  webp: ["default", "fast", "slow"],
  jpeg: ["default", "progressive", "baseline"],
  png: ["default", "fast", "best"],
} as const;

const METHOD_DESCRIPTIONS = {
  webp: {
    default: "Balanced compression speed and quality",
    fast: "Faster compression with slightly lower quality",
    slow: "Higher quality compression but slower processing",
  },
  jpeg: {
    default: "Standard JPEG compression",
    progressive: "Load image gradually, better for web",
    baseline: "Load image top to bottom, better for small images",
  },
  png: {
    default: "Standard PNG compression",
    fast: "Faster compression with good quality",
    best: "Best possible compression, slower processing",
  },
} as const;

export default function CompressionOptionsPanel({
  options,
  format,
  onChange,
  isDisabled = false,
}: CompressionOptionsPanelProps) {
  const methods = COMPRESSION_METHODS[format as keyof typeof COMPRESSION_METHODS] || ["default"];

  const handleMethodChange = (value: string) => {
    onChange({
      ...options,
      method: value,
    });
  };

  const handleLevelChange = (values: number[]) => {
    onChange({
      ...options,
      level: values[0],
    });
  };

  const getCompressionLevelRange = () => {
    switch (format) {
      case "png":
        return { min: 0, max: 9, default: 6 };
      case "webp":
        return { min: 0, max: 6, default: 4 };
      default:
        return { min: 0, max: 3, default: 2 };
    }
  };

  const range = getCompressionLevelRange();

  const getCompressionLevelDescription = (level: number) => {
    const maxLevel = range.max;
    const percentage = (level / maxLevel) * 100;

    if (percentage >= 80) return "Maximum compression, slower processing";
    if (percentage >= 60) return "High compression, balanced processing time";
    if (percentage >= 40) return "Medium compression, faster processing";
    return "Light compression, fastest processing";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Compression Options</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Configure how the image will be compressed. Different methods and levels affect both the final file
                  size and processing time.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="compressionMethod">Compression Method</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Select how the image will be compressed. Each method has different trade-offs between speed and
                    quality.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={options.method} onValueChange={handleMethodChange} disabled={isDisabled}>
            <SelectTrigger id="compressionMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {methods.map((method) => (
                <SelectItem key={method} value={method}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-2">
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {
                            METHOD_DESCRIPTIONS[format as keyof typeof METHOD_DESCRIPTIONS][
                              method as keyof (typeof METHOD_DESCRIPTIONS)[keyof typeof METHOD_DESCRIPTIONS]
                            ]
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="compressionLevel">Compression Level</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2 max-w-xs">
                      <p>Adjust how aggressively the image will be compressed.</p>
                      <p className="text-sm text-muted-foreground">{getCompressionLevelDescription(options.level)}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-sm text-muted-foreground cursor-help">
                    {options.level} / {range.max}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current compression level: {getCompressionLevelDescription(options.level)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Slider
            id="compressionLevel"
            min={range.min}
            max={range.max}
            step={1}
            value={[options.level]}
            onValueChange={handleLevelChange}
            disabled={isDisabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span>Faster compression</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lower compression levels process faster but may result in larger file sizes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span>Better compression</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Higher compression levels may achieve smaller file sizes but take longer to process.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {options.level === range.max && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Maximum compression level may significantly increase processing time</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
