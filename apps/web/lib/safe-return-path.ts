const ALLOWED_PREFIXES = [
  "/",
  "/pelanggan",
  "/customers",
  "/barang",
  "/products",
  "/penjualan",
  "/transactions",
  "/laporan",
] as const;

export function isSafeReturnPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || (prefix !== "/" && path.startsWith(`${prefix}/`))
  );
}

export function getReturnTo(formData: FormData, fallback: string): string {
  const value = formData.get("returnTo");
  if (typeof value === "string" && isSafeReturnPath(value)) {
    return value;
  }

  return fallback;
}
