import { z } from "zod";

import { parseJsonArrayFromForm } from "@/lib/action-error";

export const customerSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  discountLm: z.array(z.coerce.number().min(0).max(100)),
  discountBr: z.array(z.coerce.number().min(0).max(100)),
  bonusThreshold: z.coerce.number().min(0),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export function parseCustomerFromForm(formData: FormData) {
  return customerSchema.parse({
    nama: formData.get("nama"),
    discountLm: parseJsonArrayFromForm(formData, "discountLm"),
    discountBr: parseJsonArrayFromForm(formData, "discountBr"),
    bonusThreshold: formData.get("bonusThreshold"),
  });
}
