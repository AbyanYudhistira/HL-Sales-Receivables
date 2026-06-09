"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
import { formatIdr } from "@/lib/format-idr";

type CustomerRow = {
  id: string;
  nama: string;
  totalUnpaid: number;
  totalPaid: number;
  bonusAvailable: number;
};

export function CustomersPageClient({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => customer.nama.toLowerCase().includes(query));
  }, [customers, search]);

  function navigateToCustomer(id: string) {
    router.push(`/pelanggan/${id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Pelanggan</h1>
        </div>
        <Button size="lg" onClick={() => setDialogOpen(true)}>
          + Tambah Pelanggan
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Cari nama pelanggan..."
        aria-label="Cari pelanggan"
      />

      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-base text-muted-foreground">
            Belum ada pelanggan. Tambahkan pelanggan pertama untuk mulai mencatat bon.
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
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow
                  key={customer.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-accent/30"
                  onClick={() => navigateToCustomer(customer.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigateToCustomer(customer.id);
                    }
                  }}
                >
                  <TableCell className="font-medium text-foreground">{customer.nama}</TableCell>
                  <TableCell>{formatIdr(customer.totalUnpaid)}</TableCell>
                  <TableCell>{formatIdr(customer.totalPaid)}</TableCell>
                  <TableCell>
                    {customer.bonusAvailable > 0 ? (
                      <GiftBadge>Dapat {customer.bonusAvailable} Hadiah</GiftBadge>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CustomerFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
