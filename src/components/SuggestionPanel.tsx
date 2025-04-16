import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OptimizationJobDTO } from "@/types";
import EditableField from "./EditableField";

interface SuggestionPanelProps {
  job: OptimizationJobDTO | null;
  editedAltText: string | null;
  editedFilename: string | null;
  onAltTextChange: (value: string) => void;
  onFilenameChange: (value: string) => void;
  isEditingAlt: boolean;
  setIsEditingAlt: (value: boolean) => void;
  isEditingFilename: boolean;
  setIsEditingFilename: (value: boolean) => void;
}

export default function SuggestionPanel({
  job,
  editedAltText,
  editedFilename,
  onAltTextChange,
  onFilenameChange,
  isEditingAlt,
  setIsEditingAlt,
  isEditingFilename,
  setIsEditingFilename,
}: SuggestionPanelProps) {
  if (!job) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Alternative Text</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EditableField
            label="Alt Text"
            value={editedAltText}
            onChange={onAltTextChange}
            isEditing={isEditingAlt}
            setIsEditing={setIsEditingAlt}
            placeholder="Enter alternative text for the image"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Filename Suggestion</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EditableField
            label="Filename"
            value={editedFilename}
            onChange={onFilenameChange}
            isEditing={isEditingFilename}
            setIsEditing={setIsEditingFilename}
            placeholder="Enter SEO-friendly filename"
          />
        </CardContent>
      </Card>

      {job.ai_detected_keywords && job.ai_detected_keywords.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg">AI Detected Keywords</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {job.ai_detected_keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
