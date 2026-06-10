"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import {

  BarChart3,

  Home,

  LogOut,

  Menu,

  Package,

  PanelLeftClose,

  PanelLeftOpen,

  Receipt,

  Store,

  Users,

  X,

} from "lucide-react";

import { useEffect, useState } from "react";



import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";



const SIDEBAR_STORAGE_KEY = "hl-sidebar-collapsed";



const navItems = [

  { href: "/", label: "Beranda", icon: Home, aliases: [] as string[] },

  {

    href: "/customers",

    label: "Pelanggan",

    icon: Users,

    aliases: ["/pelanggan"],

  },

  { href: "/products", label: "Barang", icon: Package, aliases: ["/barang"] },

  {

    href: "/transactions",

    label: "Penjualan",

    icon: Receipt,

    aliases: ["/penjualan"],

  },

  { href: "/laporan", label: "Laporan", icon: BarChart3, aliases: [] as string[] },

];



function NavLinks({

  collapsed = false,

  onNavigate,

  className,

}: {

  collapsed?: boolean;

  onNavigate?: () => void;

  className?: string;

}) {

  const pathname = usePathname();



  return (

    <nav className={cn("flex flex-col gap-1", className)}>

      {navItems.map(({ href, label, icon: Icon, aliases }) => {

        const active =

          pathname === href ||

          (href !== "/" && pathname.startsWith(`${href}/`)) ||

          aliases.some(

            (alias) =>

              pathname === alias || pathname.startsWith(`${alias}/`)

          );



        return (

          <Link

            key={href}

            href={href}

            prefetch={false}

            onClick={onNavigate}

            title={collapsed ? label : undefined}

            aria-label={collapsed ? label : undefined}

            className={cn(

              "flex min-h-12 items-center rounded-xl text-[17px] font-medium transition-colors duration-200 ease-out",

              collapsed ? "justify-center px-0" : "gap-3 px-4",

              active

                ? "bg-accent text-accent-foreground"

                : "text-foreground hover:bg-accent/50"

            )}

          >

            <Icon className="size-5 shrink-0" aria-hidden />

            <span

              className={cn(

                "truncate transition-[opacity,width] duration-200 ease-out motion-reduce:transition-none",

                collapsed ? "sr-only" : "opacity-100"

              )}

            >

              {label}

            </span>

          </Link>

        );

      })}

    </nav>

  );

}



function SidebarHeader({

  compact = false,

  collapsed = false,

}: {

  compact?: boolean;

  collapsed?: boolean;

}) {

  const showText = !compact && !collapsed;



  return (

    <div

      className={cn(

        showText ? "pb-5" : "pb-3",

        collapsed && !compact && "flex justify-center"

      )}

    >

      <div

        className={cn(

          "flex items-center",

          showText ? "gap-3" : "justify-center",

          compact && "gap-3"

        )}

      >

        <span

          className={cn(

            "inline-grid shrink-0 place-items-center rounded-xl bg-primary",

            compact || collapsed ? "size-10" : "size-11"

          )}

          aria-hidden

        >

          <Store

            className={cn(

              "text-primary-foreground",

              compact || collapsed ? "size-4" : "size-5"

            )}

            strokeWidth={2}

          />

        </span>

        {showText && (

          <div className="min-w-0">

            <p className="text-base font-semibold leading-tight text-foreground">

              Buku Toko

            </p>

            <p className="mt-0.5 text-sm leading-tight text-muted-foreground">

              Catatan Penjualan

            </p>

          </div>

        )}

        {compact && (

          <p className="text-sm font-semibold leading-tight text-foreground">

            Buku Toko

          </p>

        )}

      </div>

      {showText && <div className="mt-5 border-b border-border" />}

    </div>

  );

}



function DesktopSidebar({

  collapsed,

  onToggle,

  signOutAction,

}: {

  collapsed: boolean;

  onToggle: () => void;

  signOutAction: () => Promise<void>;

}) {

  return (

    <aside

      className={cn(

        "sticky top-0 hidden h-screen flex-col border-r border-border bg-card py-6 transition-[padding,width] duration-200 ease-out motion-reduce:transition-none md:flex",

        collapsed ? "w-[72px] px-2" : "w-[280px] px-5"

      )}

    >

      <SidebarHeader collapsed={collapsed} />

      <div className="mt-2 flex flex-1 flex-col">

        <NavLinks collapsed={collapsed} />

        <div className="mt-auto space-y-1 pt-6">

          <Button

            type="button"

            variant="ghost"

            onClick={onToggle}

            className={cn(

              "w-full text-foreground transition-colors duration-200 ease-out",

              collapsed ? "justify-center px-0" : "justify-start px-4"

            )}

            aria-label={collapsed ? "Buka sidebar" : "Sembunyikan sidebar"}

            title={collapsed ? "Buka sidebar" : "Sembunyikan sidebar"}

          >

            {collapsed ? (

              <PanelLeftOpen className="size-5" aria-hidden />

            ) : (

              <>

                <PanelLeftClose className="size-5" aria-hidden />

                <span>Sembunyikan</span>

              </>

            )}

          </Button>

          <form action={signOutAction}>

            <Button

              type="submit"

              variant="ghost"

              className={cn(

                "w-full transition-colors duration-200 ease-out",

                collapsed ? "justify-center px-0" : "justify-start px-4"

              )}

              aria-label={collapsed ? "Keluar" : undefined}

              title={collapsed ? "Keluar" : undefined}

            >

              <LogOut className="size-5" aria-hidden />

              {!collapsed && <span>Keluar</span>}

            </Button>

          </form>

        </div>

      </div>

    </aside>

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



  useEffect(() => {

    try {

      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");

    } catch {

      // localStorage unavailable

    }

  }, []);



  function toggleSidebar() {

    setSidebarCollapsed((prev) => {

      const next = !prev;

      try {

        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");

      } catch {

        // localStorage unavailable

      }

      return next;

    });

  }



  return (

    <div className="min-h-screen bg-background md:flex">

      <DesktopSidebar

        collapsed={sidebarCollapsed}

        onToggle={toggleSidebar}

        signOutAction={signOutAction}

      />



      <div className="flex min-h-screen min-w-0 flex-1 flex-col">

        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">

          <SidebarHeader compact />

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

            <div className="relative z-10 h-full w-[min(100%,280px)] border-r border-border bg-card px-5 py-6 shadow-none">

              <SidebarHeader />

              <div className="mt-2 flex h-[calc(100%-8rem)] flex-col">

                <NavLinks onNavigate={() => setMobileOpen(false)} />

                <form action={signOutAction} className="mt-auto pt-6">

                  <Button

                    type="submit"

                    variant="ghost"

                    className="w-full justify-start px-4"

                  >

                    <LogOut className="size-5" aria-hidden />

                    Keluar

                  </Button>

                </form>

              </div>

            </div>

          </div>

        )}



        <main className="flex-1 px-6 py-8 md:px-10 lg:px-14 xl:px-16">

          <div className="mx-auto w-full max-w-7xl">{children}</div>

        </main>

      </div>

    </div>

  );

}

