"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { notify } from "@/components/ui/toast-wrapper";
import { Icons } from "@/components/shared/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/admin/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      notify.success("Authenticated successfully! Redirecting to portal...");
      router.push(fromPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-elevated border-border/80">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm font-serif text-2xl font-bold">
            ST
          </div>
          <CardTitle className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Smart Menu Admin Portal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your staff credentials to access restaurant management dashboards.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
              <Icons.info className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="admin@smarttechfoodhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password
                </Label>
              </div>
              <PasswordInput
                id="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              />
              <Label htmlFor="remember" className="text-xs text-muted-foreground font-medium cursor-pointer">
                Remember session on this device
              </Label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full font-semibold shadow-md shadow-primary/20 rounded-xl"
            >
              {loading ? "Authenticating..." : "Sign In to Admin Portal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
