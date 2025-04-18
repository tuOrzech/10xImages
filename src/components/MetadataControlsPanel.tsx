import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MetadataOptionsType } from "@/types";
import { Info } from "lucide-react";

interface MetadataControlsPanelProps {
  options: MetadataOptionsType;
  onChange: (options: MetadataOptionsType) => void;
  isDisabled?: boolean;
}

interface MetadataOption {
  key: keyof MetadataOptionsType;
  label: string;
  description: string;
}

const METADATA_OPTIONS: MetadataOption[] = [
  {
    key: "keepExif",
    label: "Keep EXIF data",
    description: "Preserve camera settings, date, location, and other technical information",
  },
  {
    key: "keepIptc",
    label: "Keep IPTC data",
    description: "Preserve professional metadata like copyright, credits, and keywords",
  },
  {
    key: "keepXmp",
    label: "Keep XMP data",
    description: "Preserve Adobe's extensible metadata for professional editing",
  },
  {
    key: "keepColorProfile",
    label: "Keep color profile",
    description: "Preserve ICC color profile for accurate color reproduction",
  },
  {
    key: "addCopyright",
    label: "Add copyright information",
    description: "Include copyright information in the image metadata",
  },
] as const;

export default function MetadataControlsPanel({ options, onChange, isDisabled = false }: MetadataControlsPanelProps) {
  const handleToggle = (key: keyof MetadataOptionsType) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  const handleCopyrightTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...options,
      copyrightText: event.target.value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {METADATA_OPTIONS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor={key} className="flex items-center gap-2">
                  {label}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              <Switch
                id={key}
                checked={Boolean(options[key])}
                onCheckedChange={() => handleToggle(key)}
                disabled={isDisabled}
              />
            </div>
          ))}
        </div>

        {options.addCopyright && (
          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input
              id="copyrightText"
              value={options.copyrightText}
              onChange={handleCopyrightTextChange}
              placeholder="© 2024 Your Name"
              disabled={isDisabled}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
