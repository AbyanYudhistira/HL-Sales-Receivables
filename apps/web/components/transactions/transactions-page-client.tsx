"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TRANSACTIONS_PAGE_SIZE } from "@/lib/constants";
import { GiftBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateShort,
  formatIdr,
  INDONESIAN_MONTHS,
} from "@/lib/format-idr";

type TransactionRow = {
  id: string;
  nomorBon: string;
  customerId: string;
  customerName: string;
  tanggal: string;
  total: number;
  status: "PIUTANG" | "LUNAS";
  isBonus: boolean;
};

type CustomerOption = { id: string; nama: string };

export function TransactionsPageClient({
  transactions,
  customers,
  initialMonth,
  initialYear,
  initialStatus,
  initialCustomerId,
  initialPage,
  totalCount,
}: {
  transactions: TransactionRow[];
  customers: CustomerOption[];
  initialMonth: number;
  initialYear: number;
  initialStatus: string;
  initialCustomerId: string;
  initialPage: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [status, setStatus] = useState(initialStatus);
  const [customerSearch, setCustomerSearch] = useState(() => {
    if (!initialCustomerId) return "";
    return customers.find((customer) => customer.id === initialCustomerId)?.nama ?? "";
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / TRANSACTIONS_PAGE_SIZE));
  const showPagination = totalCount > TRANSACTIONS_PAGE_SIZE;

  function buildParams(page: number) {
    const params = new URLSearchParams();
    params.set("month", String(month));
    params.set("year", String(year));
    if (status !== "all") params.set("status", status);

    const customerQuery = customerSearch.trim().toLowerCase();
    if (customerQuery) {
      const match = customers.find((customer) =>
        customer.nama.toLowerCase().includes(customerQuery)
      );
      if (match) params.set("customerId", match.id);
    }

    if (page > 1) params.set("page", String(page));
    return params;
  }

  function navigate(page: number) {
    router.push(`/transactions?${buildParams(page).toString()}`);
  }

  function applyFilters() {
    navigate(1);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-foreground">Penjualan</h1>
        <Link href="/transactions/new">
          <Button size="lg">+ Catat Penjualan Baru</Button>
        </Link>
      </div>

      <Card>
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label htmlFor="filter-month" className="mb-2 block text-sm font-medium text-muted-foreground">
              Bulan
            </label>
            <Select
              id="filter-month"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {INDONESIAN_MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="filter-year" className="mb-2 block text-sm font-medium text-muted-foreground">
              Tahun
            </label>
            <Select
              id="filter-year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="filter-status" className="mb-2 block text-sm font-medium text-muted-foreground">
              Status
            </label>
            <Select
              id="filter-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Semua</option>
              <option value="LUNAS">Sudah Bayar</option>
              <option value="PIUTANG">Belum Bayar</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Pelanggan
            </label>
            <SearchInput
              value={customerSearch}
              onChange={setCustomerSearch}
              placeholder="Cari pelanggan..."
              aria-label="Cari pelanggan untuk filter"
            />
          </div>
        </div>
        <Button className="mt-4" variant="secondary" onClick={applyFilters}>
          Terapkan filter
        </Button>
      </Card>

      {totalCount === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-base text-muted-foreground">
            Belum ada penjualan untuk filter ini.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Tanggal</TableHeader>
                <TableHeader>No. Bon</TableHeader>
                <TableHeader>Pelanggan</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Aksi</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-accent/30">
                  <TableCell>{formatDateShort(new Date(tx.tanggal))}</TableCell>
                  <TableCell className="font-medium">
                    {tx.nomorBon}
                    {tx.isBonus && (
                      <GiftBadge className="ml-2">Hadiah</GiftBadge>
                    )}
                  </TableCell>
                  <TableCell>{tx.customerName}</TableCell>
                  <TableCell>{formatIdr(tx.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status === "LUNAS" ? "paid" : "unpaid"} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/transactions/${tx.id}`}>
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
            Halaman {initialPage} dari {totalPages} ({totalCount} bon)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={initialPage <= 1}
              onClick={() => navigate(initialPage - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={initialPage >= totalPages}
              onClick={() => navigate(initialPage + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
