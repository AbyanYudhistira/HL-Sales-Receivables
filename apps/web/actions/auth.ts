"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/lib/auth";

const LOGIN_ERROR = "Nama pengguna atau kata sandi salah. Coba lagi ya.";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: LOGIN_ERROR };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: LOGIN_ERROR };
    }
  } catch (error) {
    // NextAuth v5 throws CredentialsSignin from server actions (does not return result.error).
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { error: LOGIN_ERROR };
    }

    throw error;
  }

  redirect("/");
}
