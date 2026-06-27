import { z } from "zod";

export const productSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  hargaModal: z.coerce.number().min(0),
  hargaBase: z.coerce.number().min(0),
  tipe: z.enum(["LM", "BR"]),
});

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductFromForm(formData: FormData) {
  return productSchema.parse({
    nama: formData.get("nama"),
    hargaModal: formData.get("hargaModal"),
    hargaBase: formData.get("hargaBase"),
    tipe: formData.get("tipe"),
  });
}
