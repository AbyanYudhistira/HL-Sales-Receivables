export function LoginMonogram({ dark = false }: { dark?: boolean }) {
  const stroke = dark ? "oklch(0.42 0.05 145)" : "oklch(0.97 0.01 80)";
  const fill = dark ? "oklch(0.955 0.012 80)" : "transparent";

  return (
    <span
      className="inline-grid h-11 w-11 place-items-center rounded-[14px] border"
      style={{
        borderColor: dark ? "oklch(0.42 0.05 145 / 0.25)" : "oklch(1 0 0 / 0.35)",
        backgroundColor: fill,
      }}
      aria-label="HL"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), Fraunces, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="20"
          fill={stroke}
        >
          HL
        </text>
      </svg>
    </span>
  );
}
