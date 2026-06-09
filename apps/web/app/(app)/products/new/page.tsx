import { createProductAction } from "@/actions/products";
import { ProductForm } from "@/components/products/product-form";
import { Card } from "@/components/ui/card";

export default function NewProductPage() {
  async function action(formData: FormData) {
    "use server";
    await createProductAction(formData);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-3xl font-semibold text-foreground">Tambah Barang</h1>
      <Card>
        <ProductForm action={action} submitLabel="Simpan" />
      </Card>
    </div>
  );
}
