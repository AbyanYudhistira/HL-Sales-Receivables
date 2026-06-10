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
  const customersPromise = customerService.listCustomers();

  const [tx, customers, products, bonusMap] = await Promise.all([
    transactionService.getTransactionById(id),
    customersPromise,
    productService.listProducts(),
    customersPromise.then((rows) => transactionService.getBonusAvailableMap(rows)),
  ]);

  if (!tx) notFound();

  const customersWithBonus = customers.map((customer) => ({
    id: customer.id,
    nama: customer.nama,
    discountLm: customer.discountLm,
    discountBr: customer.discountBr,
    bonusAvailable: bonusMap.get(customer.id) ?? 0,
  }));

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
