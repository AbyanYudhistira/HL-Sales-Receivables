import Link from "next/link";
import { notFound } from "next/navigation";

import { settleTransactionAction } from "@/actions/settlement";
import { deleteTransactionAction } from "@/actions/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatIdr } from "@/lib/format-idr";
import * as transactionService from "@/lib/services/transactions";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tx = await transactionService.getTransactionById(id);
  if (!tx) notFound();

  const omzet = tx.lines.reduce(
    (sum, line) =>
      line.isBonusLine ? sum : sum + Number(line.discountedUnitPrice) * line.quantity,
    0
  );
  const laba = tx.lines.reduce((sum, line) => {
    if (line.isBonusLine) return sum;
    return (
      sum +
      (Number(line.discountedUnitPrice) - Number(line.product.hargaModal)) * line.quantity
    );
  }, 0);
  const total = omzet + Number(tx.ongkir);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bon {tx.nomorBon}</h1>
          <p className="text-sm text-gray-600">
            {tx.customer.nama} — {new Date(tx.tanggal).toLocaleDateString("id-ID")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/transactions/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <form action={deleteTransactionAction.bind(null, id)}>
            <Button type="submit" variant="danger">
              Hapus
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={tx.status === "LUNAS" ? "success" : "warning"}>
          {tx.status === "LUNAS" ? "Lunas" : "Piutang"}
        </Badge>
        {tx.isBonus && <Badge variant="bonus">Transaksi Bonus</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-gray-600">Omzet</p><p className="font-bold">{formatIdr(omzet)}</p></Card>
        <Card><p className="text-xs text-gray-600">Ongkir</p><p className="font-bold">{formatIdr(Number(tx.ongkir))}</p></Card>
        <Card><p className="text-xs text-gray-600">Total</p><p className="font-bold">{formatIdr(total)}</p></Card>
        <Card><p className="text-xs text-gray-600">Laba HL</p><p className="font-bold">{formatIdr(laba)}</p></Card>
      </div>

      {tx.status === "PIUTANG" && (
        <Card>
          <h2 className="mb-4 font-semibold">Pelunasan</h2>
          <form
            action={async (formData) => {
              "use server";
              await settleTransactionAction(id, String(formData.get("tanggalPelunasan")));
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div>
              <Label htmlFor="tanggalPelunasan">Tanggal Pelunasan</Label>
              <Input
                id="tanggalPelunasan"
                name="tanggalPelunasan"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <Button type="submit">Tandai Lunas</Button>
          </form>
        </Card>
      )}

      {tx.tanggalPelunasan && (
        <p className="text-sm text-gray-600">
          Tanggal pelunasan: {new Date(tx.tanggalPelunasan).toLocaleDateString("id-ID")}
        </p>
      )}

      <Card>
        <h2 className="mb-4 font-semibold">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2">Produk</th>
                <th>Tipe</th>
                <th>Qty</th>
                <th>Harga Diskon</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {tx.lines.map((line) => (
                <tr key={line.id} className="border-b">
                  <td className="py-2">{line.product.nama}</td>
                  <td>{line.product.tipe}</td>
                  <td>{line.quantity}</td>
                  <td>{formatIdr(Number(line.discountedUnitPrice))}</td>
                  <td>
                    {formatIdr(Number(line.discountedUnitPrice) * line.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {tx.deskripsi && (
        <Card>
          <p className="text-sm text-gray-600">Deskripsi</p>
          <p>{tx.deskripsi}</p>
        </Card>
      )}
    </div>
  );
}
