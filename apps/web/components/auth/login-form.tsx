"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const hasError = !!state?.error;

  return (
    <form action={formAction} noValidate className="mt-8 space-y-5">
      <div
        id="login-error"
        role="alert"
        aria-live="polite"
        className={hasError ? "text-base text-destructive" : "sr-only"}
      >
        {state?.error ?? ""}
      </div>

      <div>
        <Label htmlFor="username">Email</Label>
        <Input
          id="username"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={hasError}
          aria-describedby="login-error"
          className="text-lg"
        />
      </div>

      <div>
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className="text-lg"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        Masuk
      </Button>
    </form>
  );
}
