import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Pencil, X } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  placeholder?: string;
}

export default function EditableField({
  label,
  value,
  onChange,
  isEditing,
  setIsEditing,
  placeholder,
}: EditableFieldProps) {
  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <Label htmlFor={label} className="text-sm text-muted-foreground">
          {label}
        </Label>
        <div className="flex gap-1">
          <Input
            id={label}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-9 w-9">
            <Check className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-9 w-9">
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={label} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <button
        type="button"
        className="w-full flex items-center justify-between p-2 rounded-md border bg-muted/50 cursor-pointer group hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => setIsEditing(true)}
        onKeyDown={handleKeyDown}
        aria-label={`Edit ${label}`}
      >
        <span className="text-sm">{value || placeholder || "Click to edit"}</span>
        <span className="h-7 w-7 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center">
          <Pencil className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}
