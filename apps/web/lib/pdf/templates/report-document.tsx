import { Document, Page, Text, View } from "@react-pdf/renderer";

import { formatIdr, formatMonthYear } from "@/lib/format-idr";
import { colors, pdfStyles } from "@/lib/pdf/styles";

export type ReportPdfData = {
  month: number;
  year: number;
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

function SummarySection({ data, hideLaba }: { data: ReportPdfData; hideLaba: boolean }) {
  return (
    <>
      <Text style={pdfStyles.sectionTitle}>Ringkasan</Text>
      <View style={pdfStyles.row}>
        <Text style={pdfStyles.rowLabel}>Total Omzet</Text>
        <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalOmzet)}</Text>
      </View>
      {!hideLaba && (
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Total Laba</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalLaba)}</Text>
        </View>
      )}
      <View style={pdfStyles.row}>
        <Text style={pdfStyles.rowLabel}>Total Belum Bayar</Text>
        <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalUnpaid)}</Text>
      </View>
      <View style={pdfStyles.row}>
        <Text style={pdfStyles.rowLabel}>Total Sudah Bayar</Text>
        <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalPaid)}</Text>
      </View>
      <Text style={{ fontSize: 9, color: colors.muted, marginTop: 4 }}>
        Omzet LM {formatIdr(data.totals.omzetLm)} · Omzet BR {formatIdr(data.totals.omzetBr)}
      </Text>
    </>
  );
}

function CustomerTable({
  rows,
  hideLaba,
}: {
  rows: ReportPdfData["byCustomer"];
  hideLaba: boolean;
}) {
  if (rows.length === 0) {
    return <Text style={{ color: colors.muted }}>Tidak ada data pelanggan.</Text>;
  }

  const namaWidth = hideLaba ? "34%" : "28%";
  const numWidth = hideLaba ? "22%" : "18%";

  return (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.tableHeader}>
        <Text style={[pdfStyles.th, { width: namaWidth }]}>Pelanggan</Text>
        <Text style={[pdfStyles.th, { width: numWidth, textAlign: "right" }]}>Omzet</Text>
        {!hideLaba && (
          <Text style={[pdfStyles.th, { width: numWidth, textAlign: "right" }]}>Laba</Text>
        )}
        <Text style={[pdfStyles.th, { width: numWidth, textAlign: "right" }]}>Belum</Text>
        <Text style={[pdfStyles.th, { width: numWidth, textAlign: "right" }]}>Sudah</Text>
      </View>
      {rows.map((row, index) => {
        const rowStyle = index === rows.length - 1 ? pdfStyles.tableRowLast : pdfStyles.tableRow;
        return (
          <View key={`${row.nama}-${index}`} style={rowStyle}>
            <Text style={[pdfStyles.td, { width: namaWidth }]}>{row.nama}</Text>
            <Text style={[pdfStyles.td, { width: numWidth, textAlign: "right" }]}>
              {formatIdr(row.omzet)}
            </Text>
            {!hideLaba && (
              <Text style={[pdfStyles.td, { width: numWidth, textAlign: "right" }]}>
                {formatIdr(row.laba)}
              </Text>
            )}
            <Text style={[pdfStyles.td, { width: numWidth, textAlign: "right" }]}>
              {formatIdr(row.unpaid)}
            </Text>
            <Text style={[pdfStyles.td, { width: numWidth, textAlign: "right" }]}>
              {formatIdr(row.paid)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function TypeTable({ rows, hideLaba }: { rows: ReportPdfData["byType"]; hideLaba: boolean }) {
  const tipeWidth = hideLaba ? "50%" : "34%";
  const omzetWidth = hideLaba ? "50%" : "33%";

  return (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.tableHeader}>
        <Text style={[pdfStyles.th, { width: tipeWidth }]}>Tipe</Text>
        <Text style={[pdfStyles.th, { width: omzetWidth, textAlign: "right" }]}>Omzet</Text>
        {!hideLaba && (
          <Text style={[pdfStyles.th, { width: "33%", textAlign: "right" }]}>Laba</Text>
        )}
      </View>
      {rows.map((row, index) => {
        const rowStyle = index === rows.length - 1 ? pdfStyles.tableRowLast : pdfStyles.tableRow;
        return (
          <View key={row.tipe} style={rowStyle}>
            <Text style={[pdfStyles.td, { width: tipeWidth }]}>{row.tipe}</Text>
            <Text style={[pdfStyles.td, { width: omzetWidth, textAlign: "right" }]}>
              {formatIdr(row.omzet)}
            </Text>
            {!hideLaba && (
              <Text style={[pdfStyles.td, { width: "33%", textAlign: "right" }]}>
                {formatIdr(row.laba)}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function ReportDocument({
  data,
  hideLaba = false,
}: {
  data: ReportPdfData;
  hideLaba?: boolean;
}) {
  return (
    <Document title={`Laporan ${formatMonthYear(data.month, data.year)}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.brand}>HL Sales</Text>
          <Text style={pdfStyles.title}>Laporan</Text>
          <Text style={pdfStyles.subtitle}>{formatMonthYear(data.month, data.year)}</Text>
        </View>

        <SummarySection data={data} hideLaba={hideLaba} />

        <Text style={pdfStyles.sectionTitle}>Per Pelanggan</Text>
        <CustomerTable rows={data.byCustomer} hideLaba={hideLaba} />

        <Text style={pdfStyles.sectionTitle}>Per Tipe (LM/BR)</Text>
        <TypeTable rows={data.byType} hideLaba={hideLaba} />

        <Text style={pdfStyles.sectionTitle}>Keseluruhan</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Total Omzet</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalOmzet)}</Text>
        </View>
        {!hideLaba && (
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.rowLabel}>Total Laba</Text>
            <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalLaba)}</Text>
          </View>
        )}
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Total Belum Bayar</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalUnpaid)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>Total Sudah Bayar</Text>
          <Text style={pdfStyles.rowValue}>{formatIdr(data.totals.totalPaid)}</Text>
        </View>

        <Text style={pdfStyles.footer}>Dicetak dari HL Sales</Text>
      </Page>
    </Document>
  );
}
