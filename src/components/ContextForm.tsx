import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import React, { useCallback, useState } from "react";

interface ContextFormProps {
  subject?: string;
  keywords: string[];
  onChange: (subject?: string, keywords?: string[]) => void;
}

export function ContextForm({ subject = "", keywords = [], onChange }: ContextFormProps) {
  const [newKeyword, setNewKeyword] = useState<string>("");

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value, keywords);
    },
    [keywords, onChange]
  );

  const handleAddKeyword = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (newKeyword.trim() === "") return;

      // Check if keyword already exists
      if (!keywords.includes(newKeyword.trim())) {
        const updatedKeywords = [...keywords, newKeyword.trim()];
        onChange(subject, updatedKeywords);
      }

      setNewKeyword("");
    },
    [keywords, newKeyword, subject, onChange]
  );

  const handleRemoveKeyword = useCallback(
    (keywordToRemove: string) => {
      const updatedKeywords = keywords.filter((keyword) => keyword !== keywordToRemove);
      onChange(subject, updatedKeywords);
    },
    [keywords, subject, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Dodawanie słowa kluczowego po naciśnięciu Enter
      if (e.key === "Enter" && !e.shiftKey && newKeyword.trim() !== "") {
        e.preventDefault();

        if (!keywords.includes(newKeyword.trim())) {
          const updatedKeywords = [...keywords, newKeyword.trim()];
          onChange(subject, updatedKeywords);
        }

        setNewKeyword("");
      }
    },
    [keywords, newKeyword, subject, onChange]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle id="context-form-title">Dodaj kontekst</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="group" aria-labelledby="context-form-title">
          <div className="space-y-2">
            <Label htmlFor="subject">Temat obrazu (opcjonalnie)</Label>
            <Input
              id="subject"
              placeholder="Np. Góry, krajobraz, produkt..."
              value={subject}
              onChange={handleSubjectChange}
              aria-describedby="subject-description"
            />
            <p id="subject-description" className="text-sm text-gray-500 dark:text-gray-400">
              Dodaj opis tego, co przedstawia obraz, aby pomóc AI w generowaniu lepszych sugestii.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Słowa kluczowe (opcjonalnie)</Label>
            <form onSubmit={handleAddKeyword} className="flex space-x-2">
              <Input
                id="keywords"
                placeholder="Wpisz słowo kluczowe"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-describedby="keywords-description"
              />
              <Button type="submit" variant="outline">
                Dodaj
              </Button>
            </form>
            <p id="keywords-description" className="text-sm text-gray-500 dark:text-gray-400">
              Naciśnij Enter, aby dodać słowo kluczowe.
            </p>
          </div>

          {keywords.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2" role="list" aria-label="Wybrane słowa kluczowe">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1" role="listitem">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                      aria-label={`Usuń słowo kluczowe ${keyword}`}
                    >
                      <X size={14} />
                      <span className="sr-only">Usuń {keyword}</span>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
