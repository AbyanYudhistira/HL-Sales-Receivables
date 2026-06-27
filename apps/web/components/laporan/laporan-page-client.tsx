"use client";

import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { DownloadPdfButton } from "@/components/pdf/download-pdf-button";
import { sanitizeFilename } from "@/lib/pdf/filename";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatIdr, formatMonthYear, INDONESIAN_MONTHS } from "@/lib/format-idr";

type ReportData = {
  totals: {
    totalOmzet: number;
    totalLaba: number;
    totalUnpaid: number;
    totalPaid: number;
    omzetLm: number;
    omzetBr: number;
  };
  byCustomer: {
    nama: string;
    omzet: number;
    laba: number;
    unpaid: number;
    paid: number;
  }[];
  byType: { tipe: string; omzet: number; laba: number }[];
};

export function LaporanPageClient({
  year,
  month,
  data,
}: {
  year: number;
  month: number;
  data: ReportData;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("customer");

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Laporan</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Ringkasan {formatMonthYear(month, year)}
          </p>
        </div>
        <DownloadPdfButton
          href={`/api/pdf/laporan?month=${month}&year=${year}`}
          filename={`laporan-${sanitizeFilename(formatMonthYear(month, year))}.pdf`}
          variant="outline"
          size="lg"
        />
      </div>

      <Card>
        <form
          method="get"
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const nextMonth = String(formData.get("month"));
            const nextYear = String(formData.get("year"));
            router.push(`/laporan?month=${nextMonth}&year=${nextYear}`);
          }}
        >
          <div>
            <label htmlFor="laporan-month" className="mb-2 block text-sm font-medium text-muted-foreground">
              Bulan
            </label>
            <Select id="laporan-month" name="month" defaultValue={month}>
              {INDONESIAN_MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="laporan-year" className="mb-2 block text-sm font-medium text-muted-foreground">
              Tahun
            </label>
            <Select id="laporan-year" name="year" defaultValue={year}>
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Terapkan
          </Button>
        </form>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Omzet"
          value={formatIdr(data.totals.totalOmzet)}
          icon={BarChart3}
        />
        <StatCard label="Total Laba" value={formatIdr(data.totals.totalLaba)} icon={TrendingUp} />
        <StatCard
          label="Total Belum Bayar"
          value={formatIdr(data.totals.totalUnpaid)}
          icon={Wallet}
          tone="warning"
        />
        <StatCard
          label="Total Sudah Bayar"
          value={formatIdr(data.totals.totalPaid)}
          icon={TrendingUp}
          tone="success"
        />
      </section>

      <p className="text-sm text-muted-foreground">
        Omzet LM {formatIdr(data.totals.omzetLm)} · Omzet BR {formatIdr(data.totals.omzetBr)}
      </p>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "customer", label: "Per Pelanggan" },
          { id: "type", label: "Per Tipe (LM/BR)" },
          { id: "overall", label: "Keseluruhan" },
        ]}
      />

      <Card className="p-0">
        <TabPanel id="customer" tabId="customer" active={tab}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Pelanggan</TableHeader>
                <TableHeader>Omzet</TableHeader>
                <TableHeader>Laba</TableHeader>
                <TableHeader>Belum Bayar</TableHeader>
                <TableHeader>Sudah Bayar</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.byCustomer.map((row) => (
                <TableRow key={row.nama}>
                  <TableCell>{row.nama}</TableCell>
                  <TableCell>{formatIdr(row.omzet)}</TableCell>
                  <TableCell>{formatIdr(row.laba)}</TableCell>
                  <TableCell>{formatIdr(row.unpaid)}</TableCell>
                  <TableCell>{formatIdr(row.paid)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        <TabPanel id="type" tabId="type" active={tab}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Tipe</TableHeader>
                <TableHeader>Omzet</TableHeader>
                <TableHeader>Laba</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.byType.map((row) => (
                <TableRow key={row.tipe}>
                  <TableCell>{row.tipe}</TableCell>
                  <TableCell>{formatIdr(row.omzet)}</TableCell>
                  <TableCell>{formatIdr(row.laba)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        <TabPanel id="overall" tabId="overall" active={tab}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Ringkasan</TableHeader>
                <TableHeader>Nilai</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Total Omzet</TableCell>
                <TableCell>{formatIdr(data.totals.totalOmzet)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Laba</TableCell>
                <TableCell>{formatIdr(data.totals.totalLaba)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Belum Bayar</TableCell>
                <TableCell>{formatIdr(data.totals.totalUnpaid)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Sudah Bayar</TableCell>
                <TableCell>{formatIdr(data.totals.totalPaid)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>
      </Card>
    </div>
  );
}
