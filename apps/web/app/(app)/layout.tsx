import { signOut } from "@/lib/auth";

import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return <AppShell signOutAction={signOutAction}>{children}</AppShell>;
}
