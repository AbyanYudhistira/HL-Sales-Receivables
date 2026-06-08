import { createProductAction } from "@/actions/products";
import { ProductForm } from "@/components/products/product-form";
import { Card } from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Produk Baru</h1>
      <Card>
        <ProductForm action={createProductAction} submitLabel="Buat Produk" />
      </Card>
    </div>
  );
}
