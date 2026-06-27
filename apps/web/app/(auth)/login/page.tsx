import { LoginForm } from "@/components/auth/login-form";
import { LoginMonogram } from "@/components/auth/login-monogram";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside
        className="relative isolate flex min-h-[280px] flex-col overflow-hidden px-8 py-10 text-primary-foreground lg:min-h-screen lg:px-14 lg:py-16"
        style={{ backgroundColor: "oklch(0.42 0.05 145)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(120% 70% at 10% 0%, oklch(0.55 0.07 145) 0%, transparent 55%), radial-gradient(80% 60% at 100% 100%, oklch(0.35 0.04 145) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <LoginMonogram />
          <span className="text-sm tracking-wide text-primary-foreground/90">
            HL Sales
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center max-w-md py-12 lg:py-0">
          <h1
            className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[1.05] text-primary-foreground"
            style={{ letterSpacing: "-0.025em" }}
          >
            Catatan toko,{" "}
            <em className="font-display font-medium italic">tanpa pusing</em>.
          </h1>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-primary-foreground/90">
            Tulis bon, tandai yang sudah bayar, lihat siapa yang masih ngutang.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LoginMonogram dark />
            <span className="text-sm tracking-wide text-muted-foreground">
              HL Sales
            </span>
          </div>

          <h2 className="font-display text-3xl font-medium text-foreground lg:text-4xl">
            Selamat datang kembali
          </h2>
          <p className="mt-2 text-base text-foreground/70">
            Masuk untuk mulai mencatat.
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
