import { notFound, redirect } from "next/navigation";

import { updateTransactionAction } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card } from "@/components/ui/card";
import * as customerService from "@/lib/services/customers";
import * as productService from "@/lib/services/products";
import * as transactionService from "@/lib/services/transactions";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tx = await transactionService.getTransactionById(id);
  if (!tx) notFound();

  const customers = await customerService.listCustomers();
  const products = await productService.listProducts();

  async function action(formData: FormData) {
    "use server";
    const result = await updateTransactionAction(id, formData);
    if (result?.success) {
      redirect(`/transactions/${id}`);
    }
    return result;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Bon {tx.nomorBon}</h1>
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
          initial={{
            tanggal: new Date(tx.tanggal).toISOString().slice(0, 10),
            nomorBon: tx.nomorBon,
            customerId: tx.customerId,
            ongkir: Number(tx.ongkir),
            deskripsi: tx.deskripsi ?? undefined,
            isBonus: tx.isBonus,
            status: tx.status,
            lines: tx.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
            bonusCount: tx.bonusGrant?.bonusCount,
          }}
        />
      </Card>
    </div>
  );
}
