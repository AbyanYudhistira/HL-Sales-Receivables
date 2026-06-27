import { Document, Page, Text, View } from "@react-pdf/renderer";

import {
  formatDateShort,
  formatDiscountSteps,
  formatIdr,
  formatMonthYear,
} from "@/lib/format-idr";
import { statusLabel } from "@/lib/pdf/labels";
import { colors, pdfStyles } from "@/lib/pdf/styles";

export type CustomerPdfData = {
  customerName: string;
  month: number;
  year: number;
  bonusThreshold: number;
  bonusAvailable: number;
  discountLm: number[];
  discountBr: number[];
  totals: {
    totalPiutang: number;
    totalDibayar: number;
    totalOmzet: number;
    totalLaba: number;
    omzetLm: number;
    omzetBr: number;
  };
  transactions: {
    nomorBon: string;
    tanggal: string;
    total: number;
    status: "PIUTANG" | "LUNAS";
    isBonus: boolean;
  }[];
};

export function CustomerDocument({ data }: { data: CustomerPdfData }) {
  return (
    <Document title={`Pelanggan ${data.customerName}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.brand}>HL Sales</Text>
          <Text style={pdfStyles.title}>{data.customerName}</Text>
          <Text style={pdfStyles.subtitle}>
            Rekap {formatMonthYear(data.month, data.year)}
          </Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>Informasi</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Batas Bonus</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.bonusThreshold)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Bonus tersedia</Text>
          <Text style={pdfStyles.rowValue}>{data.bonusAvailable}</Text>
        </View>
        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
          Diskon LM {formatDiscountSteps(data.discountLm)} · Diskon BR{" "}
          {formatDiscountSteps(data.discountBr)}
        </Text>

        <Text style={pdfStyles.sectionTitle}>Ringkasan Bulan</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Belum Bayar</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalPiutang)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Sudah Bayar</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalDibayar)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Omzet</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalOmzet)}</Text>
        </View>
        <Text style={{ fontSize: 9, color: colors.muted, marginTop: 4 }}>
          Omzet LM {formatIdr(data.totals.omzetLm)} · Omzet BR {formatIdr(data.totals.omzetBr)}
        </Text>

        <Text style={pdfStyles.sectionTitle}>Transaksi</Text>
        {data.transactions.length === 0 ? (
          <Text style={{ color: colors.muted }}>Tidak ada transaksi pada periode ini.</Text>
        ) : (
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.th, { width: "22%" }]}>Tanggal</Text>
              <Text style={[pdfStyles.th, { width: "28%" }]}>No. Bon</Text>
              <Text style={[pdfStyles.th, { width: "25%", textAlign: "right" }]}>Total</Text>
              <Text style={[pdfStyles.th, { width: "25%", textAlign: "center" }]}>Status</Text>
            </View>
            {data.transactions.map((tx, index) => {
              const rowStyle =
                index === data.transactions.length - 1
                  ? pdfStyles.tableRowLast
                  : pdfStyles.tableRow;
              return (
                <View key={`${tx.nomorBon}-${index}`} style={rowStyle}>
                  <Text style={[pdfStyles.td, { width: "22%" }]}>
                    {formatDateShort(new Date(tx.tanggal))}
                  </Text>
                  <Text style={[pdfStyles.td, { width: "28%" }]}>
                    {tx.nomorBon}
                    {tx.isBonus ? " (Bonus)" : ""}
                  </Text>
                  <Text style={[pdfStyles.td, { width: "25%", textAlign: "right" }]}>
                    {formatIdr(tx.total)}
                  </Text>
                  <Text style={[pdfStyles.td, { width: "25%", textAlign: "center" }]}>
                    {statusLabel(tx.status)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={pdfStyles.footer}>Dicetak dari HL Sales</Text>
      </Page>
    </Document>
  );
}
