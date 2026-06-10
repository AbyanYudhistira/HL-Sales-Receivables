"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClassName =
  "h-14 rounded-xl border-border bg-card text-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const hasError = !!state?.error;

  return (
    <form
      action={formAction}
      noValidate
      className="mt-8 space-y-5"
      aria-describedby={hasError ? "login-error" : undefined}
    >
      <div className="space-y-2">
        <Label htmlFor="username" className="text-base font-medium">
          Nama pengguna
        </Label>
        <Input
          id="username"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          aria-invalid={hasError}
          className={fieldClassName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-base font-medium">
          Kata sandi
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className={fieldClassName}
        />
      </div>

      <div aria-live="polite" className="min-h-0">
        {hasError && (
          <div
            id="login-error"
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-base text-destructive"
          >
            {state?.error}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-14 w-full rounded-xl text-lg font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Masuk
      </Button>
    </form>
  );
}
