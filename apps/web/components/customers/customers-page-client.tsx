"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GiftBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CUSTOMERS_PAGE_SIZE } from "@/lib/constants";
import { formatIdr } from "@/lib/format-idr";

type CustomerRow = {
  id: string;
  nama: string;
  totalUnpaid: number;
  totalPaid: number;
  bonusAvailable: number;
};

export function CustomersPageClient({
  customers,
  initialSearch,
  initialPage,
  totalCount,
}: {
  customers: CustomerRow[];
  initialSearch: string;
  initialPage: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / CUSTOMERS_PAGE_SIZE));
  const showPagination = totalCount > CUSTOMERS_PAGE_SIZE;

  function navigate(page: number) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.push(query ? `/customers?${query}` : "/customers");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-foreground">Pelanggan</h1>
        <Button size="lg" onClick={() => setDialogOpen(true)}>
          + Tambah Pelanggan
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nama pelanggan..."
          aria-label="Cari pelanggan"
          className="min-w-[240px] flex-1"
        />
        <Button variant="secondary" onClick={() => navigate(1)}>
          Cari
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-base text-muted-foreground">
            {initialSearch
              ? "Tidak ada pelanggan yang cocok dengan pencarian."
              : "Belum ada pelanggan. Tambahkan pelanggan pertama untuk mulai mencatat bon."}
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nama</TableHeader>
                <TableHeader>Total Belum Bayar</TableHeader>
                <TableHeader>Total Sudah Bayar</TableHeader>
                <TableHeader>Hadiah</TableHeader>
                <TableHeader>Aksi</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-accent/30">
                  <TableCell className="font-medium text-foreground">{customer.nama}</TableCell>
                  <TableCell>{formatIdr(customer.totalUnpaid)}</TableCell>
                  <TableCell>{formatIdr(customer.totalPaid)}</TableCell>
                  <TableCell>
                    {customer.bonusAvailable > 0 ? (
                      <GiftBadge>Dapat {customer.bonusAvailable} Hadiah</GiftBadge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="ghost">Lihat</Button>
                    </Link>
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
            Halaman {initialPage} dari {totalPages} ({totalCount} pelanggan)
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

      <CustomerFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
