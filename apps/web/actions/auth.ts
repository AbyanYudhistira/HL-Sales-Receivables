"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/lib/auth";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Nama pengguna atau kata sandi salah. Coba lagi ya." };
  }

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    return { error: "Nama pengguna atau kata sandi salah. Coba lagi ya." };
  }

  redirect("/");
}
