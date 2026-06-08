import { redirect } from "next/navigation";

import { createTransactionAction } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card } from "@/components/ui/card";
import * as customerService from "@/lib/services/customers";
import * as productService from "@/lib/services/products";

export default async function NewTransactionPage() {
  const customers = await customerService.listCustomers();
  const products = await productService.listProducts();

  async function action(formData: FormData) {
    "use server";
    const result = await createTransactionAction(formData);
    if (result?.success) {
      redirect("/transactions");
    }
    return result;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Bon Baru</h1>
      <Card>
        <TransactionForm
          action={action}
          customers={customers.map((c) => ({
            id: c.id,
            nama: c.nama,
            discountLm: c.discountLm,
            discountBr: c.discountBr,
          }))}
          products={products.map((p) => ({
            id: p.id,
            nama: p.nama,
            tipe: p.tipe,
            hargaBase: Number(p.hargaBase),
            hargaModal: Number(p.hargaModal),
          }))}
        />
      </Card>
    </div>
  );
}
