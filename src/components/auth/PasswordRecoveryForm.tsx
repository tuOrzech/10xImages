import { useState } from "react";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Backend integration will be implemented later
    setStatus("success");
    setMessage("If an account exists with this email, you will receive password reset instructions.");
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        {status === "success" && <Alert className="mt-4">{message}</Alert>}
        {status === "error" && (
          <Alert variant="destructive" className="mt-4">
            {message}
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
          <div className="text-center text-sm">
            Remember your password?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </div>
      </form>
    </Card>
  );
}
