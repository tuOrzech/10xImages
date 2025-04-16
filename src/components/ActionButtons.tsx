import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";

export interface ActionButtonsProps {
  onSave: () => void;
  onRetry: () => void;
  onBack: () => void;
  canSave: boolean;
  canRetry: boolean;
  isSaving: boolean;
  isRetrying: boolean;
}

export default function ActionButtons({
  onSave,
  onRetry,
  onBack,
  canSave,
  canRetry,
  isSaving,
  isRetrying,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="flex gap-2">
        {canRetry && (
          <Button variant="secondary" onClick={onRetry} disabled={isRetrying}>
            <RotateCcw className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
        )}
        <Button variant="default" onClick={onSave} disabled={!canSave || isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
