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
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { SearchInput } from "@/components/ui/search-input";
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants";
import { formatIdr } from "@/lib/format-idr";

type ProductRow = {
  id: string;
  nama: string;
  tipe: "LM" | "BR";
  hargaBase: number;
  hargaModal: number;
};

export function ProductsPageClient({
  products,
  initialSearch = "",
  initialPage = 1,
  totalCount,
}: {
  products: ProductRow[];
  initialSearch?: string;
  initialPage?: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [showModalPrice, setShowModalPrice] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PAGE_SIZE));
  const showPagination = totalCount > PRODUCTS_PAGE_SIZE;

  function navigate(page: number) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  }

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

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nama barang..."
          aria-label="Cari barang"
          className="min-w-[240px] flex-1"
        />
        <Button variant="secondary" onClick={() => navigate(1)}>
          Cari
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-base text-muted-foreground">
            Belum ada barang. Tambahkan barang pertama untuk mulai mencatat penjualan.
          </p>
        </Card>
      ) : (
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
      )}

      {showPagination && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-base text-muted-foreground">
            Halaman {initialPage} dari {totalPages} ({totalCount} barang)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={initialPage <= 1} onClick={() => navigate(initialPage - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" disabled={initialPage >= totalPages} onClick={() => navigate(initialPage + 1)}>
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

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
          const result = await deleteProductAction(deleteTarget.id);
          if (result && "success" in result && !result.success) {
            showErrorToast(result.error ?? "Gagal menghapus barang");
            setDeleteTarget(null);
            return;
          }
          setDeleteTarget(null);
          showSuccessToast("Barang dihapus.");
          router.refresh();
        }}
      />
    </div>
  );
}
