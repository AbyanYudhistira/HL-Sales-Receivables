"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/lib/auth";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Username atau kata sandi salah." };
  }

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    return { error: "Username atau kata sandi salah." };
  }

  redirect("/");
}
