import { Document, Page, Text, View } from "@react-pdf/renderer";

import { formatDateLong, formatDiscountSteps, formatIdr } from "@/lib/format-idr";
import { statusLabel } from "@/lib/pdf/labels";
import { colors, pdfStyles } from "@/lib/pdf/styles";

export type BonPdfData = {
  nomorBon: string;
  tanggal: string;
  status: "PIUTANG" | "LUNAS";
  isBonus: boolean;
  customerName: string;
  discountLm: number[];
  discountBr: number[];
  omzet: number;
  ongkir: number;
  total: number;
  deskripsi?: string | null;
  lines: {
    nama: string;
    quantity: number;
    discountedUnitPrice: number;
    subtotal: number;
  }[];
};

export function BonDocument({ data }: { data: BonPdfData }) {
  const status = statusLabel(data.status);
  const statusStyle =
    data.status === "LUNAS" ? pdfStyles.badgePaid : pdfStyles.badgeUnpaid;

  return (
    <Document title={`Bon ${data.nomorBon}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.brand}>Buku Toko HL</Text>
          <Text style={pdfStyles.title}>{data.nomorBon}</Text>
          <Text style={pdfStyles.subtitle}>
            {formatDateLong(new Date(data.tanggal))}
          </Text>
          <View style={[pdfStyles.badge, statusStyle]}>
            <Text>{status}</Text>
          </View>
          {data.isBonus && (
            <View style={[pdfStyles.badge, pdfStyles.badgeGift, { marginTop: 4 }]}>
              <Text>Hadiah</Text>
            </View>
          )}
        </View>

        <Text style={pdfStyles.sectionTitle}>Pelanggan</Text>
        <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold" }}>{data.customerName}</Text>
        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
          Diskon LM {formatDiscountSteps(data.discountLm)} · Diskon BR{" "}
          {formatDiscountSteps(data.discountBr)}
        </Text>

        <Text style={pdfStyles.sectionTitle}>Barang</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.th, { width: "36%" }]}>Nama</Text>
            <Text style={[pdfStyles.th, { width: "12%", textAlign: "center" }]}>Qty</Text>
            <Text style={[pdfStyles.th, { width: "26%", textAlign: "right" }]}>Harga</Text>
            <Text style={[pdfStyles.th, { width: "26%", textAlign: "right" }]}>Subtotal</Text>
          </View>
          {data.lines.map((line, index) => {
            const rowStyle =
              index === data.lines.length - 1 ? pdfStyles.tableRowLast : pdfStyles.tableRow;
            return (
              <View key={`${line.nama}-${index}`} style={rowStyle}>
                <Text style={[pdfStyles.td, { width: "36%" }]}>{line.nama}</Text>
                <Text style={[pdfStyles.td, { width: "12%", textAlign: "center" }]}>
                  {line.quantity}
                </Text>
                <Text style={[pdfStyles.td, { width: "26%", textAlign: "right" }]}>
                  {formatIdr(line.discountedUnitPrice)}
                </Text>
                <Text style={[pdfStyles.td, { width: "26%", textAlign: "right" }]}>
                  {formatIdr(line.subtotal)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.rowLabel}>Total Omzet</Text>
            <Text style={pdfStyles.rowValue}>{formatIdr(data.omzet)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.rowLabel}>Ongkir</Text>
            <Text style={pdfStyles.rowValue}>{formatIdr(data.ongkir)}</Text>
          </View>
          <Text style={pdfStyles.totalLabel}>Total Tagihan</Text>
          <Text style={pdfStyles.totalValue}>{formatIdr(data.total)}</Text>
        </View>

        {data.deskripsi ? (
          <View style={pdfStyles.note}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Catatan</Text>
            <Text>{data.deskripsi}</Text>
          </View>
        ) : null}

        <Text style={pdfStyles.footer}>Dicetak dari HL App · Buku Toko</Text>
      </Page>
    </Document>
  );
}
