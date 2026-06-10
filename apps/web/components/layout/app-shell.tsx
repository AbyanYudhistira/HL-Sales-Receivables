"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Package,
  Receipt,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/barang", label: "Barang", icon: Package },
  { href: "/penjualan", label: "Penjualan", icon: Receipt },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`)) ||
          (href === "/pelanggan" && pathname.startsWith("/customers")) ||
          (href === "/barang" && pathname.startsWith("/products")) ||
          (href === "/penjualan" && pathname.startsWith("/transactions"));

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-xl px-4 text-[17px] font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={cn(
        "font-medium leading-tight tracking-wide text-foreground",
        compact ? "text-sm" : "text-sm"
      )}
    >
      Buku Toko
    </p>
  );
}

export function AppShell({
  children,
  signOutAction,
}: {
  children: React.ReactNode;
  signOutAction: () => Promise<void>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <BrandMark />
        <div className="mt-8 flex flex-1 flex-col">
          <NavLinks />
          <form action={signOutAction} className="mt-auto pt-6">
            <Button type="submit" variant="ghost" className="w-full justify-start px-4">
              <LogOut className="size-5" aria-hidden />
              Keluar
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <BrandMark compact />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/30"
              aria-label="Tutup menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full w-[min(100%,280px)] border-r border-border bg-card px-4 py-6 shadow-none">
              <BrandMark />
              <div className="mt-8 flex h-[calc(100%-8rem)] flex-col">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <form action={signOutAction} className="mt-auto pt-6">
                  <Button type="submit" variant="ghost" className="w-full justify-start px-4">
                    <LogOut className="size-5" aria-hidden />
                    Keluar
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        <main className="w-full flex-1 px-6 py-8 md:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
