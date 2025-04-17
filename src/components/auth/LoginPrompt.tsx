import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";

interface LoginPromptProps {
  title?: string;
  description?: string;
}

export default function LoginPrompt({
  title = "Tylko dla zalogowanych użytkowników",
  description = "Zaloguj się, aby uzyskać dostęp do pełnej funkcjonalności aplikacji.",
}: LoginPromptProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => (window.location.href = "/auth/register")}>
            Zarejestruj się
          </Button>
          <Button onClick={() => (window.location.href = "/auth/login")}>Zaloguj się</Button>
        </div>
      </CardContent>
    </Card>
  );
}
