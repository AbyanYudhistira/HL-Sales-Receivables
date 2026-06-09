import { auth } from "@/lib/auth";

export async function requirePdfAuth() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}
