import { useState } from "react";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    try {
      // Backend integration will be implemented later
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }
    } catch (err) {
      setError(`An error occurred during login: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
          <div className="text-center text-sm">
            <a href="/auth/password-recovery" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </div>
        </div>
      </form>
    </Card>
  );
}
