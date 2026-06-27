import { formatIdr } from "@/lib/format-idr";

export function formatLabaDisplay(amount: number, visible: boolean): string {
  return visible ? formatIdr(amount) : "••••••";
}
