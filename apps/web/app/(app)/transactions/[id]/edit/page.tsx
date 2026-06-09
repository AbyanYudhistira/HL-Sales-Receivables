import { notFound } from "next/navigation";

import { updateTransactionAction } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
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
        customers={customersWithBonus}
        products={products.map((p) => ({
          id: p.id,
          nama: p.nama,
          tipe: p.tipe,
          hargaBase: Number(p.hargaBase),
          hargaModal: Number(p.hargaModal),
        }))}
        cancelHref={`/penjualan/${id}`}
        successHref={`/penjualan/${id}`}
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
