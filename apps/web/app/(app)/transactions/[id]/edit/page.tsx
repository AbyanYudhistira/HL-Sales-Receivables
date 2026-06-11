import { notFound } from "next/navigation";

import { updateTransactionAction } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTransactionFormData } from "@/lib/services/transaction-form-data";
import * as transactionService from "@/lib/services/transactions";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tx, { customers, products }] = await Promise.all([
    transactionService.getTransactionById(id),
    getTransactionFormData(),
  ]);

  if (!tx) notFound();

  async function action(formData: FormData) {
    "use server";
    return updateTransactionAction(id, formData);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Edit Bon {tx.nomorBon}
        </h1>
      </header>

      <TransactionForm
        action={action}
        customers={customers}
        products={products}
        cancelHref={`/transactions/${id}`}
        successHref={`/transactions/${id}`}
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
    </div>
  );
}
