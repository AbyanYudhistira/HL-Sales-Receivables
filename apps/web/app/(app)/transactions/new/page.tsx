import { redirect } from "next/navigation";

import { createTransactionAction } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import * as customerService from "@/lib/services/customers";
import * as productService from "@/lib/services/products";
import * as transactionService from "@/lib/services/transactions";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  if (edit) {
    redirect(`/transactions/${edit}/edit`);
  }
  const customersPromise = customerService.listCustomers();
  const [customers, products, bonusMap] = await Promise.all([
    customersPromise,
    productService.listProducts(),
    customersPromise.then((rows) => transactionService.getBonusAvailableMap(rows)),
  ]);

  const customersWithBonus = customers.map((customer) => ({
    id: customer.id,
    nama: customer.nama,
    discountLm: customer.discountLm,
    discountBr: customer.discountBr,
    bonusAvailable: bonusMap.get(customer.id) ?? 0,
  }));

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
        customers={customersWithBonus}
        products={products.map((p) => ({
          id: p.id,
          nama: p.nama,
          tipe: p.tipe,
          hargaBase: Number(p.hargaBase),
          hargaModal: Number(p.hargaModal),
        }))}
      />
    </div>
  );
}
