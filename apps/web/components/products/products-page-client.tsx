"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProductAction } from "@/actions/products";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showSuccessToast } from "@/lib/toast";
import { formatIdr } from "@/lib/format-idr";

type ProductRow = {
  id: string;
  nama: string;
  tipe: "LM" | "BR";
  hargaBase: number;
  hargaModal: number;
};

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [showModalPrice, setShowModalPrice] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-foreground">Barang</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Switch
            id="show-modal-price"
            checked={showModalPrice}
            onCheckedChange={setShowModalPrice}
            label="Tampilkan harga modal"
          />
          <Button
            size="lg"
            onClick={() => {
              setEditProduct(null);
              setDialogOpen(true);
            }}
          >
            + Tambah Barang
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nama</TableHeader>
              <TableHeader>Tipe</TableHeader>
              <TableHeader>Harga Jual</TableHeader>
              {showModalPrice && <TableHeader>Harga Modal</TableHeader>}
              <TableHeader>Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nama}</TableCell>
                <TableCell>
                  <Badge variant={product.tipe === "LM" ? "success" : "info"}>
                    {product.tipe}
                  </Badge>
                </TableCell>
                <TableCell>{formatIdr(product.hargaBase)}</TableCell>
                {showModalPrice && <TableCell>{formatIdr(product.hargaModal)}</TableCell>}
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditProduct(product);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(product)}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        productId={editProduct?.id}
        initial={editProduct ?? undefined}
        onSaved={() => {
          showSuccessToast("Barang disimpan.");
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus barang ini?"
        description={`"${deleteTarget?.nama}" akan dihapus dari katalog.`}
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteProductAction(deleteTarget.id);
          setDeleteTarget(null);
          showSuccessToast("Barang dihapus.");
          router.refresh();
        }}
      />
    </div>
  );
}
