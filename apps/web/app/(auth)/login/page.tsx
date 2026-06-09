import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section
        className="relative flex flex-col justify-center overflow-hidden px-8 py-12 text-primary-foreground lg:px-14 lg:py-16"
        style={{ background: "var(--brand-panel)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-md">
          <svg
            viewBox="0 0 80 80"
            className="mb-8 size-16"
            role="img"
            aria-label="HL"
          >
            <rect width="80" height="80" rx="16" fill="rgba(255,255,255,0.12)" />
            <text
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize="34"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontWeight="600"
            >
              HL
            </text>
          </svg>
          <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight text-primary-foreground">
            Catatan toko,{" "}
            <span className="italic">tanpa pusing.</span>
          </h1>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-primary-foreground/90">
            Tulis bon penjualan dan tagihan pelanggan dengan tenang. Semua tercatat
            rapi di satu tempat.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-10 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-base font-semibold italic text-primary-foreground">
              HL
            </span>
            <div>
              <p className="font-display text-lg font-semibold">Buku Toko</p>
              <p className="text-sm text-muted-foreground">Masuk ke akun Anda</p>
            </div>
          </div>

          <div className="hidden lg:block">
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary font-display text-lg font-semibold italic text-primary-foreground">
              HL
            </span>
            <h2 className="font-display text-3xl font-semibold text-foreground">Masuk</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Masuk untuk mulai mencatat.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </div>
  );
}
