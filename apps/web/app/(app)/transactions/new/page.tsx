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
  const customers = await customerService.listCustomers();
  const products = await productService.listProducts();

  const customersWithBonus = await Promise.all(
    customers.map(async (customer) => {
      const bonus = await transactionService.getCustomerBonusInfo(customer.id);
      return {
        id: customer.id,
        nama: customer.nama,
        discountLm: customer.discountLm,
        discountBr: customer.discountBr,
        bonusAvailable: bonus.available,
      };
    })
  );

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
