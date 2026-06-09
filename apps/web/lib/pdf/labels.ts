export function statusLabel(status: "PIUTANG" | "LUNAS") {
  return status === "LUNAS" ? "Sudah Bayar" : "Belum Bayar";
}
