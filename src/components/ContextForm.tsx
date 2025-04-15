import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import React, { useCallback, useState } from "react";

interface ContextFormProps {
  subject: string;
  keywords: string[];
  onChange: (subject?: string, keywords?: string[]) => void;
}

export function ContextForm({ subject, keywords, onChange }: ContextFormProps) {
  const [newKeyword, setNewKeyword] = useState("");

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value, keywords);
    },
    [keywords, onChange]
  );

  const handleAddKeyword = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (newKeyword.trim()) {
        const updatedKeywords = [...keywords, newKeyword.trim()];
        onChange(subject, updatedKeywords);
        setNewKeyword("");
      }
    },
    [newKeyword, keywords, subject, onChange]
  );

  const removeKeyword = useCallback(
    (indexToRemove: number) => {
      const updatedKeywords = keywords.filter((_, index) => index !== indexToRemove);
      onChange(subject, updatedKeywords);
    },
    [keywords, subject, onChange]
  );

  // Handle Enter key in keyword input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddKeyword();
      }
    },
    [handleAddKeyword]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Temat obrazu</Label>
        <Input
          id="subject"
          type="text"
          value={subject}
          onChange={handleSubjectChange}
          placeholder="Opisz co przedstawia obraz..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">Słowa kluczowe</Label>
        <div className="flex gap-2">
          <Input
            id="keywords"
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Dodaj słowo kluczowe..."
          />
          <Button type="button" variant="secondary" disabled={!newKeyword.trim()} onClick={handleAddKeyword}>
            Dodaj
          </Button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <Badge key={`${keyword}-${index}`} variant="secondary" className="flex items-center gap-1">
              {keyword}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeKeyword(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Usuń słowo kluczowe {keyword}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
