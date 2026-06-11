import { redirect } from "next/navigation";

import { createTransactionAction } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTransactionFormData } from "@/lib/services/transaction-form-data";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  if (edit) {
    redirect(`/transactions/${edit}/edit`);
  }

  const { customers, products } = await getTransactionFormData();

  async function action(formData: FormData) {
    "use server";
    return createTransactionAction(formData);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Catat Penjualan Baru
        </h1>
      </header>

      <TransactionForm
        action={action}
        customers={customers}
        products={products}
      />
    </div>
  );
}
